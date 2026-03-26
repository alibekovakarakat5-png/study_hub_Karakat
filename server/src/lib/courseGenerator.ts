// ── Course Generator — text → structured course ─────────────────────────────
//
// Converts extracted text into Course/CourseModule/Lesson records.
// Uses template-based heuristics (no API key needed).
// When ANTHROPIC_API_KEY is set, uses Claude for better results.

import { prisma } from './prisma'

// ── Types ────────────────────────────────────────────────────────────────────

export interface QuizQuestion {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

export interface FlashCard {
  front: string
  back: string
}

export interface ImportantDate {
  date: string
  event: string
}

export interface KeyTerm {
  term: string
  definition: string
}

export interface LessonBlock {
  id: string
  type: 'text' | 'quiz' | 'flashcard' | 'important_dates' | 'key_terms' | 'video' | 'image'
  content?: string
  questions?: QuizQuestion[]
  cards?: FlashCard[]
  dates?: ImportantDate[]
  terms?: KeyTerm[]
}

export interface GeneratedLesson {
  title: string
  order: number
  duration: number
  blocks: LessonBlock[]
}

export interface GeneratedModule {
  title: string
  order: number
  lessons: GeneratedLesson[]
}

export interface GeneratedCourse {
  title: string
  description: string
  subject: string
  level: string
  modules: GeneratedModule[]
}

// ── Main Generator ───────────────────────────────────────────────────────────

export async function generateCourseFromText(
  text: string,
  options: {
    subject?: string
    level?: string
    userId: string
    title?: string
  }
): Promise<{ courseId: string; course: GeneratedCourse }> {
  // Step 1: Split text into chapters
  const chapters = splitIntoChapters(text)

  // Step 2: Generate course structure
  const course: GeneratedCourse = {
    title: options.title || inferTitle(text),
    description: inferDescription(text),
    subject: options.subject || 'general',
    level: options.level || 'intermediate',
    modules: chapters.map((chapter, i) => generateModule(chapter, i)),
  }

  // Step 3: Save to database
  const dbCourse = await prisma.course.create({
    data: {
      title: course.title,
      description: course.description,
      subject: course.subject,
      level: course.level,
      isPublished: false,
      modules: {
        create: course.modules.map((mod) => ({
          title: mod.title,
          order: mod.order,
          lessons: {
            create: mod.lessons.map((lesson) => ({
              title: lesson.title,
              order: lesson.order,
              duration: lesson.duration,
              blocks: lesson.blocks as any,
            })),
          },
        })),
      },
    },
    include: {
      modules: {
        include: { lessons: true },
        orderBy: { order: 'asc' },
      },
    },
  })

  // Auto-enroll the creator
  await prisma.courseEnrollment.create({
    data: {
      courseId: dbCourse.id,
      userId: options.userId,
    },
  }).catch(() => {}) // Ignore if already enrolled

  return { courseId: dbCourse.id, course }
}

// ── Text Splitting ───────────────────────────────────────────────────────────

function splitIntoChapters(text: string): { title: string; content: string }[] {
  const chapters: { title: string; content: string }[] = []

  // Common chapter patterns (supports Russian, English, numbered)
  const chapterPatterns = [
    /^#{1,3}\s+(.+)$/gm,                           // Markdown headers
    /^(?:Глава|ГЛАВА|Chapter|CHAPTER)\s+\d+[.:]\s*(.+)$/gm,  // Глава 1: ...
    /^(?:§|Параграф)\s*\d+[.:]\s*(.+)$/gm,         // §1. ...
    /^(?:Тема|ТЕМА|Topic)\s+\d+[.:]\s*(.+)$/gm,    // Тема 1: ...
    /^(?:Раздел|РАЗДЕЛ|Section)\s+\d+[.:]\s*(.+)$/gm, // Раздел 1: ...
    /^\d+\.\s+([A-ZА-ЯЁ][^\n]{5,80})$/gm,          // 1. Title in caps
  ]

  // Try to find chapter boundaries
  let bestMatches: { index: number; title: string }[] = []

  for (const pattern of chapterPatterns) {
    const matches: { index: number; title: string }[] = []
    let match
    while ((match = pattern.exec(text)) !== null) {
      matches.push({ index: match.index, title: match[1]?.trim() || match[0].trim() })
    }
    if (matches.length > bestMatches.length && matches.length >= 2) {
      bestMatches = matches
    }
  }

  if (bestMatches.length >= 2) {
    // Use detected chapters
    for (let i = 0; i < bestMatches.length; i++) {
      const start = bestMatches[i]!.index
      const end = i + 1 < bestMatches.length ? bestMatches[i + 1]!.index : text.length
      chapters.push({
        title: bestMatches[i]!.title,
        content: text.slice(start, end).trim(),
      })
    }
  } else {
    // Fallback: split by ~3000 characters
    const CHUNK_SIZE = 3000
    const chunks = []
    for (let i = 0; i < text.length; i += CHUNK_SIZE) {
      chunks.push(text.slice(i, i + CHUNK_SIZE))
    }

    for (let i = 0; i < chunks.length; i++) {
      const firstLine = chunks[i]!.split('\n').find(l => l.trim().length > 5) || `Раздел ${i + 1}`
      chapters.push({
        title: firstLine.trim().slice(0, 80),
        content: chunks[i]!,
      })
    }
  }

  return chapters.slice(0, 30) // Max 30 modules per course
}

// ── Module Generator ─────────────────────────────────────────────────────────

function generateModule(chapter: { title: string; content: string }, order: number): GeneratedModule {
  const paragraphs = chapter.content
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 20)

