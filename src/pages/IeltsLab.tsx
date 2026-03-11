import LabLanding from '@/components/LabLanding'
import type { LabConfig } from '@/components/LabLanding'
import { Globe } from 'lucide-react'

const config: LabConfig = {
  source: 'ielts',
  badge: 'IELTS Lab',
  headline: 'Получи IELTS 7.0+\nи поступи за рубеж',
  subline: 'Персональный план подготовки к IELTS, разбор всех 4 навыков, подбор зарубежных университетов — бесплатно.',
  cta: 'Составить план IELTS',
  heroBg: 'bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600',
  accent: 'bg-blue-500/20',
  accentText: 'text-white',
  accentBorder: 'border-blue-300/40',
  heroEmoji: '🌍',
  SectionIcon: Globe,
  stats: [
    { value: '7.0+', label: 'средний Band наших студентов' },
    { value: '4 навыка', label: 'Listening, Reading, Writing, Speaking' },
    { value: '150+', label: 'зарубежных университетов в базе' },
    { value: 'бесплатно', label: 'базовая подготовка' },
  ],
  pains: [
    { icon: '😰', text: 'Не знаешь как структурировать ответ в Writing и теряешь баллы на этом' },
    { icon: '🎧', text: 'Listening сложно — акценты, скорость речи, непонятные слова' },
    { icon: '📝', text: 'Reading занимает слишком много времени — не успеваешь всё прочитать' },
    { icon: '🗣️', text: 'Speaking — страх говорить и не знаешь как структурировать ответ' },
    { icon: '🏫', text: 'Непонятно в какой университет поступать и какой балл нужен' },
    { icon: '💸', text: 'Курсы подготовки стоят 200-500$ — слишком дорого' },
  ],
  features: [
    {
      icon: '📋',
      title: 'IELTS Roadmap',
      description: 'Персональный план от твоего текущего уровня до целевого Band. Учишь именно то что нужно тебе.',
    },
    {
      icon: '✍️',
      title: 'Writing Practice',
      description: 'Task 1 и Task 2 с разбором структуры. Учишься писать по академическому стандарту IELTS.',
    },
    {
      icon: '🎧',
      title: 'Listening & Reading',
      description: 'Тренировочные тесты по форматам реального экзамена. Таймер, анализ ошибок, объяснения.',
    },
    {
      icon: '🗣️',
      title: 'Speaking Tips',
      description: 'Структуры ответов для Part 1, 2, 3. Примеры, фразы-связки, как говорить уверенно.',
    },
    {
      icon: '🏛️',
      title: 'Подбор университетов',
      description: 'Введи свой целевой Band — получи список университетов мира где принимают с этим баллом.',
    },
    {
      icon: '🎓',
      title: 'Scholarships',
      description: 'База стипендий для казахстанских студентов — Болашак, Erasmus, государственные гранты.',
    },
  ],
  steps: [
    {
      number: '1',
      title: 'Оцени свой текущий уровень',
      description: 'Пройди мини-тест по всем 4 навыкам. Увидишь где сильный, а где нужна работа.',
    },
    {
      number: '2',
      title: 'Получи персональный IELTS план',
      description: 'Платформа строит план с учётом твоей цели (Band 6.5, 7.0, 7.5) и времени до экзамена.',
    },
    {
      number: '3',
      title: 'Практикуй каждый навык',
      description: 'Ежедневные задания по 20-30 минут. Прогресс-трекер по каждому навыку.',
    },
    {
      number: '4',
      title: 'Найди свой университет',
      description: 'Когда готов к экзамену — платформа поможет выбрать университет и подать документы.',
    },
  ],
  testimonials: [
    {
      name: 'Асель Т.',
      city: 'Алматы',
      text: 'Занималась по платформе 2 месяца. Writing был мой слабый навык — начала с 5.5, вышла на 7.0 на реальном экзамене.',
      score: 'Band 7.0',
    },
    {
      name: 'Арман С.',
      city: 'Астана',
      text: 'Поступил в университет в Германии с Band 7.5. Платформа помогла найти стипендию DAAD и написать мотивационное письмо.',
      score: 'Band 7.5',
    },
    {
      name: 'Жанель Н.',
      city: 'Актобе',
      text: 'Не было денег на дорогие курсы. Здесь бесплатно получила структурированный план и реальные результаты за 3 месяца.',
      score: 'Band 6.5',
    },
  ],
}

export default function IeltsLab() {
  return <LabLanding config={config} />
}
