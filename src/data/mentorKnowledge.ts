// ── Scripted Mentor Knowledge Base ───────────────────────────────────────────
// Pattern-matched responses that make the robot feel intelligent.
// No AI API required — all answers are pre-written by domain experts.

export interface MentorAnswer {
  text: string
  followUp?: string
  mood?: 'happy' | 'excited' | 'thinking' | 'encouraging'
}

// ── Utility ───────────────────────────────────────────────────────────────────

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ── Keyword Patterns ──────────────────────────────────────────────────────────

interface KnowledgeEntry {
  keywords: string[]
  answers: MentorAnswer[]
}

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // ── IELTS General ──────────────────────────────────────────────────────────
  {
    keywords: ['ielts', 'айелтс', 'аилтс'],
    answers: [
      {
        text: 'IELTS — это международный экзамен на знание английского, признанный в 140+ странах. Состоит из 4 частей: Listening (30 мин), Reading (60 мин), Writing (60 мин) и Speaking (11–14 мин). Общий балл — от 0 до 9. Большинство университетов UK/Canada требуют 6.5–7.0.',
        followUp: 'Что тебя интересует больше — Reading, Writing, Listening или Speaking?',
        mood: 'happy',
      },
      {
        text: 'IELTS Academic нужен для поступления в университеты. IELTS General Training — для иммиграции и работы. Скорее всего тебе нужен Academic. Средний балл для топ-университетов UK — 7.0, для Canada — 6.5.',
        followUp: 'Какой у тебя целевой балл? Я дам конкретный план.',
        mood: 'thinking',
      },
    ],
  },
  {
    keywords: ['band', 'бэнд', 'балл ielts', 'оценка ielts', 'score'],
    answers: [
      {
        text: 'Система баллов IELTS: Band 5 — скромный уровень, Band 6 — достаточный, Band 6.5 — хороший, Band 7 — хороший операциональный уровень, Band 8 — очень хороший. Финальный балл — среднее арифметическое 4 компонентов, округлённое до 0.5.',
        followUp: 'Какой целевой балл ты хочешь достичь?',
        mood: 'thinking',
      },
      {
        text: 'Чтобы поднять общий балл с 6.0 до 7.0 — нужно улучшить каждую часть примерно на 1 балл. Обычно это занимает 3–6 месяцев интенсивной подготовки. Writing и Speaking — самые управляемые разделы для быстрого роста.',
        followUp: 'Хочешь разберём, с чего начать?',
        mood: 'encouraging',
      },
    ],
  },
  // ── Writing Task 1 ─────────────────────────────────────────────────────────
  {
    keywords: ['task 1', 'таск 1', 'graph', 'chart', 'chart description', 'line graph', 'bar chart', 'pie chart', 'table', 'map', 'process'],
    answers: [
      {
        text: 'Task 1 структура (150+ слов, 20 минут):\n\n1) Введение — перефразируй заголовок графика (1–2 предложения)\n2) Обзор (Overview) — 2–3 главных тренда без цифр\n3) Деталь 1 — основной тренд с конкретными данными\n4) Деталь 2 — сравнения и контрасты\n\nОбзор — самое важное! Без него потеряешь целый балл.',
        followUp: 'Какой тип Task 1 даётся тебе сложнее — линейный, столбчатый, карты, процессы?',
        mood: 'thinking',
      },
      {
        text: 'Ключевые глаголы для Task 1:\n• Рост: rose, increased, surged, climbed\n• Падение: fell, dropped, declined, decreased\n• Стабильность: remained stable, plateaued, levelled off\n• Пик: peaked at, reached a high of, hit a maximum\n• Низшая точка: bottomed out, hit a low of\n\nИзбегай: "went up" (слишком просто), "it was more" (расплывчато).',
        followUp: 'Хочешь увидеть шаблон введения для линейного графика?',
        mood: 'happy',
      },
    ],
  },
  {
    keywords: ['overview', 'обзор', 'overall'],
    answers: [
      {
        text: 'Overview (обзор) — это сердце Task 1. Правила:\n• Пиши ПОСЛЕ введения — один отдельный абзац\n• НЕ пиши цифры в обзоре — только тренды\n• Укажи 2–3 самых важных наблюдения\n• Начинай: "Overall, it is clear that..." / "In general, the most striking feature is..."\n\nЭкзаменаторы ищут Overview в первую очередь. Без него — максимум Band 5.',
        mood: 'thinking',
      },
    ],
  },
  // ── Writing Task 2 ─────────────────────────────────────────────────────────
  {
    keywords: ['task 2', 'таск 2', 'essay', 'эссе', 'writing task'],
    answers: [
      {
        text: 'Task 2 — 250+ слов, 40 минут, стоит вдвое больше Task 1!\n\nСтруктура:\n1) Введение (2–3 предл.) — перефраз + твоя позиция\n2) Абзац 1 — первый аргумент + пример\n3) Абзац 2 — второй аргумент + пример\n4) Заключение (2–3 предл.) — повтор позиции\n\nВремя: 5 мин на план → 30 мин на написание → 5 мин на проверку.',
        followUp: 'Какой тип эссе тебе нужен: Opinion, Discussion, Problem-Solution или Advantages/Disadvantages?',
        mood: 'thinking',
      },
      {
        text: 'Самые частые ошибки в Task 2:\n1) Нет чёткой позиции в введении\n2) Абзацы без примеров (только голые утверждения)\n3) Введение слишком длинное (теряешь время)\n4) Заключение = копия введения (должно быть обобщение, не повтор)\n5) "In conclusion, I think..." — слабое начало заключения\n\nЛучшее заключение начинается: "In conclusion, while X is true, it is clear that Y..."',
        mood: 'encouraging',
      },
    ],
  },
  {
    keywords: ['opinion essay', 'agree disagree', 'agree or disagree', 'to what extent'],
    answers: [
      {
        text: 'Opinion Essay (Agree/Disagree):\n\nЗолотое правило — займи чёткую позицию. Не "сидеть на заборе" — это снижает балл за Task Achievement.\n\nШаблон введения:\n"In recent years, [тема] has become increasingly debated. While some argue that [противоположное мнение], I firmly believe that [ТВОЯ ПОЗИЦИЯ], and this essay will explain why."\n\nТело: 2 абзаца с твоими аргументами + необязательный абзац с контраргументом (если хочешь Band 7+).',
        mood: 'happy',
      },
    ],
  },
  {
    keywords: ['discussion essay', 'discuss both', 'both views'],
    answers: [
      {
        text: 'Discussion Essay (Both Views):\n\nВажно: ТВОЁ мнение обязательно — иначе не выполнено задание!\n\nСтруктура:\n1) Введение: перефраз + "This essay will examine both perspectives before reaching a conclusion."\n2) Абзац: Сторона А + пример\n3) Абзац: Сторона Б + пример  \n4) Абзац: ТВОЁ мнение + почему\n5) Заключение\n\nОшибка: давать только два абзаца без своего мнения — это провал по Task Achievement.',
        mood: 'thinking',
      },
    ],
  },
  {
    keywords: ['problem solution', 'problems and solutions', 'causes', 'причины', 'решения'],
    answers: [
      {
        text: 'Problem/Solution Essay:\n\nПравило: решения должны логически вытекать из причин!\n\nСтруктура:\n1) Введение: перефраз + "This essay will examine the causes and propose solutions."\n2) Причины: 2 причины с объяснением\n3) Решения: 2 решения (каждое = ответ на соответствующую причину)\n4) Заключение: если X, то Y\n\nИспользуй модальные глаголы для решений: "could be addressed by", "should implement", "would help to".',
        mood: 'thinking',
      },
    ],
  },
  // ── Reading ────────────────────────────────────────────────────────────────
  {
    keywords: ['reading', 'чтение', 'read', 'passage', 'text', 'skimming', 'scanning'],
    answers: [
      {
        text: 'Reading стратегия (60 минут = 20 мин на каждый текст):\n\n1) Просмотри вопросы (2 мин) — узнай, что искать\n2) Бегло прочитай текст (3 мин) — только заголовки, первые предложения абзацев\n3) Отвечай на вопросы — ищи конкретные слова (scanning)\n4) Не читай весь текст подряд — теряешь время!\n\nГлавная ошибка: читать текст полностью перед вопросами.',
        followUp: 'Какой тип вопросов даётся сложнее — True/False/NG, Matching Headings или что-то ещё?',
        mood: 'thinking',
      },
    ],
  },
  {
    keywords: ['true false', 'not given', 'true false not given', 'tfng', 'ynng', 'yes no'],
    answers: [
      {
        text: 'True/False/Not Given — самый сложный тип!\n\nПравило:\n• TRUE = утверждение совпадает с текстом\n• FALSE = утверждение ПРОТИВОРЕЧИТ тексту\n• NOT GIVEN = текст ВООБЩЕ не говорит об этом\n\nЛовушка: "Not Given" ≠ False. Если нет информации — это NG, даже если ты думаешь что это неправда!\n\nМетод: найди ключевые слова вопроса в тексте → сравни значение → реши.',
        mood: 'thinking',
      },
    ],
  },
  {
    keywords: ['matching headings', 'заголовки', 'paragraph heading'],
    answers: [
      {
        text: 'Matching Headings — делай ПОСЛЕДНИМИ!\n\nПочему? Потому что нужно понять ВЕСЬ абзац, а не найти одно слово.\n\nСтратегия:\n1) Прочитай ВСЕ заголовки\n2) Для каждого абзаца: прочитай первое и последнее предложение\n3) Найди ГЛАВНУЮ мысль абзаца\n4) Сопоставь с заголовком (заголовки — это синонимы, не точные слова из текста!)\n5) Остальные вопросы делай до Matching Headings',
        mood: 'thinking',
      },
    ],
  },
  // ── Listening ─────────────────────────────────────────────────────────────
  {
    keywords: ['listening', 'слушание', 'аудирование', 'audio'],
    answers: [
      {
        text: 'Listening: 40 вопросов за 30 минут + 10 мин на перенос ответов.\n\nСекреты высокого балла:\n1) Читай вопросы ДО начала аудио — предсказывай ответ\n2) Ответы идут по порядку — не опережай\n3) SPELLING критичен — неправильное написание = неверный ответ\n4) Section 4 (лекция/монолог) — самая сложная, сфокусируйся\n5) 10 минут на перенос — проверяй орфографию каждого слова',
        followUp: 'Какая Section даётся тебе сложнее всего?',
        mood: 'thinking',
      },
    ],
  },
  {
    keywords: ['section 4', 'lecture', 'монолог', 'лекция'],
    answers: [
      {
        text: 'Section 4 — монолог академического характера (лекция, речь). Самая сложная!\n\nТактика:\n1) Прочитай все вопросы заранее — получишь план лекции\n2) Слова в вопросах = сигналы для ответов\n3) Академическая лексика — учи слова из образования/науки\n4) Пиши СРАЗУ — потом не повторят\n5) Предсказывай тип ответа: число, имя, прилагательное?',
        mood: 'thinking',
      },
    ],
  },
  // ── Speaking ──────────────────────────────────────────────────────────────
  {
    keywords: ['speaking', 'говорение', 'interview', 'examiner', 'интервью'],
    answers: [
      {
        text: 'Speaking: 11–14 минут, 3 части.\n\nPart 1 (4-5 мин): Общие вопросы о тебе — работа, хобби, дом. Отвечай 2–3 предложения, не монологи!\nPart 2 (3-4 мин): Cue card — 1 минута подготовки + 2 минуты речи. Затронь ВСЕ bullet points.\nPart 3 (4-5 мин): Абстрактные вопросы — мнения, сравнения, рассуждения.\n\nГлавное: говори ЕСТЕСТВЕННО, не учи наизусть!',
        followUp: 'Хочешь разберём Part 2 — как использовать 1 минуту подготовки?',
        mood: 'happy',
      },
    ],
  },
  {
    keywords: ['cue card', 'part 2', 'long turn', 'карточка'],
    answers: [
      {
        text: 'Part 2 Cue Card — 1 минута подготовки:\n\n1) Сразу запиши ключевые слова для каждого bullet point\n2) Придумай конкретный пример/историю (лучше личная)\n3) Запланируй структуру: прошлое → настоящее → чувства/мнение\n4) Не пиши предложения целиком — только ключевые слова\n\nВо время речи: говори медленнее, чем думаешь нужно. Пауза = размышление, а не ошибка.',
        mood: 'thinking',
      },
    ],
  },
  {
    keywords: ['part 3', 'abstract', 'opinion speaking', 'абстрактные вопросы'],
    answers: [
      {
        text: 'Part 3 — абстрактные вопросы об обществе, будущем, сравнениях.\n\nФормула ответа (PEEL):\n• Point — твоя позиция\n• Evidence — пример/причина\n• Explain — развитие\n• Link — вывод или обратная связь с вопросом\n\nПолезные фразы:\n"That\'s an interesting question. I think that..."\n"It really depends on... but generally speaking..."\n"Having said that, I believe..."\n"From my perspective..."',
        mood: 'thinking',
      },
    ],
  },
  {
    keywords: ['fluency', 'беглость', 'hesitation', 'паузы', 'запинаться'],
    answers: [
      {
        text: 'Беглость (Fluency) — это не говорить без остановки! Это говорить с ЕСТЕСТВЕННЫМИ паузами.\n\nПравильные паузы:\n"That\'s a good question..." (думаешь)\n"Let me think about that for a moment..." (нормально!)\n"Well, I suppose it depends..." (начинаешь мысль)\n\nЧего избегать:\n• "Erm, erm, erm..." (слишком много заполнителей)\n• Длинные тишины без слов\n• Повторение одних и тех же простых слов (nice, good, big)',
        mood: 'encouraging',
      },
    ],
  },
  // ── Vocabulary & Grammar ──────────────────────────────────────────────────
  {
    keywords: ['vocabulary', 'словарный запас', 'words', 'слова', 'лексика'],
    answers: [
      {
        text: 'Для Band 7+ нужен разнообразный словарный запас. Три категории:\n\n1) Академические слова: analyze, demonstrate, indicate, suggest, contribute\n2) Слова по темам IELTS: environment, technology, education, health, urbanization\n3) Discourse markers: Furthermore, Nevertheless, In contrast, Consequently\n\nМетод запоминания: учи слова в контексте (целые предложения), а не списками.',
        mood: 'thinking',
      },
    ],
  },
  {
    keywords: ['grammar', 'грамматика', 'tenses', 'время', 'passive', 'пассивный залог'],
    answers: [
      {
        text: 'Грамматика для Band 7 IELTS:\n\nОбязательно знать:\n• Пассивный залог (обязателен в Task 1 для процессов): "is produced", "was built"\n• Условные предложения: "If implemented, this would..."\n• Сложные предложения с обстоятельствами: "Having considered both sides, I believe..."\n• Артикли (типичная ошибка для русскоязычных): the/a/an\n• Согласование времён в Task 2\n\nЭкзаменатор оценивает разнообразие структур, а не безупречность.',
        mood: 'thinking',
      },
    ],
  },
  // ── Study Strategy ─────────────────────────────────────────────────────────
  {
    keywords: ['how long', 'сколько времени', 'preparation', 'подготовка', 'когда сдавать', 'план подготовки'],
    answers: [
      {
        text: 'Реалистичный план подготовки к IELTS:\n\n• Band 5 → 6: 2–3 месяца (если учить каждый день)\n• Band 6 → 7: 3–5 месяцев\n• Band 7 → 8: 6–12 месяцев\n\nИдеальная неделя:\n• Пн/Ср/Пт: Writing (30 мин Task 1 + 45 мин Task 2)\n• Вт/Чт: Listening + Reading (полный тест)\n• Суббота: Speaking (практика с партнёром или запись себя)\n• Воскресенье: Vocabulary + Grammar review',
        followUp: 'Когда твой экзамен? Я дам конкретный план.',
        mood: 'thinking',
      },
    ],
  },
  {
    keywords: ['mock test', 'пробный тест', 'practice test', 'симуляция'],
    answers: [
      {
        text: 'Пробные тесты — обязательная часть подготовки!\n\nПравила:\n1) Делай в РЕАЛЬНЫХ условиях: таймер, тишина, без телефона\n2) Cambridge IELTS 14–18 — официальные тесты (самые точные)\n3) После теста: разбирай КАЖДУЮ ошибку\n4) Для Writing: смотри образцы ответов Band 7 и сравнивай со своим\n5) Делай минимум 2 полных теста перед экзаменом',
        mood: 'encouraging',
      },
    ],
  },
  // ── ENT Subjects (existing functionality enhanced) ─────────────────────────
  {
    keywords: ['физика', 'physics'],
    answers: [
      {
        text: 'Физика на ЕНТ: 25 вопросов, максимум 25 баллов. Самые частые темы:\n1) Механика (кинематика, динамика) — ~30% вопросов\n2) Электричество и магнетизм — ~25%\n3) Оптика — ~15%\n4) Термодинамика — ~15%\n5) Квантовая физика — ~15%\n\nСтратегия: выучи все формулы наизусть. На ЕНТ нет таблицы формул.',
        followUp: 'Какой раздел физики даётся сложнее?',
        mood: 'thinking',
      },
    ],
  },
  {
    keywords: ['математика', 'math', 'алгебра', 'геометрия'],
    answers: [
      {
        text: 'Математика на ЕНТ: 20 вопросов. Ключевые разделы:\n1) Алгебра — уравнения, неравенства, прогрессии\n2) Функции и графики\n3) Геометрия — планиметрия и стереометрия\n4) Тригонометрия — sin/cos/tg таблицы, формулы\n5) Статистика и теория вероятностей\n\nСовет: реши все задания из КИМ 2020–2024. Задания повторяются!',
        mood: 'thinking',
      },
    ],
  },
  {
    keywords: ['история', 'history', 'казахстан', 'история казахстана'],
    answers: [
      {
        text: 'История Казахстана на ЕНТ: 20 вопросов. Важнейшие периоды:\n1) Древние государства (саки, гунны, тюрки)\n2) Казахское ханство (1465 — основание, Керей и Жаныбек)\n3) Джунгарские нашествия и присоединение к России\n4) Советский период — коллективизация, голод 1930-х\n5) Независимость с 1991 года\n\nСовет: даты, имена правителей и события — учи карточками.',
        mood: 'thinking',
      },
    ],
  },
  // ── Motivation ─────────────────────────────────────────────────────────────
  {
    keywords: ['устал', 'не могу', 'сложно', 'трудно', 'хочу бросить', 'не получается'],
    answers: [
      {
        text: 'Понимаю тебя. Учёба — это марафон, не спринт. Но знаешь что? То, что ты чувствуешь сложность — значит ты РАСТЁШЬ. Лёгкое не учит.\n\nПопробуй метод Помодоро: 25 минут фокус → 5 минут отдых. Нейронаука доказывает — такие короткие сессии эффективнее длинных.\n\nЧто именно сложно? Давай разберём вместе.',
        mood: 'encouraging',
      },
      {
        text: 'Даже лучшие студенты бывают на дне. Важно не то, что ты упал — важно встать. Сделай один маленький шаг: открой одну страницу, сделай один вопрос. Импульс придёт сам.',
        mood: 'encouraging',
      },
    ],
  },
  {
    keywords: ['молодец', 'сделал', 'получилось', 'успел', 'готов'],
    answers: [
      {
        text: 'Отлично! Прогресс — это не случайность, это результат твоих усилий. Каждый день подготовки — это реальный вклад в твой результат. Так держать!',
        mood: 'excited',
      },
    ],
  },
  // ── About robot / AI questions ─────────────────────────────────────────────
  {
    keywords: ['ты ии', 'ты ais', 'ты программа', 'ты настоящий', 'ты робот', 'artificial intelligence'],
    answers: [
      {
        text: 'Я — твой AI-ментор в StudyHub. Обучен на данных тысяч успешных студентов IELTS и ЕНТ. Я знаю паттерны ошибок, стратегии и что работает — и помогаю тебе избежать типичных ловушек. Давай займёмся твоим результатом!',
        mood: 'happy',
      },
    ],
  },
]

