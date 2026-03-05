// ── Motivation Letter Scripted System ─────────────────────────────────────────
// Fully scripted — no OpenAI needed for basic builder.
// Optional "AI Review" button can call OpenAI for grammar/style polish.

export type LetterField =
  | 'engineering'
  | 'medicine'
  | 'business'
  | 'law'
  | 'it'
  | 'social'
  | 'arts'
  | 'science'
  | 'education'

export interface FieldMeta {
  id: LetterField
  label: string
  emoji: string
  color: string
}

export const FIELDS: FieldMeta[] = [
  { id: 'engineering', label: 'Инженерия / Технологии', emoji: '⚙️', color: 'bg-blue-50 text-blue-700' },
  { id: 'it',          label: 'IT / Программирование',  emoji: '💻', color: 'bg-indigo-50 text-indigo-700' },
  { id: 'medicine',    label: 'Медицина / Здоровье',    emoji: '🏥', color: 'bg-red-50 text-red-700' },
  { id: 'business',    label: 'Бизнес / Экономика',     emoji: '📊', color: 'bg-amber-50 text-amber-700' },
  { id: 'law',         label: 'Право / Юриспруденция',  emoji: '⚖️', color: 'bg-slate-50 text-slate-700' },
  { id: 'social',      label: 'Социальные науки',        emoji: '🌍', color: 'bg-green-50 text-green-700' },
  { id: 'arts',        label: 'Искусство / Дизайн',      emoji: '🎨', color: 'bg-pink-50 text-pink-700' },
  { id: 'science',     label: 'Естественные науки',      emoji: '🔬', color: 'bg-purple-50 text-purple-700' },
  { id: 'education',   label: 'Педагогика / Образование',emoji: '📚', color: 'bg-teal-50 text-teal-700' },
]

// ── Step structure ────────────────────────────────────────────────────────────

export interface LetterStep {
  id: string
  title: string
  subtitle: string
  placeholder: string
  minWords: number
  maxWords: number
  hints: string[]
  mistakes: string[]       // common mistakes to avoid
  exampleOpeners: string[] // sentence starters
}

