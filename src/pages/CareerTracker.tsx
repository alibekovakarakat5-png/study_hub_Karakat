import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase,
  Target,
  FileText,
  MessageSquare,
  Brain,
  CheckCircle2,
  Circle,
  BookOpen,
  Code,
  FolderKanban,
  Users,
  Send,
  Download,
  ChevronDown,
  ChevronUp,
  Star,
  ArrowRight,
  Sparkles,
  Trophy,
  Zap,
  GraduationCap,
  Globe,
  Smartphone,
  Palette,
  Shield,
  Heart,
  Clock,
  TrendingUp,
  Shuffle,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  User,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'
import type { CareerGoal, CareerMilestone, ResumeData, InterviewQuestion } from '@/types'

// ── Types ──────────────────────────────────────────────────────────────────

type TabId = 'goal' | 'resume' | 'interview' | 'skills'

interface SkillItem {
  name: string
  category: 'hard' | 'soft'
  current: number
  target: number
  icon: typeof Code
  recommendedCourse?: string
}

// ── Constants ──────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string; icon: typeof Target }[] = [
  { id: 'goal', label: 'Моя цель', icon: Target },
  { id: 'resume', label: 'Резюме', icon: FileText },
  { id: 'interview', label: 'Собеседование', icon: MessageSquare },
  { id: 'skills', label: 'Навыки', icon: Brain },
]

const MILESTONE_ICONS: Record<CareerMilestone['type'], typeof Code> = {
  skill: BookOpen,
  course: GraduationCap,
  project: FolderKanban,
  interview: MessageSquare,
  application: Send,
}

const MOTIVATIONAL_QUOTES = [
  { text: 'Каждый эксперт когда-то был новичком.', author: 'Хелен Хейс' },
  { text: 'Успех -- это сумма маленьких усилий, повторяемых изо дня в день.', author: 'Роберт Кольер' },
  { text: 'Не бойся идти медленно, бойся стоять на месте.', author: 'Китайская пословица' },
]

const INITIAL_MILESTONES: CareerMilestone[] = [
  { id: 'm1', title: 'Изучить HTML/CSS', completed: true, type: 'skill' },
  { id: 'm2', title: 'Освоить JavaScript', completed: true, type: 'skill' },
  { id: 'm3', title: 'Пройти курс по React', completed: true, type: 'course' },
  { id: 'm4', title: 'Создать 3 pet-проекта', completed: false, type: 'project' },
  { id: 'm5', title: 'Пройти стажировку', completed: false, type: 'application' },
  { id: 'm6', title: 'Подготовить резюме', completed: false, type: 'skill' },
  { id: 'm7', title: 'Пройти собеседование', completed: false, type: 'interview' },
]

const INITIAL_GOAL: CareerGoal = {
  id: 'goal-1',
  title: 'Junior Frontend Developer at Kaspi.kz',
  targetRole: 'Junior Frontend Developer',
  targetCompany: 'Kaspi.kz',
  deadline: 'Сентябрь 2026',
  progress: Math.round((3 / 7) * 100),
  milestones: INITIAL_MILESTONES,
}

