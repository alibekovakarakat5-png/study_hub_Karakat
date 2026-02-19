import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Compass,
  Search,
  ChevronDown,
  ChevronUp,
  Star,
  TrendingUp,
  GraduationCap,
  Briefcase,
  Code,
  Heart,
  Scale,
  Microscope,
  Palette,
  Cog,
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Target,
  Lightbulb,
  Trophy,
  Rocket,
  Smartphone,
  Shield,
  Database,
  Stethoscope,
  Pill,
  LineChart,
  Building2,
  Flame,
  PenTool,
  Video,
  Leaf,
  FlaskConical,
  X,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import type {
  Profession,
  ProfessionCategory,
  InterestTestResult,
  Subject,
} from '@/types'
import { PROFESSION_CATEGORY_NAMES, SUBJECT_NAMES } from '@/types'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────────────────────

type TabId = 'test' | 'map' | 'recommendations'

interface TestQuestion {
  id: number
  text: string
  optionA: { label: string; icon: React.ReactNode; category: ProfessionCategory }
  optionB: { label: string; icon: React.ReactNode; category: ProfessionCategory }
}

// ─── Constants ──────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string }[] = [
  { id: 'test', label: 'Тест интересов' },
  { id: 'map', label: 'Карта профессий' },
  { id: 'recommendations', label: 'Мои рекомендации' },
]

const CATEGORY_COLORS: Record<ProfessionCategory, string> = {
  tech: '#2563eb',
  medicine: '#dc2626',
  business: '#d97706',
  creative: '#c026d3',
  engineering: '#0891b2',
  education: '#16a34a',
  law: '#7c3aed',
  science: '#0d9488',
}

const CATEGORY_BG: Record<ProfessionCategory, string> = {
  tech: 'bg-blue-50 text-blue-700 border-blue-200',
  medicine: 'bg-red-50 text-red-700 border-red-200',
  business: 'bg-amber-50 text-amber-700 border-amber-200',
  creative: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  engineering: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  education: 'bg-green-50 text-green-700 border-green-200',
  law: 'bg-violet-50 text-violet-700 border-violet-200',
  science: 'bg-teal-50 text-teal-700 border-teal-200',
}

const DEMAND_LABELS: Record<Profession['demand'], string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  'very-high': 'Очень высокий',
}

const DEMAND_COLORS: Record<Profession['demand'], string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-emerald-100 text-emerald-700',
  'very-high': 'bg-blue-100 text-blue-700',
}

const PERSONALITY_TYPES: Record<string, { label: string; description: string }> = {
  'tech-science': { label: 'Технолог-аналитик', description: 'Вы склонны к точным наукам и технологиям. Логика, системное мышление и инновации — ваши сильные стороны.' },
  'tech-engineering': { label: 'Инженер-новатор', description: 'Вы сочетаете техническое мышление с практическим подходом. Создание и оптимизация систем — ваше призвание.' },
  'tech-business': { label: 'Техно-предприниматель', description: 'Вы объединяете технические знания с бизнес-чутьём. Стартапы и IT-менеджмент — ваша стихия.' },
  'medicine-science': { label: 'Учёный-медик', description: 'Вы заинтересованы в науке и заботе о здоровье. Биомедицина и исследования — ваш путь.' },
  'business-law': { label: 'Стратег-управленец', description: 'Вы видите картину целиком. Управление, право и финансы — ваши инструменты успеха.' },
  'creative-tech': { label: 'Цифровой креатив', description: 'Вы соединяете творчество с технологиями. UX, дизайн и digital-медиа — ваше поле.' },
  'creative-business': { label: 'Визионер-креатор', description: 'Творчество и предпринимательский дух идут рука об руку. Маркетинг, бренды и контент — ваша сфера.' },
  default: { label: 'Универсал-исследователь', description: 'У вас разносторонние интересы. Это даёт вам уникальное преимущество в междисциплинарных профессиях.' },
}

// ─── Interest Test Questions ────────────────────────────────────────────────

