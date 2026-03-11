// ── Viral Career Test Data ────────────────────────────────────────────────────
// 12 questions → 6 personality axes → 18 profession matches

export type PersonalityAxis =
  | 'tech'        // технарь / разработчик
  | 'creative'    // творческий / дизайнер
  | 'analyst'     // аналитик / финансист
  | 'leader'      // лидер / предприниматель
  | 'helper'      // помощник / врач / учитель
  | 'maker'       // строитель / инженер

export interface TestAnswer {
  text: string
  emoji: string
  scores: Partial<Record<PersonalityAxis, number>>
}

export interface TestQuestion {
  id: number
  question: string
  emoji: string
  answers: TestAnswer[]
}

export interface PersonalityType {
  id: PersonalityAxis
  title: string
  subtitle: string
  emoji: string
  color: string
  gradient: string
  traits: string[]
  professions: Profession[]
  description: string
  studyhubPath: string
  studyhubCta: string
}

export interface Profession {
  title: string
  emoji: string
  salary: string
  demand: 'высокий' | 'очень высокий' | 'средний'
}

// ── Questions ─────────────────────────────────────────────────────────────────

export const CAREER_TEST_QUESTIONS: TestQuestion[] = [
  {
    id: 1,
    question: 'Пятница вечером. Ты свободен. Что выбираешь?',
    emoji: '🌙',
    answers: [
      { text: 'Пишу код или изучаю новую технологию', emoji: '💻', scores: { tech: 3, analyst: 1 } },
      { text: 'Рисую, снимаю видео или слушаю музыку', emoji: '🎨', scores: { creative: 3, maker: 1 } },
      { text: 'Читаю книгу или смотрю документалку', emoji: '📚', scores: { analyst: 3, helper: 1 } },
      { text: 'Встречаюсь с друзьями, планирую что-то', emoji: '🎉', scores: { leader: 3, helper: 1 } },
    ],
  },
  {
    id: 2,
    question: 'В команде ты обычно...',
    emoji: '👥',
    answers: [
      { text: 'Решаю технические задачи', emoji: '⚙️', scores: { tech: 3, maker: 1 } },
      { text: 'Придумываю идеи и концепции', emoji: '💡', scores: { creative: 3, leader: 1 } },
      { text: 'Анализирую данные и предлагаю решения', emoji: '📊', scores: { analyst: 3, tech: 1 } },
      { text: 'Веду команду и мотивирую людей', emoji: '🚀', scores: { leader: 3, helper: 1 } },
    ],
  },
  {
    id: 3,
    question: 'Какой предмет в школе нравился больше всего?',
    emoji: '📚',
    answers: [
      { text: 'Математика или информатика', emoji: '🔢', scores: { tech: 2, analyst: 2 } },
      { text: 'Рисование, музыка или литература', emoji: '🎭', scores: { creative: 3, helper: 1 } },
      { text: 'История, обществознание, экономика', emoji: '🌍', scores: { analyst: 2, leader: 2 } },
      { text: 'Биология, химия, физика', emoji: '🔬', scores: { maker: 2, analyst: 2 } },
    ],
  },
  {
    id: 4,
    question: 'Ты видишь сломанный механизм. Твоя реакция?',
    emoji: '🔧',
    answers: [
      { text: 'Разбираю и чиню — это интересная задача', emoji: '🛠️', scores: { maker: 3, tech: 1 } },
      { text: 'Придумываю как сделать его красивее', emoji: '✨', scores: { creative: 3, maker: 1 } },
      { text: 'Ищу информацию — почему он сломался', emoji: '🔍', scores: { analyst: 3, tech: 1 } },
      { text: 'Нахожу кого-то кто умеет это чинить', emoji: '📞', scores: { leader: 2, helper: 2 } },
    ],
  },
  {
    id: 5,
    question: 'Что важнее в работе?',
    emoji: '💼',
    answers: [
      { text: 'Решать сложные технические задачи', emoji: '⚡', scores: { tech: 3, analyst: 1 } },
      { text: 'Создавать что-то красивое и уникальное', emoji: '🎨', scores: { creative: 3 } },
      { text: 'Помогать людям и менять их жизни', emoji: '❤️', scores: { helper: 3, leader: 1 } },
      { text: 'Строить бизнес и принимать решения', emoji: '💰', scores: { leader: 3, analyst: 1 } },
    ],
  },
  {
    id: 6,
    question: 'Твой идеальный рабочий день выглядит как...',
    emoji: '☀️',
    answers: [
      { text: 'Пишу код в тишине, наушники в ушах', emoji: '🎧', scores: { tech: 3 } },
      { text: 'Создаю контент, дизайн, что-то визуальное', emoji: '🖼️', scores: { creative: 3, maker: 1 } },
      { text: 'Встречи, переговоры, принятие решений', emoji: '🤝', scores: { leader: 3, helper: 1 } },
      { text: 'Исследования, отчёты, работа с данными', emoji: '📈', scores: { analyst: 3, tech: 1 } },
    ],
  },
  {
    id: 7,
    question: 'Если бы у тебя было $100,000, ты бы...',
    emoji: '💵',
    answers: [
      { text: 'Запустил стартап или своё дело', emoji: '🚀', scores: { leader: 3, tech: 1 } },
      { text: 'Инвестировал и изучил финансы', emoji: '📊', scores: { analyst: 3, leader: 1 } },
      { text: 'Создал творческий проект или студию', emoji: '🎬', scores: { creative: 3, maker: 1 } },
      { text: 'Помог семье или открыл социальный проект', emoji: '🫶', scores: { helper: 3, leader: 1 } },
    ],
  },
  {
    id: 8,
    question: 'Тебя больше восхищает...',
    emoji: '🌟',
    answers: [
      { text: 'Как работает ChatGPT или Tesla', emoji: '🤖', scores: { tech: 3, analyst: 1 } },
      { text: 'Как создаются фильмы Marvel или игры', emoji: '🎮', scores: { creative: 3, maker: 1 } },
      { text: 'Как маленькие стартапы становятся миллиардными', emoji: '📈', scores: { leader: 3, analyst: 1 } },
      { text: 'Как врачи спасают жизни', emoji: '🏥', scores: { helper: 3, maker: 1 } },
    ],
  },
  {
    id: 9,
    question: 'Как ты принимаешь решения?',
    emoji: '🧠',
    answers: [
      { text: 'Логически, взвешивая все данные', emoji: '⚖️', scores: { analyst: 3, tech: 1 } },
      { text: 'По интуиции и ощущениям', emoji: '✨', scores: { creative: 2, helper: 2 } },
      { text: 'Советуюсь с людьми, слушаю мнения', emoji: '👂', scores: { helper: 2, leader: 2 } },
      { text: 'Быстро — время = деньги', emoji: '⚡', scores: { leader: 3, tech: 1 } },
    ],
  },
  {
    id: 10,
    question: 'Какая суперсила тебе ближе?',
    emoji: '🦸',
    answers: [
      { text: 'Программировать что угодно мгновенно', emoji: '💻', scores: { tech: 3 } },
      { text: 'Создавать шедевры искусства', emoji: '🖌️', scores: { creative: 3 } },
      { text: 'Понимать любые числа и рынки', emoji: '📊', scores: { analyst: 3 } },
      { text: 'Убеждать и вдохновлять людей', emoji: '🗣️', scores: { leader: 3, helper: 1 } },
    ],
  },
  {
    id: 11,
    question: 'Что тебя раздражает больше всего?',
    emoji: '😤',
    answers: [
      { text: 'Когда технологии работают медленно или ломаются', emoji: '🐌', scores: { tech: 2, maker: 2 } },
      { text: 'Когда нет места для творчества', emoji: '🎨', scores: { creative: 3 } },
      { text: 'Когда нет чётких данных и всё хаотично', emoji: '📉', scores: { analyst: 3 } },
      { text: 'Когда людям не помогают когда надо', emoji: '😢', scores: { helper: 3 } },
    ],
  },
  {
    id: 12,
    question: 'Через 10 лет ты хочешь...',
    emoji: '🔮',
    answers: [
      { text: 'Быть senior dev или CTO в крутой компании', emoji: '🏆', scores: { tech: 3, leader: 1 } },
      { text: 'Иметь своё агентство или творческий бизнес', emoji: '🎯', scores: { creative: 2, leader: 2 } },
      { text: 'Запустить стартап или стать инвестором', emoji: '💎', scores: { leader: 3, analyst: 1 } },
      { text: 'Помогать людям — врач, психолог, педагог', emoji: '❤️', scores: { helper: 3 } },
    ],
  },
]

