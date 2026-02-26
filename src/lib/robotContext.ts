import type { Subject } from '@/types'
import { SUBJECT_NAMES } from '@/types'
import type { CuratorLevel, CuratorGoalType, CuratorDiagnosticScore } from '@/types/curator'
import { CURATOR_LEVEL_NAMES, CURATOR_LEVEL_EMOJI } from '@/types/curator'

// ── Student Context ───────────────────────────────────────────────────────────
// A snapshot of everything the robot needs to know about the student.

export interface StudentContext {
  name: string
  streak: number
  goalType: CuratorGoalType | null

  // Subjects the student is studying + their level per subject
  subjects: Subject[]
  subjectLevels: Partial<Record<Subject, CuratorLevel>>

  // Weak topics from curator diagnostic
  weakTopics: Array<{ subject: Subject; topics: string[] }>

  // Curator plan progress
  planProgress: { completed: number; total: number } | null

  // Latest practice ENT score (0-140)
  latestEntScore: number | null
  latestEntPercentage: number | null

  // State flags
  hasTakenDiagnostic: boolean
  hasActivePlan: boolean
  isNewUser: boolean
}

// ── Builder ───────────────────────────────────────────────────────────────────

interface BuildContextArgs {
  name: string
  streak: number
  goalType: CuratorGoalType | null
  selectedSubjects: Subject[]
  subjectLevels: Partial<Record<Subject, CuratorLevel>>
  diagnosticScores: CuratorDiagnosticScore[]
  planCompleted: number
  planTotal: number
  latestEntScore: number | null
  latestEntPercentage: number | null
  hasTakenDiagnostic: boolean
  createdAt: string
}

export function buildStudentContext(args: BuildContextArgs): StudentContext {
  const {
    name, streak, goalType, selectedSubjects, subjectLevels,
    diagnosticScores, planCompleted, planTotal,
    latestEntScore, latestEntPercentage,
    hasTakenDiagnostic, createdAt,
  } = args

  const weakTopics = diagnosticScores
    .filter(s => s.weakTopics.length > 0)
    .map(s => ({ subject: s.subject, topics: s.weakTopics }))

  return {
    name,
    streak,
    goalType,
    subjects: selectedSubjects,
    subjectLevels,
    weakTopics,
    planProgress: planTotal > 0 ? { completed: planCompleted, total: planTotal } : null,
    latestEntScore,
    latestEntPercentage,
    hasTakenDiagnostic,
    hasActivePlan: planTotal > 0,
    isNewUser: new Date(createdAt).toDateString() === new Date().toDateString(),
  }
}

// ── Message Generators ────────────────────────────────────────────────────────

function timeGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Доброе утро'
  if (h < 18) return 'Добрый день'
  return 'Добрый вечер'
}

/** Personalized greeting spoken once per day */
export function buildContextualGreeting(ctx: StudentContext): string {
  const { name, streak, isNewUser, hasTakenDiagnostic, planProgress, weakTopics, latestEntScore } = ctx

  if (isNewUser) {
    return `Привет, ${name}! Я твой помощник-репетитор. Начни с диагностики — займёт пару минут, и я составлю план специально для тебя.`
  }

  if (!hasTakenDiagnostic) {
    return `${timeGreeting()}, ${name}! Пройди диагностику, чтобы я мог подобрать правильный план подготовки к ЕНТ.`
  }

  // Has plan progress
  if (planProgress && planProgress.total > 0) {
    const pct = Math.round((planProgress.completed / planProgress.total) * 100)
    if (streak > 2) {
      return `${timeGreeting()}, ${name}! ${streak} дней подряд — так держать! Прогресс: ${planProgress.completed} из ${planProgress.total} модулей (${pct}%). Продолжаем?`
    }
    return `${timeGreeting()}, ${name}! Твой прогресс: ${planProgress.completed} из ${planProgress.total} модулей. Продолжаем?`
  }

  // Has ENT result
  if (latestEntScore !== null) {
    return `${timeGreeting()}, ${name}! В прошлый раз ты набрал ${latestEntScore} баллов на пробном ЕНТ. Поработаем ещё?`
  }

  // Has weak topics
  if (weakTopics.length > 0) {
    const first = weakTopics[0]
    const topicName = first.topics[0]
    return `${timeGreeting()}, ${name}! Рекомендую поработать над "${topicName}" — там пока есть пробелы.`
  }

  if (streak > 1) {
    return `${timeGreeting()}, ${name}! ${streak} дней подряд — отличная серия! Продолжаем подготовку?`
  }

  return `${timeGreeting()}, ${name}! Рад тебя видеть. Продолжим подготовку к ЕНТ?`
}

/** Context-aware idle message (shown instead of generic "Готов учиться?") */
export function buildIdleMessage(ctx: StudentContext): string {
  if (!ctx.hasTakenDiagnostic) return 'Пройди диагностику! 📋'

  if (ctx.planProgress) {
    const { completed, total } = ctx.planProgress
    const remaining = total - completed
    if (remaining === 0) return 'Все модули пройдены! 🎉'
    return `Осталось ${remaining} из ${total} модулей`
  }

  if (ctx.weakTopics.length > 0) {
    const w = ctx.weakTopics[0]
    return `Подтяни "${w.topics[0]}" 💡`
  }

  if (ctx.latestEntScore !== null) {
    return `Последний ЕНТ: ${ctx.latestEntScore} баллов`
  }

  return 'Готов учиться? 🤓'
}

