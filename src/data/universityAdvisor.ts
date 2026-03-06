// ── International University Database for AI Advisor ─────────────────────────
// Data sources: QS World University Rankings 2025, DAAD, official university
// websites, Studyportals, Bolashak programme eligibility list.
// Tuition = annual academic fees in USD (approximate, 2024–25).
// Living   = estimated annual living costs in USD.

export interface AbroadUniversity {
  id: string
  name: string
  country: string
  city: string
  qs2025?: number        // QS World University Rankings 2025 (null = unranked/501+)
  tuitionUSD: number     // Annual tuition in USD  (0 = no tuition / state-funded)
  livingUSD: number      // Annual living cost estimate
  minIELTS?: number      // Minimum overall IELTS band (undefined = not required)
  minENT?: number        // Minimum ENT score — only for KZ universities
  language: 'en' | 'ru' | 'de' | 'kk' | 'multi'
  specialties: string[]  // Broad study areas available
  scholarships: string[] // Notable scholarship programs
  description: string
  pros: string[]
  cons: string[]
  tag?: string           // Short highlight shown on card
}

export const ABROAD_UNIVERSITIES: AbroadUniversity[] = [

  // ── Kazakhstan ──────────────────────────────────────────────────────────────
  {
    id: 'nu',
    name: 'Nazarbayev University',
    country: 'Казахстан',
    city: 'Астана',
    qs2025: 324,
    tuitionUSD: 2500,
    livingUSD: 3500,
    minIELTS: 6.0,
    minENT: 100,
    language: 'en',
    specialties: ['IT', 'Engineering', 'Science', 'Economics', 'Medicine', 'Law', 'Education'],
    scholarships: ['Болашак', 'NU Financial Aid', 'President Scholarship KZ'],
    description:
      'Топ-1 вуз Казахстана с международным стандартом, английским языком и партнёрствами с Cambridge, Duke, UCL. Почти весь первокурсник получает стипендию NU.',
    pros: ['Английский язык', 'Мировой уровень', 'Стипендии NU', 'Кампус Астана'],
    cons: ['ENT 100+ обязательно', 'Высокий конкурс'],
    tag: 'Лучший в КЗ',
  },
  {
    id: 'kbtu-adv',
    name: 'Казахстанско-Британский Технический Университет (KBTU)',
    country: 'Казахстан',
    city: 'Алматы',
    tuitionUSD: 3200,
    livingUSD: 4000,
    minIELTS: 5.5,
    minENT: 85,
    language: 'en',
    specialties: ['IT', 'Engineering', 'Science', 'Business'],
    scholarships: ['Болашак', 'President Scholarship KZ'],
    description:
      'Технический университет с программами на английском, сильной IT-школой и тесными связями с бизнесом. Совместная программа с британскими вузами.',
    pros: ['Английский язык', 'IT & Engineering', 'Партнёры из бизнеса'],
    cons: ['Дорогое обучение', 'Узкий профиль'],
    tag: 'IT & Engineering KZ',
  },
  {
    id: 'kimep-adv',
    name: 'KIMEP University',
    country: 'Казахстан',
    city: 'Алматы',
    tuitionUSD: 4500,
    livingUSD: 4000,
    minIELTS: 5.5,
    minENT: 75,
    language: 'en',
    specialties: ['Business', 'Economics', 'Law'],
    scholarships: ['Болашак', 'KIMEP Scholarship'],
    description:
      'Ведущий частный вуз Казахстана по бизнесу и праву. Полностью на английском. AACSB-аккредитация. Трудоустройство ~90%.',
    pros: ['Английский язык', 'AACSB', 'Бизнес/Право', 'Карьерный центр'],
    cons: ['Высокая стоимость', 'Узкий профиль'],
    tag: 'Бизнес & Право',
  },

  // ── Russia ──────────────────────────────────────────────────────────────────
  {
    id: 'msu',
    name: 'Московский государственный университет (МГУ)',
    country: 'Россия',
    city: 'Москва',
    qs2025: 95,
    tuitionUSD: 5000,
    livingUSD: 6000,
    language: 'ru',
    specialties: ['Science', 'Law', 'Economics', 'Arts', 'Medicine', 'Engineering', 'IT'],
    scholarships: ['Россотрудничество', 'Правительство РФ', 'Болашак'],
    description:
      'Лучший университет России, топ-100 мира. Нет языкового барьера. Правительство РФ выделяет квоты для казахстанских абитуриентов.',
    pros: ['Мировой топ-100', 'Нет языкового барьера', 'Квоты РФ', 'Широкий выбор'],
    cons: ['Дорогая Москва', 'Высокий конкурс'],
    tag: 'Мировой топ-100',
  },
  {
    id: 'hse',
    name: 'Высшая школа экономики (НИУ ВШЭ)',
    country: 'Россия',
    city: 'Москва',
    qs2025: 338,
    tuitionUSD: 5500,
    livingUSD: 6000,
    language: 'ru',
    specialties: ['Economics', 'Business', 'IT', 'Law', 'Arts', 'Science'],
    scholarships: ['Россотрудничество', 'Правительство РФ', 'ВШЭ олимпиады'],
    description:
      'Топ-1 Россия по экономике и IT. Сильная аналитическая школа, много программ на английском (магистратура). Активная студенческая жизнь.',
    pros: ['Сильная аналитика и IT', 'Программы на английском', 'Квоты РФ'],
    cons: ['Дорогая Москва', 'Высокая стоимость'],
  },
  {
    id: 'mipt',
    name: 'Московский физико-технический институт (МФТИ)',
    country: 'Россия',
    city: 'Долгопрудный',
    qs2025: 290,
    tuitionUSD: 4500,
    livingUSD: 5000,
    language: 'ru',
    specialties: ['Science', 'Engineering', 'IT'],
    scholarships: ['Россотрудничество', 'Правительство РФ'],
    description:
      'Физтех — лучший инженерный вуз России. Партнёры: Яндекс, Сбер, Huawei. Очень высокий уровень математики и физики.',
    pros: ['Мировой топ-300', 'Партнёры IT-компании', 'Квоты РФ'],
    cons: ['Очень сложная программа', 'Нужна сильная математика'],
    tag: 'Для сильных в физике',
  },
  {
    id: 'itmo',
    name: 'Университет ИТМО',
    country: 'Россия',
    city: 'Санкт-Петербург',
    qs2025: 319,
    tuitionUSD: 4000,
    livingUSD: 4500,
    language: 'ru',
    specialties: ['IT', 'Engineering', 'Science'],
    scholarships: ['Россотрудничество', 'Правительство РФ'],
    description:
      'Топ-1 Россия по IT. Многократный чемпион ACM ICPC. Сильная школа AI. Питер комфортнее Москвы и дешевле.',
    pros: ['Лучший IT в России', 'ACM ICPC чемпион', 'Питер', 'Квоты РФ'],
    cons: ['Сложная программа', 'Нужны сильные навыки'],
    tag: 'Топ IT-вуз России',
  },

  // ── Germany ─────────────────────────────────────────────────────────────────
  {
    id: 'tum',
    name: 'Technical University of Munich (TUM)',
    country: 'Германия',
    city: 'Мюнхен',
    qs2025: 37,
    tuitionUSD: 700,
    livingUSD: 13000,
    minIELTS: 6.5,
    language: 'en',
    specialties: ['Engineering', 'IT', 'Science', 'Business', 'Medicine'],
    scholarships: ['DAAD', 'Erasmus+', 'Deutschland-Stipendium', 'Болашак'],
    description:
      'Топ инженерный вуз Европы. Обучение почти бесплатное. Более 100 магистерских программ на английском. Мюнхен — IT-столица Германии с огромным рынком труда.',
    pros: ['Почти бесплатно', 'Мировой топ-40', 'Английские программы', 'Рынок труда Германии'],
    cons: ['IELTS 6.5+', 'Дорогая жизнь в Мюнхене', 'Высокий конкурс'],
    tag: 'Бесплатно + топ-40',
  },
  {
    id: 'rwth',
    name: 'RWTH Aachen University',
    country: 'Германия',
    city: 'Аахен',
    qs2025: 100,
    tuitionUSD: 700,
    livingUSD: 9000,
    minIELTS: 6.5,
    language: 'en',
    specialties: ['Engineering', 'IT', 'Science', 'Architecture'],
    scholarships: ['DAAD', 'Erasmus+', 'Deutschland-Stipendium'],
    description:
      'Лучший технический вуз Германии по версии работодателей. Инженерные программы мирового уровня. Партнёры: BMW, Siemens, Volkswagen.',
    pros: ['Почти бесплатно', 'Топ-100 мира', 'Партнёры — топ-компании'],
    cons: ['IELTS 6.5+', 'Нужно учить немецкий для жизни'],
    tag: 'Мечта инженера',
  },
  {
    id: 'tu-berlin',
    name: 'Technische Universität Berlin',
    country: 'Германия',
    city: 'Берлин',
    qs2025: 154,
    tuitionUSD: 700,
    livingUSD: 11000,
    minIELTS: 6.5,
    language: 'en',
    specialties: ['Engineering', 'IT', 'Architecture', 'Science', 'Business'],
    scholarships: ['DAAD', 'Erasmus+'],
    description:
      'Один из крупнейших технических вузов Германии. Берлин — международный, молодёжный, относительно доступный город ЕС. Много программ на английском.',
    pros: ['Почти бесплатно', 'Берлин — международный', 'Английские программы'],
    cons: ['IELTS 6.5+', 'Конкурс'],
  },

  // ── UK ──────────────────────────────────────────────────────────────────────
  {
    id: 'edinburgh',
    name: 'University of Edinburgh',
    country: 'Великобритания',
    city: 'Эдинбург',
    qs2025: 27,
    tuitionUSD: 31000,
    livingUSD: 13000,
    minIELTS: 6.5,
    language: 'en',
    specialties: ['Science', 'Engineering', 'IT', 'Medicine', 'Law', 'Arts', 'Business'],
    scholarships: ['Болашак', 'Chevening UK', 'Edinburgh Global Scholarship'],
    description:
      'Топ-30 мира. Сильные программы по AI, Data Science, медицине. Chevening стипендия покрывает магистратуру полностью. Эдинбург дешевле Лондона.',
    pros: ['Мировой топ-30', 'Chevening', 'AI-программа', 'Эдинбург дешевле Лондона'],
    cons: ['Дорогое обучение', 'IELTS 6.5+'],
    tag: 'Мировой топ-30',
  },
  {
    id: 'glasgow',
    name: 'University of Glasgow',
    country: 'Великобритания',
    city: 'Глазго',
    qs2025: 76,
    tuitionUSD: 28000,
    livingUSD: 11000,
    minIELTS: 6.5,
    language: 'en',
    specialties: ['Science', 'Engineering', 'Medicine', 'Law', 'Business', 'Arts'],
    scholarships: ['Болашак', 'Chevening UK', 'Glasgow Scholarship'],
    description:
      'Russell Group, топ-100 мира. Сильная медицина, инженерия и бизнес. Глазго — один из самых доступных городов Великобритании.',
    pros: ['Топ-100 мира', 'Доступнее Лондона', 'Chevening'],
    cons: ['Дорогое обучение', 'IELTS 6.5+'],
  },
  {
    id: 'leeds',
    name: 'University of Leeds',
    country: 'Великобритания',
    city: 'Лидс',
    qs2025: 75,
    tuitionUSD: 26000,
    livingUSD: 10000,
    minIELTS: 6.0,
    language: 'en',
    specialties: ['Business', 'Engineering', 'Science', 'Arts', 'Law', 'Medicine'],
    scholarships: ['Болашак', 'Chevening UK', 'Leeds International Scholarship'],
    description:
      'Russell Group. Один из самых международных вузов UK. IELTS ниже, чем у большинства. Сильные программы бизнес и инженерии.',
    pros: ['IELTS 6.0 (ниже порог)', 'Международная атмосфера', 'Leeds Scholarship'],
    cons: ['Дорогое обучение', 'Нужна стипендия'],
  },

  // ── Turkey ──────────────────────────────────────────────────────────────────
  {
    id: 'metu',
    name: 'Middle East Technical University (METU / ODTü)',
    country: 'Турция',
    city: 'Анкара',
    qs2025: 477,
    tuitionUSD: 800,
    livingUSD: 4500,
    minIELTS: 5.5,
    language: 'en',
    specialties: ['Engineering', 'IT', 'Science', 'Architecture', 'Business'],
    scholarships: ['Türkiye Bursları', 'METU Scholarship'],
    description:
      'Лучший технический вуз Турции, полностью на английском. Стипендия Türkiye Bursları покрывает всё. Почти бесплатно. Сильное инженерное образование.',
    pros: ['Почти бесплатно', 'Türkiye Bursları', 'Английский язык', 'Доступная жизнь'],
    cons: ['Конкурс за стипендию', 'Далеко от KZ'],
    tag: 'Лучший в Турции',
  },
  {
    id: 'itu',
    name: 'Istanbul Technical University (İTÜ)',
    country: 'Турция',
    city: 'Стамбул',
    qs2025: 501,
    tuitionUSD: 1000,
    livingUSD: 5000,
    minIELTS: 5.5,
    language: 'multi',
    specialties: ['Engineering', 'IT', 'Architecture', 'Science'],
    scholarships: ['Türkiye Bursları'],
    description:
      'Один из старейших технических вузов мира, в Стамбуле — центре бизнеса и культуры. Есть программы на английском. Türkiye Bursları доступна.',
    pros: ['Стамбул — центр бизнеса', 'Доступная цена', 'Türkiye Bursları'],
    cons: ['Нужны знания турецкого', 'Конкурс за стипендию'],
  },
  {
    id: 'bilkent',
    name: 'Bilkent University',
    country: 'Турция',
    city: 'Анкара',
    qs2025: 601,
    tuitionUSD: 12000,
    livingUSD: 4500,
    minIELTS: 6.0,
    language: 'en',
    specialties: ['Engineering', 'IT', 'Business', 'Arts', 'Science', 'Law'],
    scholarships: ['Türkiye Bursları', 'Bilkent Excellence Scholarship'],
    description:
      'Первый частный вуз Турции, полностью на английском. Международный преподавательский состав. Bilkent Excellence — частичная/полная стипендия.',
    pros: ['Английский язык', 'Международный кампус', 'Bilkent + Türkiye стипендии'],
    cons: ['Дороже государственных', 'Нужна стипендия'],
  },

  // ── Hungary ─────────────────────────────────────────────────────────────────
  {
    id: 'bme',
    name: 'Budapest University of Technology and Economics (BME)',
    country: 'Венгрия',
    city: 'Будапешт',
    qs2025: 601,
    tuitionUSD: 5500,
    livingUSD: 6000,
    minIELTS: 5.5,
    language: 'en',
    specialties: ['Engineering', 'IT', 'Architecture', 'Science', 'Business'],
    scholarships: ['Stipendium Hungaricum'],
    description:
      'Ведущий технический вуз Центральной Европы. Stipendium Hungaricum покрывает обучение, общежитие и выплачивает стипендию для казахстанцев. Будапешт — красивый доступный город ЕС.',
    pros: ['Stipendium Hungaricum — всё бесплатно', 'ЕС диплом', 'Будапешт', 'IELTS 5.5'],
    cons: ['Конкурс за стипендию', 'Заявки сдавать заранее'],
    tag: 'Стипендия ЕС',
  },
  {
    id: 'debrecen',
    name: 'University of Debrecen',
    country: 'Венгрия',
    city: 'Дебрецен',
    qs2025: 801,
    tuitionUSD: 5000,
    livingUSD: 5000,
    minIELTS: 5.0,
    language: 'en',
    specialties: ['Medicine', 'Science', 'Engineering', 'Business', 'IT'],
    scholarships: ['Stipendium Hungaricum'],
    description:
      'Популярен среди казахстанцев, особенно медицинский факультет (обучение на английском). Низкий языковой барьер. Stipendium Hungaricum покрывает всё.',
    pros: ['Stipendium Hungaricum', 'IELTS 5.0', 'Медицина на английском', 'ЕС диплом'],
    cons: ['Небольшой город', 'Рейтинг ниже топ-500'],
  },

  // ── China ───────────────────────────────────────────────────────────────────
  {
    id: 'tsinghua',
    name: 'Tsinghua University',
    country: 'Китай',
    city: 'Пекин',
    qs2025: 20,
    tuitionUSD: 4000,
    livingUSD: 5000,
    minIELTS: 6.5,
    language: 'en',
    specialties: ['Engineering', 'IT', 'Science', 'Business', 'Architecture'],
    scholarships: ['Chinese Government Scholarship (CSC)', 'Tsinghua Scholarship', 'Болашак'],
    description:
      'Лучший вуз Азии, топ-20 мира. CSC-стипендия покрывает всё. Сильнейшие программы по инженерии и AI. Растущий международный хаб.',
    pros: ['Топ-20 мира', 'CSC стипендия — всё бесплатно', 'Инженерия и AI'],
    cons: ['Очень высокий конкурс', 'IELTS 6.5', 'Адаптация к Китаю'],
    tag: 'Топ Азии',
  },
  {
    id: 'zhejiang',
    name: 'Zhejiang University',
    country: 'Китай',
    city: 'Ханчжоу',
    qs2025: 45,
    tuitionUSD: 3500,
    livingUSD: 4500,
    minIELTS: 6.0,
    language: 'en',
    specialties: ['Engineering', 'Medicine', 'Science', 'IT', 'Business'],
    scholarships: ['Chinese Government Scholarship (CSC)', 'Zhejiang University Scholarship'],
    description:
      'Топ-50 мира, сильная медицина, IT и инженерия. Ханчжоу — технологический хаб (Alibaba HQ). CSC доступна для казахстанцев.',
    pros: ['Топ-50 мира', 'CSC стипендия', 'Ханчжоу — центр технологий', 'IELTS 6.0'],
    cons: ['Конкурс', 'Адаптация к Китаю'],
  },
  {
    id: 'wuhan',
    name: 'Wuhan University',
    country: 'Китай',
    city: 'Ухань',
    qs2025: 401,
    tuitionUSD: 3000,
    livingUSD: 4000,
    minIELTS: 5.5,
    language: 'en',
    specialties: ['Science', 'Engineering', 'IT', 'Business', 'Medicine', 'Arts'],
    scholarships: ['Chinese Government Scholarship (CSC)', 'Hubei Province Scholarship'],
    description:
      'Популярен у казахстанских студентов. Широкий выбор англоязычных программ, доступная стоимость жизни, активное казахстанское сообщество.',
    pros: ['Казахстанское комьюнити', 'CSC стипендия', 'IELTS 5.5', 'Доступная жизнь'],
    cons: ['Менее известен в Европе', 'Адаптация к Китаю'],
  },

  // ── South Korea ─────────────────────────────────────────────────────────────
  {
    id: 'kaist',
    name: 'KAIST',
    country: 'Южная Корея',
    city: 'Тэджон',
    qs2025: 46,
    tuitionUSD: 3500,
    livingUSD: 7000,
    minIELTS: 6.5,
    language: 'en',
    specialties: ['Engineering', 'IT', 'Science'],
    scholarships: ['Korean Government Scholarship (GKS)', 'KAIST Scholarship'],
    description:
      'Топ инженерный вуз Азии, полностью на английском. Почти все иностранные студенты получают стипендию GKS или KAIST. Сильные программы AI и роботики.',
    pros: ['Топ-50 мира', 'Почти бесплатно + стипендия', 'Английский', 'AI и роботика'],
    cons: ['Очень высокий конкурс', 'IELTS 6.5+', 'Сложная программа'],
    tag: 'Топ инженерия Азии',
  },

  // ── UAE ─────────────────────────────────────────────────────────────────────
  {
    id: 'khalifa',
    name: 'Khalifa University',
    country: 'ОАЭ',
    city: 'Абу-Даби',
    qs2025: 262,
    tuitionUSD: 0,
    livingUSD: 12000,
    minIELTS: 6.0,
    language: 'en',
    specialties: ['Engineering', 'IT', 'Science'],
    scholarships: ['Khalifa University Full Scholarship'],
    description:
      'Государственный вуз ОАЭ с полной стипендией для иностранных студентов — обучение, общежитие, питание. Только английский. Сильная инженерия и энергетика.',
    pros: ['Полная стипендия', 'Только английский', 'Безопасность', 'ОАЭ рынок труда'],
    cons: ['Ограниченные специальности', 'Дорогая жизнь без стипендии'],
    tag: 'Полная стипендия',
  },
]

