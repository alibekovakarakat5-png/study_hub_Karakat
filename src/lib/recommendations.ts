/**
 * Smart Recommendations Engine
 * Reads diagnostic, ENT history, profile, and study plan →
 * returns prioritized, actionable recommendations with multiple options per area.
 */

import type { User, DiagnosticResult, SubjectScore, Subject, SUBJECT_NAMES } from '@/types'
import type { EntExamResult, EntBlockResult } from '@/types/practiceEnt'
import type { StudyPlan } from '@/types'

// ── Types ────────────────────────────────────────────────────────────────────

export type RecommendationType = 'study' | 'practice' | 'university' | 'portfolio' | 'career' | 'challenge' | 'ielts'

export interface Recommendation {
  id: string
  type: RecommendationType
  priority: 'high' | 'medium' | 'low'
  icon: string
  title: string
  description: string
  cta: string
  href: string
  badge?: string        // e.g. "+5 баллов ЕНТ", "Срочно"
  subjectColor?: string
}

export interface ProfileType {
  id: string
  title: string         // "Технарь", "Медик", "Гуманитарий"
  icon: string
  description: string
  strongSubjects: Subject[]
  careerExamples: string[]
  universityHints: string[]
}

export interface UniMatch {
  name: string
  city: string
  country: string
  minEnt: number        // 0 = not applicable (foreign)
  minIelts?: number
  matchPct: number      // computed
  status: 'safety' | 'target' | 'reach' | 'dream'
  programs: string[]
  flag: string
  url?: string
}

// ── KZ + International universities base ─────────────────────────────────────

export const KZ_UNIVERSITIES: Omit<UniMatch, 'matchPct' | 'status'>[] = [
  { name: 'Назарбаев Университет', city: 'Астана', country: 'KZ', minEnt: 120, minIelts: 6.5, programs: ['IT', 'Инженерия', 'Медицина', 'Бизнес'], flag: '🇰🇿' },
  { name: 'КБТУ', city: 'Алматы', country: 'KZ', minEnt: 110, minIelts: 6.0, programs: ['IT', 'Нефтегазовое дело', 'Инженерия'], flag: '🇰🇿' },
  { name: 'KIMEP University', city: 'Алматы', country: 'KZ', minEnt: 100, minIelts: 6.0, programs: ['Бизнес', 'Право', 'Журналистика'], flag: '🇰🇿' },
  { name: 'КазНУ им. аль-Фараби', city: 'Алматы', country: 'KZ', minEnt: 90, programs: ['Медицина', 'IT', 'Право', 'Экономика', 'Химия'], flag: '🇰🇿' },
  { name: 'ЕНУ им. Гумилёва', city: 'Астана', country: 'KZ', minEnt: 85, programs: ['Педагогика', 'История', 'Экономика'], flag: '🇰🇿' },
  { name: 'КазНТУ им. Сатпаева', city: 'Алматы', country: 'KZ', minEnt: 80, programs: ['Горное дело', 'Инженерия', 'IT'], flag: '🇰🇿' },
  { name: 'Алматы Менеджмент Университет', city: 'Алматы', country: 'KZ', minEnt: 75, programs: ['MBA', 'Менеджмент', 'Маркетинг'], flag: '🇰🇿' },
  { name: 'Университет Нархоз', city: 'Алматы', country: 'KZ', minEnt: 70, programs: ['Экономика', 'Бизнес', 'Финансы'], flag: '🇰🇿' },
]