export const LETTER_STEPS: LetterStep[] = [
  {
    id: 'hook',
    title: 'Сильное начало',
    subtitle: 'Первый абзац — самый важный. Зацепите комиссию с первой строки.',
    placeholder: 'Начните с яркого момента, цитаты, вопроса или личной истории...',
    minWords: 40,
    maxWords: 80,
    hints: [
      'Начните с конкретного момента из жизни, а не с "Меня зовут..."',
      'Вопрос или парадокс сразу привлекает внимание',
      'Упомяните главную мотивацию с первых строк',
      'Избегайте клише вроде "С детства мечтал(а)..."',
    ],
    mistakes: [
      '"Я хочу поступить в ваш университет потому что он лучший"',
      '"Меня зовут [Имя] и я хочу изучать..."',
      'Перечисление оценок и достижений без контекста',
    ],
    exampleOpeners: [
      'Когда мне было 15 лет, я впервые столкнулся(лась) с...',
      'Вопрос, который изменил моё мышление: ...',
      'Три года назад я понял(а), что...',
      'Представьте: ...',
      'В тот момент, когда...',
    ],
  },
  {
    id: 'background',
    title: 'Академический и личный опыт',
    subtitle: 'Расскажите что сформировало ваш интерес. Конкретные примеры, проекты, события.',
    placeholder: 'Опишите проекты, олимпиады, курсы, исследования, работу...',
    minWords: 60,
    maxWords: 120,
    hints: [
      'Называйте конкретные проекты и результаты, не просто "я занимался..."',
      'Покажите прогресс: как вы росли и развивались',
      'Олимпиады, курсы, исследования — всё что доказывает серьёзность',
      'Свяжите прошлый опыт с выбранной специальностью',
    ],
    mistakes: [
      'Просто перечислять оценки без контекста',
      'Писать о всём подряд без фокуса',
      'Хвалить себя без доказательств ("Я очень умный")',
    ],
    exampleOpeners: [
      'Моё знакомство с [областью] началось с...',
      'В рамках проекта [название] я...',
      'Участие в [олимпиада/курс] показало мне...',
      'Работая над [задача], я обнаружил(а)...',
    ],
  },
  {
    id: 'why_program',
    title: 'Почему эта программа',
    subtitle: 'Покажите что вы изучили программу. Конкретные курсы, преподаватели, лаборатории.',
    placeholder: 'Какие именно курсы, исследовательские направления или особенности программы вас привлекают...',
    minWords: 50,
    maxWords: 100,
    hints: [
      'Назовите 2-3 конкретных курса из программы — покажите что изучили сайт',
      'Если есть известный профессор/лаборатория — упомяните',
      'Объясните как программа закроет пробел в ваших знаниях',
      'Уникальные аспекты: обмен, практика, стажировка в программе',
    ],
    mistakes: [
      '"Ваш университет занимает высокое место в рейтингах"',
      '"Ваша программа лучшая в мире"',
      'Копипаст описания с официального сайта',
    ],
    exampleOpeners: [
      'Курс "[название]" в вашей программе особенно привлекает меня, потому что...',
      'Исследования профессора [имя] в области [тема] напрямую связаны с...',
      'Ваша программа уникальна тем, что...',
      'Практическая составляющая программы — [стажировка/лаб] — позволит мне...',
    ],
  },
  {
    id: 'why_university',
    title: 'Почему именно этот университет',
    subtitle: 'Что именно в университете, кампусе, культуре или среде важно для вас.',
    placeholder: 'Расскажите о ценностях, среде, возможностях конкретного университета...',
    minWords: 40,
    maxWords: 80,
    hints: [
      'Упомяните студенческие клубы, инициативы, события если они важны',
      'Локация и её связь с вашей карьерой (экосистема стартапов, медицинские центры)',
      'Международная среда если это имеет значение',
      'Что вы сами привнесёте в университетское сообщество',
    ],
    mistakes: [
      'Повторять то же что написали о программе',
      'Общие фразы без конкретики',
      '"Хочу учиться за границей потому что там лучше"',
    ],
    exampleOpeners: [
      'Среда университета привлекает меня тем, что...',
      'Клуб [название] / инициатива [название] — то, к чему я хочу присоединиться...',
      'Расположение в [город] даёт уникальный доступ к...',
      'Я хочу привнести в сообщество университета...',
    ],
  },
  {
    id: 'goals',
    title: 'Карьерные цели и планы',
    subtitle: 'Куда вы идёте после обучения. Конкретно и реалистично.',
    placeholder: 'Опишите свои цели через 5-10 лет, как образование поможет их достичь...',
    minWords: 50,
    maxWords: 100,
    hints: [
      'Краткосрочная цель (сразу после диплома) + долгосрочная',
      'Свяжите цели с проблемами которые хотите решить в Казахстане / мире',
      'Конкретная роль: не "хочу работать в IT" а "хочу стать ML-инженером в финтех"',
      'Если есть план вернуться в Казахстан — скажите об этом, это ценится',
    ],
    mistakes: [
      '"Хочу стать успешным профессионалом"',
      'Слишком амбициозные нереалистичные цели без обоснования',
      'Только деньги как мотивация',
    ],
    exampleOpeners: [
      'После окончания программы я планирую...',
      'Моя цель — решить проблему [конкретная] через...',
      'Через 5 лет я вижу себя в роли...',
      'Долгосрочно я стремлюсь к...',
    ],
  },
  {
    id: 'closing',
    title: 'Заключение',
    subtitle: 'Сильный финал который остаётся в памяти. Краткий и уверенный.',
    placeholder: 'Завершите письмо кратко и уверенно...',
    minWords: 30,
    maxWords: 60,
    hints: [
      'Перекликайтесь с первым абзацем — создайте кольцевую композицию',
      'Выразите искреннюю благодарность без лести',
      'Покажите уверенность, не самонадеянность',
      'Один последний образ или мысль которая запомнится',
    ],
    mistakes: [
      '"Надеюсь на положительный ответ"',
      'Повторять то что уже было сказано',
      'Слишком длинное заключение',
    ],
    exampleOpeners: [
      'Я убеждён(а), что эта программа станет следующим шагом к...',
      'Возвращаясь к [упомянутый момент из начала] — именно поэтому...',
      'Буду рад(а) возможности обсудить мою кандидатуру подробнее.',
      'С нетерпением жду возможности стать частью...',
    ],
  },
]