// ─── Advisor Logic ────────────────────────────────────────────────────────────

export interface AdvisorInputs {
  ielts: number        // 0 = not taken
  entScore: number     // 0 = not applicable
  budgetUSD: number    // annual (tuition + living)
  countries: string[]  // empty = any
  specialty: string    // empty = any
}

export function calculateMatchScore(uni: AbroadUniversity, inputs: AdvisorInputs): number {
  let score = 100

  // IELTS requirement
  if (uni.minIELTS !== undefined) {
    if (inputs.ielts === 0) {
      score -= 15 // not taken — slight penalty
    } else {
      const gap = uni.minIELTS - inputs.ielts
      if (gap > 0) score -= Math.min(45, Math.round(gap * 20))
    }
  }

  // Budget (tuition + living per year)
  const totalCost = uni.tuitionUSD + uni.livingUSD
  if (totalCost > inputs.budgetUSD) {
    const overRatio = (totalCost - inputs.budgetUSD) / Math.max(inputs.budgetUSD, 1)
    score -= Math.min(40, Math.round(overRatio * 25))
  }

  // Country preference
  if (inputs.countries.length > 0 && !inputs.countries.includes(uni.country)) {
    score -= 25
  }

  // Specialty match
  if (inputs.specialty) {
    const match = uni.specialties.some(
      s =>
        s.toLowerCase().includes(inputs.specialty.toLowerCase()) ||
        inputs.specialty.toLowerCase().includes(s.toLowerCase()),
    )
    if (!match) score -= 20
  }

  // ENT score (KZ universities)
  if (uni.country === 'Казахстан' && uni.minENT !== undefined && inputs.entScore > 0) {
    const gap = uni.minENT - inputs.entScore
    if (gap > 0) score -= Math.min(45, gap * 2)
  }

  return Math.max(5, Math.min(98, Math.round(score)))
}

