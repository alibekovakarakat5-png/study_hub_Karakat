import type { TopicContent } from '@/types/curator'

export const englishTopics: TopicContent[] = [
  // ── 1. Present Tenses (beginner) ──────────────────────────────────────────
  {
    subject: 'english',
    topic: 'Present Tenses',
    level: 'beginner',
    theory: {
      title: 'Настоящие времена в английском языке',
      sections: [
        {
          heading: 'Present Simple',
          content:
            'Present Simple используется для привычек, расписаний и общих истин. Образование: I/You/We/They + V, He/She/It + V-s/es. Маркеры: always, usually, every day, often, never. Пример: She goes to school every day. Water boils at 100°C.',
        },
        {
          heading: 'Present Continuous',
          content:
            'Present Continuous описывает действие, происходящее прямо сейчас или временную ситуацию. Образование: am/is/are + V-ing. Маркеры: now, at the moment, right now, currently. Пример: I am reading a book right now. They are living in Almaty this year.',
        },
        {
          heading: 'Present Perfect',
          content:
            'Present Perfect связывает прошлое с настоящим — результат или опыт. Образование: have/has + V3 (Past Participle). Маркеры: already, yet, ever, never, just, since, for. Пример: I have already done my homework. She has lived here since 2010.',
        },
        {
          heading: 'Present Perfect Continuous',
          content:
            'Present Perfect Continuous подчёркивает длительность действия, начавшегося в прошлом и продолжающегося сейчас. Образование: have/has been + V-ing. Маркеры: for, since, all day, how long. Пример: I have been studying English for 3 years.',
        },
      ],
      keyPoints: [
        'Present Simple — привычки, факты, расписания (V / V-s)',
        'Present Continuous — действие прямо сейчас (am/is/are + V-ing)',
        'Present Perfect — результат или опыт (have/has + V3)',
        'Present Perfect Continuous — длительность до сейчас (have/has been + V-ing)',
        'Stative verbs (know, like, want) не употребляются в Continuous',
      ],
      formulas: [
        'Present Simple: S + V(s/es)',
        'Present Continuous: S + am/is/are + V-ing',
        'Present Perfect: S + have/has + V3',
        'Present Perfect Continuous: S + have/has + been + V-ing',
      ],
    },
    practice: [
      {
        id: 'eng-pres-p1',
        text: 'She ___ to school every morning.',
        options: ['go', 'goes', 'is going', 'has gone'],
        correctAnswer: 1,
        hint: 'Привычка + every morning — Present Simple, 3-е лицо',
        explanation: 'Present Simple для привычек: He/She/It + V-s → goes.',
      },
      {
        id: 'eng-pres-p2',
        text: 'Look! The children ___ in the park.',
        options: ['play', 'plays', 'are playing', 'have played'],
        correctAnswer: 2,
        hint: 'Look! — маркер действия прямо сейчас',
        explanation: 'Present Continuous (are playing) — действие в момент речи.',
      },
      {
        id: 'eng-pres-p3',
        text: 'I ___ this movie three times.',
        options: ['watch', 'am watching', 'have watched', 'watched'],
        correctAnswer: 2,
        hint: 'Опыт к настоящему моменту — Present Perfect',
        explanation: 'Have watched — опыт (сколько раз видел) → Present Perfect.',
      },
      {
        id: 'eng-pres-p4',
        text: 'They ___ for two hours. They are tired.',
        options: ['run', 'are running', 'have been running', 'runs'],
        correctAnswer: 2,
        hint: 'for two hours + результат сейчас — длительность',
        explanation: 'Have been running — длительность до настоящего момента → Present Perfect Continuous.',
      },
      {
        id: 'eng-pres-p5',
        text: 'Какой глагол нельзя использовать в Continuous?',
        options: ['run', 'play', 'know', 'swim'],
        correctAnswer: 2,
        hint: 'Stative verb — состояние, а не действие',
        explanation: 'Know — глагол состояния (stative verb), не используется в формах Continuous.',
      },
    ],
    test: [
      {
        id: 'eng-pres-t1',
        text: 'The Earth ___ around the Sun.',
        options: ['move', 'moves', 'is moving', 'has moved'],
        correctAnswer: 1,
        explanation: 'Научный факт — Present Simple: moves.',
      },
      {
        id: 'eng-pres-t2',
        text: 'Be quiet! The baby ___.',
        options: ['sleeps', 'is sleeping', 'has slept', 'sleep'],
        correctAnswer: 1,
        explanation: 'Действие прямо сейчас — Present Continuous: is sleeping.',
      },
      {
        id: 'eng-pres-t3',
        text: 'I ___ never ___ to London.',
        options: ['have / been', 'has / been', 'am / being', 'was / been'],
        correctAnswer: 0,
        explanation: 'Present Perfect с never: I have never been.',
      },
      {
        id: 'eng-pres-t4',
        text: 'She ___ English since childhood.',
        options: ['studies', 'is studying', 'has been studying', 'studied'],
        correctAnswer: 2,
        explanation: 'Since childhood + длительность → Present Perfect Continuous.',
      },
      {
        id: 'eng-pres-t5',
        text: 'Какое предложение содержит ошибку?',
        options: [
          'I am understanding you.',
          'She plays tennis on Sundays.',
          'We have just arrived.',
          'He has been working all day.',
        ],
        correctAnswer: 0,
        explanation: 'Understand — stative verb, нельзя в Continuous. Правильно: I understand you.',
      },
    ],
  },

  // ── 2. Past Tenses (intermediate) ─────────────────────────────────────────
  {
    subject: 'english',
    topic: 'Past Tenses',
    level: 'intermediate',
    theory: {
      title: 'Прошедшие времена в английском языке',
      sections: [
        {
          heading: 'Past Simple',
          content:
            'Past Simple описывает завершённое действие в прошлом. Образование: V2 (правильные: V-ed, неправильные: 2-я колонка). Маркеры: yesterday, last week, ago, in 2020. Отрицание/вопрос: did + V. She visited Paris last summer. Did you go?',
        },
        {
          heading: 'Past Continuous',
          content:
            'Past Continuous — действие, длившееся в определённый момент в прошлом. Образование: was/were + V-ing. Маркеры: at 5 pm yesterday, while, when. I was reading when he called. They were sleeping at midnight.',
        },
        {
          heading: 'Past Perfect',
          content:
            'Past Perfect описывает действие, завершённое до другого действия в прошлом (предпрошедшее). Образование: had + V3. Маркеры: by the time, before, after, already. She had left before I arrived.',
        },
        {
          heading: 'Past Perfect Continuous',
          content:
            'Past Perfect Continuous подчёркивает длительность действия до момента в прошлом. Образование: had been + V-ing. Маркеры: for, since + прошедшее время. They had been waiting for 2 hours before the bus came.',
        },
      ],
      keyPoints: [
        'Past Simple — завершённое действие (V2 / did + V)',
        'Past Continuous — процесс в момент прошлого (was/were + V-ing)',
        'Past Perfect — действие до другого прошлого (had + V3)',
        'Past Perfect Continuous — длительность до момента прошлого (had been + V-ing)',
        'When + Past Simple, Past Continuous — прерывание длительного',
      ],
      formulas: [
        'Past Simple: S + V2 (V-ed / irregular)',
        'Past Continuous: S + was/were + V-ing',
        'Past Perfect: S + had + V3',
        'Past Perfect Continuous: S + had been + V-ing',
      ],
    },
    practice: [
      {
        id: 'eng-past-p1',
        text: 'She ___ to London last year.',
        options: ['goes', 'went', 'has gone', 'is going'],
        correctAnswer: 1,
        hint: 'last year — маркер Past Simple',
        explanation: 'Past Simple: went (неправильный глагол go-went-gone).',
      },
      {
        id: 'eng-past-p2',
        text: 'I ___ TV when the phone rang.',
        options: ['watched', 'was watching', 'had watched', 'have watched'],
        correctAnswer: 1,
        hint: 'Длительное действие прервано коротким — Past Continuous',
        explanation: 'Was watching — Past Continuous, прерванный Past Simple (rang).',
      },
      {
        id: 'eng-past-p3',
        text: 'By the time we arrived, the film ___.',
        options: ['started', 'has started', 'had started', 'was starting'],
        correctAnswer: 2,
        hint: 'By the time — маркер Past Perfect',
        explanation: 'Had started — действие завершилось до нашего прихода.',
      },
      {
        id: 'eng-past-p4',
        text: 'They ___ for 3 hours before the rain stopped.',
        options: ['walked', 'were walking', 'had been walking', 'have been walking'],
        correctAnswer: 2,
        hint: 'for 3 hours + до момента в прошлом — длительность',
        explanation: 'Had been walking — Past Perfect Continuous, длительность до момента в прошлом.',
      },
      {
        id: 'eng-past-p5',
        text: 'Какая форма Past Simple глагола "write"?',
        options: ['writed', 'wrote', 'written', 'writing'],
        correctAnswer: 1,
        hint: 'Неправильный глагол: write — wrote — written',
        explanation: 'Write — wrote — written. Past Simple = wrote.',
      },
    ],
    test: [
      {
        id: 'eng-past-t1',
        text: 'Columbus ___ America in 1492.',
        options: ['discovers', 'discovered', 'had discovered', 'was discovering'],
        correctAnswer: 1,
        explanation: 'Факт прошлого с конкретной датой — Past Simple.',
      },
      {
        id: 'eng-past-t2',
        text: 'While I ___, someone knocked on the door.',
        options: ['study', 'studied', 'was studying', 'had studied'],
        correctAnswer: 2,
        explanation: 'While + Past Continuous — длительное действие прервано.',
      },
      {
        id: 'eng-past-t3',
        text: 'She was sad because she ___ her keys.',
        options: ['lost', 'has lost', 'had lost', 'was losing'],
        correctAnswer: 2,
        explanation: 'Потеря ключей произошла раньше, чем она расстроилась — Past Perfect.',
      },
      {
        id: 'eng-past-t4',
        text: 'He ___ all day before the exam.',
        options: ['studies', 'was studying', 'had been studying', 'has studied'],
        correctAnswer: 2,
        explanation: 'Длительность до момента в прошлом (экзамена) — Past Perfect Continuous.',
      },
      {
        id: 'eng-past-t5',
        text: 'Предложение без ошибки:',
        options: [
          'I was went to school.',
          'She had ate before I came.',
          'They were playing when it started to rain.',
          'He haved finished his work.',
        ],
        correctAnswer: 2,
        explanation: 'Were playing (Past Continuous) + started (Past Simple) — правильная конструкция.',
      },
    ],
  },

  // ── 3. Future Tenses (intermediate) ───────────────────────────────────────
  {
    subject: 'english',
    topic: 'Future Tenses',
    level: 'intermediate',
    theory: {
      title: 'Будущие времена в английском языке',
      sections: [
        {
          heading: 'Future Simple (will)',
          content:
            'Future Simple: will + V (без to). Используется для спонтанных решений, предсказаний, обещаний. I will help you. Отрицание: will not (won\'t). Вопрос: Will you...?',
        },
        {
          heading: 'Be going to',
          content:
            'Be going to + V: запланированное действие или предсказание по очевидным признакам. I am going to travel next month. Look at those clouds — it is going to rain.',
        },
        {
          heading: 'Present Continuous для будущего',
          content:
            'Am/is/are + V-ing для личных договорённостей с конкретным временем. I am meeting John at 5 pm tomorrow. We are flying to London on Friday (билеты уже куплены).',
        },
        {
          heading: 'Future Perfect',
          content:
            'Will have + V3: действие завершится к определённому моменту в будущем. By 2030, I will have graduated. By the time you arrive, I will have cooked dinner.',
        },
      ],
      keyPoints: [
        'will + V — спонтанные решения, предсказания, обещания',
        'be going to + V — планы и предсказания по очевидным признакам',
        'Present Continuous — договорённости с конкретным временем',
        'will have + V3 — действие, завершённое к моменту в будущем',
      ],
      formulas: ['will + V', 'am/is/are + going to + V', 'am/is/are + V-ing', 'will + have + V3/Ved'],
    },
    practice: [
      {
        id: 'eng-fut-p1',
        text: 'Look at those dark clouds! It ___.',
        options: ['will rain', 'is going to rain', 'rains', 'is raining'],
        correctAnswer: 1,
        hint: 'Очевидный признак — be going to',
        explanation: 'Be going to при очевидных признаках.',
      },
      {
        id: 'eng-fut-p2',
        text: 'I promise I ___ you with homework.',
        options: ['am going to help', 'am helping', 'will help', 'help'],
        correctAnswer: 2,
        hint: 'Обещания — will',
        explanation: 'Will для обещаний.',
      },
      {
        id: 'eng-fut-p3',
        text: 'Какое предложение выражает договорённость?',
        options: [
          'I will go to the gym.',
          'I am meeting Sarah at 6 pm.',
          'I am going to study.',
          'It will be sunny.',
        ],
        correctAnswer: 1,
        hint: 'Конкретное время и лицо',
        explanation: 'Present Continuous + конкретное время/лицо = договорённость.',
      },
      {
        id: 'eng-fut-p4',
        text: 'By next December, she ___ her degree.',
        options: ['will finish', 'is going to finish', 'will have finished', 'finishes'],
        correctAnswer: 2,
        hint: 'Маркер by — Future Perfect',
        explanation: 'By + будущее = Future Perfect: will have finished.',
      },
      {
        id: 'eng-fut-p5',
        text: 'Какой маркер НЕ относится к Future Perfect?',
        options: ['by tomorrow', 'by the time', 'by next year', 'right now'],
        correctAnswer: 3,
        hint: 'Future Perfect — будущее',
        explanation: 'Right now — маркер настоящего времени, не Future Perfect.',
      },
    ],
    test: [
      {
        id: 'eng-fut-t1',
        text: 'The phone is ringing. I ___ it!',
        options: ['am going to answer', 'will answer', 'answer', 'am answering'],
        correctAnswer: 1,
        explanation: 'Спонтанное решение — will.',
      },
      {
        id: 'eng-fut-t2',
        text: 'We ___ to Paris next Friday. Tickets are booked.',
        options: ['will fly', 'are flying', 'fly', 'are going to fly'],
        correctAnswer: 1,
        explanation: 'Билеты куплены = договорённость → Present Continuous.',
      },
      {
        id: 'eng-fut-t3',
        text: 'By the time you arrive, I ___ dinner.',
        options: ['will cook', 'am cooking', 'cook', 'will have cooked'],
        correctAnswer: 3,
        explanation: 'By the time + Future Perfect: will have cooked.',
      },
      {
        id: 'eng-fut-t4',
        text: 'She ___ a doctor. She has been accepted to medical school.',
        options: ['will be', 'is going to be', 'is being', 'will have been'],
        correctAnswer: 1,
        explanation: 'Очевидное основание (принята) → be going to.',
      },
      {
        id: 'eng-fut-t5',
        text: 'Какое предложение содержит ошибку?',
        options: [
          'I will help you tomorrow.',
          'She is going to visit us.',
          'By 2030, he will have finish the project.',
          'We are meeting at 8 pm.',
        ],
        correctAnswer: 2,
        explanation: 'will have finish → will have finished (нужна форма V3).',
      },
    ],
  },

  // ── 4. Passive Voice (beginner) ───────────────────────────────────────────
  {
    subject: 'english',
    topic: 'Passive Voice',
    level: 'beginner',
    theory: {
      title: 'Страдательный залог (Passive Voice)',
      sections: [
        {
          heading: 'Что такое Passive Voice?',
          content:
            'В Active Voice подлежащее выполняет действие. В Passive Voice — подлежащее принимает действие. The mouse was caught by the cat. Используется, когда важнее действие или объект, а не исполнитель.',
        },
        {
          heading: 'Образование Passive Voice',
          content:
            'Формула: to be + V3 (Past Participle). Present Simple: am/is/are + V3. Past Simple: was/were + V3. Future Simple: will be + V3. Примеры: Letters are delivered daily. The book was written in 1990.',
        },
        {
          heading: 'By-agent (указание исполнителя)',
          content:
            'Исполнитель вводится предлогом by: The novel was written by Tolstoy. Часто исполнитель опускается, если он неизвестен или неважен: English is spoken worldwide.',
        },
        {
          heading: 'Превращение Active в Passive',
          content:
            'Дополнение Active → подлежащее Passive. Глагол → to be + V3. Подлежащее Active → by-agent. Пример: Tom cleans the room → The room is cleaned by Tom.',
        },
      ],
      keyPoints: [
        'Passive = to be + V3 (Past Participle)',
        'Present: am/is/are + V3 | Past: was/were + V3 | Future: will be + V3',
        'By + исполнитель (может опускаться)',
        'Active → Passive: объект становится подлежащим',
      ],
      formulas: [
        'S + to be + V3 (+ by agent)',
        'Active: S + V + O → Passive: O + to be + V3 + by S',
      ],
    },
    practice: [
      {
        id: 'eng-pass-p1',
        text: 'Переведите в Passive: She writes letters every day.',
        options: [
          'Letters are written every day.',
          'Letters were written.',
          'Letters will be written.',
          'Letters is written.',
        ],
        correctAnswer: 0,
        hint: 'Present Simple → am/is/are + V3',
        explanation: 'Letters (мн. ч.) + are written every day.',
      },
      {
        id: 'eng-pass-p2',
        text: 'Переведите в Passive: They built this house in 1990.',
        options: [
          'This house is built.',
          'This house was built in 1990.',
          'This house were built.',
          'This house has built.',
        ],
        correctAnswer: 1,
        hint: 'Past Simple → was/were + V3',
        explanation: 'This house (ед. ч.) + was built in 1990.',
      },
      {
        id: 'eng-pass-p3',
        text: 'Какой вариант правильно указывает исполнителя?',
        options: [
          'baked from grandmother',
          'baked by grandmother',
          'baked with grandmother',
          'baked to grandmother',
        ],
        correctAnswer: 1,
        hint: 'By + исполнитель действия',
        explanation: 'В Passive Voice исполнитель вводится предлогом by.',
      },
      {
        id: 'eng-pass-p4',
        text: 'Какое предложение в Passive Voice?',
        options: [
          'She reads books.',
          'The book was read by everyone.',
          'He is reading now.',
          'They have finished.',
        ],
        correctAnswer: 1,
        hint: 'Ищите to be + V3',
        explanation: 'Was read = was (to be) + read (V3) — Passive Voice.',
      },
      {
        id: 'eng-pass-p5',
        text: 'Future Passive: They will deliver the package. → The package ___.',
        options: ['will delivered', 'will be delivered', 'is delivered', 'was delivered'],
        correctAnswer: 1,
        hint: 'Future Passive: will + be + V3',
        explanation: 'The package will be delivered.',
      },
    ],
    test: [
      {
        id: 'eng-pass-t1',
        text: 'English ___ in many countries.',
        options: ['speaks', 'is spoken', 'is speaking', 'spoken'],
        correctAnswer: 1,
        explanation: 'Is spoken — Present Simple Passive.',
      },
      {
        id: 'eng-pass-t2',
        text: 'The Mona Lisa ___ by Leonardo da Vinci.',
        options: ['painted', 'was painted', 'is painted', 'has painted'],
        correctAnswer: 1,
        explanation: 'Was painted — Past Simple Passive.',
      },
      {
        id: 'eng-pass-t3',
        text: 'Переведите в Active: The window was broken by the children.',
        options: [
          'The children broke the window.',
          'The children break the window.',
          'The children was breaking.',
          'The children are broken.',
        ],
        correctAnswer: 0,
        explanation: 'The children broke the window — Active Voice, Past Simple.',
      },
      {
        id: 'eng-pass-t4',
        text: 'Найдите предложение с ошибкой:',
        options: [
          'The letter was written.',
          'The car is being repaired.',
          'The homework was did by the student.',
          'Rice is grown in Asia.',
        ],
        correctAnswer: 2,
        explanation: 'was did → was done. V3 от do = done.',
      },
      {
        id: 'eng-pass-t5',
        text: 'New schools ___ next year.',
        options: ['will build', 'will be built', 'are building', 'built'],
        correctAnswer: 1,
        explanation: 'Will be built — Future Simple Passive.',
      },
    ],
  },

  // ── 5. Conditionals (intermediate) ────────────────────────────────────────
  {
    subject: 'english',
    topic: 'Conditionals',
    level: 'intermediate',
    theory: {
      title: 'Условные предложения (Conditionals)',
      sections: [
        {
          heading: 'Zero Conditional',
          content:
            'Факты и законы природы. Структура: If + Present Simple, Present Simple. Пример: If you heat water to 100°C, it boils. If it rains, the grass gets wet.',
        },
        {
          heading: 'First Conditional',
          content:
            'Реальные ситуации в будущем. Структура: If + Present Simple, will + V. Пример: If it rains tomorrow, I will stay home. If you study hard, you will pass the exam.',
        },
        {
          heading: 'Second Conditional',
          content:
            'Нереальные (гипотетические) ситуации в настоящем. Структура: If + Past Simple, would + V. Пример: If I were rich, I would travel the world. If I had wings, I would fly.',
        },
        {
          heading: 'Third Conditional',
          content:
            'Нереальные ситуации в прошлом (сожаление). Структура: If + Past Perfect, would have + V3. Пример: If I had studied harder, I would have passed. If she had left earlier, she would have caught the train.',
        },
      ],
      keyPoints: [
        'Zero: If + Present, Present — факты и законы',
        'First: If + Present, will + V — реальное будущее',
        'Second: If + Past Simple, would + V — нереальное настоящее',
        'Third: If + Past Perfect, would have + V3 — нереальное прошлое',
        'Никогда не ставим will после if!',
      ],
    },
    practice: [
      {
        id: 'eng-cond-p1',
        text: 'Определите тип: If I were rich, I would buy a yacht.',
        options: ['Zero', 'First', 'Second', 'Third'],
        correctAnswer: 2,
        hint: 'Нереальное настоящее — were + would',
        explanation: 'If + Past Simple (were), would + V = Second Conditional.',
      },
      {
        id: 'eng-cond-p2',
        text: 'If she ___ earlier, she would have caught the bus.',
        options: ['leaves', 'left', 'had left', 'would leave'],
        correctAnswer: 2,
        hint: 'Third Conditional: If + Past Perfect',
        explanation: 'Third Conditional: If + had left (Past Perfect).',
      },
      {
        id: 'eng-cond-p3',
        text: 'Какое предложение — First Conditional?',
        options: [
          'If you heat ice, it melts.',
          'If it rains, I will take an umbrella.',
          'If I had wings, I would fly.',
          'If he had called, I would have answered.',
        ],
        correctAnswer: 1,
        hint: 'Реальное будущее — will',
        explanation: 'If + Present Simple, will + V = First Conditional.',
      },
      {
        id: 'eng-cond-p4',
        text: 'If you mix red and blue, you ___ purple.',
        options: ['will get', 'get', 'would get', 'got'],
        correctAnswer: 1,
        hint: 'Научный факт — Zero Conditional',
        explanation: 'Zero Conditional: If + Present, Present. Факт о цветах.',
      },
      {
        id: 'eng-cond-p5',
        text: 'В чём ошибка: "If I will study, I will pass"?',
        options: [
          'Нужно would study',
          'Нельзя will после if',
          'Нужно had studied',
          'Нужно am studying',
        ],
        correctAnswer: 1,
        hint: 'will не ставят после if',
        explanation: 'Правильно: If I study, I will pass. После if не используют will.',
      },
    ],
    test: [
      {
        id: 'eng-cond-t1',
        text: 'If water reaches 0°C, it ___.',
        options: ['will freeze', 'freezes', 'would freeze', 'froze'],
        correctAnswer: 1,
        explanation: 'Zero Conditional: научный факт — freezes.',
      },
      {
        id: 'eng-cond-t2',
        text: 'If I ___ you, I would apologize.',
        options: ['am', 'was', 'were', 'will be'],
        correctAnswer: 2,
        explanation: 'Second Conditional: If I were you (were для всех лиц).',
      },
      {
        id: 'eng-cond-t3',
        text: 'If they had invited me, I ___ to the party.',
        options: ['will go', 'would go', 'would have gone', 'had gone'],
        correctAnswer: 2,
        explanation: 'Third Conditional: would have gone.',
      },
      {
        id: 'eng-cond-t4',
        text: 'Какое предложение без ошибки?',
        options: [
          'If I will see him, I will tell.',
          'If I see him, I will tell him.',
          'If I see him, I tell him.',
          'If I would see him, I tell.',
        ],
        correctAnswer: 1,
        explanation: 'First Conditional: If + Present Simple, will + V.',
      },
      {
        id: 'eng-cond-t5',
        text: 'Какой тип Conditional выражает сожаление о прошлом?',
        options: ['Zero', 'First', 'Second', 'Third'],
        correctAnswer: 3,
        explanation: 'Third Conditional — нереальное прошлое, сожаление.',
      },
    ],
  },

  // ── 6. Modal Verbs (intermediate) ─────────────────────────────────────────
  {
    subject: 'english',
    topic: 'Modal Verbs',
    level: 'intermediate',
    theory: {
      title: 'Модальные глаголы (Modal Verbs)',
      sections: [
        {
          heading: 'Can / Could',
          content:
            'Can — способность или разрешение в настоящем: I can swim. Can I go? Could — способность в прошлом (I could swim at 5) или вежливая просьба (Could you help me?). После can/could глагол без to.',
        },
        {
          heading: 'May / Might',
          content:
            'May — формальное разрешение (May I come in?) или вероятность (It may rain tomorrow). Might — меньшая степень вероятности (He might be at home). May/might + V без to.',
        },
        {
          heading: 'Must / Have to',
          content:
            'Must — обязанность от говорящего (You must study). Have to — внешняя обязанность (I have to wear a uniform). Must not — строгий запрет. Don\'t have to — нет необходимости (можно не делать).',
        },
        {
          heading: 'Should / Ought to',
          content:
            'Should — совет, рекомендация: You should read this book. You shouldn\'t eat so much sugar. Ought to = should по значению, но менее употребителен. Should мягче must.',
        },
      ],
      keyPoints: [
        'Модальные глаголы не изменяются по лицам (нет -s в 3 лице)',
        'После модальных глаголов V без to (кроме ought to, have to)',
        'must not = строгий запрет, don\'t have to = нет необходимости',
        'can — способность/разрешение, may — вероятность/формальное разрешение',
        'should — совет, must — обязанность',
      ],
    },
    practice: [
      {
        id: 'eng-mod-p1',
        text: 'You ___ drive without a license. It\'s illegal.',
        options: ['mustn\'t', 'don\'t have to', 'shouldn\'t', 'can\'t'],
        correctAnswer: 0,
        hint: 'Строгий запрет (закон) — mustn\'t',
        explanation: 'Mustn\'t — строгий запрет. Вождение без прав запрещено законом.',
      },
      {
        id: 'eng-mod-p2',
        text: 'You ___ wear a tie at work. It\'s optional.',
        options: ['mustn\'t', 'don\'t have to', 'can\'t', 'must'],
        correctAnswer: 1,
        hint: 'Нет необходимости (но можно) — don\'t have to',
        explanation: 'Don\'t have to — нет необходимости (галстук необязателен).',
      },
      {
        id: 'eng-mod-p3',
        text: '___ you swim when you were five?',
        options: ['Can', 'Could', 'May', 'Must'],
        correctAnswer: 1,
        hint: 'Способность в прошлом — could',
        explanation: 'Could — способность в прошлом (when you were five).',
      },
      {
        id: 'eng-mod-p4',
        text: 'You look tired. You ___ go to bed earlier.',
        options: ['must', 'can', 'should', 'may'],
        correctAnswer: 2,
        hint: 'Совет — should',
        explanation: 'Should — мягкий совет, рекомендация.',
      },
      {
        id: 'eng-mod-p5',
        text: 'It ___ rain later — take an umbrella just in case.',
        options: ['must', 'should', 'might', 'has to'],
        correctAnswer: 2,
        hint: 'Небольшая вероятность — might',
        explanation: 'Might — небольшая вероятность (just in case).',
      },
    ],
    test: [
      {
        id: 'eng-mod-t1',
        text: 'She ___ speak three languages fluently.',
        options: ['can', 'must', 'should', 'may'],
        correctAnswer: 0,
        explanation: 'Can — способность: она умеет говорить на трёх языках.',
      },
      {
        id: 'eng-mod-t2',
        text: '___ I use your phone? — Of course.',
        options: ['Must', 'Should', 'May', 'Would'],
        correctAnswer: 2,
        explanation: 'May I...? — вежливая просьба о разрешении.',
      },
      {
        id: 'eng-mod-t3',
        text: 'Students ___ cheat on exams.',
        options: ['don\'t have to', 'mustn\'t', 'shouldn\'t have', 'might not'],
        correctAnswer: 1,
        explanation: 'Mustn\'t — строгий запрет (списывать запрещено).',
      },
      {
        id: 'eng-mod-t4',
        text: 'Что означает "You don\'t have to come"?',
        options: [
          'Тебе запрещено приходить',
          'Тебе не нужно приходить (но можно)',
          'Ты должен прийти',
          'Ты можешь прийти',
        ],
        correctAnswer: 1,
        explanation: 'Don\'t have to = нет необходимости, но можно.',
      },
      {
        id: 'eng-mod-t5',
        text: 'Какое предложение содержит ошибку?',
        options: [
          'He can to swim well.',
          'You should study more.',
          'They must follow the rules.',
          'She might come later.',
        ],
        correctAnswer: 0,
        explanation: 'can to swim → can swim. После can не нужен to.',
      },
    ],
  },

  // ── 7. Reported Speech (advanced) ─────────────────────────────────────────
  {
    subject: 'english',
    topic: 'Reported Speech',
    level: 'advanced',
    theory: {
      title: 'Косвенная речь (Reported Speech)',
      sections: [
        {
          heading: 'Основные правила',
          content:
            'При переводе прямой речи в косвенную сдвигаем время на одно назад (backshift): Present → Past, Past → Past Perfect, will → would. Кавычки убираем, добавляем that (необязательно). He said, "I am tired." → He said (that) he was tired.',
        },
        {
          heading: 'Изменение местоимений и указателей',
          content:
            'I → he/she, we → they, my → his/her, this → that, these → those, here → there, now → then, today → that day, yesterday → the day before, tomorrow → the next day, ago → before.',
        },
        {
          heading: 'Вопросы в косвенной речи',
          content:
            'Общие вопросы: asked + if/whether + прямой порядок слов. She asked, "Do you like tea?" → She asked if I liked tea. Специальные вопросы: asked + wh-word + прямой порядок. "Where do you live?" → He asked where I lived.',
        },
        {
          heading: 'Приказы и просьбы',
          content:
            'Приказы/просьбы: told/asked + smb + to V. "Open the door!" → He told me to open the door. Отрицание: told + smb + not to V. "Don\'t run!" → She told them not to run.',
        },
      ],
      keyPoints: [
        'Backshift: Present → Past, Past → Past Perfect, will → would',
        'Местоимения и указатели времени/места меняются',
        'Вопросы: if/whether (общие), wh-word (специальные) + прямой порядок',
        'Приказы: told + smb + to V / not to V',
        'Say → said, tell → told (tell кому-то)',
      ],
    },
    practice: [
      {
        id: 'eng-rep-p1',
        text: 'He said, "I am happy." → He said that he ___ happy.',
        options: ['is', 'was', 'has been', 'will be'],
        correctAnswer: 1,
        hint: 'Backshift: am → was',
        explanation: 'Present Simple → Past Simple: am → was.',
      },
      {
        id: 'eng-rep-p2',
        text: 'She said, "I will call you." → She said she ___ call me.',
        options: ['will', 'would', 'can', 'shall'],
        correctAnswer: 1,
        hint: 'will → would в косвенной речи',
        explanation: 'Backshift: will → would.',
      },
      {
        id: 'eng-rep-p3',
        text: '"Do you speak English?" → She asked ___ I spoke English.',
        options: ['that', 'what', 'if', 'do'],
        correctAnswer: 2,
        hint: 'Общий вопрос в косвенной речи — if/whether',
        explanation: 'Для общих вопросов (yes/no) используем if или whether.',
      },
      {
        id: 'eng-rep-p4',
        text: '"Don\'t touch it!" → She told me ___ touch it.',
        options: ['don\'t', 'to not', 'not to', 'didn\'t'],
        correctAnswer: 2,
        hint: 'Отрицательный приказ: not to + V',
        explanation: 'Told + smb + not to V — отрицательный приказ.',
      },
      {
        id: 'eng-rep-p5',
        text: '"I saw her yesterday." → He said he had seen her ___.',
        options: ['yesterday', 'the day before', 'today', 'tomorrow'],
        correctAnswer: 1,
        hint: 'yesterday → the day before',
        explanation: 'В косвенной речи yesterday заменяется на the day before.',
      },
    ],
    test: [
      {
        id: 'eng-rep-t1',
        text: 'She said, "I have finished." → She said she ___.',
        options: ['has finished', 'had finished', 'finished', 'have finished'],
        correctAnswer: 1,
        explanation: 'Present Perfect → Past Perfect: have finished → had finished.',
      },
      {
        id: 'eng-rep-t2',
        text: '"Where do you live?" → He asked me where I ___.',
        options: ['live', 'lived', 'do live', 'living'],
        correctAnswer: 1,
        explanation: 'Backshift + прямой порядок слов: where I lived.',
      },
      {
        id: 'eng-rep-t3',
        text: '"Open the window," he said. → He ___ me to open the window.',
        options: ['said', 'told', 'asked', 'spoke'],
        correctAnswer: 1,
        explanation: 'Приказ: He told me to open the window. (told + smb + to V).',
      },
      {
        id: 'eng-rep-t4',
        text: 'She said, "I am studying now." Что меняется?',
        options: [
          'am studying → was studying, now → then',
          'am studying → is studying, now → today',
          'am studying → had studied, now → before',
          'am studying → studied, now → ago',
        ],
        correctAnswer: 0,
        explanation: 'Present Continuous → Past Continuous (was studying), now → then.',
      },
      {
        id: 'eng-rep-t5',
        text: 'Какое предложение в косвенной речи правильное?',
        options: [
          'He said that he can help.',
          'She told that she was busy.',
          'He asked me where did I work.',
          'She said that she would come.',
        ],
        correctAnswer: 3,
        explanation: 'She said that she would come — правильный backshift (will → would) и структура.',
      },
    ],
  },

  // ── 8. Articles and Prepositions (beginner) ───────────────────────────────
  {
    subject: 'english',
    topic: 'Articles and Prepositions',
    level: 'beginner',
    theory: {
      title: 'Артикли и предлоги (Articles and Prepositions)',
      sections: [
        {
          heading: 'Неопределённый артикль a/an',
          content:
            'A/an используется с исчисляемыми существительными в единственном числе при первом упоминании или в значении "один из". A перед согласным звуком, an перед гласным звуком: a book, an apple, a university (звук /j/), an hour (немое h).',
        },
        {
          heading: 'Определённый артикль the',
          content:
            'The используется, когда предмет определён: уже упоминался, единственный в своём роде, уточнён контекстом. The sun, the Moon, the biggest city. I bought a book. The book was interesting. The + реки, океаны, горные цепи: the Volga, the Pacific, the Alps.',
        },
        {
          heading: 'Нулевой артикль (без артикля)',
          content:
            'Без артикля: неисчисляемые и множественное число в общем значении (Water is important. Dogs are loyal.), перед именами, странами (без Republic/Kingdom), языками, видами спорта: Kazakhstan, English, football.',
        },
        {
          heading: 'Основные предлоги: in, on, at',
          content:
            'Время: at + часы/моменты (at 5 pm, at night), on + дни/даты (on Monday, on January 1st), in + месяцы/годы/сезоны (in May, in 2024, in winter). Место: at + точка (at school, at the station), on + поверхность (on the table), in + внутри (in the room, in the city).',
        },
      ],
      keyPoints: [
        'a/an — первое упоминание, один из (a + согласный звук, an + гласный звук)',
        'the — определённый, уже известный, единственный',
        'Без артикля — общие понятия, имена, страны, языки, спорт',
        'at — точка/момент, on — поверхность/день, in — внутри/длительный период',
      ],
    },
    practice: [
      {
        id: 'eng-art-p1',
        text: 'She is ___ honest person.',
        options: ['a', 'an', 'the', '—'],
        correctAnswer: 1,
        hint: 'Honest — немое h, начинается с гласного звука',
        explanation: 'An honest — буква h немая, слово начинается с гласного звука /ɒ/.',
      },
      {
        id: 'eng-art-p2',
        text: '___ Sun rises in the east.',
        options: ['A', 'An', 'The', '—'],
        correctAnswer: 2,
        hint: 'Солнце — единственное в своём роде',
        explanation: 'The Sun — единственное, определённый артикль.',
      },
      {
        id: 'eng-art-p3',
        text: 'I usually play ___ football on Saturdays.',
        options: ['a', 'an', 'the', '—'],
        correctAnswer: 3,
        hint: 'Виды спорта — без артикля',
        explanation: 'Перед видами спорта артикль не используется: play football.',
      },
      {
        id: 'eng-art-p4',
        text: 'The meeting is ___ Monday ___ 3 pm.',
        options: ['in / at', 'on / at', 'at / on', 'in / on'],
        correctAnswer: 1,
        hint: 'День недели — on, время — at',
        explanation: 'On Monday (день), at 3 pm (конкретное время).',
      },
      {
        id: 'eng-art-p5',
        text: 'She lives ___ Almaty.',
        options: ['at', 'on', 'in', 'to'],
        correctAnswer: 2,
        hint: 'Город — in',
        explanation: 'In + город: in Almaty, in London, in Moscow.',
      },
    ],
    test: [
      {
        id: 'eng-art-t1',
        text: 'He wants to become ___ engineer.',
        options: ['a', 'an', 'the', '—'],
        correctAnswer: 1,
        explanation: 'An engineer — гласный звук /e/, первое упоминание профессии.',
      },
      {
        id: 'eng-art-t2',
        text: '___ Nile is the longest river in Africa.',
        options: ['A', 'An', 'The', '—'],
        correctAnswer: 2,
        explanation: 'The Nile — артикль the с реками.',
      },
      {
        id: 'eng-art-t3',
        text: 'She arrived ___ the airport ___ time.',
        options: ['at / on', 'in / at', 'on / in', 'at / in'],
        correctAnswer: 0,
        explanation: 'At the airport (точка), on time (вовремя — устойчивое выражение).',
      },
      {
        id: 'eng-art-t4',
        text: 'I was born ___ 15th March ___ 2005.',
        options: ['on / in', 'in / on', 'at / in', 'on / at'],
        correctAnswer: 0,
        explanation: 'On + дата (on 15th March), in + год (in 2005).',
      },
      {
        id: 'eng-art-t5',
        text: 'Какое предложение правильное?',
        options: [
          'She speaks the English very well.',
          'I need a water.',
          'The children are playing in the garden.',
          'He is an university student.',
        ],
        correctAnswer: 2,
        explanation: 'The children are playing in the garden — правильное использование the (определённые дети, конкретный сад).',
      },
    ],
  },
]