export const INTL_UNIVERSITIES: Omit<UniMatch, 'matchPct' | 'status'>[] = [
  { name: 'Томский государственный университет', city: 'Томск', country: 'RU', minEnt: 0, minIelts: 0, programs: ['IT', 'Физика', 'Химия', 'Медицина'], flag: '🇷🇺' },
  { name: 'НГУ (Новосибирск)', city: 'Новосибирск', country: 'RU', minEnt: 0, minIelts: 0, programs: ['IT', 'Математика', 'Физика'], flag: '🇷🇺' },
  { name: 'Дублинский технологический институт', city: 'Дублин', country: 'IE', minEnt: 0, minIelts: 6.0, programs: ['IT', 'Инженерия', 'Бизнес'], flag: '🇮🇪' },
  { name: 'Болонский университет', city: 'Болонья', country: 'IT', minEnt: 0, minIelts: 5.5, programs: ['Право', 'Медицина', 'Гуманитарные науки'], flag: '🇮🇹' },
  { name: 'Университет Малайи', city: 'Куала-Лумпур', country: 'MY', minEnt: 0, minIelts: 6.0, programs: ['IT', 'Бизнес', 'Инженерия'], flag: '🇲🇾' },
  { name: 'Чешский технический университет', city: 'Прага', country: 'CZ', minEnt: 0, minIelts: 5.5, programs: ['IT', 'Инженерия', 'Архитектура'], flag: '🇨🇿' },
  { name: 'University of Amsterdam', city: 'Амстердам', country: 'NL', minEnt: 0, minIelts: 6.5, programs: ['Бизнес', 'Право', 'Социология', 'IT'], flag: '🇳🇱' },
  { name: 'QUT (Австралия)', city: 'Брисбен', country: 'AU', minEnt: 0, minIelts: 6.5, programs: ['IT', 'Дизайн', 'Бизнес'], flag: '🇦🇺' },
]

// ── Profile Types ─────────────────────────────────────────────────────────────

const PROFILE_TYPES: ProfileType[] = [
  {
    id: 'engineer',
    title: 'Технарь',
    icon: '⚙️',
    description: 'Аналитический склад ума, сильные в точных науках. Подходят инженерные и IT специальности.',
    strongSubjects: ['math', 'physics', 'informatics'],
    careerExamples: ['Программист', 'Инженер', 'Архитектор ПО', 'Data Scientist'],
    universityHints: ['КБТУ', 'Назарбаев Университет', 'КазНТУ', 'МГТУ'],
  },
  {
    id: 'medic',
    title: 'Медик',
    icon: '🩺',
    description: 'Сильные в биологии и химии. Призвание — помогать людям, медицина или фармацевтика.',
    strongSubjects: ['biology', 'chemistry'],
    careerExamples: ['Врач', 'Фармацевт', 'Биохимик', 'Исследователь'],
    universityHints: ['КазНМУ', 'КазНУ (медфак)', 'ЗКМУ', 'Назарбаев Университет (медицина)'],
  },
  {
    id: 'humanist',
    title: 'Гуманитарий',
    icon: '📖',
    description: 'Развитое критическое мышление, владение языками. Правовые, экономические, журналистские профессии.',
    strongSubjects: ['history', 'english', 'kazakh', 'russian', 'literature'],
    careerExamples: ['Юрист', 'Журналист', 'Дипломат', 'Экономист'],
    universityHints: ['KIMEP', 'КазНУ', 'ЕНУ', 'Международный университет'],
  },
  {
    id: 'naturalist',
    title: 'Естественник',
    icon: '🌿',
    description: 'Сильные в науках о природе. Экология, агрономия, география, науки о Земле.',
    strongSubjects: ['biology', 'geography', 'chemistry'],
    careerExamples: ['Эколог', 'Агроном', 'Геолог', 'Биолог'],
    universityHints: ['КазНУ', 'КазАТУ', 'ЕНУ', 'Алматинский университет'],
  },
  {
    id: 'polymath',
    title: 'Универсал',
    icon: '🌟',
    description: 'Равномерно сильный результат по всем предметам. Широкие возможности выбора.',
    strongSubjects: [],
    careerExamples: ['Менеджер', 'Предприниматель', 'Продакт-менеджер'],
    universityHints: ['Любой вуз по интересам', 'АМУ', 'Нархоз'],
  },
]

// ── Engine functions ──────────────────────────────────────────────────────────