export function matchLabel(score: number): { label: string; color: string; bar: string } {
  if (score >= 80) return { label: 'Высокие шансы',      color: 'text-emerald-700 bg-emerald-50 border-emerald-200', bar: 'bg-emerald-500' }
  if (score >= 60) return { label: 'Хорошие шансы',       color: 'text-blue-700 bg-blue-50 border-blue-200',         bar: 'bg-blue-500' }
  if (score >= 40) return { label: 'Умеренные шансы',     color: 'text-amber-700 bg-amber-50 border-amber-200',       bar: 'bg-amber-500' }
  return                  { label: 'Сложно, но возможно', color: 'text-slate-600 bg-slate-50 border-slate-200',       bar: 'bg-slate-400' }
}

export const ADVISOR_COUNTRIES = [
  'Казахстан', 'Россия', 'Германия', 'Великобритания',
  'Турция', 'Венгрия', 'Китай', 'Южная Корея', 'ОАЭ',
]

export const ADVISOR_SPECIALTIES: { id: string; label: string }[] = [
  { id: 'IT',           label: 'IT / Программирование' },
  { id: 'Engineering',  label: 'Инженерия' },
  { id: 'Medicine',     label: 'Медицина' },
  { id: 'Business',     label: 'Бизнес / Менеджмент' },
  { id: 'Economics',    label: 'Экономика / Финансы' },
  { id: 'Law',          label: 'Право' },
  { id: 'Science',      label: 'Естественные науки' },
  { id: 'Arts',         label: 'Гуманитарные науки' },
  { id: 'Architecture', label: 'Архитектура / Дизайн' },
  { id: 'Education',    label: 'Педагогика' },
]

export const BUDGET_PRESETS: { label: string; value: number }[] = [
  { label: 'до $8 000/год',  value: 8000 },
  { label: 'до $12 000/год', value: 12000 },
  { label: 'до $18 000/год', value: 18000 },
  { label: 'до $25 000/год', value: 25000 },
  { label: 'до $40 000/год', value: 40000 },
  { label: 'без ограничений', value: 999999 },
]