/** Context-aware message after completing a module */
export function buildModuleCompleteMessage(ctx: StudentContext, score: number): string {
  const { name, planProgress } = ctx

  if (score >= 90) return `Блестяще, ${name}! ${score}% — почти идеально!`
  if (score >= 70) {
    if (planProgress) {
      const remaining = planProgress.total - planProgress.completed
      return `Отлично, ${name}! ${score}%. Осталось ${remaining} модулей.`
    }
    return `Хорошая работа, ${name}! ${score}% — модуль засчитан.`
  }
  return `${name}, ${score}% — попробуй ещё раз, ты справишься!`
}

/** Short subject summary string for widget display */
export function subjectSummary(subject: Subject, level: CuratorLevel): string {
  const short: Partial<Record<Subject, string>> = {
    math: 'Матем.',
    physics: 'Физика',
    chemistry: 'Химия',
    biology: 'Биология',
    history: 'История',
    english: 'English',
    kazakh: 'Казахск.',
    russian: 'Русский',
    informatics: 'Информат.',
    geography: 'Геогр.',
    literature: 'Литерат.',
  }
  const name = short[subject] ?? SUBJECT_NAMES[subject]
  const emoji = CURATOR_LEVEL_EMOJI[level]
  const lvl = CURATOR_LEVEL_NAMES[level]
  return `${emoji} ${name} · ${lvl}`
}

export { SUBJECT_NAMES, CURATOR_LEVEL_NAMES, CURATOR_LEVEL_EMOJI }

// ── Holiday greetings ─────────────────────────────────────────────────────────

export function getHolidayGreeting(robotName: string | null): string | null {
  const now  = new Date()
  const m    = now.getMonth() + 1  // 1-12
  const d    = now.getDate()
  const name = robotName ?? 'Робот'

  if (m === 1  && d === 1)  return `С Новым годом! 🎄 Новый год — новые знания. Погнали, ${name} рядом!`
  if (m === 3  && d === 8)  return `С 8 Марта! 🌷 Умных и красивых — поздравляю!`
  if (m === 3  && d === 22) return `Наурыз мейрамы! 🌸 Пусть этот год принесёт отличный балл на ЕНТ!`
  if (m === 5  && d === 7)  return `С Днём защитника Отечества! 🇰🇿 Защищай свои знания так же стойко!`
  if (m === 5  && d === 9)  return `С Днём Победы! 🎖 Помни — учёба тоже требует мужества!`
  if (m === 6  && d === 1)  return `Сегодня ЕНТ! 💪 Ты готовился, теперь просто покажи всё что знаешь. Удачи!`
  if (m === 7  && d === 6)  return `С Днём столицы — Астана күні! 🏙 Большой город, большие мечты!`
  if (m === 8  && d === 30) return `С Днём Конституции Казахстана! 📜 Знай свои права и знай свои предметы!`
  if (m === 12 && d === 16) return `С Днём Независимости Казахстана! 🇰🇿 Независимый в стране — независимый в знаниях!`
  return null
}

// ── Random idle facts ─────────────────────────────────────────────────────────
// Rotates every ~45 seconds based on time — no state needed

const IDLE_FACTS = [
  '📐 На ЕНТ по математике 20 вопросов. Топ темы: алгебра, геометрия, тригонометрия',
  '🥧 Число π = 3.14159... содержит все числа — в том числе твой день рождения!',
  '⚡ Скорость света — 299 792 км/с. Свет от Солнца идёт до Земли 8 минут',
  '🧬 ДНК человека, если её распутать, протянется от Земли до Солнца 70 раз',
  '🇰🇿 Казахстан — 9-я по площади страна мира. Больше всей Западной Европы!',
  '💧 Вода расширяется при замерзании. Именно поэтому лёд плавает, а не тонет',
  '🧠 Мозг человека содержит ~86 млрд нейронов. Каждый учебный час создаёт новые связи!',
  '📱 Первый компьютер ENIAC весил 30 тонн. Твой телефон в миллион раз мощнее',
  '🌍 Казахский язык входит в тюркскую группу — родственен турецкому, узбекскому, татарскому',
  '⚗️ Таблица Менделеева открылась ему во сне. Наука любит тех, кто думает даже ночью!',
  '🔭 Если сжать Землю до плотности нейтронной звезды — она была бы размером с яблоко',
  '📚 Средний выпускник знает ~50 000 слов. Чемпион по словарному запасу — Шекспир (66 000+)',
  '🎯 На ЕНТ нужно 120 вопросов за 240 минут — это 2 минуты на вопрос. Темп решает!',
  '🌱 Фотосинтез: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Растения буквально едят воздух!',
  '🏔️ Хан-Тенгри (7 010 м) — самая высокая точка Казахстана. Вершина знаний — твой ЕНТ!',
]

export function getRandomIdleFact(): string {
  const idx = Math.floor(Date.now() / 45_000) % IDLE_FACTS.length
  return IDLE_FACTS[idx]
}
