// ── Personalized Admission Plan Data ─────────────────────────────────────────
// University requirements, score thresholds, program mappings for Kazakhstan.
// Used to calculate student's admission probability and personalized roadmap.

import type { Subject } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

export type StudyField =
  | 'it'
  | 'engineering'
  | 'medicine'
  | 'business'
  | 'law'
  | 'social'
  | 'natural_science'
  | 'humanities'
  | 'education'

export interface SubjectWeight {
  subject: Subject
  weight: number   // 0–1, how important this subject is for the field
  required: boolean
}

export interface Program {
  id: string
  name: string
  nameKz?: string
  field: StudyField
  requiredSubjects: Subject[]   // subjects that matter most
  bonusSubjects: Subject[]      // extra help
}

export interface UniversityRequirement {
  universityId: string
  programId: string
  minEnt: number          // minimum ENT to be considered
  grantEnt: number        // typical ENT for grant (государственный грант)
  competitiveEnt: number  // ENT for comfortable admission
  grantPlaces: number     // approximate grant places per year
  paidPlaces: number
  ieltsMin?: number
  toeflMin?: number
  hasInterview: boolean
  notes: string[]
}

export interface UniversityProfile {
  id: string
  name: string
  shortName: string
  city: string
  ranking: number          // QS World or national rank
  logo: string
  tier: 1 | 2 | 3          // 1=elite, 2=strong, 3=accessible
  url: string
  strengths: StudyField[]  // what they're best at
  requirements: UniversityRequirement[]
}

// ── Programs ─────────────────────────────────────────────────────────────────

export const PROGRAMS: Program[] = [
  { id: 'cs',              name: 'Информатика / CS',            field: 'it',             requiredSubjects: ['math', 'informatics'], bonusSubjects: ['physics'] },
  { id: 'software_eng',   name: 'Программная инженерия',       field: 'it',             requiredSubjects: ['math', 'informatics'], bonusSubjects: ['physics'] },
  { id: 'data_science',   name: 'Наука о данных',              field: 'it',             requiredSubjects: ['math', 'informatics'], bonusSubjects: ['physics'] },
  { id: 'civil_eng',      name: 'Гражданское строительство',   field: 'engineering',    requiredSubjects: ['math', 'physics'],     bonusSubjects: ['chemistry'] },
  { id: 'mech_eng',       name: 'Машиностроение',              field: 'engineering',    requiredSubjects: ['math', 'physics'],     bonusSubjects: [] },
  { id: 'electrical_eng', name: 'Электроэнергетика',           field: 'engineering',    requiredSubjects: ['math', 'physics'],     bonusSubjects: ['informatics'] },
  { id: 'petroleum_eng',  name: 'Нефтегазовое дело',          field: 'engineering',    requiredSubjects: ['math', 'chemistry'],   bonusSubjects: ['physics'] },
  { id: 'medicine',       name: 'Общая медицина',              field: 'medicine',       requiredSubjects: ['biology', 'chemistry'],bonusSubjects: ['math'] },
  { id: 'pharmacy',       name: 'Фармация',                    field: 'medicine',       requiredSubjects: ['chemistry', 'biology'],bonusSubjects: ['math'] },
  { id: 'dentistry',      name: 'Стоматология',                field: 'medicine',       requiredSubjects: ['biology', 'chemistry'],bonusSubjects: [] },
  { id: 'management',     name: 'Менеджмент',                  field: 'business',       requiredSubjects: ['math', 'history'],     bonusSubjects: ['english'] },
  { id: 'economics',      name: 'Экономика',                   field: 'business',       requiredSubjects: ['math', 'history'],     bonusSubjects: ['english'] },
  { id: 'finance',        name: 'Финансы',                     field: 'business',       requiredSubjects: ['math', 'history'],     bonusSubjects: ['english'] },
  { id: 'law',            name: 'Юриспруденция',               field: 'law',            requiredSubjects: ['history', 'kazakh'],   bonusSubjects: ['english'] },
  { id: 'international',  name: 'Международные отношения',     field: 'social',         requiredSubjects: ['history', 'english'],  bonusSubjects: ['kazakh'] },
  { id: 'psychology',     name: 'Психология',                  field: 'social',         requiredSubjects: ['biology', 'history'],  bonusSubjects: ['english'] },
  { id: 'biology_sci',    name: 'Биология (наука)',            field: 'natural_science', requiredSubjects: ['biology', 'chemistry'],bonusSubjects: ['math'] },
  { id: 'chemistry_sci',  name: 'Химия (наука)',               field: 'natural_science', requiredSubjects: ['chemistry', 'math'],   bonusSubjects: ['biology'] },
  { id: 'physics_sci',    name: 'Физика (наука)',              field: 'natural_science', requiredSubjects: ['physics', 'math'],     bonusSubjects: ['informatics'] },
  { id: 'pedagogy',       name: 'Педагогика',                  field: 'education',      requiredSubjects: ['kazakh', 'history'],   bonusSubjects: ['english'] },
]