// ── Personality types ──────────────────────────────────────────────────────────

export const PERSONALITY_TYPES: Record<PersonalityAxis, PersonalityType> = {
  tech: {
    id: 'tech',
    title: 'Tech Builder',
    subtitle: 'Строитель цифрового будущего',
    emoji: '🤖',
    color: '#3B82F6',
    gradient: 'from-blue-600 to-cyan-500',
    traits: ['Логическое мышление', 'Решение сложных задач', 'Внимание к деталям'],
    description: 'Ты мыслишь системно и любишь разбираться как всё устроено под капотом. Технологии для тебя — не инструмент, а язык которым ты говоришь с миром.',
    professions: [
      { title: 'Software Developer', emoji: '💻', salary: '400–800K ₸/мес', demand: 'очень высокий' },
      { title: 'Data Scientist / AI', emoji: '🧠', salary: '500K–1M ₸/мес', demand: 'очень высокий' },
      { title: 'DevOps / Cloud Engineer', emoji: '☁️', salary: '450–900K ₸/мес', demand: 'высокий' },
    ],
    studyhubPath: '/career-lab',
    studyhubCta: 'Построить Tech карьерный план',
  },
  creative: {
    id: 'creative',
    title: 'Creative Maker',
    subtitle: 'Создатель смыслов и образов',
    emoji: '🎨',
    color: '#EC4899',
    gradient: 'from-pink-500 to-violet-500',
    traits: ['Нестандартное мышление', 'Визуальный интеллект', 'Эмпатия к аудитории'],
    description: 'Ты видишь красоту там где другие видят просто объекты. Твоя сила — превращать идеи в образы которые цепляют и запоминаются.',
    professions: [
      { title: 'UI/UX Designer', emoji: '🖼️', salary: '300–600K ₸/мес', demand: 'очень высокий' },
      { title: 'Motion Designer / 3D', emoji: '🎬', salary: '250–500K ₸/мес', demand: 'высокий' },
      { title: 'Brand Strategist', emoji: '✨', salary: '350–700K ₸/мес', demand: 'высокий' },
    ],
    studyhubPath: '/career-lab',
    studyhubCta: 'Создать творческое портфолио',
  },
  analyst: {
    id: 'analyst',
    title: 'Strategic Analyst',
    subtitle: 'Мастер данных и стратегий',
    emoji: '📊',
    color: '#10B981',
    gradient: 'from-emerald-500 to-teal-500',
    traits: ['Критическое мышление', 'Работа с данными', 'Системный подход'],
    description: 'Ты видишь паттерны там где другие видят хаос. Цифры для тебя — это история, и ты умеешь её читать лучше других.',
    professions: [
      { title: 'Product / Business Analyst', emoji: '📈', salary: '350–700K ₸/мес', demand: 'очень высокий' },
      { title: 'Financial Analyst', emoji: '💰', salary: '400–800K ₸/мес', demand: 'высокий' },
      { title: 'Data Analyst', emoji: '🔢', salary: '400–750K ₸/мес', demand: 'очень высокий' },
    ],
    studyhubPath: '/startup',
    studyhubCta: 'Построить аналитическую карьеру',
  },
  leader: {
    id: 'leader',
    title: 'Visionary Leader',
    subtitle: 'Предприниматель и стратег',
    emoji: '🚀',
    color: '#F59E0B',
    gradient: 'from-amber-500 to-orange-500',
    traits: ['Стратегическое мышление', 'Харизма и влияние', 'Принятие решений'],
    description: 'Ты не просто участник — ты тот кто задаёт направление. Видишь возможности там где другие видят препятствия.',
    professions: [
      { title: 'Product Manager', emoji: '🎯', salary: '500K–1.2M ₸/мес', demand: 'очень высокий' },
      { title: 'Entrepreneur / Founder', emoji: '💡', salary: 'Без потолка', demand: 'очень высокий' },
      { title: 'Business Development', emoji: '🤝', salary: '400–900K ₸/мес', demand: 'высокий' },
    ],
    studyhubPath: '/startup',
    studyhubCta: 'Запустить свой стартап',
  },
  helper: {
    id: 'helper',
    title: 'Impact Creator',
    subtitle: 'Тот кто меняет жизни людей',
    emoji: '❤️',
    color: '#EF4444',
    gradient: 'from-red-500 to-rose-500',
    traits: ['Эмпатия и эмоциональный интеллект', 'Умение слушать', 'Желание помогать'],
    description: 'Смысл твоей работы — люди. Ты чувствуешь чужие эмоции и знаешь как помочь. Это редкий и ценный дар.',
    professions: [
      { title: 'Психолог / Коуч', emoji: '🧘', salary: '250–600K ₸/мес', demand: 'высокий' },
      { title: 'HR / Talent Manager', emoji: '👥', salary: '300–600K ₸/мес', demand: 'высокий' },
      { title: 'EdTech / Педагог', emoji: '📚', salary: '200–450K ₸/мес', demand: 'высокий' },
    ],
    studyhubPath: '/career-lab',
    studyhubCta: 'Построить карьеру в people-профессиях',
  },
  maker: {
    id: 'maker',
    title: 'Engineering Mind',
    subtitle: 'Инженер и строитель реального мира',
    emoji: '⚙️',
    color: '#8B5CF6',
    gradient: 'from-violet-600 to-purple-500',
    traits: ['Практическое мышление', 'Точность и методичность', 'Решение физических задач'],
    description: 'Ты превращаешь идеи в реальные объекты и системы. Мир нуждается в людях которые умеют не только думать но и строить.',
    professions: [
      { title: 'Инженер / Конструктор', emoji: '🏗️', salary: '300–600K ₸/мес', demand: 'высокий' },
      { title: 'Robotics / Hardware', emoji: '🤖', salary: '400–800K ₸/мес', demand: 'очень высокий' },
      { title: 'Архитектор / Urban Designer', emoji: '🏛️', salary: '300–700K ₸/мес', demand: 'средний' },
    ],
    studyhubPath: '/career-lab',
    studyhubCta: 'Построить инженерную карьеру',
  },
}

// ── Scoring engine ─────────────────────────────────────────────────────────────

export function calculateResult(answers: (TestAnswer | null)[]): {
  primary: PersonalityType
  secondary: PersonalityType
  scores: Record<PersonalityAxis, number>
  topPercent: number
} {
  const scores: Record<PersonalityAxis, number> = {
    tech: 0, creative: 0, analyst: 0, leader: 0, helper: 0, maker: 0,
  }

  for (const answer of answers) {
    if (!answer) continue
    for (const [axis, pts] of Object.entries(answer.scores) as [PersonalityAxis, number][]) {
      scores[axis] += pts
    }
  }

  const sorted = (Object.entries(scores) as [PersonalityAxis, number][])
    .sort((a, b) => b[1] - a[1])

  const total = Object.values(scores).reduce((s, v) => s + v, 0)
  const topPercent = total > 0 ? Math.round((sorted[0][1] / total) * 100) : 0

  return {
    primary: PERSONALITY_TYPES[sorted[0][0]],
    secondary: PERSONALITY_TYPES[sorted[1][0]],
    scores,
    topPercent,
  }
}
