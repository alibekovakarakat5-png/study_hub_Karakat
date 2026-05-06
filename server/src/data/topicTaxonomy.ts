// ── Topic taxonomy ──────────────────────────────────────────────────────────
//
// The single source of truth for topic IDs across the platform. We use stable
// kebab-case English IDs so renames don't break stored content, with Russian
// labels for UI display. New topics added here automatically become available
// to the tagger and the smart-assignment matcher.
//
// Adding new verticals (programming, IELTS, driving, etc.) is just appending
// entries — no DB migration needed. The matcher and picker iterate this list.

export interface TopicEntry {
  id: string         // 'quadratic-equations' — stable, kebab-case English
  label_ru: string   // 'Квадратные уравнения' — for UI
  subject: string    // 'math' — same set used elsewhere
}

export const TOPIC_TAXONOMY: TopicEntry[] = [
  // ── Math ───────────────────────────────────────────────────────────────
  { id: 'linear-equations',      label_ru: 'Линейные уравнения',     subject: 'math' },
  { id: 'quadratic-equations',   label_ru: 'Квадратные уравнения',   subject: 'math' },
  { id: 'inequalities',          label_ru: 'Неравенства',            subject: 'math' },
  { id: 'functions-graphs',      label_ru: 'Функции и графики',      subject: 'math' },
  { id: 'trigonometry',          label_ru: 'Тригонометрия',          subject: 'math' },
  { id: 'powers-logarithms',     label_ru: 'Степени и логарифмы',    subject: 'math' },
  { id: 'derivatives-integrals', label_ru: 'Производные и интегралы', subject: 'math' },
  { id: 'geometry-planimetry',   label_ru: 'Планиметрия',            subject: 'math' },
  { id: 'geometry-stereometry',  label_ru: 'Стереометрия',           subject: 'math' },
  { id: 'probability',           label_ru: 'Вероятность и статистика', subject: 'math' },

  // ── Physics ────────────────────────────────────────────────────────────
  { id: 'kinematics',            label_ru: 'Кинематика',             subject: 'physics' },
  { id: 'dynamics',              label_ru: 'Динамика',               subject: 'physics' },
  { id: 'energy-momentum',       label_ru: 'Энергия и импульс',      subject: 'physics' },
  { id: 'thermodynamics',        label_ru: 'Термодинамика',          subject: 'physics' },
  { id: 'electricity',           label_ru: 'Электричество',          subject: 'physics' },
  { id: 'magnetism',             label_ru: 'Магнетизм',              subject: 'physics' },
  { id: 'optics',                label_ru: 'Оптика',                 subject: 'physics' },
  { id: 'atomic-physics',        label_ru: 'Атомная физика',         subject: 'physics' },

  // ── Chemistry ──────────────────────────────────────────────────────────
  { id: 'atomic-structure',      label_ru: 'Строение атома',         subject: 'chemistry' },
  { id: 'periodic-law',          label_ru: 'Периодический закон',    subject: 'chemistry' },
  { id: 'chemical-bonding',      label_ru: 'Химическая связь',       subject: 'chemistry' },
  { id: 'reactions-equations',   label_ru: 'Химические реакции',     subject: 'chemistry' },
  { id: 'solutions',             label_ru: 'Растворы',               subject: 'chemistry' },
  { id: 'organic-chemistry',     label_ru: 'Органическая химия',     subject: 'chemistry' },
  { id: 'metals-nonmetals',      label_ru: 'Металлы и неметаллы',    subject: 'chemistry' },

  // ── Biology ────────────────────────────────────────────────────────────
  { id: 'cell-biology',          label_ru: 'Клеточная биология',     subject: 'biology' },
  { id: 'genetics',              label_ru: 'Генетика',               subject: 'biology' },
  { id: 'evolution',             label_ru: 'Эволюция',               subject: 'biology' },
  { id: 'human-anatomy',         label_ru: 'Анатомия человека',      subject: 'biology' },
  { id: 'botany',                label_ru: 'Ботаника',               subject: 'biology' },
  { id: 'zoology',               label_ru: 'Зоология',               subject: 'biology' },
  { id: 'ecology',               label_ru: 'Экология',               subject: 'biology' },
  { id: 'reproduction',          label_ru: 'Размножение',            subject: 'biology' },

  // ── History of Kazakhstan ──────────────────────────────────────────────
  { id: 'ancient-kz',            label_ru: 'Древний Казахстан',      subject: 'history' },
  { id: 'medieval-states',       label_ru: 'Средневековые государства', subject: 'history' },
  { id: 'kazakh-khanate',        label_ru: 'Казахское ханство',      subject: 'history' },
  { id: 'jungar-invasion',       label_ru: 'Джунгарское нашествие',  subject: 'history' },
  { id: 'russian-colonisation',  label_ru: 'Присоединение к России', subject: 'history' },
  { id: 'national-uprisings',    label_ru: 'Национальные восстания', subject: 'history' },
  { id: 'soviet-kz',             label_ru: 'Советский Казахстан',    subject: 'history' },
  { id: 'modern-kz',             label_ru: 'Современный Казахстан',  subject: 'history' },

  // ── English ────────────────────────────────────────────────────────────
  { id: 'grammar-tenses',        label_ru: 'Времена глагола',        subject: 'english' },
  { id: 'grammar-articles',      label_ru: 'Артикли',                subject: 'english' },
  { id: 'grammar-conditionals',  label_ru: 'Условные предложения',   subject: 'english' },
  { id: 'reading-skills',        label_ru: 'Чтение',                 subject: 'english' },
  { id: 'vocabulary-academic',   label_ru: 'Академическая лексика',  subject: 'english' },

  // ── Geography ──────────────────────────────────────────────────────────
  { id: 'physical-geography',    label_ru: 'Физическая география',   subject: 'geography' },
  { id: 'economic-geography',    label_ru: 'Экономическая география', subject: 'geography' },
  { id: 'world-regions',         label_ru: 'Регионы мира',           subject: 'geography' },
  { id: 'kz-geography',          label_ru: 'География Казахстана',   subject: 'geography' },

  // ── Informatics ────────────────────────────────────────────────────────
  { id: 'algorithms',            label_ru: 'Алгоритмы',              subject: 'informatics' },
  { id: 'programming-basics',    label_ru: 'Основы программирования', subject: 'informatics' },
  { id: 'data-structures',       label_ru: 'Структуры данных',       subject: 'informatics' },
  { id: 'number-systems',        label_ru: 'Системы счисления',      subject: 'informatics' },
  { id: 'logic-gates',           label_ru: 'Логические операции',    subject: 'informatics' },
]

// ── Helpers ─────────────────────────────────────────────────────────────────

export function topicsForSubject(subject: string): TopicEntry[] {
  return TOPIC_TAXONOMY.filter((t) => t.subject === subject)
}

export function isValidTopicId(id: string): boolean {
  return TOPIC_TAXONOMY.some((t) => t.id === id)
}

export function topicLabel(id: string): string | null {
  return TOPIC_TAXONOMY.find((t) => t.id === id)?.label_ru ?? null
}