// ── University profiles ───────────────────────────────────────────────────────

export const UNIVERSITIES: UniversityProfile[] = [
  {
    id: 'nu',
    name: 'Назарбаев Университет',
    shortName: 'НУ',
    city: 'Астана',
    ranking: 1,
    logo: '🎓',
    tier: 1,
    url: 'https://nu.edu.kz',
    strengths: ['it', 'engineering', 'medicine', 'business', 'natural_science'],
    requirements: [
      { universityId: 'nu', programId: 'cs',           minEnt: 100, grantEnt: 115, competitiveEnt: 125, grantPlaces: 30, paidPlaces: 20, ieltsMin: 6.0, hasInterview: false, notes: ['SAT Math 600+ сильно помогает', 'Портфолио проектов'] },
      { universityId: 'nu', programId: 'medicine',     minEnt: 105, grantEnt: 120, competitiveEnt: 130, grantPlaces: 20, paidPlaces: 10, ieltsMin: 6.5, hasInterview: true,  notes: ['Обязательное интервью', 'Волонтёрство в медицине'] },
      { universityId: 'nu', programId: 'management',   minEnt: 100, grantEnt: 112, competitiveEnt: 122, grantPlaces: 25, paidPlaces: 30, ieltsMin: 6.0, hasInterview: false, notes: ['Эссе о лидерстве важно'] },
      { universityId: 'nu', programId: 'law',          minEnt: 100, grantEnt: 115, competitiveEnt: 125, grantPlaces: 20, paidPlaces: 20, ieltsMin: 6.0, hasInterview: true,  notes: ['Дебаты, модель ООН — преимущество'] },
      { universityId: 'nu', programId: 'civil_eng',    minEnt: 98,  grantEnt: 110, competitiveEnt: 120, grantPlaces: 25, paidPlaces: 15, ieltsMin: 6.0, hasInterview: false, notes: [] },
      { universityId: 'nu', programId: 'petroleum_eng',minEnt: 98,  grantEnt: 110, competitiveEnt: 120, grantPlaces: 25, paidPlaces: 20, ieltsMin: 6.0, hasInterview: false, notes: ['Хорошая связь с нефтяными компаниями'] },
    ],
  },
  {
    id: 'kbtu',
    name: 'Казахстанско-Британский Технический Университет',
    shortName: 'КБТУ',
    city: 'Алматы',
    ranking: 2,
    logo: '🔬',
    tier: 1,
    url: 'https://kbtu.edu.kz',
    strengths: ['it', 'engineering', 'business'],
    requirements: [
      { universityId: 'kbtu', programId: 'cs',           minEnt: 90, grantEnt: 105, competitiveEnt: 115, grantPlaces: 35, paidPlaces: 40, ieltsMin: 5.5, hasInterview: false, notes: ['Программирование на C++ на вступительном'] },
      { universityId: 'kbtu', programId: 'software_eng', minEnt: 90, grantEnt: 105, competitiveEnt: 115, grantPlaces: 30, paidPlaces: 40, hasInterview: false, notes: [] },
      { universityId: 'kbtu', programId: 'petroleum_eng',minEnt: 85, grantEnt: 100, competitiveEnt: 112, grantPlaces: 40, paidPlaces: 50, hasInterview: false, notes: ['Топ по нефтегазу в KZ'] },
      { universityId: 'kbtu', programId: 'management',   minEnt: 85, grantEnt: 100, competitiveEnt: 112, grantPlaces: 30, paidPlaces: 50, hasInterview: false, notes: [] },
    ],
  },
  {
    id: 'iitu',
    name: 'Международный Университет Информационных Технологий',
    shortName: 'МУИТ',
    city: 'Алматы',
    ranking: 5,
    logo: '💻',
    tier: 2,
    url: 'https://iitu.edu.kz',
    strengths: ['it'],
    requirements: [
      { universityId: 'iitu', programId: 'cs',           minEnt: 75, grantEnt: 90,  competitiveEnt: 105, grantPlaces: 50, paidPlaces: 100, hasInterview: false, notes: ['Фокус только на IT', 'Много грантов'] },
      { universityId: 'iitu', programId: 'software_eng', minEnt: 75, grantEnt: 90,  competitiveEnt: 105, grantPlaces: 50, paidPlaces: 100, hasInterview: false, notes: [] },
      { universityId: 'iitu', programId: 'data_science', minEnt: 78, grantEnt: 92,  competitiveEnt: 108, grantPlaces: 30, paidPlaces: 50,  hasInterview: false, notes: [] },
    ],
  },
  {
    id: 'kaznu',
    name: 'КазНУ им. аль-Фараби',
    shortName: 'КазНУ',
    city: 'Алматы',
    ranking: 3,
    logo: '📚',
    tier: 2,
    url: 'https://kaznu.kz',
    strengths: ['natural_science', 'humanities', 'law', 'social', 'medicine'],
    requirements: [
      { universityId: 'kaznu', programId: 'medicine',    minEnt: 90, grantEnt: 108, competitiveEnt: 118, grantPlaces: 60, paidPlaces: 40, hasInterview: false, notes: ['Очень высокий конкурс на медицину'] },
      { universityId: 'kaznu', programId: 'law',         minEnt: 80, grantEnt: 95,  competitiveEnt: 108, grantPlaces: 50, paidPlaces: 50, hasInterview: false, notes: [] },
      { universityId: 'kaznu', programId: 'international',minEnt:78, grantEnt: 92,  competitiveEnt: 105, grantPlaces: 35, paidPlaces: 40, hasInterview: false, notes: [] },
      { universityId: 'kaznu', programId: 'biology_sci', minEnt: 72, grantEnt: 85,  competitiveEnt: 98,  grantPlaces: 40, paidPlaces: 30, hasInterview: false, notes: [] },
      { universityId: 'kaznu', programId: 'chemistry_sci',minEnt:70, grantEnt: 82,  competitiveEnt: 95,  grantPlaces: 35, paidPlaces: 25, hasInterview: false, notes: [] },
      { universityId: 'kaznu', programId: 'physics_sci', minEnt: 72, grantEnt: 85,  competitiveEnt: 98,  grantPlaces: 35, paidPlaces: 25, hasInterview: false, notes: [] },
    ],
  },
  {
    id: 'enu',
    name: 'ЕНУ им. Гумилёва',
    shortName: 'ЕНУ',
    city: 'Астана',
    ranking: 4,
    logo: '🏛️',
    tier: 2,
    url: 'https://enu.kz',
    strengths: ['humanities', 'law', 'education', 'social'],
    requirements: [
      { universityId: 'enu', programId: 'law',       minEnt: 75, grantEnt: 90, competitiveEnt: 105, grantPlaces: 60, paidPlaces: 60, hasInterview: false, notes: [] },
      { universityId: 'enu', programId: 'pedagogy',  minEnt: 65, grantEnt: 78, competitiveEnt: 92,  grantPlaces: 80, paidPlaces: 60, hasInterview: false, notes: ['Много бюджетных мест'] },
      { universityId: 'enu', programId: 'economics', minEnt: 72, grantEnt: 85, competitiveEnt: 98,  grantPlaces: 50, paidPlaces: 60, hasInterview: false, notes: [] },
    ],
  },
  {
    id: 'kaznmu',
    name: 'КазНМУ им. Асфендиярова',
    shortName: 'КазНМУ',
    city: 'Алматы',
    ranking: 6,
    logo: '🏥',
    tier: 2,
    url: 'https://kaznmu.kz',
    strengths: ['medicine'],
    requirements: [
      { universityId: 'kaznmu', programId: 'medicine',  minEnt: 85, grantEnt: 100, competitiveEnt: 115, grantPlaces: 100, paidPlaces: 80, hasInterview: false, notes: ['Специализированный медвуз', 'Высокий конкурс'] },
      { universityId: 'kaznmu', programId: 'pharmacy',  minEnt: 78, grantEnt: 92,  competitiveEnt: 108, grantPlaces: 60,  paidPlaces: 60, hasInterview: false, notes: [] },
      { universityId: 'kaznmu', programId: 'dentistry', minEnt: 80, grantEnt: 95,  competitiveEnt: 110, grantPlaces: 40,  paidPlaces: 50, hasInterview: false, notes: [] },
    ],
  },
]