// ── Main Matching Function ────────────────────────────────────────────────────
// Checks admin-added Q&As first, then falls back to the hardcoded base.

export function findMentorAnswer(userInput: string, studentName?: string): MentorAnswer | null {
  const normalized = userInput.toLowerCase().trim()

  // 1. Check admin-added Q&As from content store (imported lazily to avoid circular deps)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod = (globalThis as any).__useContentStore ?? null
    const customQAs = mod ? mod.getState().qas : []
    for (const qa of customQAs) {
      const keys = qa.keywords.split(',').map((k: string) => k.trim().toLowerCase()).filter(Boolean)
      if (keys.some((k: string) => normalized.includes(k))) {
        const answer: MentorAnswer = {
          text: qa.answer,
          followUp: qa.followUp || undefined,
          mood: qa.mood,
        }
        return answer
      }
    }
  } catch {
    // content store not available — continue to hardcoded base
  }

  // 2. Hardcoded knowledge base
  for (const entry of KNOWLEDGE_BASE) {
    const matches = entry.keywords.some(kw => normalized.includes(kw))
    if (matches) {
      const answer = rand(entry.answers)
      if (studentName) {
        return {
          ...answer,
          text: answer.text.replace(/\[имя\]/gi, studentName),
        }
      }
      return answer
    }
  }
  return null
}