// ── Field-specific hints ──────────────────────────────────────────────────────

export const FIELD_TIPS: Record<LetterField, string[]> = {
  engineering: [
    'Упомяните конкретный инженерный проект или задачу которую решили',
    'Покажите понимание технических концепций в своей области',
    'Расскажите о командной работе — инженерия это всегда команда',
    'Свяжите с реальными проблемами: инфраструктура, энергетика, производство в KZ',
  ],
  it: [
    'Ссылка на GitHub или конкретные проекты очень ценится',
    'Назовите технологии с которыми работали (языки, фреймворки)',
    'Покажите самообучение — курсы, хакатоны, open source',
    'IT-индустрия Казахстана растёт — покажите как планируете в ней участвовать',
  ],
  medicine: [
    'Опыт волонтёрства в больницах / поликлиниках обязателен',
    'Расскажите о конкретном пациенте или ситуации которая укрепила решение',
    'Научные интересы: какая область медицины и почему',
    'Покажите эмпатию и понимание ответственности врача',
  ],
  business: [
    'Любой предпринимательский опыт — даже небольшой — очень ценится',
    'Покажите аналитическое мышление: кейсы, разборы, исследования рынка',
    'Международный контекст: как бизнес-образование поможет в KZ',
    'Лидерский опыт: проекты, команды, инициативы',
  ],
  law: [
    'Мотивация должна быть ценностной, не только карьерной',
    'Конкретный правовой вопрос который вас волнует (права человека, коммерческое право)',
    'Аналитические навыки: дебаты, модель ООН, эссе-конкурсы',
    'Понимание правовой системы Казахстана и международного права',
  ],
  social: [
    'Полевой опыт: исследования, интервью, работа с сообществами',
    'Социальные проблемы KZ которые вы хотите изучать',
    'Методологические интересы: качественные vs количественные методы',
    'НПО, волонтёрство, общественные инициативы — ценный опыт',
  ],
  arts: [
    'Портфолио — главное, но письмо объясняет вашу художественную философию',
    'Назовите конкретных художников/дизайнеров которые вас вдохновляют',
    'Как ваше творчество связано с казахской/азиатской идентичностью',
    'Коммерческий и творческий баланс — покажите понимание обоих',
  ],
  science: [
    'Участие в исследовательских проектах или олимпиадах по предмету',
    'Конкретная научная проблема или гипотеза которая вас захватывает',
    'Лабораторный опыт если есть',
    'Научные публикации или исследования к которым хотите присоединиться',
  ],
  education: [
    'Опыт репетиторства, наставничества, работы с детьми',
    'Ваша педагогическая философия — как вы думаете об обучении',
    'Проблемы образования в Казахстане которые хотите решить',
    'Инновационные подходы к обучению которые вас интересуют',
  ],
}

// ── Real examples by field (abbreviated successful openers) ──────────────────