// ── Probability calculation ───────────────────────────────────────────────────

export type ChanceLevel = 'high' | 'medium' | 'low' | 'reach' | 'impossible'

export interface UniversityChance {
  university: UniversityProfile
  requirement: UniversityRequirement
  program: Program
  entScore: number
  chanceGrant: number       // 0–100%
  chancePaid: number        // 0–100%
  level: ChanceLevel
  gap: number               // points needed for grant (negative = surplus)
  subjectGaps: SubjectGap[]
  recommendations: string[]
  timeToReady: number       // weeks of focused study needed
}

export interface SubjectGap {
  subject: Subject
  currentPct: number
  targetPct: number
  gap: number
  priority: 'critical' | 'high' | 'medium'
}

export function calcChance(entScore: number, req: UniversityRequirement): { grant: number; paid: number; level: ChanceLevel } {
  const gap = entScore - req.grantEnt

  let grant: number
  if (entScore >= req.competitiveEnt) {
    grant = 85 + Math.min(14, (entScore - req.competitiveEnt) * 2)
  } else if (entScore >= req.grantEnt) {
    grant = 50 + ((entScore - req.grantEnt) / (req.competitiveEnt - req.grantEnt)) * 35
  } else if (entScore >= req.minEnt) {
    grant = 5 + ((entScore - req.minEnt) / (req.grantEnt - req.minEnt)) * 44
  } else {
    grant = 0
  }

  const paid = entScore >= req.minEnt
    ? Math.min(95, 60 + ((entScore - req.minEnt) / 20) * 35)
    : 0

  let level: ChanceLevel
  if (grant >= 70) level = 'high'
  else if (grant >= 35) level = 'medium'
  else if (grant >= 10) level = 'low'
  else if (paid >= 50) level = 'reach'
  else level = 'impossible'

  return { grant: Math.round(grant), paid: Math.round(paid), level }
}

