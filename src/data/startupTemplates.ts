// ── Startup Lab — Project templates & AI analysis engine ──────────────────────

export type ProjectCategory =
  | 'edtech'
  | 'fintech'
  | 'marketplace'
  | 'saas'
  | 'social'
  | 'mobile_app'
  | 'ai_product'
  | 'ecommerce'
  | 'healthtech'
  | 'other'

export type Complexity = 'easy' | 'medium' | 'hard'
export type ProjectType = 'startup' | 'pet_project' | 'research'

export interface RoadmapStep {
  id: string
  phase: number
  title: string
  description: string
  duration: string
  tasks: string[]
  deliverable: string
  icon: string
}

export interface SkillRequired {
  name: string
  level: 'basic' | 'intermediate' | 'advanced'
  icon: string
}

export interface Accelerator {
  name: string
  country: string
  focus: string
  url: string
  flag: string
}

export interface AnalysisResult {
  category: ProjectCategory
  projectType: ProjectType
  complexity: Complexity
  shortDescription: string
  marketSize: string
  problemSolved: string
  targetAudience: string
  skills: SkillRequired[]
  roadmap: RoadmapStep[]
  accelerators: Accelerator[]
  investorReadiness: number
  checklist: { label: string; done: boolean }[]
  monetization: string[]
  competitors: string[]
  uniqueAdvantage: string
}

// ── Keyword detection ──────────────────────────────────────────────────────────

const KEYWORDS: Record<ProjectCategory, string[]> = {
  edtech: ['учеба', 'обучение', 'курс', 'школа', 'репетитор', 'студент', 'образование', 'урок', 'ент', 'ielts', 'learn', 'edu', 'tutor', 'study'],
  fintech: ['финанс', 'банк', 'деньги', 'платеж', 'инвестиц', 'крипто', 'кошелек', 'кредит', 'бухгалтер', 'налог', 'finance', 'payment', 'wallet', 'crypto'],
  marketplace: ['маркетплейс', 'купить', 'продать', 'аренда', 'объявление', 'услуги', 'поиск', 'агрегатор', 'площадка', 'marketplace', 'booking'],
  saas: ['сервис', 'автоматиз', 'crm', 'erp', 'b2b', 'dashboard', 'аналитика', 'управление', 'платформа', 'software', 'saas', 'tool'],
  social: ['социаль', 'сеть', 'сообщество', 'чат', 'общение', 'знакомства', 'друзья', 'network', 'community', 'social', 'dating'],
  mobile_app: ['приложение', 'мобильн', 'ios', 'android', 'app', 'смартфон', 'телефон'],
  ai_product: ['ai', 'искусственный интеллект', 'нейросеть', 'ml', 'chatbot', 'чатбот', 'gpt', 'автоматич', 'умный', 'smart'],
  ecommerce: ['интернет-магазин', 'магазин', 'доставка', 'товар', 'онлайн продаж', 'shop', 'ecommerce', 'store'],
  healthtech: ['здоровье', 'медицин', 'врач', 'клиника', 'фитнес', 'спорт', 'психолог', 'health', 'medical', 'fitness'],
  other: [],
}

export function detectCategory(idea: string): ProjectCategory {
  const lower = idea.toLowerCase()
  let best: ProjectCategory = 'other'
  let bestScore = 0

  for (const [cat, keywords] of Object.entries(KEYWORDS) as [ProjectCategory, string[]][]) {
    const score = keywords.filter(k => lower.includes(k)).length
    if (score > bestScore) {
      bestScore = score
      best = cat
    }
  }
  return best
}

// ── Category data ──────────────────────────────────────────────────────────────