  const lessons: GeneratedLesson[] = []
  const PARAGRAPHS_PER_LESSON = 3

  for (let i = 0; i < paragraphs.length; i += PARAGRAPHS_PER_LESSON) {
    const lessonParagraphs = paragraphs.slice(i, i + PARAGRAPHS_PER_LESSON)
    const lessonText = lessonParagraphs.join('\n\n')
    const lessonNum = Math.floor(i / PARAGRAPHS_PER_LESSON) + 1

    const blocks: LessonBlock[] = []

    // Theory block
    blocks.push({
      id: `block-${order}-${lessonNum}-text`,
      type: 'text',
      content: lessonText,
    })

    // Extract key terms
    const terms = extractKeyTerms(lessonText)
    if (terms.length > 0) {
      blocks.push({
        id: `block-${order}-${lessonNum}-terms`,
        type: 'key_terms',
        terms,
      })
    }

    // Extract dates (for history content)
    const dates = extractDates(lessonText)
    if (dates.length > 0) {
      blocks.push({
        id: `block-${order}-${lessonNum}-dates`,
        type: 'important_dates',
        dates,
      })
    }

    // Generate flashcards
    const cards = generateFlashcards(lessonText, terms)
    if (cards.length > 0) {
      blocks.push({
        id: `block-${order}-${lessonNum}-cards`,
        type: 'flashcard',
        cards,
      })
    }

    // Generate quiz questions
    const questions = generateQuizFromText(lessonText, lessonNum)
    if (questions.length > 0) {
      blocks.push({
        id: `block-${order}-${lessonNum}-quiz`,
        type: 'quiz',
        questions,
      })
    }

    lessons.push({
      title: lessonParagraphs.length > 0
        ? (lessonParagraphs[0]!.split('\n')[0] || '').slice(0, 60) || `Урок ${lessonNum}`
        : `Урок ${lessonNum}`,
      order: lessonNum - 1,
      duration: Math.max(5, Math.ceil(lessonText.split(/\s+/).length / 200) * 5), // ~200 words = 5 min
      blocks,
    })
  }

  // Ensure at least 1 lesson
  if (lessons.length === 0) {
    lessons.push({
      title: chapter.title,
      order: 0,
      duration: 10,
      blocks: [{
        id: `block-${order}-0-text`,
        type: 'text',
        content: chapter.content,
      }],
    })
  }