export function calcSubjectGaps(
  subjectScores: { subject: Subject; percentage: number }[],
  program: Program,
): SubjectGap[] {
  const gaps: SubjectGap[] = []

  for (const subject of program.requiredSubjects) {
    const score = subjectScores.find(s => s.subject === subject)
    const currentPct = score?.percentage ?? 0
    const targetPct = 80  // target for grant

    if (currentPct < targetPct) {
      gaps.push({
        subject,
        currentPct,
        targetPct,
        gap: targetPct - currentPct,
        priority: program.requiredSubjects.indexOf(subject) === 0 ? 'critical' : 'high',
      })
    }
  }

  for (const subject of program.bonusSubjects) {
    const score = subjectScores.find(s => s.subject === subject)
    const currentPct = score?.percentage ?? 0
    const targetPct = 70

    if (currentPct < targetPct) {
      gaps.push({ subject, currentPct, targetPct, gap: targetPct - currentPct, priority: 'medium' })
    }
  }

  return gaps.sort((a, b) => b.gap - a.gap)
}

export function buildRecommendations(
  gap: number,
  req: UniversityRequirement,
  subjectGaps: SubjectGap[],
): string[] {
  const recs: string[] = []

  if (gap > 20) {
    recs.push(`Нужно добрать ${gap} баллов ЕНТ — это реально за 6–9 месяцев интенсивной подготовки`)
  } else if (gap > 0) {
    recs.push(`Осталось всего ${gap} баллов до гранта — 3–4 месяца фокусированной работы`)
  } else {
    recs.push('Ваш балл уже на уровне гранта — поддерживайте темп')
  }

  const critical = subjectGaps.filter(g => g.priority === 'critical')
  if (critical.length > 0) {
    recs.push(`Критично подтянуть: ${critical.map(g => SUBJECT_LABELS[g.subject]).join(', ')}`)
  }

  if (req.hasInterview) {
    recs.push('Готовьтесь к собеседованию: изучите типовые вопросы, попрактикуйтесь в ответах')
  }

  if (req.ieltsMin) {
    recs.push(`Начните подготовку к IELTS ${req.ieltsMin}+ — это параллельная задача`)
  }

  req.notes.forEach(n => recs.push(n))

  return recs
}