const CATEGORY_META: Record<ProjectCategory, {
  label: string
  icon: string
  projectType: ProjectType
  complexity: Complexity
  marketSize: string
  skills: SkillRequired[]
  monetization: string[]
  competitors: string[]
  accelerators: Accelerator[]
}> = {
  edtech: {
    label: 'EdTech', icon: '🎓',
    projectType: 'startup', complexity: 'medium',
    marketSize: 'Рынок EdTech Казахстана: $180M (2025), рост 22% в год',
    skills: [
      { name: 'Product Thinking', level: 'intermediate', icon: '🧠' },
      { name: 'UI/UX Design', level: 'basic', icon: '🎨' },
      { name: 'Frontend (React)', level: 'intermediate', icon: '💻' },
      { name: 'Content Creation', level: 'basic', icon: '✍️' },
      { name: 'Marketing', level: 'basic', icon: '📣' },
    ],
    monetization: ['Подписка (freemium)', 'Оплата за курс', 'B2B продажи школам', 'Сертификаты'],
    competitors: ['Bilimland', 'Daryn Online', 'StudyHub', 'Coursera (global)'],
    accelerators: [
      { name: 'Astana Hub', country: 'Казахстан', focus: 'Tech стартапы', url: 'https://astanahub.com', flag: '🇰🇿' },
      { name: 'Tech Garden', country: 'Казахстан', focus: 'IT & EdTech', url: 'https://techgarden.kz', flag: '🇰🇿' },
      { name: 'QazInnovations', country: 'Казахстан', focus: 'Инновации', url: 'https://qazinnovations.kz', flag: '🇰🇿' },
    ],
  },
  fintech: {
    label: 'FinTech', icon: '💳',
    projectType: 'startup', complexity: 'hard',
    marketSize: 'Рынок FinTech Казахстана: $420M, рост 31% в год',
    skills: [
      { name: 'Backend Development', level: 'advanced', icon: '⚙️' },
      { name: 'Security & Compliance', level: 'advanced', icon: '🔐' },
      { name: 'Product Thinking', level: 'intermediate', icon: '🧠' },
      { name: 'Financial Knowledge', level: 'intermediate', icon: '📊' },
      { name: 'Legal / RegTech', level: 'basic', icon: '⚖️' },
    ],
    monetization: ['Комиссия с транзакций', 'Подписка B2B', 'Кредитные продукты', 'White-label решения'],
    competitors: ['Kaspi Bank', 'Halyk Bank Digital', 'Freedom Finance'],
    accelerators: [
      { name: 'Astana Hub', country: 'Казахстан', focus: 'FinTech Hub', url: 'https://astanahub.com', flag: '🇰🇿' },
      { name: 'AIFC FinTech Hub', country: 'Казахстан', focus: 'Financial Tech', url: 'https://aifc.kz', flag: '🇰🇿' },
    ],
  },
  marketplace: {
    label: 'Marketplace', icon: '🛒',
    projectType: 'startup', complexity: 'medium',
    marketSize: 'Рынок онлайн-площадок Казахстана: растет 40% ежегодно',
    skills: [
      { name: 'Product Thinking', level: 'intermediate', icon: '🧠' },
      { name: 'Full-stack Dev', level: 'intermediate', icon: '💻' },
      { name: 'Growth Marketing', level: 'intermediate', icon: '📣' },
      { name: 'Operations', level: 'basic', icon: '⚙️' },
    ],
    monetization: ['Комиссия с сделок', 'Платное размещение', 'Рекламные места', 'Подписка продавцов'],
    competitors: ['OLX Kazakhstan', 'Kolesa.kz', 'Krisha.kz', 'Kaspi Marketplace'],
    accelerators: [
      { name: 'Astana Hub', country: 'Казахстан', focus: 'Tech стартапы', url: 'https://astanahub.com', flag: '🇰🇿' },
    ],
  },
  saas: {
    label: 'SaaS / B2B', icon: '☁️',
    projectType: 'startup', complexity: 'medium',
    marketSize: 'B2B SaaS в Казахстане — недооцененный рынок с высоким потенциалом',
    skills: [
      { name: 'Backend Architecture', level: 'advanced', icon: '⚙️' },
      { name: 'B2B Sales', level: 'intermediate', icon: '🤝' },
      { name: 'Product Thinking', level: 'intermediate', icon: '🧠' },
      { name: 'Customer Success', level: 'basic', icon: '🎯' },
    ],
    monetization: ['Ежемесячная подписка', 'Оплата за пользователя', 'Enterprise план', 'API доступ'],
    competitors: ['Bitrix24', '1C', 'Local solutions'],
    accelerators: [
      { name: 'Astana Hub', country: 'Казахстан', focus: 'B2B Tech', url: 'https://astanahub.com', flag: '🇰🇿' },
      { name: 'QazInnovations', country: 'Казахстан', focus: 'Digital трансформация', url: 'https://qazinnovations.kz', flag: '🇰🇿' },
    ],
  },
  social: {
    label: 'Social / Community', icon: '👥',
    projectType: 'startup', complexity: 'hard',
    marketSize: 'Социальные сети — высококонкурентный рынок, нужна нишевая стратегия',
    skills: [
      { name: 'Community Building', level: 'advanced', icon: '👥' },
      { name: 'Full-stack Dev', level: 'advanced', icon: '💻' },
      { name: 'Viral Marketing', level: 'intermediate', icon: '📣' },
      { name: 'Content Strategy', level: 'intermediate', icon: '✍️' },
    ],
    monetization: ['Реклама', 'Premium подписка', 'Виртуальные товары', 'Партнерства'],
    competitors: ['Instagram', 'TikTok', 'Local niche communities'],
    accelerators: [
      { name: 'Astana Hub', country: 'Казахстан', focus: 'Digital Media', url: 'https://astanahub.com', flag: '🇰🇿' },
    ],
  },
  mobile_app: {
    label: 'Mobile App', icon: '📱',
    projectType: 'pet_project', complexity: 'medium',
    marketSize: 'Мобильные приложения — $4.8B глобальный рынок, зависит от ниши',
    skills: [
      { name: 'React Native / Flutter', level: 'intermediate', icon: '📱' },
      { name: 'UI/UX Design', level: 'intermediate', icon: '🎨' },
      { name: 'Backend API', level: 'basic', icon: '⚙️' },
      { name: 'App Store Optimization', level: 'basic', icon: '🔍' },
    ],
    monetization: ['Freemium', 'Платное скачивание', 'In-app покупки', 'Реклама'],
    competitors: ['Зависит от ниши'],
    accelerators: [
      { name: 'Astana Hub', country: 'Казахстан', focus: 'Mobile', url: 'https://astanahub.com', flag: '🇰🇿' },
    ],
  },
  ai_product: {
    label: 'AI Product', icon: '🤖',
    projectType: 'startup', complexity: 'hard',
    marketSize: 'AI рынок: один из самых быстрорастущих, $1.8T к 2030',
    skills: [
      { name: 'Machine Learning / API', level: 'intermediate', icon: '🤖' },
      { name: 'Product Thinking', level: 'advanced', icon: '🧠' },
      { name: 'Backend Development', level: 'intermediate', icon: '⚙️' },
      { name: 'Prompt Engineering', level: 'intermediate', icon: '✍️' },
      { name: 'Data Analysis', level: 'basic', icon: '📊' },
    ],
    monetization: ['API as a Service', 'SaaS подписка', 'White-label', 'Consulting'],
    competitors: ['ChatGPT', 'Claude', 'Local AI solutions'],
    accelerators: [
      { name: 'Astana Hub', country: 'Казахстан', focus: 'AI & Deep Tech', url: 'https://astanahub.com', flag: '🇰🇿' },
      { name: 'QazInnovations', country: 'Казахстан', focus: 'Инновации', url: 'https://qazinnovations.kz', flag: '🇰🇿' },
    ],
  },
  ecommerce: {
    label: 'E-Commerce', icon: '🛍️',
    projectType: 'startup', complexity: 'medium',
    marketSize: 'E-commerce Казахстана: $3.2B (2025), рост 35%',
    skills: [
      { name: 'E-commerce Platform', level: 'intermediate', icon: '🛍️' },
      { name: 'Digital Marketing', level: 'intermediate', icon: '📣' },
      { name: 'Logistics / Operations', level: 'basic', icon: '📦' },
      { name: 'Customer Service', level: 'basic', icon: '🎯' },
    ],
    monetization: ['Прямые продажи', 'Дропшиппинг', 'Подписочные боксы', 'B2B оптом'],
    competitors: ['Kaspi Магазин', 'WildBerries KZ', 'Alibaba'],
    accelerators: [
      { name: 'Astana Hub', country: 'Казахстан', focus: 'E-Commerce', url: 'https://astanahub.com', flag: '🇰🇿' },
    ],
  },
  healthtech: {
    label: 'HealthTech', icon: '🏥',
    projectType: 'startup', complexity: 'hard',
    marketSize: 'HealthTech Казахстана — стремительно растущий рынок после пандемии',
    skills: [
      { name: 'Medical Domain Knowledge', level: 'advanced', icon: '🏥' },
      { name: 'Product Thinking', level: 'intermediate', icon: '🧠' },
      { name: 'Compliance & Legal', level: 'intermediate', icon: '⚖️' },
      { name: 'Full-stack Dev', level: 'intermediate', icon: '💻' },
    ],
    monetization: ['B2B клиники', 'Прямые пользователи', 'Страховые компании', 'Государственные контракты'],
    competitors: ['Doctoronline', 'Medrocket', 'Local health apps'],
    accelerators: [
      { name: 'Astana Hub', country: 'Казахстан', focus: 'HealthTech', url: 'https://astanahub.com', flag: '🇰🇿' },
      { name: 'QazInnovations', country: 'Казахстан', focus: 'Social Innovation', url: 'https://qazinnovations.kz', flag: '🇰🇿' },
    ],
  },
  other: {
    label: 'Tech Project', icon: '⚡',
    projectType: 'pet_project', complexity: 'medium',
    marketSize: 'Потенциал зависит от конкретной ниши — нужно исследование рынка',
    skills: [
      { name: 'Product Thinking', level: 'basic', icon: '🧠' },
      { name: 'Development', level: 'intermediate', icon: '💻' },
      { name: 'Marketing', level: 'basic', icon: '📣' },
    ],
    monetization: ['Подписка', 'Разовые платежи', 'Реклама', 'Партнерства'],
    competitors: ['Зависит от ниши'],
    accelerators: [
      { name: 'Astana Hub', country: 'Казахстан', focus: 'Tech стартапы', url: 'https://astanahub.com', flag: '🇰🇿' },
    ],
  },
}