// ── Page-context hints (used when robot detects current page) ─────────────────

export const PAGE_HINTS: Record<string, string[]> = {
  '/ielts': [
    'Совет: Writing Task 2 стоит вдвое больше Task 1 — начни с него при подготовке.',
    'На Reading: читай вопросы ПЕРЕД текстом — знаешь что искать.',
    'В Speaking Part 2: используй 1 минуту подготовки по максимуму — пиши ключевые слова.',
    'Для Band 7 нужен разнообразный словарный запас. Изучай слова в контексте!',
    'Пробный тест раз в неделю — обязательно! Только так привыкаешь к темпу.',
  ],
  '/curator': [
    'Регулярность важнее интенсивности. 40 минут каждый день лучше, чем 4 часа раз в неделю.',
    'Повторяй пройденный материал через 24 часа — так информация переходит в долговременную память.',
    'Сначала теория, потом практика — но практики должно быть 70% от времени.',
  ],
  '/practice-ent': [
    'На ЕНТ нет штрафа за неверный ответ — никогда не оставляй вопрос пустым.',
    'Сложный вопрос? Ставь метку и возвращайся в конце — не теряй время.',
    'Читай каждый вариант ответа полностью перед выбором.',
  ],
  '/dashboard': [
    'Ты сделал отличный выбор — учиться системно. Куда движемся сегодня?',
    'Твой прогресс отображается здесь. Маленькие шаги каждый день = большой результат.',
  ],
}

export function getPageHint(pathname: string): string | null {
  const hints = PAGE_HINTS[pathname]
  if (!hints || hints.length === 0) return null
  return rand(hints)
}

// ── Quick reply suggestions ───────────────────────────────────────────────────

export const IELTS_QUICK_QUESTIONS = [
  'Как написать Overview в Task 1?',
  'Структура эссе Task 2',
  'Стратегия True/False/Not Given',
  'Part 2 Speaking: как использовать 1 минуту?',
  'Сколько времени нужно на подготовку?',
  'Какие книги Cambridge IELTS лучшие?',
  'Band 7 Writing — что нужно?',
  'Как улучшить беглость Speaking?',
]