// ── Subject labels ────────────────────────────────────────────────────────────

export const SUBJECT_LABELS: Record<Subject, string> = {
  math:        'Математика',
  physics:     'Физика',
  chemistry:   'Химия',
  biology:     'Биология',
  history:     'История Казахстана',
  english:     'Английский',
  kazakh:      'Казахский язык',
  russian:     'Русский язык',
  informatics: 'Информатика',
  geography:   'География',
  literature:  'Литература',
  ielts:       'IELTS',
}

// ── Field → programs mapping ──────────────────────────────────────────────────

export function getProgramsByField(field: StudyField): Program[] {
  return PROGRAMS.filter(p => p.field === field)
}

export function getUniversitiesByProgram(programId: string): UniversityProfile[] {
  return UNIVERSITIES.filter(u => u.requirements.some(r => r.programId === programId))
}

// ── Study field labels ────────────────────────────────────────────────────────

export const FIELD_LABELS: Record<StudyField, { label: string; emoji: string }> = {
  it:             { label: 'IT / Программирование', emoji: '💻' },
  engineering:    { label: 'Инженерия',              emoji: '⚙️' },
  medicine:       { label: 'Медицина',               emoji: '🏥' },
  business:       { label: 'Бизнес / Экономика',     emoji: '📊' },
  law:            { label: 'Право',                  emoji: '⚖️' },
  social:         { label: 'Социальные науки',        emoji: '🌍' },
  natural_science:{ label: 'Естественные науки',      emoji: '🔬' },
  humanities:     { label: 'Гуманитарные науки',      emoji: '📖' },
  education:      { label: 'Педагогика',             emoji: '📚' },
}

// ── Timeline estimate ─────────────────────────────────────────────────────────

export function estimateWeeks(pointsNeeded: number): number {
  if (pointsNeeded <= 0) return 0
  if (pointsNeeded <= 5) return 4
  if (pointsNeeded <= 10) return 8
  if (pointsNeeded <= 20) return 16
  if (pointsNeeded <= 30) return 24
  return 36
}