const TEST_QUESTIONS: TestQuestion[] = [
  {
    id: 1,
    text: 'Что тебе ближе?',
    optionA: { label: 'Создавать приложения и сайты', icon: <Code className="w-6 h-6" />, category: 'tech' },
    optionB: { label: 'Лечить людей и помогать им', icon: <Heart className="w-6 h-6" />, category: 'medicine' },
  },
  {
    id: 2,
    text: 'Какая деятельность привлекает больше?',
    optionA: { label: 'Анализировать данные и рынки', icon: <LineChart className="w-6 h-6" />, category: 'business' },
    optionB: { label: 'Проектировать здания и сооружения', icon: <Building2 className="w-6 h-6" />, category: 'engineering' },
  },
  {
    id: 3,
    text: 'Что вызывает больший интерес?',
    optionA: { label: 'Рисовать, создавать дизайн', icon: <Palette className="w-6 h-6" />, category: 'creative' },
    optionB: { label: 'Защищать права людей', icon: <Scale className="w-6 h-6" />, category: 'law' },
  },
  {
    id: 4,
    text: 'Чем бы ты занялся на выходных?',
    optionA: { label: 'Программировать мобильное приложение', icon: <Smartphone className="w-6 h-6" />, category: 'tech' },
    optionB: { label: 'Проводить химический эксперимент', icon: <FlaskConical className="w-6 h-6" />, category: 'science' },
  },
  {
    id: 5,
    text: 'Какая работа привлекательнее?',
    optionA: { label: 'Управлять проектами и командой', icon: <Briefcase className="w-6 h-6" />, category: 'business' },
    optionB: { label: 'Исследовать природу и экосистемы', icon: <Leaf className="w-6 h-6" />, category: 'science' },
  },
  {
    id: 6,
    text: 'Что больше нравится?',
    optionA: { label: 'Защищать системы от хакеров', icon: <Shield className="w-6 h-6" />, category: 'tech' },
    optionB: { label: 'Разрабатывать лекарственные препараты', icon: <Pill className="w-6 h-6" />, category: 'medicine' },
  },
  {
    id: 7,
    text: 'Какой навык хочешь развить?',
    optionA: { label: 'Снимать и монтировать видео', icon: <Video className="w-6 h-6" />, category: 'creative' },
    optionB: { label: 'Работать с машинным обучением', icon: <Database className="w-6 h-6" />, category: 'tech' },
  },
  {
    id: 8,
    text: 'Какая сфера ближе?',
    optionA: { label: 'Нефтегазовая промышленность', icon: <Flame className="w-6 h-6" />, category: 'engineering' },
    optionB: { label: 'Финансы и инвестиции', icon: <LineChart className="w-6 h-6" />, category: 'business' },
  },
  {
    id: 9,
    text: 'Чем бы хотел заниматься?',
    optionA: { label: 'Лечить зубы и делать улыбки красивыми', icon: <Stethoscope className="w-6 h-6" />, category: 'medicine' },
    optionB: { label: 'Создавать удобные интерфейсы', icon: <PenTool className="w-6 h-6" />, category: 'creative' },
  },
  {
    id: 10,
    text: 'Что интереснее изучать?',
    optionA: { label: 'Конституцию и законы', icon: <Scale className="w-6 h-6" />, category: 'law' },
    optionB: { label: 'Биотехнологии и генетику', icon: <Microscope className="w-6 h-6" />, category: 'science' },
  },
  {
    id: 11,
    text: 'Какой проект ты бы выбрал?',
    optionA: { label: 'Запустить свой стартап', icon: <Rocket className="w-6 h-6" />, category: 'business' },
    optionB: { label: 'Спроектировать умный дом', icon: <Cog className="w-6 h-6" />, category: 'engineering' },
  },
  {
    id: 12,
    text: 'Что ближе твоей душе?',
    optionA: { label: 'Обучать и менторить других', icon: <BookOpen className="w-6 h-6" />, category: 'education' },
    optionB: { label: 'Программировать искусственный интеллект', icon: <Code className="w-6 h-6" />, category: 'tech' },
  },
  {
    id: 13,
    text: 'Какая задача привлекает?',
    optionA: { label: 'Провести хирургическую операцию', icon: <Heart className="w-6 h-6" />, category: 'medicine' },
    optionB: { label: 'Построить мост или дорогу', icon: <Building2 className="w-6 h-6" />, category: 'engineering' },
  },
  {
    id: 14,
    text: 'Чем хотел бы прославиться?',
    optionA: { label: 'Научным открытием', icon: <FlaskConical className="w-6 h-6" />, category: 'science' },
    optionB: { label: 'Креативной рекламной кампанией', icon: <Sparkles className="w-6 h-6" />, category: 'creative' },
  },
  {
    id: 15,
    text: 'Финальный выбор!',
    optionA: { label: 'Работать с людьми и правом', icon: <Scale className="w-6 h-6" />, category: 'law' },
    optionB: { label: 'Работать с данными и кодом', icon: <Database className="w-6 h-6" />, category: 'tech' },
  },
]

// ─── Mock Professions Data ──────────────────────────────────────────────────