/** Detect user profile type from diagnostic + ENT history */
export function detectProfileType(
  diagnostic: DiagnosticResult | null,
  entHistory: EntExamResult[],
): ProfileType {
  if (!diagnostic && entHistory.length === 0) return PROFILE_TYPES[4] // polymath default

  // Build subject → average percentage map
  const scores: Partial<Record<Subject, number[]>> = {}

  if (diagnostic) {
    for (const s of diagnostic.subjects) {
      scores[s.subject] = [...(scores[s.subject] ?? []), s.percentage]
    }
  }

  for (const r of entHistory.slice(0, 3)) {
    for (const b of r.blocks) {
      if (b.subject) {
        scores[b.subject] = [...(scores[b.subject] ?? []), b.percentage]
      }
    }
  }

  const avg: Partial<Record<Subject, number>> = {}
  for (const [sub, vals] of Object.entries(scores) as [Subject, number[]][]) {
    avg[sub] = vals.reduce((a, b) => a + b, 0) / vals.length
  }

  // Score each profile type
  let bestProfile = PROFILE_TYPES[4]
  let bestScore = -1

  for (const pt of PROFILE_TYPES.slice(0, -1)) {
    const score = pt.strongSubjects.reduce((acc, sub) => acc + (avg[sub] ?? 0), 0)
    if (score > bestScore) {
      bestScore = score
      bestProfile = pt
    }
  }

  return bestProfile
}

/** Calculate ENT equivalent score from diagnostic or ENT history */
export function estimateEntScore(
  diagnostic: DiagnosticResult | null,
  entHistory: EntExamResult[],
): number {
  if (entHistory.length > 0) {
    // Average of last 3 ENT results, scaled to 140
    const recent = entHistory.slice(0, 3)
    const avgPct = recent.reduce((s, r) => s + r.percentage, 0) / recent.length
    return Math.round((avgPct / 100) * 140)
  }

  if (diagnostic) {
    const overall = diagnostic.maxScore > 0
      ? (diagnostic.overallScore / diagnostic.maxScore) * 100
      : 0
    return Math.round((overall / 100) * 140)
  }

  return 0
}

/** Compute university matches based on estimated ENT score and IELTS */
export function computeUniMatches(
  entScore: number,
  ieltsScore?: number,
  preferredCountries: string[] = ['KZ'],
): UniMatch[] {
  const all = [...KZ_UNIVERSITIES, ...INTL_UNIVERSITIES]

  return all
    .filter(u => preferredCountries.length === 0 || preferredCountries.includes(u.country))
    .map(u => {
      let matchPct = 100
      let status: UniMatch['status'] = 'target'

      if (u.country === 'KZ' && u.minEnt > 0) {
        const gap = u.minEnt - entScore
        if (gap <= 0) {
          matchPct = Math.min(100, 70 + (Math.abs(gap) / u.minEnt) * 30)
          status = gap <= -15 ? 'safety' : 'target'
        } else if (gap <= 15) {
          matchPct = 60 - gap * 2
          status = 'reach'
        } else {
          matchPct = Math.max(10, 40 - gap * 1.5)
          status = 'dream'
        }
      } else if (u.minIelts && u.minIelts > 0) {
        const effectiveIelts = ieltsScore ?? 0
        const gap = u.minIelts - effectiveIelts
        if (gap <= 0) {
          matchPct = 80
          status = 'target'
        } else if (gap <= 0.5) {
          matchPct = 60
          status = 'reach'
        } else {
          matchPct = 35
          status = 'dream'
        }
      }

      return { ...u, matchPct: Math.round(matchPct), status }
    })
    .sort((a, b) => b.matchPct - a.matchPct)
}

/** Get weakest subjects from diagnostic + ENT history */
export function getWeakSubjects(
  diagnostic: DiagnosticResult | null,
  entHistory: EntExamResult[],
): { subject: string; pct: number; topics: string[] }[] {
  const map = new Map<string, { pcts: number[]; topics: string[] }>()

  if (diagnostic) {
    for (const s of diagnostic.subjects) {
      const entry = map.get(s.subject) ?? { pcts: [], topics: [] }
      entry.pcts.push(s.percentage)
      entry.topics.push(...s.weakTopics)
      map.set(s.subject, entry)
    }
  }

  for (const r of entHistory.slice(0, 3)) {
    for (const b of r.blocks) {
      const key = b.subject ?? b.block
      const entry = map.get(key) ?? { pcts: [], topics: [] }
      entry.pcts.push(b.percentage)
      const weak = b.byTopic?.filter(t => t.total > 0 && t.correct / t.total < 0.6).map(t => t.topic) ?? []
      entry.topics.push(...weak)
      map.set(key, entry)
    }
  }

  return Array.from(map.entries())
    .map(([subject, { pcts, topics }]) => ({
      subject,
      pct: Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length),
      topics: [...new Set(topics)].slice(0, 3),
    }))
    .filter(s => s.pct < 65)
    .sort((a, b) => a.pct - b.pct)
}

