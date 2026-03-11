import LabLanding from '@/components/LabLanding'
import type { LabConfig } from '@/components/LabLanding'
import { Rocket } from 'lucide-react'

const config: LabConfig = {
  source: 'startup',
  badge: 'Startup Lab',
  headline: 'Преврати идею\nв реальный стартап',
  subline: 'AI Co-Founder поможет построить roadmap, найти рынок, подготовить pitch deck и подать заявку в акселераторы Казахстана.',
  cta: 'Создать проект',
  heroBg: 'bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800',
  accent: 'bg-violet-500/20',
  accentText: 'text-white',
  accentBorder: 'border-violet-300/40',
  heroEmoji: '🚀',
  SectionIcon: Rocket,
  stats: [
    { value: 'AI', label: 'Co-Founder всегда с тобой' },
    { value: '7 этапов', label: 'от идеи до инвестиций' },
    { value: 'Astana Hub', label: 'и другие акселераторы КЗ' },
    { value: 'бесплатно', label: 'старт проекта' },
  ],
  pains: [
    { icon: '💡', text: 'Есть идея, но не знаешь с чего начать — исследование рынка, MVP, первые пользователи' },
    { icon: '😰', text: 'Боишься провала — не понимаешь реальна ли идея и есть ли для неё рынок' },
    { icon: '🤷', text: 'Не знаешь какие навыки нужны и как их получить для своего проекта' },
    { icon: '💸', text: 'Не знаешь где искать инвестиции и что такое акселераторы в Казахстане' },
    { icon: '📊', text: 'Не умеешь делать pitch deck и business model — а без этого инвесторы не смотрят' },
    { icon: '🧑‍💻', text: 'Хочешь найти соучредителя или команду, но не знаешь где' },
  ],
  features: [
    {
      icon: '🤖',
      title: 'AI Co-Founder',
      description: 'Напиши идею — получи полный анализ: тип проекта, объём рынка, конкуренты, необходимые навыки.',
    },
    {
      icon: '🗺️',
      title: '7-этапный Roadmap',
      description: 'Пошаговый план от исследования рынка до первых инвестиций. Каждый этап — конкретные задачи.',
    },
    {
      icon: '📊',
      title: 'Market Research',
      description: 'Анализ рынка Казахстана, конкурентов, целевой аудитории и монетизации — автоматически.',
    },
    {
      icon: '🏆',
      title: 'Investor Readiness',
      description: 'Чеклист готовности к инвестициям. Видишь что ещё нужно сделать до питча инвестору.',
    },
    {
      icon: '🏛️',
      title: 'Акселераторы КЗ',
      description: 'Astana Hub, Tech Garden, QazInnovations, AIFC — информация о требованиях и дедлайнах.',
    },
    {
      icon: '💼',
      title: 'Project Workspace',
      description: 'Все материалы проекта в одном месте — roadmap, документы, метрики, чеклист.',
    },
  ],
  steps: [
    {
      number: '1',
      title: 'Опиши свою идею',
      description: 'Несколько предложений о том что хочешь создать. AI сразу начнёт анализ.',
    },
    {
      number: '2',
      title: 'Получи анализ рынка',
      description: 'Тип проекта, сложность, нужные навыки, объём рынка, конкуренты — за 10 секунд.',
    },
    {
      number: '3',
      title: 'Работай по roadmap',
      description: '7 этапов от идеи до инвестиций. Каждый этап с конкретными задачами и deliverables.',
    },
    {
      number: '4',
      title: 'Подай в акселератор',
      description: 'Когда готов — платформа покажет подходящие акселераторы и требования к заявке.',
    },
  ],
  testimonials: [
    {
      name: 'Тимур А.',
      city: 'Астана',
      text: 'Всегда хотел сделать EdTech стартап, но не знал как начать. Платформа дала чёткий план и я уже в работе над MVP.',
      score: 'EdTech Founder',
    },
    {
      name: 'Сабина К.',
      city: 'Алматы',
      text: 'Подала заявку в Astana Hub после того как подготовила pitch deck с помощью платформы. Прошла в программу!',
      score: 'Astana Hub ✓',
    },
    {
      name: 'Арман Д.',
      city: 'Шымкент',
      text: 'Раньше думал что стартап это только для программистов. Платформа показала что product thinking важнее кода.',
      score: 'First Product',
    },
  ],
}

export default function StartupLabLanding() {
  return <LabLanding config={config} />
}
