import type { TopicContent } from '@/types/curator'

// ── ҰБТ Физика — Қазақ тілінде ──────────────────────────────────────────────

export const physicsTopicsKk: TopicContent[] = [
  // ── 1. Кинематика ──────────────────────────────────────────────────────────
  {
    subject: 'physics',
    topic: 'Кинематика',
    level: 'beginner',
    language: 'kk',
    theory: {
      title: 'Кинематика — қозғалыс туралы ілім',
      sections: [
        { heading: 'Бірқалыпты қозғалыс', content: 'Бірқалыпты қозғалыс — жылдамдығы тұрақты қозғалыс. Жол формуласы: S = vt, мұндағы S — жол, v — жылдамдық, t — уақыт. Орташа жылдамдық: v = S/t.' },
        { heading: 'Бірқалыпты үдемелі қозғалыс', content: 'Үдеу — жылдамдықтың өзгеру жылдамдығы: a = (v − v₀)/t. Жол: S = v₀t + at²/2. Жылдамдық: v = v₀ + at.' },
        { heading: 'Еркін түсу', content: 'Ауырлық күшінің әсерінен болатын қозғалыс. Еркін түсу үдеуі g ≈ 9.8 м/с² ≈ 10 м/с². h = gt²/2, v = gt.' },
      ],
      keyPoints: ['S = vt — бірқалыпты қозғалыс', 'a = (v − v₀)/t — үдеу', 'S = v₀t + at²/2 — үдемелі қозғалыс жолы', 'g ≈ 10 м/с² — еркін түсу үдеуі'],
      formulas: ['S = vt', 'v = v₀ + at', 'S = v₀t + at²/2', 'v² = v₀² + 2aS'],
    },
    practice: [
      { id: 'kk-phys-kin-p1', text: 'Дене 100 м жолды 10 с-та жүрді. Орташа жылдамдығы:', options: ['10 м/с', '100 м/с', '1 м/с', '1000 м/с'], correctAnswer: 0, hint: 'v = S/t', explanation: 'v = 100/10 = 10 м/с.' },
      { id: 'kk-phys-kin-p2', text: 'Бастапқы жылдамдығы 0, үдеуі 2 м/с². 5 с кейінгі жылдамдығы:', options: ['10 м/с', '5 м/с', '25 м/с', '7 м/с'], correctAnswer: 0, hint: 'v = v₀ + at.', explanation: 'v = 0 + 2 × 5 = 10 м/с.' },
      { id: 'kk-phys-kin-p3', text: 'Дене 3 с ішінде еркін түседі (g = 10 м/с²). Биіктігі:', options: ['45 м', '30 м', '15 м', '90 м'], correctAnswer: 0, hint: 'h = gt²/2.', explanation: 'h = 10 × 9/2 = 45 м.' },
      { id: 'kk-phys-kin-p4', text: 'Автокөлік 20 м/с жылдамдықпен 4 с жүрді. Жүрген жолы:', options: ['80 м', '5 м', '24 м', '160 м'], correctAnswer: 0, hint: 'S = vt.', explanation: 'S = 20 × 4 = 80 м.' },
      { id: 'kk-phys-kin-p5', text: 'Бастапқы жылдамдығы 0, үдеуі a. Жүрілген жол формуласы:', options: ['S = at²/2', 'S = v₀t', 'S = vt', 'S = v²/2a'], correctAnswer: 0, hint: 'v₀ = 0 болғанда.', explanation: 'S = v₀t + at²/2 = at²/2 (v₀ = 0 болғанда).' },
    ],
    test: [
      { id: 'kk-phys-kin-t1', text: 'Дене 2 с ішінде жылдамдығын 0-ден 20 м/с-қа дейін арттырды. Үдеуі:', options: ['10 м/с²', '20 м/с²', '40 м/с²', '5 м/с²'], correctAnswer: 0, explanation: 'a = (20 − 0)/2 = 10 м/с².' },
      { id: 'kk-phys-kin-t2', text: 'Еркін түскен дене 2 с ішіндегі жылдамдығы (g = 10):', options: ['20 м/с', '10 м/с', '40 м/с', '5 м/с'], correctAnswer: 0, explanation: 'v = gt = 10 × 2 = 20 м/с.' },
      { id: 'kk-phys-kin-t3', text: '60 км/сағ жылдамдық м/с-пен:', options: ['16.7 м/с', '60 м/с', '360 м/с', '1 м/с'], correctAnswer: 0, explanation: '60/3.6 ≈ 16.7 м/с.' },
    ],
  },

  // ── 2. Динамика ────────────────────────────────────────────────────────────
  {
    subject: 'physics',
    topic: 'Динамика',
    level: 'beginner',
    language: 'kk',
    theory: {
      title: 'Ньютон заңдары',
      sections: [
        { heading: 'Бірінші заң (инерция)', content: 'Денеге басқа денелер әсер етпесе немесе әсер ететін күштер теңгерілсе, дене тыныштық күйін немесе бірқалыпты түзу сызықты қозғалысын сақтайды.' },
        { heading: 'Екінші заң', content: 'F = ma — күш массаға және үдеуге тең. Үдеу күшке тура пропорционал, массаға кері пропорционал.' },
        { heading: 'Үшінші заң', content: 'Әрекет күші қарсы әрекет күшіне шамасы бойынша тең, бағыты қарама-қарсы: F₁ = −F₂.' },
      ],
      keyPoints: ['F = ma — Ньютонның екінші заңы', '1 Н = 1 кг·м/с²', 'Ауырлық күші: F = mg', 'Үйкеліс күші: F = μN'],
      formulas: ['F = ma', 'F = mg', 'F = μN'],
    },
    practice: [
      { id: 'kk-phys-dyn-p1', text: 'Массасы 5 кг, үдеуі 2 м/с² дене. Күші:', options: ['10 Н', '2.5 Н', '7 Н', '25 Н'], correctAnswer: 0, hint: 'F = ma.', explanation: 'F = 5 × 2 = 10 Н.' },
      { id: 'kk-phys-dyn-p2', text: 'Ньютонның екінші заңы:', options: ['F = ma', 'F = mv', 'F = mg', 'F = mgh'], correctAnswer: 0, hint: 'Динамиканың негізгі заңы.', explanation: 'F = ma — Ньютонның екінші заңы.' },
      { id: 'kk-phys-dyn-p3', text: 'Массасы 3 кг дененің ауырлық күші (g = 10 м/с²):', options: ['30 Н', '3 Н', '0.3 Н', '300 Н'], correctAnswer: 0, hint: 'F = mg.', explanation: 'F = 3 × 10 = 30 Н.' },
      { id: 'kk-phys-dyn-p4', text: '20 Н күш 4 кг денеге қандай үдеу береді?', options: ['5 м/с²', '80 м/с²', '24 м/с²', '16 м/с²'], correctAnswer: 0, hint: 'a = F/m.', explanation: 'a = 20/4 = 5 м/с².' },
      { id: 'kk-phys-dyn-p5', text: 'Ньютонның үшінші заңы бойынша:', options: ['Әрекет = Қарсы әрекет', 'F = ma', 'Инерция заңы', 'E = mc²'], correctAnswer: 0, hint: 'Күштер жұбы.', explanation: 'Әрекет күші = Қарсы әрекет күшіне тең, бағыты қарама-қарсы.' },
    ],
    test: [
      { id: 'kk-phys-dyn-t1', text: '60 Н күш әсерінен дене 3 м/с² үдеумен қозғалды. Массасы:', options: ['20 кг', '180 кг', '63 кг', '57 кг'], correctAnswer: 0, explanation: 'm = F/a = 60/3 = 20 кг.' },
      { id: 'kk-phys-dyn-t2', text: 'Массасы 70 кг адамның салмағы (g = 10):', options: ['700 Н', '70 Н', '7 Н', '7000 Н'], correctAnswer: 0, explanation: 'P = mg = 70 × 10 = 700 Н.' },
      { id: 'kk-phys-dyn-t3', text: 'Инерция заңы — бұл Ньютонның:', options: ['Бірінші заңы', 'Екінші заңы', 'Үшінші заңы', 'Тартылыс заңы'], correctAnswer: 0, explanation: 'Инерция заңы — Ньютонның бірінші заңы.' },
    ],
  },

  // ── 3. Энергия ─────────────────────────────────────────────────────────────
  {
    subject: 'physics',
    topic: 'Энергия',
    level: 'intermediate',
    language: 'kk',
    theory: {
      title: 'Механикалық энергия',
      sections: [
        { heading: 'Кинетикалық энергия', content: 'Қозғалыстағы дененің энергиясы: Eк = mv²/2. Жұмыс — күштің әсерінен энергияның өзгеруі: A = Fs·cos α.' },
        { heading: 'Потенциалдық энергия', content: 'Көтерілген дененің энергиясы: Eп = mgh. Серіппенің потенциалдық энергиясы: Eп = kx²/2.' },
        { heading: 'Энергияның сақталу заңы', content: 'Тұйық жүйеде толық механикалық энергия тұрақты: Eк + Eп = const. Дене түскенде Eп азайып, Eк артады.' },
      ],
      keyPoints: ['Eк = mv²/2 — кинетикалық энергия', 'Eп = mgh — потенциалдық энергия', 'A = Fs — жұмыс', 'Eк + Eп = const — сақталу заңы'],
      formulas: ['Eк = mv²/2', 'Eп = mgh', 'A = Fs·cos α', 'P = A/t (қуат)'],
    },
    practice: [
      { id: 'kk-phys-en-p1', text: 'Массасы 2 кг, жылдамдығы 3 м/с дененің кинетикалық энергиясы:', options: ['9 Дж', '6 Дж', '3 Дж', '18 Дж'], correctAnswer: 0, hint: 'Eк = mv²/2.', explanation: 'Eк = 2 × 9/2 = 9 Дж.' },
      { id: 'kk-phys-en-p2', text: 'Массасы 3 кг, 10 м биіктікте дененің потенциалдық энергиясы (g = 10):', options: ['300 Дж', '30 Дж', '33 Дж', '100 Дж'], correctAnswer: 0, hint: 'Eп = mgh.', explanation: 'Eп = 3 × 10 × 10 = 300 Дж.' },
      { id: 'kk-phys-en-p3', text: '50 Н күшпен 10 м жол бойынша жасалған жұмыс:', options: ['500 Дж', '5 Дж', '60 Дж', '0.2 Дж'], correctAnswer: 0, hint: 'A = Fs.', explanation: 'A = 50 × 10 = 500 Дж.' },
      { id: 'kk-phys-en-p4', text: 'Қуат P = 100 Вт. 5 с ішінде жасалған жұмыс:', options: ['500 Дж', '20 Дж', '105 Дж', '0.05 Дж'], correctAnswer: 0, hint: 'P = A/t → A = Pt.', explanation: 'A = 100 × 5 = 500 Дж.' },
      { id: 'kk-phys-en-p5', text: 'Дене 20 м биіктіктен еркін түсті. Жерге жеткендегі жылдамдығы (g = 10):', options: ['20 м/с', '10 м/с', '200 м/с', '14 м/с'], correctAnswer: 0, hint: 'mgh = mv²/2 → v = √(2gh).', explanation: 'v = √(2×10×20) = √400 = 20 м/с.' },
    ],
    test: [
      { id: 'kk-phys-en-t1', text: 'Eп = 200 Дж. Жерге жеткенде Eк =', options: ['200 Дж', '0', '400 Дж', '100 Дж'], correctAnswer: 0, explanation: 'Энергия сақталу заңы: Eп = Eк (жерде).' },
      { id: 'kk-phys-en-t2', text: '1 кВт·сағ = ... Дж', options: ['3 600 000', '1000', '3600', '360'], correctAnswer: 0, explanation: '1 кВт·сағ = 1000 × 3600 = 3 600 000 Дж.' },
      { id: 'kk-phys-en-t3', text: 'Серіппенің қатаңдығы k = 100 Н/м, сығылуы 0.2 м. Энергиясы:', options: ['2 Дж', '20 Дж', '10 Дж', '0.2 Дж'], correctAnswer: 0, explanation: 'Eп = kx²/2 = 100 × 0.04/2 = 2 Дж.' },
    ],
  },

  // ── 4. Электр тогы ─────────────────────────────────────────────────────────
  {
    subject: 'physics',
    topic: 'Электр тогы',
    level: 'intermediate',
    language: 'kk',
    theory: {
      title: 'Тұрақты электр тогы',
      sections: [
        { heading: 'Ом заңы', content: 'Тізбек бөлігі үшін Ом заңы: I = U/R. Ток күші (I) — кернеуге (U) тура пропорционал, кедергіге (R) кері пропорционал. Өлшем бірліктері: I — Ампер, U — Вольт, R — Ом.' },
        { heading: 'Тізбекті және параллель қосу', content: 'Тізбекті: R = R₁ + R₂, I бірдей, U = U₁ + U₂. Параллель: 1/R = 1/R₁ + 1/R₂, U бірдей, I = I₁ + I₂.' },
      ],
      keyPoints: ['I = U/R — Ом заңы', 'P = UI — қуат', 'Тізбекті: R = R₁ + R₂', 'Параллель: 1/R = 1/R₁ + 1/R₂'],
      formulas: ['I = U/R', 'R = ρl/S', 'P = UI = I²R', 'Q = I²Rt'],
    },
    practice: [
      { id: 'kk-phys-el-p1', text: 'Кернеу 12 В, кедергі 4 Ом. Ток күші:', options: ['3 А', '48 А', '16 А', '8 А'], correctAnswer: 0, hint: 'I = U/R.', explanation: 'I = 12/4 = 3 А.' },
      { id: 'kk-phys-el-p2', text: 'R₁ = 3 Ом, R₂ = 6 Ом тізбекті қосылды. Жалпы кедергі:', options: ['9 Ом', '2 Ом', '18 Ом', '3 Ом'], correctAnswer: 0, hint: 'Тізбекті: R = R₁ + R₂.', explanation: 'R = 3 + 6 = 9 Ом.' },
      { id: 'kk-phys-el-p3', text: 'R₁ = 3 Ом, R₂ = 6 Ом параллель қосылды. Жалпы кедергі:', options: ['2 Ом', '9 Ом', '4.5 Ом', '18 Ом'], correctAnswer: 0, hint: '1/R = 1/R₁ + 1/R₂.', explanation: '1/R = 1/3 + 1/6 = 3/6 = 1/2, R = 2 Ом.' },
      { id: 'kk-phys-el-p4', text: 'I = 2 А, U = 10 В. Электр қуаты:', options: ['20 Вт', '5 Вт', '12 Вт', '0.2 Вт'], correctAnswer: 0, hint: 'P = UI.', explanation: 'P = 10 × 2 = 20 Вт.' },
      { id: 'kk-phys-el-p5', text: 'Ом заңы бойынша:', options: ['I = U/R', 'U = IR²', 'R = IU', 'P = U/I'], correctAnswer: 0, hint: 'Электр тогының негізгі заңы.', explanation: 'I = U/R — Ом заңы.' },
    ],
    test: [
      { id: 'kk-phys-el-t1', text: 'I = 5 А, R = 10 Ом. Кернеу:', options: ['50 В', '2 В', '15 В', '0.5 В'], correctAnswer: 0, explanation: 'U = IR = 5 × 10 = 50 В.' },
      { id: 'kk-phys-el-t2', text: 'Джоуль-Ленц заңы:', options: ['Q = I²Rt', 'Q = cmΔT', 'Q = λm', 'Q = Lm'], correctAnswer: 0, explanation: 'Q = I²Rt — Джоуль-Ленц заңы.' },
      { id: 'kk-phys-el-t3', text: '100 Вт шам 2 сағат жанды. Жұмсалған энергия:', options: ['200 Вт·сағ', '50 Вт·сағ', '102 Вт·сағ', '0.02 Вт·сағ'], correctAnswer: 0, explanation: 'E = Pt = 100 × 2 = 200 Вт·сағ.' },
    ],
  },
]