const INITIAL_RESUME: ResumeData = {
  fullName: 'Арман Сериков',
  title: 'Junior Frontend Developer',
  email: 'arman.serikov@mail.kz',
  phone: '+7 (707) 123-45-67',
  city: 'Алматы, Казахстан',
  summary:
    'Целеустремлённый студент 3-го курса КБТУ, увлечённый веб-разработкой. Имею опыт работы с React, TypeScript и современными фреймворками. Стремлюсь развиваться в сфере frontend-разработки и создавать качественные пользовательские интерфейсы.',
  education: [
    {
      institution: 'КБТУ (Казахстанско-Британский технический университет)',
      degree: 'Бакалавр, Информационные системы',
      year: '2023 — 2027',
      gpa: '3.6',
    },
    {
      institution: 'НИШ ФМН г. Алматы',
      degree: 'Среднее образование',
      year: '2017 — 2023',
    },
  ],
  experience: [
    {
      company: 'Freelance',
      role: 'Веб-разработчик',
      period: 'Июнь 2025 — настоящее время',
      bullets: [
        'Разработал 5+ лендингов для локальных бизнесов',
        'Использовал React, Tailwind CSS и Framer Motion',
        'Взаимодействовал напрямую с заказчиками',
      ],
    },
    {
      company: 'Google Developer Student Club KBTU',
      role: 'Frontend Lead',
      period: 'Сентябрь 2024 — Май 2025',
      bullets: [
        'Руководил командой из 4 разработчиков',
        'Организовал 3 воркшопа по React и TypeScript',
        'Разработал сайт клуба с посещаемостью 500+ пользователей/мес',
      ],
    },
  ],
  skills: [
    { name: 'React', level: 75 },
    { name: 'TypeScript', level: 60 },
    { name: 'HTML/CSS', level: 90 },
    { name: 'JavaScript', level: 80 },
    { name: 'Tailwind CSS', level: 85 },
    { name: 'Git', level: 70 },
    { name: 'Figma', level: 55 },
    { name: 'Node.js', level: 40 },
  ],
  languages: [
    { name: 'Казахский', level: 'Родной' },
    { name: 'Русский', level: 'Свободный' },
    { name: 'Английский', level: 'B2 (Upper-Intermediate)' },
  ],
  projects: [
    {
      name: 'Study Hub',
      description: 'EdTech платформа для подготовки к ЕНТ с AI-репетитором',
      tech: ['React', 'TypeScript', 'Tailwind CSS', 'Zustand'],
      link: 'github.com/arman/studyhub',
    },
    {
      name: 'TaskFlow',
      description: 'Канбан-доска для управления проектами с drag-and-drop',
      tech: ['React', 'DnD Kit', 'Framer Motion'],
      link: 'github.com/arman/taskflow',
    },
    {
      name: 'Weather KZ',
      description: 'Приложение погоды для городов Казахстана с API интеграцией',
      tech: ['React', 'OpenWeather API', 'Chart.js'],
    },
  ],
}