export const FIELD_EXAMPLES: Record<LetterField, { university: string; opener: string }[]> = {
  engineering: [
    { university: 'MIT', opener: 'The bridge collapsed in 2.3 seconds. That moment taught me more about structural engineering than any textbook...' },
    { university: 'ETH Zürich', opener: 'Growing up in a city where half the buildings were built without permits, I became obsessed with the question: what makes infrastructure safe?' },
  ],
  it: [
    { university: 'Carnegie Mellon', opener: 'At 14, I broke my first program. At 16, I fixed someone else\'s. That difference — between writing code and debugging reality — is what draws me to CS research.' },
    { university: 'University of Toronto', opener: 'When my machine learning model predicted the wrong diagnosis in a medical dataset, I realized that AI without ethics is not progress — it\'s risk.' },
  ],
  medicine: [
    { university: 'Johns Hopkins', opener: 'She was 72 and refused surgery. Sitting with her, I understood that medicine is not only about curing — it\'s about listening.' },
    { university: 'Karolinska', opener: 'The first time I held a stethoscope to a patient\'s chest, I wasn\'t listening to the heart. I was listening to a life story.' },
  ],
  business: [
    { university: 'Wharton', opener: 'At 17, I ran a small tea reselling business from my dorm room. The profit was minimal. The lessons were invaluable.' },
    { university: 'LBS', opener: 'Kazakhstan\'s GDP grew 4% last year, yet rural entrepreneurship remains underfunded. This paradox is why I want to study business.' },
  ],
  law: [
    { university: 'Oxford', opener: 'The law that failed my neighbour was technically correct. That contradiction — between legal and just — is what brought me to law.' },
    { university: 'Harvard Law', opener: 'A single article in the Civil Code can affect thousands of lives. I learned this at 16 when my family navigated a property dispute without legal help.' },
  ],
  social: [
    { university: 'LSE', opener: 'My grandmother can\'t explain why she votes the way she does. But I can — and understanding that gap between perception and behaviour is why I chose sociology.' },
    { university: 'Sciences Po', opener: 'In 2022, I conducted 40 interviews in rural Kazakhstan about digital literacy. What I found contradicted every assumption I had.' },
  ],
  arts: [
    { university: 'Royal College of Art', opener: 'Design, I believe, is not decoration. It\'s an argument. My portfolio is my thesis.' },
    { university: 'Parsons', opener: 'The moment I combined Kazakh ornament with brutalist typography, I found my language.' },
  ],
  science: [
    { university: 'Caltech', opener: 'I spent six months trying to replicate an experiment that failed every time. The day it worked, I understood why science chooses us — not the other way around.' },
    { university: 'Cambridge', opener: 'The periodic table felt abstract until I watched metal corrode in acid under a microscope. Chemistry became real in that moment.' },
  ],
  education: [
    { university: 'UCL Institute of Education', opener: 'The student who couldn\'t read at 12 was reading novels at 14. I didn\'t change his intelligence — I changed his belief in it.' },
    { university: 'Columbia Teachers College', opener: 'Education in Kazakhstan reaches 95% of children. But meaningful education? That number is much smaller — and that gap is my purpose.' },
  ],
}

// ── Structure guide ───────────────────────────────────────────────────────────

export const LETTER_STRUCTURE = {
  idealLength: '500–800 слов',
  paragraphs: 5,
  tone: 'Профессиональный но личный. Уверенный но не самонадеянный.',
  dos: [
    'Конкретные примеры вместо общих слов',
    'Активный залог: "Я сделал" вместо "Было сделано"',
    'Один главный нарратив через всё письмо',
    'Кольцевая композиция: финал перекликается с началом',
    'Проверить: каждый абзац отвечает на вопрос "зачем это комиссии?"',
  ],
  donts: [
    'Не начинать с "Я хочу" или "Меня зовут"',
    'Не писать "лучший университет в мире"',
    'Не переводить CV в текст — это другой документ',
    'Не использовать клише: "страсть", "всегда мечтал", "с детства"',
    'Не превышать 1000 слов если не указано иное',
  ],
}

// ── Checklist before submit ───────────────────────────────────────────────────

export const SUBMISSION_CHECKLIST = [
  { id: 'hook', text: 'Первый абзац захватывает внимание' },
  { id: 'specific', text: 'Есть конкретные примеры и детали' },
  { id: 'program', text: 'Упомянуты конкретные курсы или аспекты программы' },
  { id: 'goals', text: 'Карьерные цели чёткие и реалистичные' },
  { id: 'unique', text: 'Видно что ВЫ уникальны — не просто хороший студент' },
  { id: 'tone', text: 'Тон уверенный, не умоляющий' },
  { id: 'length', text: 'Длина 500–800 слов' },
  { id: 'proofread', text: 'Проверено на опечатки и грамматику' },
  { id: 'name', text: 'Имя университета написано правильно' },
  { id: 'tailored', text: 'Письмо адаптировано под конкретный университет' },
]