const PROFESSIONS: Profession[] = [
  // Tech
  {
    id: 'frontend-dev',
    title: 'Frontend-разработчик',
    category: 'tech',
    description: 'Создаёт пользовательские интерфейсы для веб-приложений. Работает с HTML, CSS, JavaScript и современными фреймворками. Отвечает за визуальную часть продукта и взаимодействие пользователя с системой.',
    avgSalary: '450 000 – 1 200 000 ₸',
    demand: 'very-high',
    requiredSkills: ['JavaScript', 'React/Vue/Angular', 'HTML/CSS', 'TypeScript', 'Git', 'REST API'],
    education: 'Бакалавриат IT / Самообразование + курсы',
    growthRate: '+25% в год',
    relatedSubjects: ['informatics', 'math', 'english'],
    icon: 'Code',
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    category: 'tech',
    description: 'Анализирует большие объёмы данных с помощью статистики и машинного обучения. Строит предиктивные модели, визуализирует данные и помогает бизнесу принимать решения на основе данных.',
    avgSalary: '600 000 – 1 500 000 ₸',
    demand: 'very-high',
    requiredSkills: ['Python', 'Machine Learning', 'SQL', 'Статистика', 'TensorFlow/PyTorch', 'Data Visualization'],
    education: 'Бакалавриат / Магистратура (CS, Математика, Статистика)',
    growthRate: '+35% в год',
    relatedSubjects: ['math', 'informatics', 'english'],
    icon: 'Database',
  },
  {
    id: 'cybersecurity',
    title: 'Специалист по кибербезопасности',
    category: 'tech',
    description: 'Защищает информационные системы от кибератак и утечек данных. Проводит аудит безопасности, разрабатывает политики защиты и реагирует на инциденты. Одна из самых востребованных профессий в мире.',
    avgSalary: '500 000 – 1 300 000 ₸',
    demand: 'very-high',
    requiredSkills: ['Сетевая безопасность', 'Linux', 'Penetration Testing', 'Криптография', 'SIEM', 'Python'],
    education: 'Бакалавриат IT / Информационная безопасность',
    growthRate: '+30% в год',
    relatedSubjects: ['informatics', 'math', 'physics'],
    icon: 'Shield',
  },
  {
    id: 'mobile-dev',
    title: 'Mobile Developer',
    category: 'tech',
    description: 'Разрабатывает мобильные приложения для iOS и Android. Работает с нативными технологиями или кроссплатформенными решениями. Создаёт удобные и быстрые приложения для миллионов пользователей.',
    avgSalary: '500 000 – 1 400 000 ₸',
    demand: 'high',
    requiredSkills: ['Swift/Kotlin', 'React Native/Flutter', 'REST API', 'UI/UX', 'Git', 'Firebase'],
    education: 'Бакалавриат IT / Онлайн-курсы',
    growthRate: '+20% в год',
    relatedSubjects: ['informatics', 'math', 'english'],
    icon: 'Smartphone',
  },
  // Medicine
  {
    id: 'surgeon',
    title: 'Хирург',
    category: 'medicine',
    description: 'Выполняет хирургические операции для лечения заболеваний, травм и деформаций. Одна из самых уважаемых и ответственных профессий в медицине. Требует многолетнего обучения и практики.',
    avgSalary: '500 000 – 2 000 000 ₸',
    demand: 'high',
    requiredSkills: ['Анатомия', 'Хирургические техники', 'Диагностика', 'Стрессоустойчивость', 'Командная работа', 'Постоянное обучение'],
    education: 'Медицинский вуз (7 лет) + Резидентура (2-5 лет)',
    growthRate: '+8% в год',
    relatedSubjects: ['biology', 'chemistry', 'physics'],
    icon: 'Heart',
  },
  {
    id: 'dentist',
    title: 'Стоматолог',
    category: 'medicine',
    description: 'Диагностирует и лечит заболевания зубов, дёсен и полости рта. Выполняет профилактику, протезирование и эстетическую стоматологию. Высоко востребованная профессия с возможностью частной практики.',
    avgSalary: '400 000 – 1 500 000 ₸',
    demand: 'high',
    requiredSkills: ['Стоматология', 'Анатомия', 'Мелкая моторика', 'Коммуникация с пациентами', 'Эстетическое чувство', 'Рентгенология'],
    education: 'Медицинский/Стоматологический вуз (5 лет) + Интернатура',
    growthRate: '+12% в год',
    relatedSubjects: ['biology', 'chemistry'],
    icon: 'Stethoscope',
  },
  {
    id: 'pharmacist',
    title: 'Фармацевт',
    category: 'medicine',
    description: 'Занимается разработкой, производством и контролем качества лекарственных средств. Консультирует пациентов по применению препаратов. Может работать в аптеках, лабораториях или фармкомпаниях.',
    avgSalary: '300 000 – 800 000 ₸',
    demand: 'medium',
    requiredSkills: ['Фармакология', 'Химия', 'Биология', 'Внимательность', 'Консультирование', 'Стандарты GMP'],
    education: 'Фармацевтический вуз (5 лет)',
    growthRate: '+6% в год',
    relatedSubjects: ['chemistry', 'biology'],
    icon: 'Pill',
  },
  // Business
  {
    id: 'marketing',
    title: 'Маркетолог',
    category: 'business',
    description: 'Разрабатывает стратегии продвижения продуктов и услуг. Анализирует рынок, целевую аудиторию и конкурентов. Управляет рекламными кампаниями и работает над повышением узнаваемости бренда.',
    avgSalary: '350 000 – 900 000 ₸',
    demand: 'high',
    requiredSkills: ['Digital-маркетинг', 'SMM', 'Аналитика', 'Копирайтинг', 'Google Ads', 'SEO'],
    education: 'Бакалавриат (Маркетинг, Бизнес, Коммуникации)',
    growthRate: '+15% в год',
    relatedSubjects: ['math', 'english', 'russian'],
    icon: 'TrendingUp',
  },
  {
    id: 'financial-analyst',
    title: 'Финансовый аналитик',
    category: 'business',
    description: 'Анализирует финансовые данные компаний и рынков. Составляет прогнозы, оценивает инвестиционные возможности и помогает принимать стратегические решения. Работает в банках, инвестфондах и корпорациях.',
    avgSalary: '450 000 – 1 200 000 ₸',
    demand: 'high',
    requiredSkills: ['Финансовый анализ', 'Excel', 'SQL', 'Финансовое моделирование', 'CFA (желательно)', 'Презентации'],
    education: 'Бакалавриат (Финансы, Экономика, Математика)',
    growthRate: '+10% в год',
    relatedSubjects: ['math', 'english', 'informatics'],
    icon: 'LineChart',
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    category: 'business',
    description: 'Управляет развитием цифрового продукта от идеи до запуска. Определяет стратегию продукта, приоритеты фич и метрики успеха. Связующее звено между бизнесом, разработкой и дизайном.',
    avgSalary: '600 000 – 1 500 000 ₸',
    demand: 'very-high',
    requiredSkills: ['Product Strategy', 'Аналитика', 'UX Research', 'Agile/Scrum', 'SQL', 'Коммуникация'],
    education: 'Бакалавриат (любой) + Опыт в IT',
    growthRate: '+22% в год',
    relatedSubjects: ['math', 'informatics', 'english'],
    icon: 'Briefcase',
  },
  // Engineering
  {
    id: 'oil-engineer',
    title: 'Нефтяной инженер',
    category: 'engineering',
    description: 'Проектирует и оптимизирует процессы добычи нефти и газа. Работает на месторождениях, нефтеперерабатывающих заводах или в офисах нефтегазовых компаний. Одна из самых высокооплачиваемых профессий в Казахстане.',
    avgSalary: '700 000 – 2 500 000 ₸',
    demand: 'high',
    requiredSkills: ['Нефтегазовое дело', 'Геология', 'AutoCAD', 'Петрофизика', 'Бурение', 'Английский язык'],
    education: 'Бакалавриат / Магистратура (Нефтегазовое дело)',
    growthRate: '+5% в год',
    relatedSubjects: ['physics', 'math', 'chemistry'],
    icon: 'Flame',
  },
  {
    id: 'architect',
    title: 'Архитектор',
    category: 'engineering',
    description: 'Проектирует здания и городские пространства. Сочетает инженерные знания с эстетическим чувством. Работает с 3D-моделированием, строительными нормами и требованиями заказчиков.',
    avgSalary: '400 000 – 1 200 000 ₸',
    demand: 'medium',
    requiredSkills: ['AutoCAD', 'ArchiCAD', '3D-моделирование', 'Строительные нормы', 'Черчение', 'Художественный вкус'],
    education: 'Бакалавриат (Архитектура, 5 лет)',
    growthRate: '+7% в год',
    relatedSubjects: ['math', 'physics', 'geography'],
    icon: 'Building2',
  },
  // Creative
  {
    id: 'ux-designer',
    title: 'UX/UI Дизайнер',
    category: 'creative',
    description: 'Проектирует пользовательские интерфейсы и опыт взаимодействия с цифровыми продуктами. Проводит исследования пользователей, создаёт прототипы и визуальный дизайн. Востребован во всех IT-компаниях.',
    avgSalary: '400 000 – 1 100 000 ₸',
    demand: 'very-high',
    requiredSkills: ['Figma', 'UX Research', 'Прототипирование', 'Типографика', 'Design Systems', 'Usability Testing'],
    education: 'Бакалавриат (Дизайн) / Онлайн-курсы',
    growthRate: '+20% в год',
    relatedSubjects: ['informatics', 'english'],
    icon: 'PenTool',
  },
  {
    id: 'videographer',
    title: 'Видеограф',
    category: 'creative',
    description: 'Снимает и монтирует видеоконтент для YouTube, TikTok, рекламы и кино. Работает с камерами, освещением, звуком и программами для монтажа. Креативная профессия с высоким спросом в digital-эпоху.',
    avgSalary: '300 000 – 900 000 ₸',
    demand: 'high',
    requiredSkills: ['Видеосъёмка', 'Adobe Premiere', 'After Effects', 'DaVinci Resolve', 'Сторителлинг', 'Color Grading'],
    education: 'Бакалавриат (Кино, Медиа) / Самообразование',
    growthRate: '+18% в год',
    relatedSubjects: ['informatics', 'english', 'literature'],
    icon: 'Video',
  },
  // Law
  {
    id: 'lawyer',
    title: 'Юрист',
    category: 'law',
    description: 'Консультирует по правовым вопросам, представляет интересы клиентов в суде, составляет договоры и правовые документы. Работает в юридических фирмах, корпорациях или государственных органах.',
    avgSalary: '350 000 – 1 200 000 ₸',
    demand: 'medium',
    requiredSkills: ['Гражданское право', 'Уголовное право', 'Аналитическое мышление', 'Ораторское искусство', 'Документация', 'Переговоры'],
    education: 'Бакалавриат / Магистратура (Юриспруденция)',
    growthRate: '+5% в год',
    relatedSubjects: ['history', 'russian', 'english'],
    icon: 'Scale',
  },
  {
    id: 'notary',
    title: 'Нотариус',
    category: 'law',
    description: 'Удостоверяет сделки, заверяет документы, оформляет наследственные дела. Работает как частный специалист или в государственном нотариате. Стабильная профессия с хорошим доходом.',
    avgSalary: '400 000 – 1 000 000 ₸',
    demand: 'medium',
    requiredSkills: ['Нотариальное право', 'Гражданское право', 'Внимательность к деталям', 'Документооборот', 'Коммуникация', 'Этика'],
    education: 'Юридический вуз + Стаж + Лицензия нотариуса',
    growthRate: '+3% в год',
    relatedSubjects: ['history', 'russian'],
    icon: 'BookOpen',
  },
  // Science
  {
    id: 'biotech',
    title: 'Биотехнолог',
    category: 'science',
    description: 'Использует биологические системы и организмы для создания новых продуктов и технологий. Работает в фармацевтике, сельском хозяйстве, экологии и пищевой промышленности.',
    avgSalary: '350 000 – 900 000 ₸',
    demand: 'high',
    requiredSkills: ['Молекулярная биология', 'Генная инженерия', 'Микробиология', 'Лабораторные методы', 'Биоинформатика', 'Статистика'],
    education: 'Бакалавриат / Магистратура (Биотехнология, Биология)',
    growthRate: '+15% в год',
    relatedSubjects: ['biology', 'chemistry', 'math'],
    icon: 'Microscope',
  },
  {
    id: 'ecologist',
    title: 'Эколог',
    category: 'science',
    description: 'Изучает экосистемы и влияние человека на окружающую среду. Разрабатывает программы защиты природы, проводит экологические экспертизы и мониторинг. Всё более важная профессия в современном мире.',
    avgSalary: '280 000 – 700 000 ₸',
    demand: 'medium',
    requiredSkills: ['Экология', 'Экологический мониторинг', 'ГИС', 'Статистика', 'Полевые исследования', 'Экологическое право'],
    education: 'Бакалавриат (Экология, Биология, География)',
    growthRate: '+10% в год',
    relatedSubjects: ['biology', 'chemistry', 'geography'],
    icon: 'Leaf',
  },
]