const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  // Behavioral
  {
    id: 'bh1',
    category: 'behavioral',
    question: 'Расскажите о ситуации, когда вы работали в команде над сложным проектом.',
    tips: [
      'Используйте метод STAR: Situation, Task, Action, Result',
      'Подчеркните свою конкретную роль',
      'Упомяните, чему научились',
    ],
    sampleAnswer:
      'В университете мы работали командой из 4 человек над проектом Study Hub. Я был ответственным за frontend. Возникли разногласия по дизайну, и я предложил провести голосование с аргументами каждой стороны. В итоге мы нашли компромисс, и проект получил высшую оценку. Я понял, что важно слушать все мнения и искать решение, которое устраивает всех.',
  },
  {
    id: 'bh2',
    category: 'behavioral',
    question: 'Расскажите о своей самой большой ошибке и чему она вас научила.',
    tips: [
      'Будьте честны, но выбирайте профессиональную ошибку',
      'Фокус на уроке, а не на ошибке',
      'Покажите рост',
    ],
    sampleAnswer:
      'На одном из фриланс-проектов я не уточнил все требования заранее и начал разработку по своему видению. В результате пришлось переделывать 60% работы. С тех пор я всегда составляю детальное ТЗ и согласовываю макеты до начала кодинга. Это сэкономило мне массу времени на следующих проектах.',
  },
  {
    id: 'bh3',
    category: 'behavioral',
    question: 'Как вы справляетесь со стрессом и большим объёмом работы?',
    tips: [
      'Покажите конкретные стратегии',
      'Приведите пример из жизни',
      'Не говорите, что стресс вас не касается',
    ],
    sampleAnswer:
      'Я использую метод приоритизации задач. Во время сессии в университете у меня были одновременно экзамены и дедлайн по проекту. Я составил план по дням, разбил большие задачи на маленькие и работал по таймеру Pomodoro. Это помогло мне всё сдать вовремя без потери качества.',
  },
  // Technical
  {
    id: 'tc1',
    category: 'technical',
    question: 'Объясните разницу между let, const и var в JavaScript.',
    tips: [
      'Упомяните scope: block vs function',
      'Объясните hoisting',
      'Приведите практические примеры',
    ],
    sampleAnswer:
      'var имеет функциональную область видимости и поднимается (hoisting). let и const имеют блочную область видимости. const не позволяет переприсвоить значение, но объекты в const можно мутировать. В современном коде рекомендуется использовать const по умолчанию и let когда нужно переприсвоение. var практически не используется.',
  },
  {
    id: 'tc2',
    category: 'technical',
    question: 'Что такое Virtual DOM в React и зачем он нужен?',
    tips: [
      'Объясните проблему прямого манипулирования DOM',
      'Опишите процесс reconciliation',
      'Упомяните производительность',
    ],
    sampleAnswer:
      'Virtual DOM -- это лёгкая копия реального DOM в памяти. Когда состояние компонента меняется, React создаёт новое виртуальное дерево, сравнивает его с предыдущим (diffing), и применяет только минимальные изменения к реальному DOM. Это гораздо быстрее, чем перерисовывать весь DOM при каждом обновлении.',
  },
  {
    id: 'tc3',
    category: 'technical',
    question: 'Что такое замыкание (closure) в JavaScript? Приведите пример.',
    tips: [
      'Дайте простое определение',
      'Приведите практический пример',
      'Упомяните где это используется в React',
    ],
    sampleAnswer:
      'Замыкание -- это функция, которая запоминает переменные из внешней области видимости, даже когда внешняя функция завершилась. Например, function counter() { let count = 0; return () => ++count; }. В React замыкания используются повсюду: в useEffect, обработчиках событий, колбэках useState.',
  },
  // Situational
  {
    id: 'st1',
    category: 'situational',
    question: 'Что вы сделаете, если не успеваете к дедлайну по важному проекту?',
    tips: [
      'Покажите проактивность',
      'Упомяните коммуникацию с командой',
      'Предложите конкретные шаги',
    ],
    sampleAnswer:
      'Первым делом я оценю оставшийся объём работы и определю, что можно сделать к дедлайну, а что нет. Затем сообщу руководителю о ситуации и предложу варианты: сократить scope, привлечь помощь или немного сдвинуть срок. Прозрачность и предложение решений лучше, чем молчание до последнего момента.',
  },
  {
    id: 'st2',
    category: 'situational',
    question: 'Коллега написал код, который вы считаете неоптимальным. Ваши действия?',
    tips: [
      'Покажите уважение к коллегам',
      'Предложите конструктивный подход',
      'Упомяните code review',
    ],
    sampleAnswer:
      'Я бы начал с вопроса, а не критики: "Я заметил, что здесь используется такой подход -- можешь объяснить причину?" Возможно, у коллеги были основания. Если нет, я бы предложил альтернативу с конкретными аргументами: производительность, читаемость. Конструктивный code review помогает всей команде расти.',
  },
  {
    id: 'st3',
    category: 'situational',
    question: 'Вам поручили задачу с технологией, которую вы не знаете. Что будете делать?',
    tips: [
      'Покажите готовность учиться',
      'Опишите стратегию изучения',
      'Упомяните ресурсы',
    ],
    sampleAnswer:
      'Я бы начал с официальной документации и прошёл бы quick start. Затем нашёл бы похожие проекты на GitHub для изучения паттернов. Параллельно посмотрел бы видео-туториал для общего понимания. Если застряну -- спрошу у коллег или в сообществе. Главное -- не бояться незнакомого, а системно подходить к изучению.',
  },
  // HR
  {
    id: 'hr1',
    category: 'hr',
    question: 'Почему вы хотите работать в нашей компании?',
    tips: [
      'Изучите компанию заранее',
      'Свяжите с вашими целями',
      'Будьте конкретны',
    ],
    sampleAnswer:
      'Kaspi.kz -- это технологический лидер Казахстана, который меняет повседневную жизнь миллионов людей. Меня привлекает масштаб продуктов: от финтеха до маркетплейса. Я хочу работать в команде, где могу расти как разработчик, решая реальные задачи для реальных пользователей. Мои навыки в React и TypeScript помогут мне быстро влиться в команду.',
  },
  {
    id: 'hr2',
    category: 'hr',
    question: 'Кем вы видите себя через 3 года?',
    tips: [
      'Покажите амбиции, но будьте реалистичны',
      'Свяжите с компанией',
      'Упомяните развитие навыков',
    ],
    sampleAnswer:
      'Через 3 года я хочу вырасти до Middle/Senior Frontend разработчика. Планирую углубить знания в архитектуре приложений, освоить backend на Node.js и стать fullstack-разработчиком. Также хочу менторить джуниоров, потому что обучение других -- лучший способ закрепить свои знания.',
  },
  {
    id: 'hr3',
    category: 'hr',
    question: 'Какие ваши сильные и слабые стороны?',
    tips: [
      'Сильные: приведите примеры',
      'Слабые: покажите осознанность и работу над ними',
      'Не говорите "перфекционизм" как слабость',
    ],
    sampleAnswer:
      'Мои сильные стороны: быстрая обучаемость и внимание к деталям в UI. За 2 месяца я освоил React с нуля до уровня, позволяющего создавать полноценные приложения. Слабая сторона: иногда слишком погружаюсь в одну задачу, теряя время. Сейчас я работаю над этим, используя тайм-боксинг и ежедневные стендапы для самоконтроля.',
  },
]