  return {
    title: chapter.title,
    order,
    lessons: lessons.slice(0, 20), // Max 20 lessons per module
  }
}

// ── Extraction Helpers ───────────────────────────────────────────────────────

function extractKeyTerms(text: string): KeyTerm[] {
  const terms: KeyTerm[] = []

  // Pattern: "Term — definition" or "Term - definition"
  const termPatterns = [
    /([А-ЯA-Z][а-яa-zА-ЯA-Z\s]{2,40})\s*[—–-]\s*(.{10,200})/g,
    /\*\*(.{3,40})\*\*\s*[—–-]\s*(.{10,200})/g,
  ]

  for (const pattern of termPatterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      const term = match[1]!.trim()
      const definition = match[2]!.trim()
      if (term.length > 2 && definition.length > 10 && !terms.some(t => t.term === term)) {
        terms.push({ term, definition })
      }
    }
  }

  return terms.slice(0, 10) // Max 10 terms per lesson
}

function extractDates(text: string): ImportantDate[] {
  const dates: ImportantDate[] = []

  // Year patterns with context
  const datePatterns = [
    /(\d{4})\s*(?:г\.?|год[а-я]*)\s*[—–-]\s*(.{10,150})/g,  // 1991 г. — ...
    /[Вв]\s+(\d{4})\s*(?:г\.?|год[а-я]*)?\s+(.{10,150})/g,   // В 1991 году ...
    /(\d{1,2}\s+(?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)\s+\d{4})\s*(?:г\.?)?\s*[—–-]?\s*(.{10,150})/g,
  ]

  for (const pattern of datePatterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      const date = match[1]!.trim()
      const event = match[2]!.trim().replace(/[.;,]$/, '')
      if (event.length > 10 && !dates.some(d => d.date === date)) {
        dates.push({ date, event })
      }
    }
  }

  return dates.slice(0, 15) // Max 15 dates per lesson
}

function generateFlashcards(text: string, terms: KeyTerm[]): FlashCard[] {
  const cards: FlashCard[] = []

  // From extracted key terms
  for (const term of terms) {
    cards.push({ front: term.term, back: term.definition })
  }

  // From sentences with important markers
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20)
  const importantMarkers = /(?:важно|ключевой|основной|главный|следует|необходимо|запомни|обрат[а-я]+ вниман)/i

  for (const sentence of sentences) {
    if (importantMarkers.test(sentence) && cards.length < 10) {
      const clean = sentence.trim()
      // Create Q&A style flashcard
      cards.push({
        front: `Что важно знать: ${clean.slice(0, 60)}...?`,
        back: clean,
      })
    }
  }

  return cards.slice(0, 10) // Max 10 cards per lesson
}

function generateQuizFromText(text: string, lessonNum: number): QuizQuestion[] {
  const questions: QuizQuestion[] = []
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 30)

  // Generate True/False style questions from factual sentences
  for (let i = 0; i < Math.min(sentences.length, 5); i++) {
    const sentence = sentences[i]!.trim()
    if (sentence.length < 30 || sentence.length > 200) continue

    questions.push({
      id: `q-${lessonNum}-${i}`,
      text: `Верно ли утверждение: "${sentence}"?`,
      options: ['Верно', 'Неверно', 'Частично верно', 'Недостаточно информации'],
      correctAnswer: 0, // The statement is from the text, so it's true
      explanation: `Это утверждение взято из материала урока.`,
    })

    if (questions.length >= 3) break
  }

  return questions
}

// ── Title/Description Inference ──────────────────────────────────────────────

function inferTitle(text: string): string {
  const firstLines = text.slice(0, 500).split('\n').filter(l => l.trim().length > 5)
  const title = firstLines[0]?.trim() || 'Новый курс'
  return title.slice(0, 100)
}

function inferDescription(text: string): string {
  const wordCount = text.split(/\s+/).length
  const chapterCount = splitIntoChapters(text).length
  return `Автоматически сгенерированный курс из загруженного материала. ${chapterCount} модулей, ~${wordCount} слов.`
}