// ─── Icon Resolver ──────────────────────────────────────────────────────────

function ProfessionIcon({ iconName, className }: { iconName: string; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    Code: <Code className={className} />,
    Database: <Database className={className} />,
    Shield: <Shield className={className} />,
    Smartphone: <Smartphone className={className} />,
    Heart: <Heart className={className} />,
    Stethoscope: <Stethoscope className={className} />,
    Pill: <Pill className={className} />,
    TrendingUp: <TrendingUp className={className} />,
    LineChart: <LineChart className={className} />,
    Briefcase: <Briefcase className={className} />,
    Flame: <Flame className={className} />,
    Building2: <Building2 className={className} />,
    PenTool: <PenTool className={className} />,
    Video: <Video className={className} />,
    Scale: <Scale className={className} />,
    BookOpen: <BookOpen className={className} />,
    Microscope: <Microscope className={className} />,
    Leaf: <Leaf className={className} />,
  }
  return <>{icons[iconName] ?? <Star className={className} />}</>
}

// ─── Category Icon ──────────────────────────────────────────────────────────

function CategoryIcon({ category, className }: { category: ProfessionCategory; className?: string }) {
  const icons: Record<ProfessionCategory, React.ReactNode> = {
    tech: <Code className={className} />,
    medicine: <Heart className={className} />,
    business: <Briefcase className={className} />,
    creative: <Palette className={className} />,
    engineering: <Cog className={className} />,
    education: <GraduationCap className={className} />,
    law: <Scale className={className} />,
    science: <Microscope className={className} />,
  }
  return <>{icons[category]}</>
}

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function CareerOrientation() {
  const { onboardingProfile } = useStore()

  // ── Tab state ───────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>('test')

  // ── Interest test state ─────────────────────────────────────────────────────
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [testAnswers, setTestAnswers] = useState<Record<number, ProfessionCategory>>({})
  const [testResult, setTestResult] = useState<InterestTestResult | null>(null)
  const [testStarted, setTestStarted] = useState(false)

  // ── Profession map state ────────────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<ProfessionCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedProfession, setExpandedProfession] = useState<string | null>(null)

  // ── Recommendations state ───────────────────────────────────────────────────
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null)

  // ── Filtered professions ────────────────────────────────────────────────────
  const filteredProfessions = useMemo(() => {
    let result = PROFESSIONS
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.requiredSkills.some(s => s.toLowerCase().includes(q))
      )
    }
    return result
  }, [selectedCategory, searchQuery])

  // ── Handle test answer ──────────────────────────────────────────────────────
  const handleTestAnswer = useCallback((questionId: number, category: ProfessionCategory) => {
    const newAnswers = { ...testAnswers, [questionId]: category }
    setTestAnswers(newAnswers)

    if (currentQuestion < TEST_QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQuestion(prev => prev + 1), 350)
    } else {
      // Compute results
      const categoryCounts: Partial<Record<ProfessionCategory, number>> = {}
      for (const cat of Object.values(newAnswers)) {
        categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1
      }

      const sortedCategories = (Object.entries(categoryCounts) as [ProfessionCategory, number][])
        .sort((a, b) => b[1] - a[1])

      const categories = sortedCategories.map(([category, score]) => ({ category, score }))

      // Top professions from top 3 categories
      const topCats = sortedCategories.slice(0, 3).map(([c]) => c)
      const topProfessions = PROFESSIONS.filter(p => topCats.includes(p.category)).slice(0, 6)

      // Personality type
      const top2 = sortedCategories.slice(0, 2).map(([c]) => c)
      const personalityKey = `${top2[0]}-${top2[1]}` as string
      const personalityInfo = PERSONALITY_TYPES[personalityKey] ?? PERSONALITY_TYPES['default']

      const interestResult: InterestTestResult = {
        categories,
        topProfessions,
        personalityTraits: [personalityInfo.label],
      }

      setTimeout(() => setTestResult(interestResult), 400)
    }
  }, [testAnswers, currentQuestion])

  // ── Reset test ──────────────────────────────────────────────────────────────
  const resetTest = useCallback(() => {
    setCurrentQuestion(0)
    setTestAnswers({})
    setTestResult(null)
    setTestStarted(false)
  }, [])

  // ── Recommendations logic ───────────────────────────────────────────────────
  const recommendations = useMemo(() => {
    if (!onboardingProfile) return []

    const interestKeywords = onboardingProfile.interests.map(i => i.toLowerCase())
    const strengthKeywords = onboardingProfile.strengths.map(s => s.toLowerCase())
    const dreamKeywords = onboardingProfile.dreamProfessions.map(d => d.toLowerCase())

    const scored = PROFESSIONS.map(prof => {
      let score = 0
      const titleLower = prof.title.toLowerCase()
      const descLower = prof.description.toLowerCase()
      const skillsLower = prof.requiredSkills.map(s => s.toLowerCase())
      const catName = PROFESSION_CATEGORY_NAMES[prof.category].toLowerCase()

      for (const keyword of interestKeywords) {
        if (titleLower.includes(keyword) || descLower.includes(keyword) || catName.includes(keyword)) score += 20
        if (skillsLower.some(s => s.includes(keyword))) score += 10
      }
      for (const keyword of strengthKeywords) {
        if (skillsLower.some(s => s.includes(keyword))) score += 15
        if (descLower.includes(keyword)) score += 10
      }
      for (const keyword of dreamKeywords) {
        if (titleLower.includes(keyword)) score += 30
        if (descLower.includes(keyword) || catName.includes(keyword)) score += 15
      }

      // Goals bonus
      if (onboardingProfile.goals.includes('career') && (prof.demand === 'high' || prof.demand === 'very-high')) score += 10
      if (onboardingProfile.goals.includes('startup') && prof.category === 'business') score += 10
      if (onboardingProfile.goals.includes('abroad') && prof.relatedSubjects.includes('english')) score += 5

      // Ensure some minimum variety
      if (score === 0) {
        if (prof.demand === 'very-high') score += 5
        if (prof.demand === 'high') score += 3
      }

      return { profession: prof, score }
    })

    scored.sort((a, b) => b.score - a.score)
    const maxScore = scored[0]?.score || 1

    return scored.slice(0, 5).map(item => ({
      ...item,
      matchPercentage: Math.min(98, Math.max(45, Math.round((item.score / maxScore) * 95 + Math.random() * 5))),
    }))
  }, [onboardingProfile])

  // ═══════════════════════════════════════════════════════════════════════════════
  // TAB 1: Interest Test
  // ═══════════════════════════════════════════════════════════════════════════════

  const renderInterestTest = () => {
    // Show result
    if (testResult) {
      const maxScore = Math.max(...testResult.categories.map(c => c.score))
      const top2 = testResult.categories.slice(0, 2).map(c => c.category)
      const personalityKey = `${top2[0]}-${top2[1]}` as string
      const personality = PERSONALITY_TYPES[personalityKey] ?? PERSONALITY_TYPES['default']

      return (
        <motion.div
          key="test-result"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          {/* Result header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring' as const, stiffness: 200, delay: 0.3 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 mb-4"
            >
              <Trophy className="w-8 h-8" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Твой результат</h2>
            <p className="text-gray-500">На основе 15 вопросов мы определили твои склонности</p>
          </motion.div>

          {/* Personality Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl p-6 mb-6 text-white shadow-xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-6 h-6 text-amber-300" />
              <span className="text-sm font-medium text-blue-200">Твой тип личности</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">{personality.label}</h3>
            <p className="text-blue-100 text-sm leading-relaxed">{personality.description}</p>
          </motion.div>

          {/* Category Scores (Bar chart) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Твои склонности
            </h3>
            <div className="space-y-4">
              {testResult.categories.slice(0, 5).map((cat, idx) => {
                const percentage = Math.round((cat.score / maxScore) * 100)
                return (
                  <motion.div
                    key={cat.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <CategoryIcon category={cat.category} className="w-4 h-4" />
                        <span className="text-sm font-semibold text-gray-700">
                          {PROFESSION_CATEGORY_NAMES[cat.category]}
                        </span>
                      </div>
                      <span className="text-sm font-bold" style={{ color: CATEGORY_COLORS[cat.category] }}>
                        {cat.score} {cat.score === 1 ? 'балл' : cat.score < 5 ? 'балла' : 'баллов'}
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[cat.category] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.7 + idx * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Recommended professions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Рекомендуемые профессии
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {testResult.topProfessions.map((prof, idx) => (
                <motion.div
                  key={prof.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + idx * 0.08 }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => {
                    setActiveTab('map')
                    setExpandedProfession(prof.id)
                    setSelectedCategory(prof.category)
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: `${CATEGORY_COLORS[prof.category]}15`,
                      color: CATEGORY_COLORS[prof.category],
                    }}
                  >
                    <ProfessionIcon iconName={prof.icon} className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{prof.title}</p>
                    <p className="text-xs text-gray-400">{prof.avgSalary}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('map')}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
            >
              <Compass className="w-5 h-5" />
              Открыть карту профессий
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetTest}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-gray-700 bg-white border-2 border-gray-200 hover:border-gray-300 transition-all"
            >
              Пройти заново
            </motion.button>
          </div>
        </motion.div>
      )
    }

    // Not started yet — intro
    if (!testStarted) {
      return (
        <motion.div
          key="test-intro"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-violet-500 text-white mb-6 shadow-xl shadow-blue-200"
          >
            <Target className="w-10 h-10" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Тест интересов</h2>
          <p className="text-lg text-gray-500 mb-2">15 вопросов, чтобы определить твоё призвание</p>
          <p className="text-sm text-gray-400 mb-8">
            В каждом вопросе выбери вариант, который тебе ближе. Нет правильных или неправильных ответов — только твои предпочтения.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { icon: <Target className="w-6 h-6" />, title: '15 вопросов', desc: 'Быстрый и точный тест' },
              { icon: <Sparkles className="w-6 h-6" />, title: '8 категорий', desc: 'Все основные направления' },
              { icon: <Lightbulb className="w-6 h-6" />, title: 'Персональный результат', desc: 'Тип личности и профессии' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mb-3">
                  {item.icon}
                </div>
                <p className="font-semibold text-gray-900 text-sm mb-1">{item.title}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setTestStarted(true)}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-xl shadow-blue-200 transition-all text-lg"
          >
            <Rocket className="w-5 h-5" />
            Начать тест
          </motion.button>
        </motion.div>
      )
    }

    // Active test
    const question = TEST_QUESTIONS[currentQuestion]
    const progress = ((currentQuestion + 1) / TEST_QUESTIONS.length) * 100

    return (
      <motion.div
        key="test-active"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto"
      >
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">
              Вопрос {currentQuestion + 1} из {TEST_QUESTIONS.length}
            </span>
            <span className="text-sm font-bold text-blue-600">{Math.round(progress)}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }}
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-bold text-gray-900 text-center mb-8">{question.text}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[question.optionA, question.optionB].map((option, idx) => {
                const isSelected = testAnswers[question.id] === option.category
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleTestAnswer(question.id, option.category)}
                    className={cn(
                      'relative flex flex-col items-center gap-4 p-6 rounded-2xl border-2 text-center transition-all duration-200',
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                    )}
                  >
                    <div
                      className={cn(
                        'w-14 h-14 rounded-2xl flex items-center justify-center transition-colors',
                        isSelected
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-500'
                      )}
                    >
                      {option.icon}
                    </div>
                    <span className={cn(
                      'text-sm font-semibold leading-snug',
                      isSelected ? 'text-blue-700' : 'text-gray-700'
                    )}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3"
                      >
                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-1.5 mt-8">
          {TEST_QUESTIONS.map((q, idx) => (
            <div
              key={q.id}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                idx === currentQuestion
                  ? 'w-6 bg-blue-500'
                  : idx < currentQuestion || testAnswers[q.id]
                    ? 'bg-blue-300'
                    : 'bg-gray-200'
              )}
            />
          ))}
        </div>
      </motion.div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // TAB 2: Profession Map
  // ═══════════════════════════════════════════════════════════════════════════════

  const renderProfessionMap = () => (
    <motion.div
      key="profession-map"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Search and filters */}
      <motion.div variants={itemVariants} className="mb-6">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Поиск профессий..."
            className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all',
              selectedCategory === 'all'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            )}
          >
            Все ({PROFESSIONS.length})
          </button>
          {(Object.keys(PROFESSION_CATEGORY_NAMES) as ProfessionCategory[]).map(cat => {
            const count = PROFESSIONS.filter(p => p.category === cat).length
            if (count === 0) return null
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all',
                  selectedCategory === cat
                    ? `${CATEGORY_BG[cat]} border-current`
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                )}
              >
                <CategoryIcon category={cat} className="w-3.5 h-3.5" />
                {PROFESSION_CATEGORY_NAMES[cat]} ({count})
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Results count */}
      <motion.p variants={itemVariants} className="text-sm text-gray-400 mb-4">
        {filteredProfessions.length === 0
          ? 'Ничего не найдено'
          : `Найдено: ${filteredProfessions.length} ${filteredProfessions.length === 1 ? 'профессия' : filteredProfessions.length < 5 ? 'профессии' : 'профессий'}`}
      </motion.p>

      {/* Profession Grid */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProfessions.map(prof => {
          const isExpanded = expandedProfession === prof.id
          return (
            <motion.div
              key={prof.id}
              variants={itemVariants}
              layout
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Card header */}
              <button
                onClick={() => setExpandedProfession(isExpanded ? null : prof.id)}
                className="w-full p-5 text-left"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: `${CATEGORY_COLORS[prof.category]}12`,
                      color: CATEGORY_COLORS[prof.category],
                    }}
                  >
                    <ProfessionIcon iconName={prof.icon} className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-sm leading-tight">{prof.title}</h3>
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />}
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{PROFESSION_CATEGORY_NAMES[prof.category]}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-gray-700">{prof.avgSalary}</span>
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold', DEMAND_COLORS[prof.demand])}>
                        <TrendingUp className="w-3 h-3" />
                        {DEMAND_LABELS[prof.demand]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">{prof.education}</p>
                  </div>
                </div>
              </button>

              {/* Expanded content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                      {/* Description */}
                      <p className="text-sm text-gray-600 leading-relaxed">{prof.description}</p>

                      {/* Skills */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Необходимые навыки</p>
                        <div className="flex flex-wrap gap-1.5">
                          {prof.requiredSkills.map(skill => (
                            <span
                              key={skill}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 border border-gray-100"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Related subjects */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Связанные предметы</p>
                        <div className="flex flex-wrap gap-1.5">
                          {prof.relatedSubjects.map(sub => (
                            <span
                              key={sub}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100"
                            >
                              {SUBJECT_NAMES[sub]}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Growth rate */}
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-700">
                          Рост спроса: {prof.growthRate}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.div>
  )

  // ═══════════════════════════════════════════════════════════════════════════════
  // TAB 3: Recommendations
  // ═══════════════════════════════════════════════════════════════════════════════

  const renderRecommendations = () => {
    if (!onboardingProfile) {
      return (
        <motion.div
          key="no-onboarding"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto text-center py-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 mb-4">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Заполните профиль</h3>
          <p className="text-gray-500 mb-6 leading-relaxed">
            Чтобы получить персональные рекомендации, необходимо пройти онбординг и заполнить информацию
            о ваших интересах, сильных сторонах и целях.
          </p>
          <p className="text-sm text-gray-400">
            Перейдите в главное меню и пройдите квест знакомства с платформой.
          </p>
        </motion.div>
      )
    }

    return (
      <motion.div
        key="recommendations"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 mb-4"
          >
            <Sparkles className="w-7 h-7" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Персональные рекомендации</h2>
          <p className="text-gray-500">
            На основе ваших интересов, сильных сторон и целей
          </p>
        </motion.div>

        {/* Profile summary */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-5 mb-6"
        >
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Ваш профиль:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {onboardingProfile.interests.map(i => (
              <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-emerald-700 border border-emerald-200">
                {i}
              </span>
            ))}
            {onboardingProfile.strengths.map(s => (
              <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-teal-700 border border-teal-200">
                {s}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Top 5 Professions */}
        <div className="space-y-4">
          {recommendations.map((rec, idx) => {
            const prof = rec.profession
            const isExpanded = expandedRecommendation === prof.id
            return (
              <motion.div
                key={prof.id}
                variants={itemVariants}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setExpandedRecommendation(isExpanded ? null : prof.id)}
                  className="w-full p-5 text-left"
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm',
                      idx === 0 ? 'bg-amber-100 text-amber-700' :
                      idx === 1 ? 'bg-gray-100 text-gray-600' :
                      idx === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-50 text-gray-400'
                    )}>
                      #{idx + 1}
                    </div>

                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: `${CATEGORY_COLORS[prof.category]}12`,
                        color: CATEGORY_COLORS[prof.category],
                      }}
                    >
                      <ProfessionIcon iconName={prof.icon} className="w-6 h-6" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm">{prof.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">{PROFESSION_CATEGORY_NAMES[prof.category]}</span>
                        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold', DEMAND_COLORS[prof.demand])}>
                          {DEMAND_LABELS[prof.demand]}
                        </span>
                      </div>
                    </div>

                    {/* Match percentage */}
                    <div className="flex flex-col items-end flex-shrink-0">
                      <div className="text-lg font-bold text-emerald-600">{rec.matchPercentage}%</div>
                      <span className="text-xs text-gray-400">совпадение</span>
                    </div>

                    {isExpanded
                      ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                  </div>

                  {/* Match bar */}
                  <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${rec.matchPercentage}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + idx * 0.1 }}
                    />
                  </div>
                </button>

                {/* Expanded: What's needed */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-5">
                        <p className="text-sm text-gray-600 leading-relaxed">{prof.description}</p>

                        {/* What's needed */}
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-blue-600" />
                            Что нужно для этой профессии
                          </h4>

                          <div className="space-y-3">
                            {/* Education */}
                            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                              <p className="text-xs font-semibold text-blue-600 mb-1">Образование</p>
                              <p className="text-sm text-blue-800">{prof.education}</p>
                            </div>

                            {/* Skills */}
                            <div className="p-3 rounded-xl bg-violet-50 border border-violet-100">
                              <p className="text-xs font-semibold text-violet-600 mb-2">Навыки</p>
                              <div className="flex flex-wrap gap-1.5">
                                {prof.requiredSkills.map(skill => (
                                  <span key={skill} className="px-2 py-0.5 rounded-md text-xs font-medium bg-white text-violet-700 border border-violet-200">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Subjects */}
                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                              <p className="text-xs font-semibold text-amber-600 mb-2">Предметы для подготовки</p>
                              <div className="flex flex-wrap gap-1.5">
                                {prof.relatedSubjects.map(sub => (
                                  <span key={sub} className="px-2 py-0.5 rounded-md text-xs font-medium bg-white text-amber-700 border border-amber-200">
                                    {SUBJECT_NAMES[sub]}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Next steps */}
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Rocket className="w-4 h-4 text-emerald-600" />
                            Рекомендуемые шаги
                          </h4>
                          <div className="space-y-2">
                            {getNextSteps(prof).map((step, i) => (
                              <div key={i} className="flex items-start gap-2.5">
                                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-xs font-bold">{i + 1}</span>
                                </div>
                                <p className="text-sm text-gray-600">{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Salary and growth */}
                        <div className="flex gap-3">
                          <div className="flex-1 p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                            <p className="text-xs text-gray-400 mb-1">Зарплата</p>
                            <p className="text-sm font-bold text-gray-900">{prof.avgSalary}</p>
                          </div>
                          <div className="flex-1 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                            <p className="text-xs text-emerald-500 mb-1">Рост спроса</p>
                            <p className="text-sm font-bold text-emerald-700">{prof.growthRate}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Профориентация</h1>
            <p className="text-sm text-gray-500">Найди своё призвание</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-5 py-2.5 rounded-lg text-sm font-semibold transition-all',
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'test' && (
            <motion.div
              key="tab-test"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderInterestTest()}
            </motion.div>
          )}
          {activeTab === 'map' && (
            <motion.div
              key="tab-map"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderProfessionMap()}
            </motion.div>
          )}
          {activeTab === 'recommendations' && (
            <motion.div
              key="tab-recommendations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderRecommendations()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Helper: Next steps for a profession ────────────────────────────────────

function getNextSteps(prof: Profession): string[] {
  const stepsMap: Partial<Record<ProfessionCategory, string[]>> = {
    tech: [
      `Начните изучать ${prof.requiredSkills[0]} через онлайн-курсы (Coursera, Stepik)`,
      'Создайте первый проект для портфолио на GitHub',
      'Участвуйте в хакатонах и IT-сообществах Казахстана',
      'Подготовьтесь к стажировке в IT-компании',
    ],
    medicine: [
      'Углубленно изучайте биологию и химию в школе',
      'Подготовьтесь к ЕНТ с акцентом на профильные предметы',
      'Посещайте дни открытых дверей медицинских вузов',
      'Пройдите волонтёрство в больнице или клинике',
    ],
    business: [
      `Изучите основы ${prof.requiredSkills[0]} через бесплатные ресурсы`,
      'Прочитайте книги по бизнесу и менеджменту',
      'Участвуйте в бизнес-олимпиадах и кейс-чемпионатах',
      'Найдите ментора в интересующей отрасли',
    ],
    creative: [
      `Начните практиковаться в ${prof.requiredSkills[0]}`,
      'Создайте портфолио из учебных и личных проектов',
      'Изучайте тренды и лучшие практики в отрасли',
      'Участвуйте в конкурсах и freelance-проектах',
    ],
    engineering: [
      'Углубленно изучайте физику и математику',
      'Освойте базовые инженерные программы (AutoCAD)',
      'Участвуйте в инженерных олимпиадах',
      'Посетите дни открытых дверей технических вузов',
    ],
    law: [
      'Изучайте историю и обществознание углубленно',
      'Читайте правовые документы и следите за новостями права',
      'Участвуйте в дебатах и Model UN',
      'Подготовьтесь к поступлению на юридический факультет',
    ],
    science: [
      `Углубленно изучайте ${prof.relatedSubjects.map(s => SUBJECT_NAMES[s as Subject]).join(', ')}`,
      'Участвуйте в научных олимпиадах и конференциях',
      'Найдите научного руководителя для исследовательского проекта',
      'Рассмотрите магистратуру и аспирантуру для карьеры в науке',
    ],
  }

  return stepsMap[prof.category] ?? [
    'Определите ключевые навыки для этой профессии',
    'Найдите курсы и ресурсы для обучения',
    'Создайте план развития на ближайший год',
    'Найдите ментора или сообщество профессионалов',
  ]
}