// ── Roadmap templates ──────────────────────────────────────────────────────────

function buildRoadmap(category: ProjectCategory, idea: string): RoadmapStep[] {
  const common: RoadmapStep[] = [
    {
      id: 'discovery',
      phase: 1,
      title: 'Исследование рынка',
      description: 'Пойми проблему и рынок перед тем как что-то строить',
      duration: '1-2 недели',
      icon: '🔍',
      deliverable: 'Market Research документ',
      tasks: [
        'Провести 10 интервью с потенциальными пользователями',
        'Изучить 3-5 конкурентов',
        'Определить целевую аудиторию (ICP)',
        'Описать ключевую проблему одним предложением',
        'Оценить объем рынка (TAM/SAM/SOM)',
      ],
    },
    {
      id: 'define',
      phase: 2,
      title: 'Описание продукта',
      description: 'Определи что именно ты строишь и для кого',
      duration: '1 неделя',
      icon: '📝',
      deliverable: 'Product Brief + User Stories',
      tasks: [
        'Написать Problem Statement',
        'Создать User Persona (2-3 персонажа)',
        'Составить список ключевых фич (Feature List)',
        'Нарисовать Customer Journey Map',
        'Определить метрики успеха (KPIs)',
      ],
    },
    {
      id: 'mvp',
      phase: 3,
      title: 'MVP — Минимальный продукт',
      description: 'Построй самую простую версию которая решает ключевую проблему',
      duration: '3-6 недель',
      icon: '🚀',
      deliverable: 'Рабочий MVP',
      tasks: [
        'Нарисовать wireframes (Figma/бумага)',
        'Выбрать технологический стек',
        'Разработать core feature (одна главная функция)',
        'Создать landing page',
        'Настроить базовую аналитику',
      ],
    },
    {
      id: 'users',
      phase: 4,
      title: 'Первые пользователи',
      description: 'Найди 100 первых пользователей и получи обратную связь',
      duration: '2-4 недели',
      icon: '👥',
      deliverable: '100 активных пользователей',
      tasks: [
        'Запустить в ближайшем окружении (friends & family)',
        'Выйти в тематические сообщества (Telegram, Instagram)',
        'Собирать feedback через интервью',
        'Измерить Retention (возвращаются ли пользователи)',
        'Приоритизировать улучшения по отзывам',
      ],
    },
    {
      id: 'iterate',
      phase: 5,
      title: 'Итерации и улучшения',
      description: 'На основе данных улучши продукт',
      duration: '2-3 недели',
      icon: '🔄',
      deliverable: 'v1.0 — улучшенный продукт',
      tasks: [
        'Исправить топ-5 проблем из feedback',
        'Добавить 1-2 новые фичи по запросу',
        'Оптимизировать onboarding',
        'Настроить email/push уведомления',
        'Запустить реферальную программу',
      ],
    },
    {
      id: 'monetize',
      phase: 6,
      title: 'Монетизация',
      description: 'Начни зарабатывать деньги',
      duration: '1-2 недели',
      icon: '💰',
      deliverable: 'Первая оплата от пользователя',
      tasks: [
        'Определить модель монетизации',
        'Настроить систему оплаты (Kaspi Pay / Stripe)',
        'Создать тарифные планы',
        'Провести тест "готов ли платить?" с пользователями',
        'Установить цель: первые $100 выручки',
      ],
    },
    {
      id: 'growth',
      phase: 7,
      title: 'Рост и инвестиции',
      description: 'Масштабируй и привлекай финансирование',
      duration: '1-3 месяца',
      icon: '📈',
      deliverable: 'Pitch Deck + заявка в акселератор',
      tasks: [
        'Подготовить Pitch Deck (10 слайдов)',
        'Собрать метрики тракции (пользователи, выручка, рост)',
        'Подать заявку в Astana Hub / Tech Garden',
        'Найти angel investor или grant',
        'Построить план на 12 месяцев',
      ],
    },
  ]

  return common
}