/** Get strongest subjects */
export function getStrongSubjects(
  diagnostic: DiagnosticResult | null,
  entHistory: EntExamResult[],
): { subject: string; pct: number }[] {
  const map = new Map<string, number[]>()

  if (diagnostic) {
    for (const s of diagnostic.subjects) {
      map.set(s.subject, [...(map.get(s.subject) ?? []), s.percentage])
    }
  }

  for (const r of entHistory.slice(0, 3)) {
    for (const b of r.blocks) {
      const key = b.subject ?? b.block
      map.set(key, [...(map.get(key) ?? []), b.percentage])
    }
  }

  return Array.from(map.entries())
    .map(([subject, pcts]) => ({
      subject,
      pct: Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length),
    }))
    .filter(s => s.pct >= 65)
    .sort((a, b) => b.pct - a.pct)
}

// ── Main recommendations generator ───────────────────────────────────────────

export function generateRecommendations(params: {
  user: User | null
  diagnostic: DiagnosticResult | null
  entHistory: EntExamResult[]
  studyPlan: StudyPlan | null
}): Recommendation[] {
  const { user, diagnostic, entHistory, studyPlan } = params
  const recs: Recommendation[] = []

  // ── 1. No diagnostic taken yet
  if (!diagnostic && entHistory.length === 0) {
    recs.push({
      id: 'take-diagnostic',
      type: 'practice',
      priority: 'high',
      icon: '🎯',
      title: 'Пройди диагностический тест',
      description: 'Мы определим твой уровень по всем предметам и составим персональный план.',
      cta: 'Начать диагностику',
      href: '/diagnostic',
      badge: 'Шаг 1',
    })
    recs.push({
      id: 'daily-challenge-intro',
      type: 'challenge',
      priority: 'medium',
      icon: '⚡',
      title: 'Попробуй ежедневный челлендж',
      description: '10 вопросов за 5 минут. Отличная разминка для начала.',
      cta: 'Начать',
      href: '/daily-challenge',
      badge: '5 мин',
    })
    return recs
  }

  const weakSubjects = getWeakSubjects(diagnostic, entHistory)
  const strongSubjects = getStrongSubjects(diagnostic, entHistory)
  const entScore = estimateEntScore(diagnostic, entHistory)

  // ── 2. Weak subjects → urgent study recommendations
  weakSubjects.slice(0, 2).forEach((ws, i) => {
    const topicHint = ws.topics.length > 0 ? ` Начни с: ${ws.topics[0]}` : ''
    recs.push({
      id: `weak-study-${ws.subject}`,
      type: 'study',
      priority: i === 0 ? 'high' : 'medium',
      icon: '📚',
      title: `Подтяни ${ws.subject === 'math' ? 'Математику' : ws.subject === 'physics' ? 'Физику' : ws.subject === 'history' ? 'Историю КЗ' : ws.subject === 'biology' ? 'Биологию' : ws.subject === 'chemistry' ? 'Химию' : ws.subject === 'english' ? 'Английский' : ws.subject}`,
      description: `Твой результат ${ws.pct}% — ниже проходного.${topicHint}`,
      cta: 'Изучить с куратором',
      href: '/curator',
      badge: `${ws.pct}% → нужно 70%`,
    })
  })

  // ── 3. ENT practice if not done recently
  const lastEnt = entHistory[0]
  const daysSinceEnt = lastEnt
    ? Math.floor((Date.now() - new Date(lastEnt.date).getTime()) / 86400000)
    : 999
  if (daysSinceEnt >= 3) {
    recs.push({
      id: 'practice-ent',
      type: 'practice',
      priority: weakSubjects.length > 0 ? 'medium' : 'high',
      icon: '🏆',
      title: daysSinceEnt >= 7 ? 'Пора пройти пробный ЕНТ' : 'Пробный ЕНТ через 3 дня',
      description: entScore > 0
        ? `Твой текущий уровень ~${entScore}/140. Нужно набрать проходной балл (80+).`
        : 'Симуляция реального экзамена. 120 вопросов, 240 минут.',
      cta: 'Начать экзамен',
      href: '/practice-ent',
      badge: entScore > 0 ? `~${entScore}/140` : 'Бесплатно',
    })
  }

  // ── 4. Daily challenge streak nudge
  const today = new Date().toDateString()
  const lastActive = user?.lastActiveDate ? new Date(user.lastActiveDate).toDateString() : null
  if (lastActive !== today) {
    recs.push({
      id: 'daily-challenge',
      type: 'challenge',
      priority: 'medium',
      icon: '⚡',
      title: 'Ежедневный челлендж ждёт тебя',
      description: weakSubjects.length > 0
        ? `10 вопросов по слабым темам. Серия: ${user?.streak ?? 0} дней — не прерывай!`
        : 'Закрепи материал. 10 вопросов за 5 минут.',
      cta: 'Пройти челлендж',
      href: '/daily-challenge',
      badge: user?.streak ? `🔥 ${user.streak} дней` : 'Начни серию',
    })
  }

  // ── 5. University recommendation based on score
  if (entScore > 0) {
    const topMatch = computeUniMatches(entScore, undefined, ['KZ'])
      .filter(u => u.status === 'target' || u.status === 'safety')[0]
    if (topMatch) {
      recs.push({
        id: 'uni-match',
        type: 'university',
        priority: 'medium',
        icon: '🎓',
        title: `${topMatch.name} — ${topMatch.matchPct}% совместимость`,
        description: `При баллах ${entScore}/140 у тебя есть шансы. Посмотри требования и программы.`,
        cta: 'Подобрать вуз',
        href: '/university-advisor',
        badge: topMatch.status === 'safety' ? 'Реальный шанс' : 'Целевой',
      })
    }
  }

  // ── 6. Strong subjects → leverage for career/specialty
  const topStrong = strongSubjects[0]
  if (topStrong) {
    recs.push({
      id: `strong-leverage-${topStrong.subject}`,
      type: 'career',
      priority: 'low',
      icon: '🌟',
      title: `Используй силу в ${topStrong.subject === 'math' ? 'математике' : topStrong.subject === 'physics' ? 'физике' : topStrong.subject === 'biology' ? 'биологии' : topStrong.subject === 'chemistry' ? 'химии' : topStrong.subject === 'english' ? 'английском' : 'своём предмете'}`,
      description: `${topStrong.pct}% — отличный результат. Рассмотри специальности где это ключевой предмет.`,
      cta: 'Исследовать карьеру',
      href: '/career',
      badge: `${topStrong.pct}% ✓`,
    })
  }

  // ── 7. IELTS nudge if English is strong or KZ uni requires it
  const englishScore = diagnostic?.subjects.find(s => s.subject === 'english')?.percentage
    ?? entHistory[0]?.blocks.find(b => b.subject === 'english')?.percentage
  if (!englishScore || englishScore >= 60) {
    recs.push({
      id: 'ielts-prep',
      type: 'ielts',
      priority: 'low',
      icon: '🇬🇧',
      title: 'Подготовься к IELTS',
      description: 'IELTS 6.0+ открывает KIMEP, КБТУ и международные вузы. Начни подготовку сейчас.',
      cta: 'Раздел IELTS',
      href: '/ielts',
      badge: 'Нужен для КБТУ',
    })
  }

  // ── 8. Study plan nudge if not created
  if (!studyPlan && diagnostic) {
    recs.push({
      id: 'create-plan',
      type: 'study',
      priority: 'medium',
      icon: '🗺️',
      title: 'Создай учебный план',
      description: 'На основе твоих слабых мест сформируем 16-недельный план с задачами на каждый день.',
      cta: 'Создать план',
      href: '/plan',
    })
  }

  // Sort: high first, then medium, then low
  const order = { high: 0, medium: 1, low: 2 }
  return recs.sort((a, b) => order[a.priority] - order[b.priority]).slice(0, 8)
}