const CATEGORY_LABELS: Record<InterviewQuestion['category'], string> = {
  behavioral: 'Поведенческие',
  technical: 'Технические',
  situational: 'Ситуационные',
  hr: 'HR',
}

const CATEGORY_COLORS: Record<InterviewQuestion['category'], string> = {
  behavioral: 'bg-blue-100 text-blue-700 border-blue-200',
  technical: 'bg-purple-100 text-purple-700 border-purple-200',
  situational: 'bg-amber-100 text-amber-700 border-amber-200',
  hr: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

const SKILLS_DATA: SkillItem[] = [
  { name: 'HTML/CSS', category: 'hard', current: 5, target: 5, icon: Code },
  { name: 'JavaScript', category: 'hard', current: 4, target: 5, icon: Code, recommendedCourse: 'JavaScript Advanced на Stepik' },
  { name: 'React', category: 'hard', current: 3, target: 5, icon: Code, recommendedCourse: 'React Pro Course на Udemy' },
  { name: 'TypeScript', category: 'hard', current: 2, target: 5, icon: Code, recommendedCourse: 'TypeScript Deep Dive' },
  { name: 'Git', category: 'hard', current: 3, target: 4, icon: FolderKanban },
  { name: 'Node.js', category: 'hard', current: 2, target: 3, icon: Globe },
  { name: 'Figma', category: 'hard', current: 3, target: 4, icon: Palette },
  { name: 'Коммуникация', category: 'soft', current: 4, target: 5, icon: Users },
  { name: 'Работа в команде', category: 'soft', current: 4, target: 5, icon: Users },
  { name: 'Тайм-менеджмент', category: 'soft', current: 3, target: 5, icon: Clock, recommendedCourse: 'Productivity Masterclass' },
  { name: 'Английский язык', category: 'soft', current: 3, target: 5, icon: Globe, recommendedCourse: 'English for IT на Coursera' },
  { name: 'Решение проблем', category: 'soft', current: 3, target: 5, icon: Zap },
  { name: 'Адаптивность', category: 'soft', current: 4, target: 5, icon: Shield },
]

// ── Animation constants ────────────────────────────────────────────────────

const fadeInUp = {
  initial: { opacity: 0, y: 20 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.5 } as const,
}

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.07 } as const,
  },
}

const staggerItem = {
  initial: { opacity: 0, y: 12 } as const,
  animate: { opacity: 1, y: 0 } as const,
}

// ── Progress Ring Component ────────────────────────────────────────────────

function ProgressRing({ progress, size = 120, strokeWidth = 10 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, type: 'spring' as const, bounce: 0.2 }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-800">{progress}%</span>
        <span className="text-xs text-slate-500">выполнено</span>
      </div>
    </div>
  )
}

// ── Star Rating Component ──────────────────────────────────────────────────