// ── Unique advantage generator ─────────────────────────────────────────────────

function generateAdvantage(category: ProjectCategory, idea: string): string {
  const advantages: Record<ProjectCategory, string> = {
    edtech: 'Фокус на казахстанский контент (ЕНТ, казахский язык) — глобальные платформы это не покрывают',
    fintech: 'Интеграция с Kaspi экосистемой и локальная поддержка — иностранные решения не адаптированы под KZ',
    marketplace: 'Знание локального рынка и доверие пользователей — ключевое преимущество перед международными игроками',
    saas: 'Поддержка казахского и русского языков + локальная интеграция с 1С и гос. сервисами',
    social: 'Нишевое сообщество — лучше быть первым в маленькой нише, чем последним в большой',
    mobile_app: 'Оффлайн-режим и оптимизация под медленный интернет в регионах KZ',
    ai_product: 'AI на казахском и русском языках — огромный неохваченный рынок в СНГ',
    ecommerce: 'Локальная логистика + казахстанские поставщики — быстрая доставка vs AliExpress',
    healthtech: 'Интеграция с системой МедПорт и OSMS — локальный контекст критичен в медицине',
    other: 'Глубокое знание казахстанского рынка и локальная поддержка — ваше главное УТП',
  }
  return advantages[category]
}

