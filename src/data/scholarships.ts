// ── Scholarship Database ───────────────────────────────────────────────────────
// Current as of 2025. Deadlines are approximate annual windows — verify exact
// dates on official programme websites each cycle.

export interface Scholarship {
  id: string
  name: string
  nameShort: string
  provider: string           // organisation offering it
  country: string            // study destination
  flag: string               // emoji flag
  level: ('bachelor' | 'master' | 'phd' | 'any')[]
  fields: string[]           // 'all' means no restriction
  coverage: 'full' | 'partial' | 'tuition'
  coverageLabel: string      // human-readable description
  deadline: string           // approximate annual window
  requirements: string[]
  description: string
  officialSite: string       // official government / org website
  tags: string[]
}

export const SCHOLARSHIPS: Scholarship[] = [
  {
    id: 'bolashak',
    name: 'Международная стипендия «Болашак»',
    nameShort: 'Болашак',
    provider: 'Правительство Республики Казахстан',
    country: 'Любая страна',
    flag: '🇰🇿',
    level: ['master', 'phd'],
    fields: ['all'],
    coverage: 'full',
    coverageLabel: 'Полное покрытие: обучение, проживание, перелёты, страховка',
    deadline: 'Ноябрь – Январь (подача документов)',
    requirements: [
      'Гражданство РК',
      'Возраст: до 35 лет (бакалавр), до 40 лет (магистр/PhD)',
      'IELTS 6.0 / TOEFL 550+ для английских программ',
      'Опыт работы от 2 лет в профессиональной сфере',
      'Договор с работодателем (обязательная отработка 5 лет по возвращении)',
    ],
    description:
      'Главная государственная стипендия Казахстана. Покрывает любые аккредитованные вузы мира — от Оксфорда до TU Munich. Ежегодно выдаётся ~500 квот. Обязательная отработка 5 лет в Казахстане после возвращения.',
    officialSite: 'https://bolashak.gov.kz',
    tags: ['Полная', 'Любая страна', 'Правительство КЗ'],
  },
  {
    id: 'president-kz',
    name: 'Государственный образовательный грант РК',
    nameShort: 'President Scholarship KZ',
    provider: 'Министерство образования РК',
    country: 'Казахстан',
    flag: '🇰🇿',
    level: ['bachelor'],
    fields: ['all'],
    coverage: 'tuition',
    coverageLabel: 'Покрытие обучения в казахстанском вузе',
    deadline: 'Июль (после ЕНТ)',
    requirements: [
      'Гражданство РК',
      'Сдача ЕНТ',
      'Балл ЕНТ выше порогового по выбранной специальности',
      'Аттестат о среднем образовании',
    ],
    description:
      'Ежегодные государственные гранты на обучение в вузах Казахстана, распределяемые по результатам ЕНТ. Покрывают полную стоимость обучения. Конкурс зависит от специальности и вуза.',
    officialSite: 'https://www.edu.gov.kz',
    tags: ['Бакалавр', 'КЗ вузы', 'ЕНТ'],
  },
  {
    id: 'daad',
    name: 'DAAD — Deutsches Akademisches Austauschdienst',
    nameShort: 'DAAD',
    provider: 'Германская служба академических обменов',
    country: 'Германия',
    flag: '🇩🇪',
    level: ['master', 'phd', 'any'],
    fields: ['all'],
    coverage: 'full',
    coverageLabel: 'Ежемесячная стипендия €934 (магистр) / €1 200 (PhD) + доплаты',
    deadline: 'Октябрь – Ноябрь (на следующий год)',
    requirements: [
      'Диплом бакалавра / магистра с хорошей успеваемостью',
      'Немецкий B2 или английский IELTS 6.0 / TOEFL 90 (зависит от программы)',
      'Мотивационное письмо',
      '2 рекомендательных письма',
    ],
    description:
      'Крупнейшая в мире организация академических обменов. Предлагает десятки типов грантов: магистратуру, PhD, исследования, летние школы. Германские государственные вузы почти бесплатны — стипендия покрывает проживание.',
    officialSite: 'https://www.daad.de/en',
    tags: ['Полная', 'Германия', 'Любая специальность'],
  },
  {
    id: 'erasmus-mundus',
    name: 'Erasmus Mundus Joint Master Degrees',
    nameShort: 'Erasmus Mundus',
    provider: 'Европейская комиссия',
    country: 'Страны ЕС',
    flag: '🇪🇺',
    level: ['master'],
    fields: ['all'],
    coverage: 'full',
    coverageLabel: 'Обучение + €1 400/мес стипендия + перелёты + страховка',
    deadline: 'Январь – Март (зависит от программы)',
    requirements: [
      'Диплом бакалавра (любой страны)',
      'IELTS 6.5 / TOEFL 90+ (большинство программ)',
      'Мотивационное письмо',
      '2 рекомендательных письма',
    ],
    description:
      'Элитные совместные магистерские программы нескольких европейских вузов. Студент учится в 2–3 странах ЕС. ~700–800 грантов в год для граждан стран за пределами ЕС. Очень престижно.',
    officialSite: 'https://erasmus-plus.ec.europa.eu',
    tags: ['Полная', 'ЕС', 'Магистр', 'Мобильность'],
  },
  {
    id: 'chevening',
    name: 'Chevening Scholarships',
    nameShort: 'Chevening',
    provider: 'Правительство Великобритании (FCDO)',
    country: 'Великобритания',
    flag: '🇬🇧',
    level: ['master'],
    fields: ['all'],
    coverage: 'full',
    coverageLabel: 'Обучение + проживание + перелёты + стипендия на год',
    deadline: 'Ноябрь (подача), результаты — июнь',
    requirements: [
      'Гражданство Казахстана',
      'Диплом бакалавра',
      'IELTS 6.5+ (большинство вузов UK)',
      'Опыт работы 2+ года',
      'Лидерский потенциал (ключевой критерий)',
      '3 рекомендательных письма',
    ],
    description:
      'Самая престижная стипендия правительства Великобритании. Полное покрытие любой магистратуры в любом университете UK. Казахстан имеет квоту. Акцент на лидерском потенциале кандидата.',
    officialSite: 'https://www.chevening.org',
    tags: ['Полная', 'Великобритания', 'Лидерство', 'Магистр'],
  },
  {
    id: 'fulbright',
    name: 'Fulbright Foreign Student Program',
    nameShort: 'Fulbright',
    provider: 'Государственный департамент США',
    country: 'США',
    flag: '🇺🇸',
    level: ['master', 'phd'],
    fields: ['all'],
    coverage: 'full',
    coverageLabel: 'Обучение + проживание + перелёты + страховка',
    deadline: 'Февраль – Май (подача на следующий год)',
    requirements: [
      'Гражданство Казахстана',
      'Диплом бакалавра (хорошая успеваемость)',
      'IELTS 7.0 / TOEFL 100+',
      'GRE / GMAT (зависит от программы)',
      'Мотивационное письмо',
      '3 рекомендательных письма',
    ],
    description:
      'Самая престижная стипендия для обучения в США. Полное покрытие магистратуры или PhD в любом аккредитованном вузе США. Ежегодно отбирается ~10–15 казахстанцев.',
    officialSite: 'https://kz.usembassy.gov/education-culture/fulbright',
    tags: ['Полная', 'США', 'Магистр/PhD', 'Очень престижно'],
  },
  {
    id: 'stipendium-hungaricum',
    name: 'Stipendium Hungaricum',
    nameShort: 'Stipendium Hungaricum',
    provider: 'Правительство Венгрии / Tempus Public Foundation',
    country: 'Венгрия',
    flag: '🇭🇺',
    level: ['bachelor', 'master', 'phd'],
    fields: ['all'],
    coverage: 'full',
    coverageLabel: 'Обучение + общежитие + ежемесячная стипендия',
    deadline: 'Январь – Февраль',
    requirements: [
      'Гражданство Казахстана (есть двустороннее соглашение)',
      'Аттестат (бакалавр) / Диплом бакалавра (магистр)',
      'IELTS 5.0–5.5 (зависит от программы)',
      'Мотивационное письмо',
      'Академические достижения',
    ],
    description:
      'Правительственная программа Венгрии. Казахстан включён в список стран-партнёров. Полное покрытие обучения в венгерских вузах (BME, University of Debrecen и др.). Диплом ЕС по окончании.',
    officialSite: 'https://stipendiumhungaricum.hu',
    tags: ['Полная', 'Венгрия', 'ЕС диплом', 'Бакалавр/Магистр'],
  },
  {
    id: 'csc',
    name: 'Chinese Government Scholarship (CSC)',
    nameShort: 'CSC / 中国政府奖学金',
    provider: 'Министерство образования КНР',
    country: 'Китай',
    flag: '🇨🇳',
    level: ['bachelor', 'master', 'phd'],
    fields: ['all'],
    coverage: 'full',
    coverageLabel: 'Обучение + общежитие + страховка + стипендия ¥1 400–3 000/мес',
    deadline: 'Февраль – Апрель',
    requirements: [
      'Гражданство любой страны (есть квоты для КЗ)',
      'Возраст: до 25 лет (бакалавр), до 35 лет (магистр), до 40 лет (PhD)',
      'Аттестат / диплом с хорошей успеваемостью',
      'IELTS 6.0 / TOEFL 80+ (английские программы) или HSK (китайские)',
      'Медицинская справка',
    ],
    description:
      'Крупнейшая по охвату стипендия в мире — более 50 000 мест в год. Казахстан имеет крупную квоту. Подать можно через CSC-систему или напрямую в вуз (Tsinghua, Zhejiang, Wuhan и др.).',
    officialSite: 'https://www.campuschina.org',
    tags: ['Полная', 'Китай', 'Все уровни', 'Большие квоты'],
  },
  {
    id: 'gks',
    name: 'Korean Government Scholarship Program (KGSP / GKS)',
    nameShort: 'GKS Korea',
    provider: 'Национальный институт международного образования Кореи (NIIED)',
    country: 'Южная Корея',
    flag: '🇰🇷',
    level: ['bachelor', 'master', 'phd'],
    fields: ['all'],
    coverage: 'full',
    coverageLabel: 'Обучение + общежитие + ₩900 000–1 000 000/мес + перелёт',
    deadline: 'Февраль – Март',
    requirements: [
      'Гражданство Казахстана (есть двустороннее соглашение)',
      'GPA 2.64 / 4.0 (80%) или выше',
      'IELTS 5.5 / TOPIK 3+ или без языка (1 год корейского подготовит)',
      'Возраст: до 25 лет (бакалавр), до 40 лет (магистр/PhD)',
      '2 рекомендательных письма',
    ],
    description:
      'Полная правительственная стипендия Южной Кореи. Включает 1 год изучения корейского языка (бесплатно), затем основная программа. Доступна для KAIST, POSTECH, SNU и других топ-вузов Кореи.',
    officialSite: 'https://www.studyinkorea.go.kr',
    tags: ['Полная', 'Южная Корея', 'Все уровни', 'Язык включён'],
  },
  {
    id: 'turkiye-burslari',
    name: 'Türkiye Bursları (Turkey Scholarships)',
    nameShort: 'Türkiye Bursları',
    provider: 'Президиум по делам турков за рубежом (YTB)',
    country: 'Турция',
    flag: '🇹🇷',
    level: ['bachelor', 'master', 'phd'],
    fields: ['all'],
    coverage: 'full',
    coverageLabel: 'Обучение + общежитие + ₺800–1 600/мес + перелёт + языковой курс',
    deadline: 'Февраль – Март',
    requirements: [
      'Гражданство Казахстана (есть квота)',
      'Успеваемость: 70% (бакалавр), 75% (магистр), 80% (PhD)',
      'Возраст: до 21 (бакалавр), до 30 (магистр), до 35 (PhD)',
      'IELTS 5.0 / TOEFL 60 (англ. программы) или без языка (турецкий включён)',
      'Мотивационное письмо',
    ],
    description:
      'Полная стипендия правительства Турции. Ежегодно ~5 000 мест из 180+ стран. Казахстан имеет квоту. Включает 1-летний курс турецкого языка. Доступны METU, İTÜ, Bilkent и сотни других вузов.',
    officialSite: 'https://www.turkiyeburslari.gov.tr',
    tags: ['Полная', 'Турция', 'Все уровни', 'Язык включён'],
  },
  {
    id: 'mext',
    name: 'MEXT — Japanese Government Scholarship',
    nameShort: 'MEXT Japan',
    provider: 'Министерство образования Японии',
    country: 'Япония',
    flag: '🇯🇵',
    level: ['bachelor', 'master', 'phd'],
    fields: ['all'],
    coverage: 'full',
    coverageLabel: 'Обучение + ¥117 000–145 000/мес + перелёт + жильё',
    deadline: 'Апрель – Июнь (через посольство)',
    requirements: [
      'Гражданство Казахстана',
      'Аттестат / диплом',
      'Академическая успеваемость выше среднего',
      'Японский N4+ (желательно) или английский',
      'Пройти отбор в посольстве Японии в Астане',
    ],
    description:
      'Престижная правительственная стипендия Японии. Охватывает крупнейшие вузы: Tokyo University, Osaka, Kyoto. Обычно 1–2 года японского, затем основная программа. Казахстанцы регулярно выигрывают.',
    officialSite: 'https://www.studyinjapan.go.jp/en',
    tags: ['Полная', 'Япония', 'Все уровни', 'Язык включён'],
  },
  {
    id: 'deutschland-stipendium',
    name: 'Deutschland-Stipendium',
    nameShort: 'Deutschland-Stipendium',
    provider: 'Федеральное правительство Германии + частные доноры',
    country: 'Германия',
    flag: '🇩🇪',
    level: ['bachelor', 'master'],
    fields: ['all'],
    coverage: 'partial',
    coverageLabel: '€300/месяц (половина — от компаний, половина — от государства)',
    deadline: 'Зависит от вуза (обычно апрель – июнь)',
    requirements: [
      'Быть зачисленным или поступающим в немецкий вуз',
      'Академические достижения',
      'Социальная активность / волонтёрство',
    ],
    description:
      'Ежемесячная доплата €300 поверх стипендии студента. Выдаётся непосредственно в вузе — подавать после поступления в TUM, RWTH, TU Berlin и т.д. Спонсоры часто предлагают также стажировки.',
    officialSite: 'https://www.deutschland-stipendium.de/en',
    tags: ['Частичная', 'Германия', 'Дополнительная выплата'],
  },
  {
    id: 'nu-financial-aid',
    name: 'NU Financial Aid & Merit Scholarships',
    nameShort: 'NU Scholarship',
    provider: 'Nazarbayev University',
    country: 'Казахстан',
    flag: '🇰🇿',
    level: ['bachelor', 'master'],
    fields: ['all'],
    coverage: 'full',
    coverageLabel: 'Полное / частичное покрытие обучения, общежитие',
    deadline: 'Март – Май (подача на следующий год)',
    requirements: [
      'Поступление в Nazarbayev University',
      'ENT 100+ (бакалавр) или диплом с отличием (магистр)',
      'IELTS 6.0+',
      'Необходимость в финансовой помощи (для нуждающихся)',
    ],
    description:
      'Назарбаев Университет выдаёт Merit и Need-based стипендии. Merit — за высокий балл ЕНТ / академические достижения. Need-based — для нуждающихся. Большинство первокурсников получает ту или иную форму поддержки.',
    officialSite: 'https://nu.edu.kz/admissions/scholarships',
    tags: ['Полная / частичная', 'Казахстан', 'NU'],
  },
]

// ─── Filter helpers ────────────────────────────────────────────────────────────

export const SCHOLARSHIP_COUNTRIES = [
  'Любая страна', 'Казахстан', 'Германия', 'Великобритания', 'США',
  'Венгрия', 'Китай', 'Южная Корея', 'Турция', 'Япония',
]

export const SCHOLARSHIP_LEVELS = [
  { id: 'bachelor', label: 'Бакалавриат' },
  { id: 'master',   label: 'Магистратура' },
  { id: 'phd',      label: 'PhD / Докторантура' },
]

export const COVERAGE_LABELS: Record<Scholarship['coverage'], string> = {
  full:    'Полная',
  partial: 'Частичная',
  tuition: 'Только обучение',
}

export const COVERAGE_COLORS: Record<Scholarship['coverage'], string> = {
  full:    'bg-emerald-100 text-emerald-700',
  partial: 'bg-blue-100 text-blue-700',
  tuition: 'bg-amber-100 text-amber-700',
}