function StarRating({ current, target }: { current: number; target: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'w-4 h-4',
            i < current
              ? 'fill-amber-400 text-amber-400'
              : i < target
                ? 'fill-none text-amber-300'
                : 'fill-none text-slate-200'
          )}
        />
      ))}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function CareerTracker() {
  const { user } = useStore()

  const [activeTab, setActiveTab] = useState<TabId>('goal')
  const [milestones, setMilestones] = useState<CareerMilestone[]>(INITIAL_MILESTONES)
  const [resume] = useState<ResumeData>(INITIAL_RESUME)
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)
  const [interviewCategory, setInterviewCategory] = useState<InterviewQuestion['category'] | 'all'>('all')
  const [practiceMode, setPracticeMode] = useState(false)
  const [practiceQuestion, setPracticeQuestion] = useState<InterviewQuestion | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [skillFilter, setSkillFilter] = useState<'all' | 'hard' | 'soft'>('all')

  // ── Derived state ──────────────────────────────────────────────────────

  const completedCount = milestones.filter(m => m.completed).length
  const progress = Math.round((completedCount / milestones.length) * 100)

  const goal: CareerGoal = useMemo(() => ({
    ...INITIAL_GOAL,
    progress,
    milestones,
  }), [progress, milestones])

  const filteredQuestions = useMemo(
    () =>
      interviewCategory === 'all'
        ? INTERVIEW_QUESTIONS
        : INTERVIEW_QUESTIONS.filter(q => q.category === interviewCategory),
    [interviewCategory],
  )

  const filteredSkills = useMemo(
    () =>
      skillFilter === 'all'
        ? SKILLS_DATA
        : SKILLS_DATA.filter(s => s.category === skillFilter),
    [skillFilter],
  )

  const gapSkills = useMemo(
    () => SKILLS_DATA.filter(s => s.target - s.current >= 2),
    [],
  )

  // ── Handlers ───────────────────────────────────────────────────────────

  const toggleMilestone = useCallback((id: string) => {
    setMilestones(prev =>
      prev.map(m => (m.id === id ? { ...m, completed: !m.completed } : m)),
    )
  }, [])

  const getRandomQuestion = useCallback(() => {
    const pool = interviewCategory === 'all'
      ? INTERVIEW_QUESTIONS
      : INTERVIEW_QUESTIONS.filter(q => q.category === interviewCategory)
    const randomIndex = Math.floor(Math.random() * pool.length)
    setPracticeQuestion(pool[randomIndex])
    setShowAnswer(false)
  }, [interviewCategory])

  const handleStartPractice = useCallback(() => {
    setPracticeMode(true)
    getRandomQuestion()
  }, [getRandomQuestion])

  const handleDownloadPdf = useCallback(() => {
    alert('Функция скоро будет доступна')
  }, [])

  // ── Render helpers ─────────────────────────────────────────────────────

  const userName = user?.name ?? 'Пользователь'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Карьерный трекер</h1>
          </div>
          <p className="text-white/70 ml-13">
            {userName}, отслеживайте свой путь к карьере мечты
          </p>
        </div>
      </div>

      {/* ── Tab navigation ────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-1 bg-white rounded-xl shadow-sm p-1 -mt-5 relative z-10 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all flex-1 justify-center whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* ─────────────── Tab 1: My Goal ─────────────── */}
          {activeTab === 'goal' && (
            <motion.div
              key="goal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Goal card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <ProgressRing progress={progress} />

                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                      <Target className="w-5 h-5 text-indigo-600" />
                      <span className="text-sm font-medium text-indigo-600">Моя карьерная цель</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                      {goal.targetRole}
                    </h2>
                    {goal.targetCompany && (
                      <p className="text-slate-500 mt-1">
                        в {goal.targetCompany}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-3 justify-center md:justify-start">
                      <span className="inline-flex items-center gap-1 text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5" />
                        Дедлайн: {goal.deadline}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {completedCount} из {milestones.length} этапов
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4 w-full">
                      <div className="flex justify-between text-sm text-slate-500 mb-1">
                        <span>Прогресс</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, type: 'spring' as const, bounce: 0.2 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Milestones */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Этапы пути
                </h3>

                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="space-y-3"
                >
                  {milestones.map((milestone, index) => {
                    const Icon = MILESTONE_ICONS[milestone.type]
                    return (
                      <motion.div
                        key={milestone.id}
                        variants={staggerItem}
                        transition={{ duration: 0.3 }}
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer group',
                          milestone.completed
                            ? 'border-emerald-200 bg-emerald-50'
                            : 'border-slate-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/30',
                        )}
                        onClick={() => toggleMilestone(milestone.id)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-sm font-medium text-slate-400 w-6 text-center">
                            {index + 1}
                          </span>
                          <motion.div
                            whileTap={{ scale: 0.8 }}
                          >
                            {milestone.completed ? (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring' as const, bounce: 0.5 }}
                              >
                                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                              </motion.div>
                            ) : (
                              <Circle className="w-6 h-6 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                            )}
                          </motion.div>
                          <Icon className={cn(
                            'w-5 h-5',
                            milestone.completed ? 'text-emerald-500' : 'text-slate-400',
                          )} />
                          <span className={cn(
                            'font-medium',
                            milestone.completed ? 'text-emerald-700 line-through' : 'text-slate-700',
                          )}>
                            {milestone.title}
                          </span>
                        </div>
                        {milestone.completed && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium"
                          >
                            Готово
                          </motion.span>
                        )}
                      </motion.div>
                    )
                  })}
                </motion.div>
              </div>

              {/* Motivational Quote */}
              <motion.div
                {...fadeInUp}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white"
              >
                <div className="flex items-start gap-4">
                  <Sparkles className="w-8 h-8 text-amber-300 shrink-0 mt-1" />
                  <div>
                    <p className="text-lg font-medium italic">
                      &laquo;{MOTIVATIONAL_QUOTES[completedCount % MOTIVATIONAL_QUOTES.length].text}&raquo;
                    </p>
                    <p className="text-white/70 mt-2 text-sm">
                      -- {MOTIVATIONAL_QUOTES[completedCount % MOTIVATIONAL_QUOTES.length].author}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ─────────────── Tab 2: Resume ─────────────── */}
          {activeTab === 'resume' && (
            <motion.div
              key="resume"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Edit form */}
                <div className="lg:w-2/5 space-y-4">
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-indigo-600" />
                      Личные данные
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-slate-600 block mb-1">Имя</label>
                        <input
                          type="text"
                          defaultValue={resume.fullName}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 block mb-1">Должность</label>
                        <input
                          type="text"
                          defaultValue={resume.title}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 block mb-1">Email</label>
                        <input
                          type="email"
                          defaultValue={resume.email}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 block mb-1">Телефон</label>
                        <input
                          type="tel"
                          defaultValue={resume.phone}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 block mb-1">Город</label>
                        <input
                          type="text"
                          defaultValue={resume.city}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600 block mb-1">О себе</label>
                        <textarea
                          defaultValue={resume.summary}
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Skills editor quick view */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Навыки</h3>
                    <div className="space-y-3">
                      {resume.skills.map(skill => (
                        <div key={skill.name}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-slate-700">{skill.name}</span>
                            <span className="text-slate-500">{skill.level}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${skill.level}%` }}
                              transition={{ duration: 0.8, delay: 0.1 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadPdf}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Скачать PDF
                  </button>
                </div>

                {/* Resume preview */}
                <div className="lg:w-3/5">
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {/* Resume Header */}
                    <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-8">
                      <h2 className="text-2xl font-bold">{resume.fullName}</h2>
                      <p className="text-slate-300 mt-1 text-lg">{resume.title}</p>
                      <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-4 h-4" />
                          {resume.email}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-4 h-4" />
                          {resume.phone}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          {resume.city}
                        </span>
                      </div>
                    </div>

                    <div className="p-8 space-y-6">
                      {/* Summary */}
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-200 pb-2">
                          О себе
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">{resume.summary}</p>
                      </div>

                      {/* Education */}
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-2">
                          Образование
                        </h3>
                        <div className="space-y-3">
                          {resume.education.map((edu, idx) => (
                            <div key={idx}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-semibold text-slate-800 text-sm">{edu.institution}</p>
                                  <p className="text-slate-500 text-sm">{edu.degree}</p>
                                </div>
                                <span className="text-sm text-slate-400 shrink-0 ml-4">{edu.year}</span>
                              </div>
                              {edu.gpa && (
                                <p className="text-xs text-slate-400 mt-0.5">GPA: {edu.gpa}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Experience */}
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-2">
                          Опыт
                        </h3>
                        <div className="space-y-4">
                          {resume.experience.map((exp, idx) => (
                            <div key={idx}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-semibold text-slate-800 text-sm">{exp.role}</p>
                                  <p className="text-indigo-600 text-sm">{exp.company}</p>
                                </div>
                                <span className="text-sm text-slate-400 shrink-0 ml-4">{exp.period}</span>
                              </div>
                              <ul className="mt-2 space-y-1">
                                {exp.bullets.map((bullet, bIdx) => (
                                  <li key={bIdx} className="text-sm text-slate-600 flex gap-2">
                                    <span className="text-indigo-400 mt-1.5 shrink-0">&#8226;</span>
                                    {bullet}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Skills with bars */}
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-2">
                          Навыки
                        </h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                          {resume.skills.map(skill => (
                            <div key={skill.name}>
                              <div className="flex justify-between text-xs mb-0.5">
                                <span className="font-medium text-slate-700">{skill.name}</span>
                                <span className="text-slate-400">{skill.level}%</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1.5">
                                <div
                                  className="h-full rounded-full bg-indigo-500"
                                  style={{ width: `${skill.level}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Languages */}
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-2">
                          Языки
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {resume.languages.map(lang => (
                            <span key={lang.name} className="text-sm bg-slate-100 px-3 py-1 rounded-full text-slate-700">
                              <span className="font-medium">{lang.name}</span>
                              <span className="text-slate-400 ml-1">-- {lang.level}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Projects */}
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-2">
                          Проекты
                        </h3>
                        <div className="space-y-3">
                          {resume.projects.map((project, idx) => (
                            <div key={idx}>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-slate-800 text-sm">{project.name}</p>
                                {project.link && (
                                  <span className="text-xs text-indigo-500">{project.link}</span>
                                )}
                              </div>
                              <p className="text-sm text-slate-500 mt-0.5">{project.description}</p>
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {project.tech.map(t => (
                                  <span key={t} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─────────────── Tab 3: Interview ─────────────── */}
          {activeTab === 'interview' && (
            <motion.div
              key="interview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Category pills */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setInterviewCategory('all')}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all border',
                    interviewCategory === 'all'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300',
                  )}
                >
                  Все ({INTERVIEW_QUESTIONS.length})
                </button>
                {(Object.keys(CATEGORY_LABELS) as InterviewQuestion['category'][]).map(cat => {
                  const count = INTERVIEW_QUESTIONS.filter(q => q.category === cat).length
                  return (
                    <button
                      key={cat}
                      onClick={() => setInterviewCategory(cat)}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm font-medium transition-all border',
                        interviewCategory === cat
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : cn('bg-white border-slate-200 hover:border-indigo-300', CATEGORY_COLORS[cat].split(' ')[1]),
                      )}
                    >
                      {CATEGORY_LABELS[cat]} ({count})
                    </button>
                  )
                })}
              </div>

              {/* Practice mode */}
              {!practiceMode ? (
                <button
                  onClick={handleStartPractice}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md"
                >
                  <Zap className="w-5 h-5" />
                  Режим тренировки
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-300" />
                      Режим тренировки
                    </h3>
                    <button
                      onClick={() => setPracticeMode(false)}
                      className="text-white/70 hover:text-white text-sm"
                    >
                      Закрыть
                    </button>
                  </div>

                  {practiceQuestion && (
                    <div className="space-y-4">
                      <span className={cn(
                        'inline-block text-xs px-2 py-1 rounded-full font-medium',
                        'bg-white/20 text-white',
                      )}>
                        {CATEGORY_LABELS[practiceQuestion.category]}
                      </span>
                      <p className="text-lg font-medium">{practiceQuestion.question}</p>

                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => setShowAnswer(!showAnswer)}
                          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          {showAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          {showAnswer ? 'Скрыть ответ' : 'Показать ответ'}
                        </button>
                        <button
                          onClick={getRandomQuestion}
                          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          <Shuffle className="w-4 h-4" />
                          Следующий вопрос
                        </button>
                      </div>

                      <AnimatePresence>
                        {showAnswer && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="bg-white/10 rounded-xl p-4 mt-2">
                              <p className="text-sm font-medium text-amber-200 mb-2">Советы:</p>
                              <ul className="space-y-1 mb-3">
                                {practiceQuestion.tips.map((tip, i) => (
                                  <li key={i} className="text-sm text-white/80 flex gap-2">
                                    <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                              <p className="text-sm font-medium text-amber-200 mb-1">Пример ответа:</p>
                              <p className="text-sm text-white/90 leading-relaxed">{practiceQuestion.sampleAnswer}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Questions list */}
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-3"
              >
                {filteredQuestions.map(question => {
                  const isExpanded = expandedQuestion === question.id
                  return (
                    <motion.div
                      key={question.id}
                      variants={staggerItem}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100"
                    >
                      <button
                        onClick={() => setExpandedQuestion(isExpanded ? null : question.id)}
                        className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50 transition-colors"
                      >
                        <span className={cn(
                          'text-xs px-2.5 py-1 rounded-full font-medium border shrink-0',
                          CATEGORY_COLORS[question.category],
                        )}>
                          {CATEGORY_LABELS[question.category]}
                        </span>
                        <span className="flex-1 font-medium text-slate-700 text-sm">
                          {question.question}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-0 border-t border-slate-100">
                              <div className="mt-3 space-y-3">
                                <div>
                                  <p className="text-sm font-semibold text-indigo-600 mb-1.5">Советы:</p>
                                  <ul className="space-y-1">
                                    {question.tips.map((tip, i) => (
                                      <li key={i} className="text-sm text-slate-600 flex gap-2">
                                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                        {tip}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-indigo-600 mb-1.5">Пример ответа:</p>
                                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg">
                                    {question.sampleAnswer}
                                  </p>
                                </div>
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
          )}

          {/* ─────────────── Tab 4: Skills ─────────────── */}
          {activeTab === 'skills' && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Filter pills */}
              <div className="flex gap-2">
                {([
                  { id: 'all' as const, label: 'Все навыки' },
                  { id: 'hard' as const, label: 'Hard Skills' },
                  { id: 'soft' as const, label: 'Soft Skills' },
                ]).map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSkillFilter(f.id)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition-all border',
                      skillFilter === f.id
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300',
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Radar / Visual overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Skills list */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Карта навыков</h3>
                    <motion.div
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                      className="space-y-4"
                    >
                      {filteredSkills.map(skill => {
                        const Icon = skill.icon
                        const currentPct = (skill.current / 5) * 100
                        const targetPct = (skill.target / 5) * 100
                        return (
                          <motion.div
                            key={skill.name}
                            variants={staggerItem}
                            transition={{ duration: 0.3 }}
                            className="flex items-center gap-4"
                          >
                            <div className={cn(
                              'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                              skill.category === 'hard' ? 'bg-purple-100' : 'bg-blue-100',
                            )}>
                              <Icon className={cn(
                                'w-4.5 h-4.5',
                                skill.category === 'hard' ? 'text-purple-600' : 'text-blue-600',
                              )} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-slate-700">{skill.name}</span>
                                <StarRating current={skill.current} target={skill.target} />
                              </div>
                              <div className="relative w-full bg-slate-100 rounded-full h-2.5">
                                {/* Target marker */}
                                <div
                                  className="absolute top-0 h-full border-r-2 border-dashed border-slate-300"
                                  style={{ left: `${targetPct}%` }}
                                />
                                <motion.div
                                  className={cn(
                                    'h-full rounded-full',
                                    skill.current >= skill.target
                                      ? 'bg-emerald-500'
                                      : skill.current >= skill.target - 1
                                        ? 'bg-amber-500'
                                        : 'bg-red-400',
                                  )}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${currentPct}%` }}
                                  transition={{ duration: 0.8, delay: 0.1 }}
                                />
                              </div>
                              <div className="flex justify-between mt-0.5">
                                <span className="text-xs text-slate-400">Уровень: {skill.current}/5</span>
                                <span className="text-xs text-slate-400">Цель: {skill.target}/5</span>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </motion.div>
                  </div>
                </div>

                {/* Side panel: Gap analysis + recommendations */}
                <div className="space-y-6">
                  {/* Gap analysis */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-red-500" />
                      Анализ пробелов
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Вам нужно прокачать:
                    </p>
                    <div className="space-y-2">
                      {gapSkills.map(skill => (
                        <div
                          key={skill.name}
                          className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                            <Zap className="w-4 h-4 text-red-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700">{skill.name}</p>
                            <p className="text-xs text-slate-500">
                              {skill.current}/5 &rarr; {skill.target}/5
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended courses */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-indigo-600" />
                      Рекомендации
                    </h3>
                    <div className="space-y-3">
                      {SKILLS_DATA.filter(s => s.recommendedCourse).map(skill => (
                        <div
                          key={skill.name}
                          className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl"
                        >
                          <p className="text-xs text-indigo-500 font-medium mb-0.5">Для: {skill.name}</p>
                          <p className="text-sm font-medium text-slate-700">{skill.recommendedCourse}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Overall stats */}
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-pink-300" />
                      Общий прогресс
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Hard Skills</span>
                        <span className="font-medium">
                          {Math.round(
                            (SKILLS_DATA.filter(s => s.category === 'hard').reduce((acc, s) => acc + s.current, 0) /
                              SKILLS_DATA.filter(s => s.category === 'hard').reduce((acc, s) => acc + s.target, 0)) *
                              100,
                          )}%
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div
                          className="h-full rounded-full bg-white"
                          style={{
                            width: `${Math.round(
                              (SKILLS_DATA.filter(s => s.category === 'hard').reduce((acc, s) => acc + s.current, 0) /
                                SKILLS_DATA.filter(s => s.category === 'hard').reduce((acc, s) => acc + s.target, 0)) *
                                100,
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-white/70">Soft Skills</span>
                        <span className="font-medium">
                          {Math.round(
                            (SKILLS_DATA.filter(s => s.category === 'soft').reduce((acc, s) => acc + s.current, 0) /
                              SKILLS_DATA.filter(s => s.category === 'soft').reduce((acc, s) => acc + s.target, 0)) *
                              100,
                          )}%
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div
                          className="h-full rounded-full bg-white"
                          style={{
                            width: `${Math.round(
                              (SKILLS_DATA.filter(s => s.category === 'soft').reduce((acc, s) => acc + s.current, 0) /
                                SKILLS_DATA.filter(s => s.category === 'soft').reduce((acc, s) => acc + s.target, 0)) *
                                100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