// ── Main analysis function ─────────────────────────────────────────────────────

export function analyzeIdea(idea: string): AnalysisResult {
  const category = detectCategory(idea)
  const meta = CATEGORY_META[category]

  const checklist = [
    { label: 'Идея сформулирована', done: true },
    { label: 'Исследование рынка', done: false },
    { label: 'User interviews (10+)', done: false },
    { label: 'MVP создан', done: false },
    { label: 'Первые 100 пользователей', done: false },
    { label: 'Первая выручка', done: false },
    { label: 'Pitch Deck готов', done: false },
    { label: 'Подача в акселератор', done: false },
  ]

  // Target audience based on idea text
  const lower = idea.toLowerCase()
  let targetAudience = 'Молодые люди 18-30 лет, активные пользователи смартфонов'
  if (lower.includes('студент') || lower.includes('школьник') || lower.includes('ент')) {
    targetAudience = 'Ученики 10-11 классов и студенты вузов Казахстана'
  } else if (lower.includes('бизнес') || lower.includes('компания') || lower.includes('b2b')) {
    targetAudience = 'Малый и средний бизнес Казахстана (МСБ)'
  } else if (lower.includes('врач') || lower.includes('пациент') || lower.includes('здоровье')) {
    targetAudience = 'Пациенты и медицинские работники Казахстана'
  }

  const problemSolved = `Платформа решает проблему доступности и удобства в нише "${meta.label}" для казахстанского рынка`

  return {
    category,
    projectType: meta.projectType,
    complexity: meta.complexity,
    shortDescription: `${meta.icon} ${meta.label} стартап для рынка Казахстана`,
    marketSize: meta.marketSize,
    problemSolved,
    targetAudience,
    skills: meta.skills,
    roadmap: buildRoadmap(category, idea),
    accelerators: meta.accelerators,
    investorReadiness: 12, // starts low — grows as checklist is completed
    checklist,
    monetization: meta.monetization,
    competitors: meta.competitors,
    uniqueAdvantage: generateAdvantage(category, idea),
  }
}

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  edtech: 'EdTech', fintech: 'FinTech', marketplace: 'Marketplace',
  saas: 'SaaS / B2B', social: 'Social', mobile_app: 'Mobile App',
  ai_product: 'AI Product', ecommerce: 'E-Commerce', healthtech: 'HealthTech', other: 'Tech Project',
}

export const COMPLEXITY_LABELS: Record<Complexity, { label: string; color: string }> = {
  easy: { label: 'Легко', color: 'text-green-400' },
  medium: { label: 'Средне', color: 'text-amber-400' },
  hard: { label: 'Сложно', color: 'text-red-400' },
}

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  startup: 'Стартап', pet_project: 'Pet Project', research: 'Исследование',
}
