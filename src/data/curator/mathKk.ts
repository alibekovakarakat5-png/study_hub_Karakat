import type { TopicContent } from '@/types/curator'

// ── ҰБТ Математика — Қазақ тілінде ──────────────────────────────────────────

export const mathTopicsKk: TopicContent[] = [
  // ── 1. Сызықтық теңдеулер ──────────────────────────────────────────────────
  {
    subject: 'math',
    topic: 'Сызықтық теңдеулер',
    level: 'beginner',
    language: 'kk',
    theory: {
      title: 'Сызықтық теңдеулер',
      sections: [
        {
          heading: 'Сызықтық теңдеу анықтамасы',
          content: 'Сызықтық теңдеу — ax + b = 0 түрінде жазылатын теңдеу, мұндағы a және b — белгілі сандар, x — белгісіз айнымалы. a ≠ 0 болғанда, теңдеудің жалғыз шешімі x = −b/a болады.',
        },
        {
          heading: 'Тең мәнді түрлендірулер',
          content: 'Сызықтық теңдеулерді шешкенде тең мәнді түрлендірулер қолданылады: қосылғышты бір жақтан екінші жаққа таңбасын өзгертіп көшіру; теңдеудің екі жағын да нөлден өзгеше бір санға көбейту немесе бөлу.',
        },
        {
          heading: 'Сызықтық теңдеулер жүйесі',
          content: 'Екі белгісізі бар екі сызықтық теңдеулер жүйесі алмастыру, қосу немесе графиктік әдіспен шешіледі. Алмастыру әдісі: бір теңдеуден бір айнымалыны өрнектеп, екінші теңдеуге қою.',
        },
      ],
      keyPoints: [
        'Сызықтық теңдеу ax + b = 0, a ≠ 0 болғанда x = −b/a',
        'Қосылғышты көшіргенде таңбасы қарама-қарсыға өзгереді',
        'Теңдеудің екі жағын да 0-ден басқа санға көбейтуге/бөлуге болады',
        'Теңдеулер жүйесі алмастыру немесе қосу әдісімен шешіледі',
      ],
      formulas: [
        'ax + b = 0  →  x = −b/a',
        'a₁x + b₁y = c₁ ;  a₂x + b₂y = c₂',
      ],
    },
    practice: [
      { id: 'kk-math-lin-p1', text: 'Теңдеуді шешіңіз: 3x − 7 = 2x + 5', options: ['12', '10', '−12', '2'], correctAnswer: 0, hint: 'x бар мүшелерді сол жаққа, сандарды оң жаққа көшіріңіз.', explanation: '3x − 2x = 5 + 7, x = 12.' },
      { id: 'kk-math-lin-p2', text: 'Теңдеуді шешіңіз: 5(x − 2) = 3(x + 4)', options: ['8', '11', '−1', '7'], correctAnswer: 1, hint: 'Жақшаны ашып, ұқсас мүшелерді жинаңыз.', explanation: '5x − 10 = 3x + 12 → 2x = 22 → x = 11.' },
      { id: 'kk-math-lin-p3', text: 'Жүйені шешіңіз: x + y = 10 және x − y = 4. x пен y-ті табыңыз.', options: ['x = 5, y = 5', 'x = 6, y = 4', 'x = 8, y = 2', 'x = 7, y = 3'], correctAnswer: 3, hint: 'y-ті жою үшін екі теңдеуді қосыңыз.', explanation: 'Қоссақ: 2x = 14 → x = 7. Онда y = 10 − 7 = 3.' },
      { id: 'kk-math-lin-p4', text: 'a-ның қандай мәнінде ax = 6 теңдеуінің шешімі жоқ?', options: ['a = 6', 'a = 1', 'a = −1', 'a = 0'], correctAnswer: 3, hint: 'x алдындағы коэффициенттің қандай мәнінде теңдеу шешілмейді?', explanation: 'a = 0 болғанда: 0·x = 6, яғни 0 = 6 — қайшылық, шешім жоқ.' },
      { id: 'kk-math-lin-p5', text: '2(3x + 1) = 4x + 10 теңдеуін шешіңіз', options: ['4', '5', '3', '6'], correctAnswer: 0, hint: 'Жақшаны ашыңыз, x-ті бір жаққа жинаңыз.', explanation: '6x + 2 = 4x + 10 → 2x = 8 → x = 4.' },
    ],
    test: [
      { id: 'kk-math-lin-t1', text: '7x − 3 = 4x + 9 теңдеуінің шешімі:', options: ['4', '3', '2', '6'], correctAnswer: 0, explanation: '3x = 12, x = 4.' },
      { id: 'kk-math-lin-t2', text: 'x + y = 8 және 2x − y = 7 жүйесінің шешімінде x =', options: ['5', '3', '4', '6'], correctAnswer: 0, explanation: 'Қосамыз: 3x = 15, x = 5.' },
      { id: 'kk-math-lin-t3', text: '(x − 3)/2 = 5 теңдеуінің шешімі:', options: ['13', '10', '7', '8'], correctAnswer: 0, explanation: 'x − 3 = 10, x = 13.' },
      { id: 'kk-math-lin-t4', text: '4(x + 2) − 3(x − 1) = 15 теңдеуін шешіңіз:', options: ['4', '6', '8', '2'], correctAnswer: 0, explanation: '4x + 8 − 3x + 3 = 15 → x + 11 = 15 → x = 4.' },
      { id: 'kk-math-lin-t5', text: '|2x − 6| = 0 теңдеуінің шешімі:', options: ['3', '−3', '0', '6'], correctAnswer: 0, explanation: '2x − 6 = 0, x = 3.' },
    ],
  },

  // ── 2. Квадрат теңдеулер ───────────────────────────────────────────────────
  {
    subject: 'math',
    topic: 'Квадрат теңдеулер',
    level: 'beginner',
    language: 'kk',
    theory: {
      title: 'Квадрат теңдеулер',
      sections: [
        {
          heading: 'Квадрат теңдеу түрі',
          content: 'Квадрат теңдеу — ax² + bx + c = 0 түрінде жазылатын теңдеу, мұндағы a ≠ 0. Дискриминант D = b² − 4ac формуласымен есептеледі. D > 0 болса, екі түбір; D = 0 болса, бір түбір; D < 0 болса, нақты түбір жоқ.',
        },
        {
          heading: 'Виет теоремасы',
          content: 'x² + px + q = 0 теңдеуі үшін: x₁ + x₂ = −p, x₁ · x₂ = q. Виет теоремасы квадрат теңдеуді ауызша шешуге мүмкіндік береді.',
        },
        {
          heading: 'Түбірлер формуласы',
          content: 'ax² + bx + c = 0 теңдеуінің түбірлері: x = (−b ± √D) / (2a), мұндағы D = b² − 4ac.',
        },
      ],
      keyPoints: [
        'D = b² − 4ac — дискриминант',
        'D > 0: екі нақты түбір',
        'D = 0: бір түбір (қайталанатын)',
        'D < 0: нақты түбір жоқ',
        'Виет: x₁ + x₂ = −b/a, x₁ · x₂ = c/a',
      ],
      formulas: [
        'ax² + bx + c = 0',
        'D = b² − 4ac',
        'x = (−b ± √D) / (2a)',
      ],
    },
    practice: [
      { id: 'kk-math-quad-p1', text: 'x² − 5x + 6 = 0 теңдеуін шешіңіз', options: ['x = 2, x = 3', 'x = −2, x = −3', 'x = 1, x = 6', 'x = −1, x = 6'], correctAnswer: 0, hint: 'Виет теоремасы: қосындысы 5, көбейтіндісі 6 болатын сандарды табыңыз.', explanation: 'D = 25 − 24 = 1; x = (5 ± 1)/2 → x₁ = 3, x₂ = 2.' },
      { id: 'kk-math-quad-p2', text: '2x² + 3x − 5 = 0 теңдеуінің дискриминанты:', options: ['49', '19', '−31', '1'], correctAnswer: 0, hint: 'D = b² − 4ac формуласын қолданыңыз.', explanation: 'D = 9 − 4·2·(−5) = 9 + 40 = 49.' },
      { id: 'kk-math-quad-p3', text: 'x² − 7x + 10 = 0 теңдеуінің түбірлерінің қосындысы:', options: ['7', '10', '−7', '3'], correctAnswer: 0, hint: 'Виет теоремасы бойынша: x₁ + x₂ = −(−7)/1 = 7.', explanation: 'Виет теоремасы: x₁ + x₂ = 7.' },
      { id: 'kk-math-quad-p4', text: 'x² + 4x + 4 = 0 теңдеуінің неше түбірі бар?', options: ['1 (қайталанатын)', '2', '0', '3'], correctAnswer: 0, hint: 'D-ні есептеп, таңбасын анықтаңыз.', explanation: 'D = 16 − 16 = 0 → бір қайталанатын түбір x = −2.' },
      { id: 'kk-math-quad-p5', text: 'x² − 9 = 0 теңдеуін шешіңіз', options: ['x = 3, x = −3', 'x = 9, x = −9', 'x = 3', 'x = 81'], correctAnswer: 0, hint: 'Квадраттар айырмасы формуласын қолданыңыз.', explanation: 'x² = 9 → x = ±3.' },
    ],
    test: [
      { id: 'kk-math-quad-t1', text: '3x² − 12 = 0 теңдеуін шешіңіз:', options: ['x = ±2', 'x = ±4', 'x = 2', 'x = ±6'], correctAnswer: 0, explanation: '3x² = 12, x² = 4, x = ±2.' },
      { id: 'kk-math-quad-t2', text: 'x² + 2x − 15 = 0 теңдеуінің түбірлерінің көбейтіндісі:', options: ['−15', '15', '2', '−2'], correctAnswer: 0, explanation: 'Виет: x₁ · x₂ = c/a = −15.' },
      { id: 'kk-math-quad-t3', text: 'x² − 6x + 9 = 0 теңдеуінің шешімі:', options: ['x = 3', 'x = −3', 'x = ±3', 'шешім жоқ'], correctAnswer: 0, explanation: 'D = 0, x = 3.' },
      { id: 'kk-math-quad-t4', text: 'x² + 1 = 0 теңдеуінің нақты түбірлер саны:', options: ['0', '1', '2', '∞'], correctAnswer: 0, explanation: 'D = −4 < 0, нақты түбір жоқ.' },
      { id: 'kk-math-quad-t5', text: '2x² − 8x = 0 теңдеуін шешіңіз:', options: ['x = 0, x = 4', 'x = 4', 'x = 0', 'x = ±4'], correctAnswer: 0, explanation: '2x(x − 4) = 0 → x = 0 немесе x = 4.' },
    ],
  },

  // ── 3. Теңсіздіктер ───────────────────────────────────────────────────────
  {
    subject: 'math',
    topic: 'Теңсіздіктер',
    level: 'intermediate',
    language: 'kk',
    theory: {
      title: 'Теңсіздіктер',
      sections: [
        {
          heading: 'Сызықтық теңсіздіктер',
          content: 'Сызықтық теңсіздік — ax + b > 0 (немесе <, ≥, ≤) түрінде жазылады. Шешу ережесі: теңдеумен бірдей, бірақ теріс санға көбейткенде/бөлгенде таңба қарама-қарсыға ауысады.',
        },
        {
          heading: 'Квадрат теңсіздіктер',
          content: 'ax² + bx + c > 0 түріндегі теңсіздік: алдымен ax² + bx + c = 0 теңдеуін шешіп, түбірлер мен a-ның таңбасы бойынша парабола әдісімен аралықтарды анықтаймыз.',
        },
      ],
      keyPoints: [
        'Теріс санға көбейткенде теңсіздік таңбасы ауысады',
        'Квадрат теңсіздіктерде парабола әдісі қолданылады',
        'Аралықтар әдісі — көпмүшелі теңсіздіктер үшін',
      ],
    },
    practice: [
      { id: 'kk-math-ineq-p1', text: '2x − 3 > 5 теңсіздігін шешіңіз', options: ['x > 4', 'x > 1', 'x < 4', 'x > 8'], correctAnswer: 0, hint: '2x > 8, содан кейін екі жағын 2-ге бөліңіз.', explanation: '2x > 8 → x > 4.' },
      { id: 'kk-math-ineq-p2', text: '−3x + 6 ≤ 0 теңсіздігін шешіңіз', options: ['x ≥ 2', 'x ≤ 2', 'x ≥ −2', 'x ≤ −2'], correctAnswer: 0, hint: 'Теріс санға бөлгенде таңба ауысады!', explanation: '−3x ≤ −6 → x ≥ 2.' },
      { id: 'kk-math-ineq-p3', text: 'x² − 4 < 0 теңсіздігін шешіңіз', options: ['−2 < x < 2', 'x < −2 немесе x > 2', 'x < 2', 'x > −2'], correctAnswer: 0, hint: 'x² < 4 → −2 < x < 2.', explanation: '(x−2)(x+2) < 0 → −2 < x < 2.' },
      { id: 'kk-math-ineq-p4', text: '5 − x ≥ 1 теңсіздігінің шешімі:', options: ['x ≤ 4', 'x ≥ 4', 'x ≤ −4', 'x ≥ −4'], correctAnswer: 0, hint: 'x-ті бір жаққа, сандарды екінші жаққа көшіріңіз.', explanation: '−x ≥ −4 → x ≤ 4.' },
      { id: 'kk-math-ineq-p5', text: '|x| < 3 теңсіздігін шешіңіз', options: ['−3 < x < 3', 'x < 3', 'x > −3', 'x < −3 немесе x > 3'], correctAnswer: 0, hint: 'Модуль теңсіздігі: |x| < a ⟺ −a < x < a.', explanation: '|x| < 3 → −3 < x < 3.' },
    ],
    test: [
      { id: 'kk-math-ineq-t1', text: '3x + 2 > 14 теңсіздігінің шешімі:', options: ['x > 4', 'x > 5.3', 'x < 4', 'x > 16'], correctAnswer: 0, explanation: '3x > 12, x > 4.' },
      { id: 'kk-math-ineq-t2', text: 'x² − 9 > 0 теңсіздігінің шешімі:', options: ['x < −3 немесе x > 3', '−3 < x < 3', 'x > 3', 'x > 9'], correctAnswer: 0, explanation: '(x−3)(x+3) > 0 → x ∈ (−∞;−3) ∪ (3;+∞).' },
      { id: 'kk-math-ineq-t3', text: '−2x ≥ 10 теңсіздігін шешіңіз:', options: ['x ≤ −5', 'x ≥ −5', 'x ≤ 5', 'x ≥ 5'], correctAnswer: 0, explanation: 'x ≤ −5 (теріс санға бөлгенде таңба ауысады).' },
      { id: 'kk-math-ineq-t4', text: '|x − 2| ≤ 5 теңсіздігінің шешімі:', options: ['−3 ≤ x ≤ 7', 'x ≤ 7', 'x ≥ −3', '−5 ≤ x ≤ 5'], correctAnswer: 0, explanation: '−5 ≤ x − 2 ≤ 5 → −3 ≤ x ≤ 7.' },
    ],
  },

  // ── 4. Тригонометрия ──────────────────────────────────────────────────────
  {
    subject: 'math',
    topic: 'Тригонометрия',
    level: 'intermediate',
    language: 'kk',
    theory: {
      title: 'Тригонометрия',
      sections: [
        {
          heading: 'Тригонометриялық функциялар',
          content: 'sin, cos, tg, ctg — тікбұрышты үшбұрыштағы қабырғалардың қатынастары. sin α = қарсы катет / гипотенуза, cos α = жанасу катет / гипотенуза, tg α = sin α / cos α.',
        },
        {
          heading: 'Негізгі тригонометриялық тепе-теңдік',
          content: 'sin²α + cos²α = 1 — негізгі тригонометриялық тепе-теңдік. Одан: sin²α = 1 − cos²α, cos²α = 1 − sin²α.',
        },
      ],
      keyPoints: [
        'sin 30° = 1/2, cos 30° = √3/2',
        'sin 45° = √2/2, cos 45° = √2/2',
        'sin 60° = √3/2, cos 60° = 1/2',
        'sin 90° = 1, cos 90° = 0',
        'sin²α + cos²α = 1',
      ],
      formulas: [
        'sin²α + cos²α = 1',
        'tg α = sin α / cos α',
        'sin 2α = 2 sin α cos α',
        'cos 2α = cos²α − sin²α',
      ],
    },
    practice: [
      { id: 'kk-math-trig-p1', text: 'sin 30° мәні:', options: ['0.5', '1', '√3/2', '√2/2'], correctAnswer: 0, hint: 'Стандарт бұрыштардың кестесін еске түсіріңіз.', explanation: 'sin 30° = 1/2 = 0.5.' },
      { id: 'kk-math-trig-p2', text: 'cos 60° мәні:', options: ['0.5', '1', '√3/2', '0'], correctAnswer: 0, hint: 'cos 60° = sin 30°.', explanation: 'cos 60° = 1/2 = 0.5.' },
      { id: 'kk-math-trig-p3', text: 'sin²45° + cos²45° =', options: ['1', '0', '2', '0.5'], correctAnswer: 0, hint: 'Негізгі тригонометриялық тепе-теңдікті қолданыңыз.', explanation: 'sin²α + cos²α = 1 кез келген α үшін.' },
      { id: 'kk-math-trig-p4', text: 'tg 45° мәні:', options: ['1', '0', '√2', '∞'], correctAnswer: 0, hint: 'tg 45° = sin 45° / cos 45°.', explanation: 'tg 45° = (√2/2) / (√2/2) = 1.' },
      { id: 'kk-math-trig-p5', text: 'sin 0° + cos 0° =', options: ['1', '0', '2', '−1'], correctAnswer: 0, hint: 'sin 0° = 0, cos 0° = 1.', explanation: '0 + 1 = 1.' },
    ],
    test: [
      { id: 'kk-math-trig-t1', text: 'sin 90° мәні:', options: ['1', '0', '−1', '0.5'], correctAnswer: 0, explanation: 'sin 90° = 1.' },
      { id: 'kk-math-trig-t2', text: 'cos 0° мәні:', options: ['1', '0', '−1', '0.5'], correctAnswer: 0, explanation: 'cos 0° = 1.' },
      { id: 'kk-math-trig-t3', text: 'sin 150° мәні:', options: ['0.5', '−0.5', '√3/2', '−√3/2'], correctAnswer: 0, explanation: 'sin 150° = sin(180° − 30°) = sin 30° = 0.5.' },
      { id: 'kk-math-trig-t4', text: '2sin30°·cos30° мәні (қос бұрыш формуласы):', options: ['√3/2', '1/2', '1', '√2/2'], correctAnswer: 0, explanation: '2sin30°cos30° = sin60° = √3/2.' },
    ],
  },

  // ── 5. Дәрежелер мен логарифмдер ──────────────────────────────────────────
  {
    subject: 'math',
    topic: 'Дәрежелер мен логарифмдер',
    level: 'advanced',
    language: 'kk',
    theory: {
      title: 'Дәрежелер мен логарифмдер',
      sections: [
        {
          heading: 'Дәреже қасиеттері',
          content: 'aⁿ · aᵐ = aⁿ⁺ᵐ; aⁿ / aᵐ = aⁿ⁻ᵐ; (aⁿ)ᵐ = aⁿᵐ; a⁰ = 1 (a ≠ 0); a⁻ⁿ = 1/aⁿ. Бұл қасиеттер дәрежелі өрнектерді жеңілдетуде қолданылады.',
        },
        {
          heading: 'Логарифм',
          content: 'log_a(b) = c  ⟺  aᶜ = b. Логарифм — дәрежеге кері амал. Қасиеттері: log(ab) = log a + log b; log(a/b) = log a − log b; log(aⁿ) = n·log a.',
        },
      ],
      keyPoints: [
        'aⁿ · aᵐ = aⁿ⁺ᵐ',
        'log_a(b) = c ⟺ aᶜ = b',
        'log₂8 = 3 (себебі 2³ = 8)',
        'ln — натурал логарифм (негізі e)',
        'lg — ондық логарифм (негізі 10)',
      ],
      formulas: [
        'aⁿ · aᵐ = aⁿ⁺ᵐ',
        'log_a(bc) = log_a(b) + log_a(c)',
        'log_a(bⁿ) = n · log_a(b)',
      ],
    },
    practice: [
      { id: 'kk-math-log-p1', text: '2³ × 2⁴ =', options: ['2⁷', '2¹²', '4⁷', '2¹'], correctAnswer: 0, hint: 'Негіздері бірдей дәрежелерді қосыңыз.', explanation: '2³⁺⁴ = 2⁷ = 128.' },
      { id: 'kk-math-log-p2', text: 'log₂ 8 =', options: ['3', '2', '4', '8'], correctAnswer: 0, hint: '2 санының қандай дәрежесі 8-ге тең?', explanation: '2³ = 8, демек log₂ 8 = 3.' },
      { id: 'kk-math-log-p3', text: 'log₁₀ 1000 =', options: ['3', '10', '100', '30'], correctAnswer: 0, hint: '10³ = 1000.', explanation: 'lg 1000 = 3.' },
      { id: 'kk-math-log-p4', text: '5⁰ =', options: ['1', '0', '5', 'анықталмаған'], correctAnswer: 0, hint: 'Кез келген санның нөлінші дәрежесі...', explanation: 'a⁰ = 1 (a ≠ 0 болғанда).' },
      { id: 'kk-math-log-p5', text: '3⁻² =', options: ['1/9', '−9', '−6', '9'], correctAnswer: 0, hint: 'a⁻ⁿ = 1/aⁿ.', explanation: '3⁻² = 1/3² = 1/9.' },
    ],
    test: [
      { id: 'kk-math-log-t1', text: 'log₃ 27 =', options: ['3', '9', '2', '27'], correctAnswer: 0, explanation: '3³ = 27.' },
      { id: 'kk-math-log-t2', text: 'log₂ 32 =', options: ['5', '4', '6', '16'], correctAnswer: 0, explanation: '2⁵ = 32.' },
      { id: 'kk-math-log-t3', text: '(2³)² =', options: ['64', '32', '12', '8'], correctAnswer: 0, explanation: '(2³)² = 2⁶ = 64.' },
      { id: 'kk-math-log-t4', text: 'log₅ 1 =', options: ['0', '1', '5', '−1'], correctAnswer: 0, explanation: 'log_a(1) = 0, себебі a⁰ = 1.' },
    ],
  },

  // ── 6. Геометрия ──────────────────────────────────────────────────────────
  {
    subject: 'math',
    topic: 'Геометрия',
    level: 'intermediate',
    language: 'kk',
    theory: {
      title: 'Планиметрия негіздері',
      sections: [
        {
          heading: 'Үшбұрыш',
          content: 'Үшбұрыштың ауданы S = ½ah, мұндағы a — табан, h — биіктік. Пифагор теоремасы: тікбұрышты үшбұрышта c² = a² + b², мұндағы c — гипотенуза.',
        },
        {
          heading: 'Шеңбер',
          content: 'Шеңбердің ұзындығы C = 2πr. Дөңгелектің ауданы S = πr². π ≈ 3.14159.',
        },
      ],
      keyPoints: [
        'Үшбұрыш ауданы: S = ½ah',
        'Пифагор теоремасы: c² = a² + b²',
        'Шеңбер ұзындығы: C = 2πr',
        'Дөңгелек ауданы: S = πr²',
      ],
      formulas: [
        'S△ = ½ · a · h',
        'c² = a² + b²',
        'C = 2πr, S = πr²',
      ],
    },
    practice: [
      { id: 'kk-math-geom-p1', text: 'Табаны 10, биіктігі 6 болатын үшбұрыштың ауданы:', options: ['30', '60', '16', '80'], correctAnswer: 0, hint: 'S = ½ · a · h.', explanation: 'S = ½ × 10 × 6 = 30.' },
      { id: 'kk-math-geom-p2', text: 'Катеттері 3 және 4 болатын тікбұрышты үшбұрыштың гипотенузасы:', options: ['5', '7', '6', '√7'], correctAnswer: 0, hint: 'Пифагор теоремасы: c² = a² + b².', explanation: 'c² = 9 + 16 = 25, c = 5.' },
      { id: 'kk-math-geom-p3', text: 'Радиусы 7 болатын шеңбердің ұзындығы (π ≈ 22/7):', options: ['44', '154', '22', '49'], correctAnswer: 0, hint: 'C = 2πr.', explanation: 'C = 2 × 22/7 × 7 = 44.' },
      { id: 'kk-math-geom-p4', text: 'Қабырғасы 6 см квадраттың ауданы:', options: ['36 см²', '24 см²', '12 см²', '18 см²'], correctAnswer: 0, hint: 'S = a².', explanation: 'S = 6² = 36 см².' },
      { id: 'kk-math-geom-p5', text: 'Тікбұрышты үшбұрыштың бұрыштарының қосындысы:', options: ['180°', '360°', '90°', '270°'], correctAnswer: 0, hint: 'Кез келген үшбұрыштың бұрыштарының қосындысы бірдей.', explanation: 'Кез келген үшбұрыштағы бұрыштар қосындысы = 180°.' },
    ],
    test: [
      { id: 'kk-math-geom-t1', text: 'Радиусы 5 см дөңгелектің ауданы (π ≈ 3.14):', options: ['78.5 см²', '31.4 см²', '25 см²', '15.7 см²'], correctAnswer: 0, explanation: 'S = πr² = 3.14 × 25 = 78.5.' },
      { id: 'kk-math-geom-t2', text: 'Катеттері 5 және 12: гипотенуза =', options: ['13', '17', '7', '60'], correctAnswer: 0, explanation: 'c² = 25 + 144 = 169, c = 13.' },
      { id: 'kk-math-geom-t3', text: 'Тік төртбұрыштың қабырғалары 8 және 5. Периметрі:', options: ['26', '40', '13', '80'], correctAnswer: 0, explanation: 'P = 2(a + b) = 2(8 + 5) = 26.' },
    ],
  },
]
