// ── Admissions & Scholarships Data ────────────────────────────────────────────
// All deadlines are stored with a `verifiedAt` date.
// The backend checks for staleness and flags outdated entries.

export type DeadlineType = 'application' | 'documents' | 'exam' | 'results' | 'scholarship'
export type Category = 'kz_university' | 'international' | 'scholarship' | 'internship' | 'grant'
export type DeadlineStatus = 'upcoming' | 'soon' | 'passed' | 'unknown'

export interface AdmissionDeadline {
  date: string         // ISO date YYYY-MM-DD
  label: string
  type: DeadlineType
}

export interface AdmissionEntry {
  id: string
  category: Category
  name: string
  shortName?: string
  country: string
  city?: string
  logo?: string                  // emoji fallback
  description: string
  url: string
  deadlines: AdmissionDeadline[]
  requirements: string[]
  fundingType: 'free' | 'grant' | 'paid' | 'partial'
  fundingNote?: string
  tags: string[]
  verifiedAt: string             // when we last checked this data
  sourceUrl: string              // official source to reverify
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getDeadlineStatus(dateStr: string): DeadlineStatus {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = date.getTime() - now.getTime()
  const days = diff / (1000 * 60 * 60 * 24)
  if (days < 0) return 'passed'
  if (days <= 30) return 'soon'
  if (days <= 180) return 'upcoming'
  return 'upcoming'
}

export function isDataStale(verifiedAt: string, staleDays = 90): boolean {
  const verified = new Date(verifiedAt)
  const now = new Date()
  return (now.getTime() - verified.getTime()) / (1000 * 60 * 60 * 24) > staleDays
}

export function nearestDeadline(entry: AdmissionEntry): AdmissionDeadline | null {
  const now = new Date()
  const future = entry.deadlines
    .filter(d => new Date(d.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  return future[0] ?? null
}

// ── Kazakhstan Universities ───────────────────────────────────────────────────

export const KZ_UNIVERSITIES: AdmissionEntry[] = [
  {
    id: 'nu',
    category: 'kz_university',
    name: 'Назарбаев Университет',
    shortName: 'NU',
    country: 'Казахстан',
    city: 'Астана',
    logo: '🎓',
    description: 'Топ-1 университет Казахстана. Обучение на английском, международные партнёры (Cambridge, UCL, Duke). Гранты на 100% покрытие.',
    url: 'https://nu.edu.kz',
    deadlines: [
      { date: '2025-12-01', label: 'Открытие приёма документов', type: 'application' },
      { date: '2026-02-15', label: 'Дедлайн подачи заявки (ранний)', type: 'application' },
      { date: '2026-04-01', label: 'Дедлайн подачи заявки (основной)', type: 'application' },
      { date: '2026-04-20', label: 'Вступительный тест', type: 'exam' },
      { date: '2026-05-15', label: 'Объявление результатов', type: 'results' },
    ],
    requirements: [
      'ЕНТ от 100 баллов (рекомендуется 110+)',
      'IELTS 6.0+ или TOEFL 79+',
      'Мотивационное письмо',
      'Рекомендательные письма (2 шт.)',
      'Портфолио достижений',
    ],
    fundingType: 'grant',
    fundingNote: 'Гранты НУ покрывают 100% обучения + стипендия. Конкурс высокий.',
    tags: ['английский', 'грант', 'международный', 'астана'],
    verifiedAt: '2026-03-05',
    sourceUrl: 'https://nu.edu.kz/admissions',
  },
  {
    id: 'kbtu',
    category: 'kz_university',
    name: 'Казахстанско-Британский Технический Университет',
    shortName: 'КБТУ',
    country: 'Казахстан',
    city: 'Алматы',
    logo: '🔬',
    description: 'Лидер в IT, нефтегазе и бизнесе. Партнёрство с University of Greenwich (Лондон). Обучение на английском.',
    url: 'https://kbtu.edu.kz',
    deadlines: [
      { date: '2026-03-01', label: 'Начало приёма документов', type: 'application' },
      { date: '2026-06-01', label: 'Приём документов закрыт', type: 'application' },
      { date: '2026-06-20', label: 'Вступительные экзамены', type: 'exam' },
      { date: '2026-07-10', label: 'Результаты', type: 'results' },
    ],
    requirements: [
      'ЕНТ от 90 баллов',
      'IELTS 5.5+ (для английских программ)',
      'Собеседование (для некоторых программ)',
      'Аттестат с отличием — преимущество',
    ],
    fundingType: 'partial',
    fundingNote: 'Государственные гранты + внутренние гранты КБТУ. Подавайте одновременно.',
    tags: ['IT', 'инженерия', 'нефтегаз', 'алматы', 'английский'],
    verifiedAt: '2026-03-05',
    sourceUrl: 'https://kbtu.edu.kz/ru/admission',
  },
  {
    id: 'kaznu',
    category: 'kz_university',
    name: 'КазНУ им. аль-Фараби',
    shortName: 'КазНУ',
    country: 'Казахстан',
    city: 'Алматы',
    logo: '📚',
    description: 'Крупнейший классический университет Казахстана. Широкий спектр специальностей, научная база, международные программы.',
    url: 'https://kaznu.kz',
    deadlines: [
      { date: '2026-06-01', label: 'Подача заявки (через Platonus)', type: 'application' },
      { date: '2026-07-05', label: 'Зачисление по гранту', type: 'results' },
      { date: '2026-08-01', label: 'Зачисление на платной основе', type: 'results' },
    ],
    requirements: [
      'ЕНТ (профильные предметы зависят от специальности)',
      'Аттестат об общем среднем образовании',
      'Грант МОН РК или платное обучение',
    ],
    fundingType: 'grant',
    fundingNote: 'Государственный образовательный грант через МОН РК (единый конкурс).',
    tags: ['классический', 'алматы', 'грант', 'все специальности'],
    verifiedAt: '2026-03-05',
    sourceUrl: 'https://kaznu.kz/ru/content/pages/4',
  },
  {
    id: 'enu',
    category: 'kz_university',
    name: 'ЕНУ им. Л.Н. Гумилева',
    shortName: 'ЕНУ',
    country: 'Казахстан',
    city: 'Астана',
    logo: '🏛️',
    description: 'Ведущий университет столицы. Флагман в гуманитарных и социальных науках, юриспруденции, педагогике.',
    url: 'https://enu.kz',
    deadlines: [
      { date: '2026-06-01', label: 'Приём документов', type: 'application' },
      { date: '2026-07-10', label: 'Результаты зачисления', type: 'results' },
    ],
    requirements: [
      'ЕНТ (профильные предметы)',
      'Аттестат',
      'Грант МОН или платное',
    ],
    fundingType: 'grant',
    tags: ['астана', 'гуманитарные', 'право', 'педагогика'],
    verifiedAt: '2026-03-05',
    sourceUrl: 'https://enu.kz/ru/abiturient',
  },
]

// ── International Universities (for KZ applicants) ────────────────────────────

export const INTERNATIONAL_UNIVERSITIES: AdmissionEntry[] = [
  {
    id: 'qmul',
    category: 'international',
    name: 'Queen Mary University of London',
    shortName: 'QMUL',
    country: 'Великобритания',
    city: 'Лондон',
    logo: '🇬🇧',
    description: 'Топ-120 QS. Сильный IT, право, медицина. Активно принимает казахстанских студентов. Scholarships до £5,000.',
    url: 'https://qmul.ac.uk',
    deadlines: [
      { date: '2026-01-15', label: 'UCAS дедлайн (медицина/право)', type: 'application' },
      { date: '2026-06-30', label: 'UCAS дедлайн (остальные программы)', type: 'application' },
    ],
    requirements: [
      'IELTS 6.5+ (7.0 для медицины/права)',
      'A-Levels или международный эквивалент',
      'Personal Statement через UCAS',
      'Рекомендательное письмо от учителя',
    ],
    fundingType: 'partial',
    fundingNote: 'Queen Mary Excellence Scholarship — до £5,000/год для международных студентов.',
    tags: ['UK', 'лондон', 'UCAS', 'стипендия'],
    verifiedAt: '2026-03-05',
    sourceUrl: 'https://www.qmul.ac.uk/international/international-students/central-asia/',
  },
  {
    id: 'free_berlin',
    category: 'international',
    name: 'Freie Universität Berlin',
    shortName: 'FU Berlin',
    country: 'Германия',
    city: 'Берлин',
    logo: '🇩🇪',
    description: 'Топ-100 QS. Бесплатное обучение для всех студентов (~330€/семестр сбор). Программы на английском и немецком.',
    url: 'https://fu-berlin.de',
    deadlines: [
      { date: '2026-05-15', label: 'Дедлайн (зимний семестр, англ. программы)', type: 'application' },
      { date: '2026-11-15', label: 'Дедлайн (летний семестр)', type: 'application' },
    ],
    requirements: [
      'Диплом/аттестат с признанием в Германии (anabin)',
      'IELTS 6.5+ или TestDaF для немецких программ',
      'Мотивационное письмо',
      'APS-сертификат для KZ (обязателен)',
    ],
    fundingType: 'free',
    fundingNote: 'Обучение бесплатное. Нужен APS-сертификат (проверка документов, ~4-6 мес процесс).',
    tags: ['Германия', 'бесплатно', 'берлин', 'APS'],
    verifiedAt: '2026-03-05',
    sourceUrl: 'https://www.fu-berlin.de/en/studium/studienbuero/international/incoming/index.html',
  },
  {
    id: 'ceu',
    category: 'international',
    name: 'Central European University',
    shortName: 'CEU',
    country: 'Австрия',
    city: 'Вена',
    logo: '🇦🇹',
    description: 'Элитный университет для социальных наук, права, политики. 100% на английском. Щедрые стипендии для студентов из постсоветских стран.',
    url: 'https://ceu.edu',
    deadlines: [
      { date: '2026-01-15', label: 'Приоритетный дедлайн (стипендии)', type: 'scholarship' },
      { date: '2026-04-01', label: 'Финальный дедлайн', type: 'application' },
    ],
    requirements: [
      'Степень бакалавра (для магистратуры)',
      'IELTS 6.5+ или TOEFL 90+',
      'Мотивационное письмо (writing sample)',
      'Рекомендательные письма (2-3)',
    ],
    fundingType: 'grant',
    fundingNote: 'CEU Scholarship покрывает полное обучение + стипендию для студентов из СНГ.',
    tags: ['постсоветские', 'социальные науки', 'стипендия', 'вена'],
    verifiedAt: '2026-03-05',
    sourceUrl: 'https://www.ceu.edu/admissions/financial-aid',
  },
]

// ── Scholarships & Grants ─────────────────────────────────────────────────────

export const SCHOLARSHIPS: AdmissionEntry[] = [
  {
    id: 'bolashak',
    category: 'scholarship',
    name: 'Стипендия Президента РК «Болашак»',
    country: 'Казахстан → Весь мир',
    logo: '⭐',
    description: 'Государственная стипендия для обучения в топ-200 университетах мира. Покрывает ВСЕ расходы: обучение, жильё, проезд, страховку. Обязательство вернуться в KZ на 5 лет.',
    url: 'https://bolashak.gov.kz',
    deadlines: [
      { date: '2026-02-01', label: 'Открытие конкурса', type: 'application' },
      { date: '2026-04-30', label: 'Дедлайн подачи документов', type: 'application' },
      { date: '2026-06-30', label: 'Объявление победителей', type: 'results' },
    ],
    requirements: [
      'Гражданство РК',
      'Возраст до 35 лет (бакалавриат), до 40 (магистратура)',
      'Опыт работы по специальности 3+ года (для магистров)',
      'IELTS 6.5+ / TOEFL 79+ / DELF B2+',
      'Поступление в университет из списка Болашак',
      'Рекомендация работодателя',
    ],
    fundingType: 'grant',
    fundingNote: '100% покрытие всех расходов. После окончания — обязательная работа в KZ 5 лет.',
    tags: ['государственный', 'полное покрытие', 'работа в KZ', 'топ-университеты'],
    verifiedAt: '2026-03-05',
    sourceUrl: 'https://bolashak.gov.kz/ru/o-stipendii/bolashak/usloviya-uchastiya.html',
  },
  {
    id: 'chevening',
    category: 'scholarship',
    name: 'Стипендия Chevening (UK)',
    country: 'Великобритания',
    logo: '🇬🇧',
    description: 'Британская правительственная стипендия. 1 год магистратуры в любом университете UK. Полное покрытие + стипендия £1,000/мес. Для будущих лидеров.',
    url: 'https://chevening.org',
    deadlines: [
      { date: '2025-11-04', label: 'Открытие приёма заявок', type: 'application' },
      { date: '2026-11-04', label: 'Дедлайн заявки', type: 'application' },
      { date: '2026-02-01', label: 'Интервью (приглашённые)', type: 'exam' },
      { date: '2026-06-01', label: 'Объявление победителей', type: 'results' },
    ],
    requirements: [
      'Гражданство РК',
      'Степень бакалавра',
      'Опыт работы 2+ года',
      'IELTS 6.5+ (требования каждого университета)',
      '3 рекомендательных письма',
      'Эссе о лидерстве и влиянии',
    ],
    fundingType: 'grant',
    fundingNote: 'Полное покрытие: обучение + авиабилеты + жильё + £1,000/мес.',
    tags: ['UK', 'магистратура', 'лидерство', 'правительство', 'полное покрытие'],
    verifiedAt: '2026-03-05',
    sourceUrl: 'https://www.chevening.org/scholarship/kazakhstan/',
  },
  {
    id: 'daad',
    category: 'scholarship',
    name: 'Стипендия DAAD (Германия)',
    country: 'Германия',
    logo: '🇩🇪',
    description: 'Немецкая служба академических обменов. Десятки программ: бакалавриат, магистратура, аспирантура. Покрытие от €750/мес.',
    url: 'https://daad.de',
    deadlines: [
      { date: '2025-10-15', label: 'Development-Related Postgraduate Courses', type: 'application' },
      { date: '2025-12-01', label: 'Programmes for Graduates (Master)', type: 'application' },
      { date: '2026-01-31', label: 'Research Grants (PhD)', type: 'application' },
    ],
    requirements: [
      'Степень бакалавра (для магистратуры)',
      'Немецкий B2 или английский C1',
      'Академические достижения (GPA 3.5+)',
      'Мотивационное письмо, CV',
    ],
    fundingType: 'grant',
    fundingNote: 'От €750 до €1,200/мес + медстраховка + перелёт.',
    tags: ['Германия', 'магистратура', 'PhD', 'исследования'],
    verifiedAt: '2026-03-05',
    sourceUrl: 'https://www.daad.de/en/study-and-research-in-germany/scholarships/',
  },
  {
    id: 'erasmus',
    category: 'scholarship',
    name: 'Erasmus+ (обмен)',
    country: 'Европа',
    logo: '🇪🇺',
    description: 'Программа студенческого обмена EU. Семестр/год в европейском университете. Грант €600–800/мес. Без потери года — учёба засчитывается.',
    url: 'https://erasmus-plus.ec.europa.eu',
    deadlines: [
      { date: '2026-01-31', label: 'Конкурс в вашем университете (осенний семестр)', type: 'application' },
      { date: '2026-09-30', label: 'Конкурс (весенний семестр)', type: 'application' },
    ],
    requirements: [
      'Студент KZ-университета с соглашением Erasmus+',
      'Минимум 2-й курс бакалавриата',
      'IELTS 5.5+ или B2 принимающей страны',
      'Средний балл GPA 3.0+',
      'Мотивационное письмо',
    ],
    fundingType: 'grant',
    fundingNote: 'Подавать через свой KZ-университет (отдел международного сотрудничества).',
    tags: ['обмен', 'Европа', 'семестр', 'через свой вуз'],
    verifiedAt: '2026-03-05',
    sourceUrl: 'https://erasmus-plus.ec.europa.eu/opportunities/opportunities-for-individuals/students',
  },
]

// ── Internships ───────────────────────────────────────────────────────────────

export const INTERNSHIPS: AdmissionEntry[] = [
  {
    id: 'samruk',
    category: 'internship',
    name: 'Стажировка Samruk-Kazyna',
    country: 'Казахстан',
    logo: '🏢',
    description: 'Крупнейший работодатель Казахстана. Стажировки в КазМунайГаз, Казахтелеком, Air Astana и других дочерних компаниях.',
    url: 'https://samruk.kz',
    deadlines: [
      { date: '2026-02-28', label: 'Весенний набор', type: 'application' },
      { date: '2026-07-31', label: 'Летний набор', type: 'application' },
      { date: '2026-10-31', label: 'Осенний набор', type: 'application' },
    ],
    requirements: [
      'Студент 3-4 курса или выпускник',
      'GPA 3.0+',
      'Казахский и/или русский язык',
      'Английский язык — преимущество',
      'CV и мотивационное письмо',
    ],
    fundingType: 'paid',
    fundingNote: 'Оплачиваемая стажировка. Размер оплаты зависит от компании.',
    tags: ['оплачиваемая', 'KZ', 'государственная', 'нефтегаз', 'IT'],
    verifiedAt: '2026-03-05',
    sourceUrl: 'https://samruk.kz/ru/career/internship',
  },
  {
    id: 'kaspi',
    category: 'internship',
    name: 'Стажировка Kaspi.kz',
    country: 'Казахстан',
    logo: '💳',
    description: 'Ведущий финтех Казахстана. Стажировки в IT, продукте, аналитике, маркетинге. Высокий уровень культуры и технологий.',
    url: 'https://kaspi.kz/careers',
    deadlines: [
      { date: '2026-03-01', label: 'Летняя стажировка — дедлайн', type: 'application' },
      { date: '2025-12-01', label: 'Зимняя стажировка — дедлайн', type: 'application' },
    ],
    requirements: [
      'Студент IT/математических/экономических специальностей',
      'Опыт программирования (Python, Java, JS — в зависимости от направления)',
      'Английский B2+',
      'Тестовое задание (онлайн)',
    ],
    fundingType: 'paid',
    fundingNote: 'Конкурентная оплата. Лучшие стажёры получают оффер.',
    tags: ['финтех', 'IT', 'оплачиваемая', 'алматы'],
    verifiedAt: '2026-03-05',
    sourceUrl: 'https://kaspi.kz/careers',
  },
  {
    id: 'google_step',
    category: 'internship',
    name: 'Google STEP Internship',
    country: 'США / Европа',
    logo: '🔍',
    description: 'Google Student Training in Engineering Program. Для студентов 1-2 курса. 12 недель оплачиваемой стажировки + менторство.',
    url: 'https://careers.google.com/programs/students/',
    deadlines: [
      { date: '2025-11-01', label: 'Открытие приёма (летняя стажировка)', type: 'application' },
      { date: '2026-01-31', label: 'Дедлайн заявки', type: 'application' },
    ],
    requirements: [
      'Студент 1-2 курса CS/Software Engineering',
      'Знание минимум одного языка: Python, Java, C++, Go',
      'Английский B2+',
      'Coding interview (LeetCode уровень)',
    ],
    fundingType: 'paid',
    fundingNote: '$7,000–$9,000/мес + жильё от Google. Сильно конкурентно.',
    tags: ['международная', 'IT', 'США', 'Google', 'высокий конкурс'],
    verifiedAt: '2026-03-05',
    sourceUrl: 'https://careers.google.com/programs/students/',
  },
  {
    id: 'nu_research',
    category: 'internship',
    name: 'Исследовательская стажировка NU (URAP)',
    country: 'Казахстан',
    logo: '🔬',
    description: 'Undergraduate Research Apprenticeship Program в Назарбаев Университете. Работа с профессорами мирового уровня.',
    url: 'https://nu.edu.kz/research',
    deadlines: [
      { date: '2026-01-20', label: 'Заявки на весенний семестр', type: 'application' },
      { date: '2026-08-20', label: 'Заявки на осенний семестр', type: 'application' },
    ],
    requirements: [
      'Студент любого KZ-университета',
      'GPA 3.5+',
      'Исследовательский интерес в конкретной области',
      'Письмо профессору NU с описанием интереса',
    ],
    fundingType: 'paid',
    fundingNote: 'Небольшая стипендия + бесценный опыт для поступления в магистратуру за рубежом.',
    tags: ['исследования', 'астана', 'академия', 'наука'],
    verifiedAt: '2026-03-05',
    sourceUrl: 'https://nu.edu.kz/academics/undergraduate/undergraduate-research',
  },
]

// ── All combined ──────────────────────────────────────────────────────────────

export const ALL_ENTRIES: AdmissionEntry[] = [
  ...KZ_UNIVERSITIES,
  ...INTERNATIONAL_UNIVERSITIES,
  ...SCHOLARSHIPS,
  ...INTERNSHIPS,
]

export const CATEGORY_META: Record<Category, { label: string; emoji: string; color: string }> = {
  kz_university:  { label: 'Университеты KZ',    emoji: '🏛️', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  international:  { label: 'Зарубежные вузы',    emoji: '🌍', color: 'bg-purple-50 text-purple-700 border-purple-100' },
  scholarship:    { label: 'Стипендии / Гранты', emoji: '⭐', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  internship:     { label: 'Стажировки',          emoji: '💼', color: 'bg-green-50 text-green-700 border-green-100' },
  grant:          { label: 'Гранты',              emoji: '🎯', color: 'bg-rose-50 text-rose-700 border-rose-100' },
}

export const FUNDING_META: Record<string, { label: string; color: string }> = {
  free:    { label: 'Бесплатно',         color: 'bg-green-100 text-green-700' },
  grant:   { label: 'Грант / Стипендия', color: 'bg-amber-100 text-amber-700' },
  paid:    { label: 'Оплачиваемая',      color: 'bg-blue-100 text-blue-700' },
  partial: { label: 'Частичное покрытие',color: 'bg-slate-100 text-slate-700' },
}
