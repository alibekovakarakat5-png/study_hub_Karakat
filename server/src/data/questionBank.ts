// ── Server-side Question Bank ─────────────────────────────────────────────────
//
// Provides questions indexed by subject + topic for smart assignment generation.
// This is a curated subset of questions; the frontend curator data is the source of truth.
// Questions use the same format as Assignment content: { questions: [...] }

export interface BankQuestion {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  hint?: string
  explanation?: string
  topic: string
  subject: string
  language?: 'ru' | 'kk' | 'en'  // default 'ru'
}

// ── Question Bank (subset — add more as content grows) ───────────────────────

const QUESTIONS: BankQuestion[] = [
  // ── Math ──────────────────────────────────────────────────────────────────
  { id: 'qb-math-1', subject: 'math', topic: 'Линейные уравнения', text: 'Решите уравнение: 3x − 7 = 2x + 5', options: ['12', '10', '−12', '2'], correctAnswer: 0, explanation: '3x − 2x = 5 + 7, x = 12' },
  { id: 'qb-math-2', subject: 'math', topic: 'Линейные уравнения', text: 'Решите уравнение: 5(x − 2) = 3(x + 4)', options: ['8', '11', '−1', '7'], correctAnswer: 1, explanation: '5x − 10 = 3x + 12 → 2x = 22 → x = 11' },
  { id: 'qb-math-3', subject: 'math', topic: 'Линейные уравнения', text: 'При каком a уравнение ax = 6 не имеет решений?', options: ['a = 6', 'a = 1', 'a = −1', 'a = 0'], correctAnswer: 3, explanation: 'При a = 0: 0·x = 6 — противоречие' },
  { id: 'qb-math-4', subject: 'math', topic: 'Квадратные уравнения', text: 'Решите: x² − 5x + 6 = 0', options: ['x = 2, x = 3', 'x = −2, x = −3', 'x = 1, x = 6', 'x = −1, x = 6'], correctAnswer: 0, explanation: 'D = 25 − 24 = 1; x = (5 ± 1)/2' },
  { id: 'qb-math-5', subject: 'math', topic: 'Квадратные уравнения', text: 'Дискриминант уравнения 2x² + 3x − 5 = 0 равен:', options: ['49', '19', '−31', '1'], correctAnswer: 0, explanation: 'D = 9 + 40 = 49' },
  { id: 'qb-math-6', subject: 'math', topic: 'Квадратные уравнения', text: 'Сумма корней уравнения x² − 7x + 10 = 0 равна:', options: ['7', '10', '−7', '3'], correctAnswer: 0, explanation: 'По теореме Виета: x₁ + x₂ = 7' },
  { id: 'qb-math-7', subject: 'math', topic: 'Неравенства', text: 'Решите неравенство: 2x − 3 > 5', options: ['x > 4', 'x > 1', 'x < 4', 'x > 8'], correctAnswer: 0, explanation: '2x > 8 → x > 4' },
  { id: 'qb-math-8', subject: 'math', topic: 'Неравенства', text: 'Решите неравенство: −3x + 6 ≤ 0', options: ['x ≥ 2', 'x ≤ 2', 'x ≥ −2', 'x ≤ −2'], correctAnswer: 0, explanation: '−3x ≤ −6 → x ≥ 2 (делим на −3, знак меняется)' },
  { id: 'qb-math-9', subject: 'math', topic: 'Функции и графики', text: 'Функция y = 2x + 3 пересекает ось OY в точке:', options: ['(0; 3)', '(3; 0)', '(0; 2)', '(−1.5; 0)'], correctAnswer: 0, explanation: 'При x = 0: y = 3' },
  { id: 'qb-math-10', subject: 'math', topic: 'Функции и графики', text: 'Угловой коэффициент прямой y = −4x + 1 равен:', options: ['−4', '4', '1', '−1'], correctAnswer: 0, explanation: 'k = −4 в формуле y = kx + b' },
  { id: 'qb-math-11', subject: 'math', topic: 'Тригонометрия', text: 'sin 30° равен:', options: ['0.5', '1', '√3/2', '√2/2'], correctAnswer: 0, explanation: 'sin 30° = 1/2 = 0.5' },
  { id: 'qb-math-12', subject: 'math', topic: 'Тригонометрия', text: 'cos 60° равен:', options: ['0.5', '1', '√3/2', '0'], correctAnswer: 0, explanation: 'cos 60° = 1/2 = 0.5' },
  { id: 'qb-math-13', subject: 'math', topic: 'Степени и логарифмы', text: '2³ × 2⁴ равно:', options: ['2⁷', '2¹²', '4⁷', '2¹'], correctAnswer: 0, explanation: '2³⁺⁴ = 2⁷ = 128' },
  { id: 'qb-math-14', subject: 'math', topic: 'Степени и логарифмы', text: 'log₂ 8 равен:', options: ['3', '2', '4', '8'], correctAnswer: 0, explanation: '2³ = 8, значит log₂ 8 = 3' },
  { id: 'qb-math-15', subject: 'math', topic: 'Геометрия', text: 'Площадь треугольника со сторонами основания 10 и высотой 6:', options: ['30', '60', '16', '80'], correctAnswer: 0, explanation: 'S = ½ × a × h = ½ × 10 × 6 = 30' },

  // ── Physics ───────────────────────────────────────────────────────────────
  { id: 'qb-phys-1', subject: 'physics', topic: 'Кинематика', text: 'Тело прошло 100 м за 10 с. Средняя скорость:', options: ['10 м/с', '100 м/с', '1 м/с', '1000 м/с'], correctAnswer: 0, explanation: 'v = S/t = 100/10 = 10 м/с' },
  { id: 'qb-phys-2', subject: 'physics', topic: 'Кинематика', text: 'Формула пути при равноускоренном движении без начальной скорости:', options: ['S = at²/2', 'S = v₀t', 'S = vt', 'S = v²/2a'], correctAnswer: 0, explanation: 'S = at²/2 при v₀ = 0' },
  { id: 'qb-phys-3', subject: 'physics', topic: 'Динамика', text: 'Второй закон Ньютона:', options: ['F = ma', 'F = mv', 'F = mg', 'F = mgh'], correctAnswer: 0, explanation: 'F = ma — основной закон динамики' },
  { id: 'qb-phys-4', subject: 'physics', topic: 'Динамика', text: 'Масса тела 5 кг, ускорение 2 м/с². Сила:', options: ['10 Н', '2.5 Н', '7 Н', '25 Н'], correctAnswer: 0, explanation: 'F = ma = 5 × 2 = 10 Н' },
  { id: 'qb-phys-5', subject: 'physics', topic: 'Энергия', text: 'Кинетическая энергия тела массой 2 кг при скорости 3 м/с:', options: ['9 Дж', '6 Дж', '3 Дж', '18 Дж'], correctAnswer: 0, explanation: 'Eк = mv²/2 = 2 × 9/2 = 9 Дж' },
  { id: 'qb-phys-6', subject: 'physics', topic: 'Энергия', text: 'Потенциальная энергия тела 3 кг на высоте 10 м (g = 10):', options: ['300 Дж', '30 Дж', '33 Дж', '100 Дж'], correctAnswer: 0, explanation: 'Ep = mgh = 3 × 10 × 10 = 300 Дж' },
  { id: 'qb-phys-7', subject: 'physics', topic: 'Электричество', text: 'Закон Ома для участка цепи:', options: ['I = U/R', 'U = IR²', 'R = IU', 'P = U/I'], correctAnswer: 0, explanation: 'I = U/R — закон Ома' },
  { id: 'qb-phys-8', subject: 'physics', topic: 'Электричество', text: 'Напряжение 12 В, сопротивление 4 Ом. Ток:', options: ['3 А', '48 А', '16 А', '8 А'], correctAnswer: 0, explanation: 'I = U/R = 12/4 = 3 А' },
  { id: 'qb-phys-9', subject: 'physics', topic: 'Термодинамика', text: 'Количество теплоты для нагрева воды (c = 4200 Дж/(кг·°C), m = 2 кг, ΔT = 10°C):', options: ['84000 Дж', '8400 Дж', '42000 Дж', '840 Дж'], correctAnswer: 0, explanation: 'Q = cmΔT = 4200 × 2 × 10 = 84000 Дж' },
  { id: 'qb-phys-10', subject: 'physics', topic: 'Оптика', text: 'Скорость света в вакууме:', options: ['3 × 10⁸ м/с', '3 × 10⁶ м/с', '3 × 10¹⁰ м/с', '3 × 10⁵ м/с'], correctAnswer: 0, explanation: 'c ≈ 3 × 10⁸ м/с' },

  // ── History of Kazakhstan ──────────────────────────────────────────────────
  { id: 'qb-hist-1', subject: 'history', topic: 'Древний Казахстан', text: 'Какое государство существовало на территории Казахстана в VI–VIII вв.?', options: ['Тюркский каганат', 'Золотая Орда', 'Казахское ханство', 'Монгольская империя'], correctAnswer: 0, explanation: 'Тюркский каганат (552–603 гг.)' },
  { id: 'qb-hist-2', subject: 'history', topic: 'Древний Казахстан', text: 'Сакские племена населяли территорию Казахстана в:', options: ['VII–IV вв. до н.э.', 'I–III вв. н.э.', 'X–XII вв.', 'XV–XVII вв.'], correctAnswer: 0, explanation: 'Саки — VII–IV вв. до н.э.' },
  { id: 'qb-hist-3', subject: 'history', topic: 'Казахское ханство', text: 'Основатели Казахского ханства:', options: ['Керей и Жанибек', 'Абылай и Тауке', 'Касым и Есим', 'Абулхаир и Барак'], correctAnswer: 0, explanation: 'Керей и Жанибек основали ханство в 1465 г.' },
  { id: 'qb-hist-4', subject: 'history', topic: 'Казахское ханство', text: 'В каком году образовалось Казахское ханство?', options: ['1465', '1520', '1370', '1610'], correctAnswer: 0, explanation: '1465 год — дата образования Казахского ханства' },
  { id: 'qb-hist-5', subject: 'history', topic: 'Присоединение к России', text: 'В каком году Младший жуз принял российское подданство?', options: ['1731', '1798', '1822', '1861'], correctAnswer: 0, explanation: '1731 год — хан Абулхаир принял подданство' },
  { id: 'qb-hist-6', subject: 'history', topic: 'Присоединение к России', text: 'Устав о Сибирских Киргизах 1822 года подготовил:', options: ['М.М. Сперанский', 'Николай I', 'А.С. Пушкин', 'О.А. Игельстром'], correctAnswer: 0, explanation: 'М.М. Сперанский разработал "Устав о сибирских киргизах"' },
  { id: 'qb-hist-7', subject: 'history', topic: 'Национально-освободительные движения', text: 'Восстание Кенесары Касымова проходило в:', options: ['1837–1847', '1783–1797', '1916', '1821–1824'], correctAnswer: 0, explanation: 'Восстание Кенесары — 1837–1847 гг.' },
  { id: 'qb-hist-8', subject: 'history', topic: 'Казахстан в XX веке', text: 'Партия «Алаш» была создана в:', options: ['1917', '1905', '1920', '1936'], correctAnswer: 0, explanation: 'Партия «Алаш» создана в 1917 году' },
  { id: 'qb-hist-9', subject: 'history', topic: 'Казахстан в XX веке', text: 'Декабрьские события 1986 года произошли в:', options: ['Алма-Ате', 'Караганде', 'Семипалатинске', 'Астане'], correctAnswer: 0, explanation: 'Декабрьские события — Алма-Ата, 1986 г.' },
  { id: 'qb-hist-10', subject: 'history', topic: 'Независимый Казахстан', text: 'Дата обретения независимости Казахстана:', options: ['16 декабря 1991', '1 декабря 1991', '25 октября 1990', '30 августа 1995'], correctAnswer: 0, explanation: '16 декабря 1991 года — День Независимости' },

  // ── Biology ───────────────────────────────────────────────────────────────
  { id: 'qb-bio-1', subject: 'biology', topic: 'Клетка', text: 'Основная функция митохондрий:', options: ['Синтез АТФ', 'Синтез белка', 'Хранение ДНК', 'Деление клетки'], correctAnswer: 0, explanation: 'Митохондрии — «энергетические станции» клетки' },
  { id: 'qb-bio-2', subject: 'biology', topic: 'Клетка', text: 'Какая органелла содержит ДНК в ядре клетки?', options: ['Хромосомы', 'Рибосомы', 'Лизосомы', 'Вакуоли'], correctAnswer: 0, explanation: 'ДНК организована в хромосомы' },
  { id: 'qb-bio-3', subject: 'biology', topic: 'Генетика', text: 'Сколько хромосом в соматической клетке человека?', options: ['46', '23', '48', '44'], correctAnswer: 0, explanation: '46 хромосом = 23 пары' },
  { id: 'qb-bio-4', subject: 'biology', topic: 'Генетика', text: 'Второй закон Менделя описывает:', options: ['Расщепление 3:1', 'Единообразие F1', 'Независимое наследование', 'Сцепленное наследование'], correctAnswer: 0, explanation: 'Закон расщепления — соотношение 3:1 в F2' },
  { id: 'qb-bio-5', subject: 'biology', topic: 'Эволюция', text: 'Автор теории эволюции путём естественного отбора:', options: ['Ч. Дарвин', 'К. Линней', 'Ж. Ламарк', 'Г. Мендель'], correctAnswer: 0, explanation: 'Чарльз Дарвин — основатель теории естественного отбора' },
  { id: 'qb-bio-6', subject: 'biology', topic: 'Ботаника', text: 'Фотосинтез происходит в:', options: ['Хлоропластах', 'Митохондриях', 'Ядре', 'Рибосомах'], correctAnswer: 0, explanation: 'Хлоропласты содержат хлорофилл для фотосинтеза' },
  { id: 'qb-bio-7', subject: 'biology', topic: 'Анатомия', text: 'Большой круг кровообращения начинается из:', options: ['Левого желудочка', 'Правого желудочка', 'Левого предсердия', 'Правого предсердия'], correctAnswer: 0, explanation: 'Левый желудочек → аорта → большой круг' },
  { id: 'qb-bio-8', subject: 'biology', topic: 'Анатомия', text: 'Гормон инсулин вырабатывается:', options: ['Поджелудочной железой', 'Щитовидной железой', 'Надпочечниками', 'Гипофизом'], correctAnswer: 0, explanation: 'Бета-клетки поджелудочной железы вырабатывают инсулин' },

  // ── Chemistry ──────────────────────────────────────────────────────────────
  { id: 'qb-chem-1', subject: 'chemistry', topic: 'Строение атома', text: 'Число протонов в атоме кислорода (O, Z = 8):', options: ['8', '16', '6', '2'], correctAnswer: 0, explanation: 'Число протонов = атомный номер = 8' },
  { id: 'qb-chem-2', subject: 'chemistry', topic: 'Строение атома', text: 'Электронная конфигурация натрия (Na, Z = 11):', options: ['1s²2s²2p⁶3s¹', '1s²2s²2p⁶', '1s²2s²2p⁶3s²', '1s²2s²2p⁶3p¹'], correctAnswer: 0, explanation: 'Na: 2-8-1' },
  { id: 'qb-chem-3', subject: 'chemistry', topic: 'Химические реакции', text: 'Реакция 2H₂ + O₂ → 2H₂O является:', options: ['Соединения', 'Разложения', 'Замещения', 'Обмена'], correctAnswer: 0, explanation: 'Два вещества соединяются в одно — реакция соединения' },
  { id: 'qb-chem-4', subject: 'chemistry', topic: 'Химические реакции', text: 'Сумма коэффициентов в уравнении: N₂ + 3H₂ → 2NH₃', options: ['6', '5', '4', '7'], correctAnswer: 0, explanation: '1 + 3 + 2 = 6' },
  { id: 'qb-chem-5', subject: 'chemistry', topic: 'Растворы', text: 'pH нейтрального раствора равен:', options: ['7', '0', '14', '1'], correctAnswer: 0, explanation: 'pH = 7 — нейтральная среда' },
  { id: 'qb-chem-6', subject: 'chemistry', topic: 'Органическая химия', text: 'Общая формула алканов:', options: ['CₙH₂ₙ₊₂', 'CₙH₂ₙ', 'CₙH₂ₙ₋₂', 'CₙHₙ'], correctAnswer: 0, explanation: 'Алканы — предельные углеводороды CₙH₂ₙ₊₂' },
  { id: 'qb-chem-7', subject: 'chemistry', topic: 'Органическая химия', text: 'Метан CH₄ относится к:', options: ['Алканам', 'Алкенам', 'Алкинам', 'Аренам'], correctAnswer: 0, explanation: 'CH₄ — простейший алкан' },
  { id: 'qb-chem-8', subject: 'chemistry', topic: 'Неорганическая химия', text: 'Формула серной кислоты:', options: ['H₂SO₄', 'HNO₃', 'HCl', 'H₃PO₄'], correctAnswer: 0, explanation: 'H₂SO₄ — серная кислота' },

  // ── English ───────────────────────────────────────────────────────────────
  { id: 'qb-eng-1', subject: 'english', topic: 'Grammar', text: 'Choose the correct form: She ___ to school every day.', options: ['goes', 'go', 'going', 'gone'], correctAnswer: 0, explanation: 'Present Simple, 3rd person singular: goes' },
  { id: 'qb-eng-2', subject: 'english', topic: 'Grammar', text: 'Choose the correct form: They ___ playing football now.', options: ['are', 'is', 'was', 'were'], correctAnswer: 0, explanation: 'Present Continuous with "they": are playing' },
  { id: 'qb-eng-3', subject: 'english', topic: 'Grammar', text: 'Past Simple of "go":', options: ['went', 'goed', 'gone', 'goes'], correctAnswer: 0, explanation: 'Go — went — gone (irregular verb)' },
  { id: 'qb-eng-4', subject: 'english', topic: 'Vocabulary', text: '"Environment" means:', options: ['Окружающая среда', 'Развлечение', 'Оборудование', 'Достижение'], correctAnswer: 0, explanation: 'Environment = окружающая среда' },
  { id: 'qb-eng-5', subject: 'english', topic: 'Reading', text: 'The main idea of a paragraph is usually found in:', options: ['The first sentence', 'The last sentence', 'The middle', 'Not in the paragraph'], correctAnswer: 0, explanation: 'Topic sentence is usually first' },

  // ── Kazakh (kk) — Математика ──────────────────────────────────────────────
  { id: 'qb-kk-math-1', subject: 'math', topic: 'Сызықтық теңдеулер', text: 'Теңдеуді шешіңіз: 3x − 7 = 2x + 5', options: ['12', '10', '−12', '2'], correctAnswer: 0, explanation: '3x − 2x = 5 + 7, x = 12', language: 'kk' },
  { id: 'qb-kk-math-2', subject: 'math', topic: 'Квадрат теңдеулер', text: 'x² − 5x + 6 = 0 теңдеуін шешіңіз', options: ['x = 2, x = 3', 'x = −2, x = −3', 'x = 1, x = 6', 'x = −1, x = 6'], correctAnswer: 0, explanation: 'D = 25 − 24 = 1; x = (5 ± 1)/2', language: 'kk' },
  { id: 'qb-kk-math-3', subject: 'math', topic: 'Квадрат теңдеулер', text: '2x² + 3x − 5 = 0 дискриминанты:', options: ['49', '19', '−31', '1'], correctAnswer: 0, explanation: 'D = 9 + 40 = 49', language: 'kk' },
  { id: 'qb-kk-math-4', subject: 'math', topic: 'Теңсіздіктер', text: '2x − 3 > 5 теңсіздігін шешіңіз', options: ['x > 4', 'x > 1', 'x < 4', 'x > 8'], correctAnswer: 0, explanation: '2x > 8 → x > 4', language: 'kk' },
  { id: 'qb-kk-math-5', subject: 'math', topic: 'Тригонометрия', text: 'sin 30° мәні:', options: ['0.5', '1', '√3/2', '√2/2'], correctAnswer: 0, explanation: 'sin 30° = 1/2 = 0.5', language: 'kk' },
  { id: 'qb-kk-math-6', subject: 'math', topic: 'Дәрежелер мен логарифмдер', text: 'log₂ 8 =', options: ['3', '2', '4', '8'], correctAnswer: 0, explanation: '2³ = 8, демек log₂ 8 = 3', language: 'kk' },
  { id: 'qb-kk-math-7', subject: 'math', topic: 'Геометрия', text: 'Табаны 10, биіктігі 6 болатын үшбұрыштың ауданы:', options: ['30', '60', '16', '80'], correctAnswer: 0, explanation: 'S = ½ × 10 × 6 = 30', language: 'kk' },

  // ── Kazakh (kk) — Физика ──────────────────────────────────────────────────
  { id: 'qb-kk-phys-1', subject: 'physics', topic: 'Кинематика', text: 'Дене 100 м жолды 10 с-та жүрді. Орташа жылдамдығы:', options: ['10 м/с', '100 м/с', '1 м/с', '1000 м/с'], correctAnswer: 0, explanation: 'v = 100/10 = 10 м/с', language: 'kk' },
  { id: 'qb-kk-phys-2', subject: 'physics', topic: 'Динамика', text: 'Ньютонның екінші заңы:', options: ['F = ma', 'F = mv', 'F = mg', 'F = mgh'], correctAnswer: 0, explanation: 'F = ma', language: 'kk' },
  { id: 'qb-kk-phys-3', subject: 'physics', topic: 'Динамика', text: 'Массасы 5 кг, үдеуі 2 м/с² дененің күші:', options: ['10 Н', '2.5 Н', '7 Н', '25 Н'], correctAnswer: 0, explanation: 'F = 5 × 2 = 10 Н', language: 'kk' },
  { id: 'qb-kk-phys-4', subject: 'physics', topic: 'Энергия', text: 'Массасы 2 кг, жылдамдығы 3 м/с. Кинетикалық энергиясы:', options: ['9 Дж', '6 Дж', '3 Дж', '18 Дж'], correctAnswer: 0, explanation: 'Eк = mv²/2 = 2×9/2 = 9 Дж', language: 'kk' },
  { id: 'qb-kk-phys-5', subject: 'physics', topic: 'Электр тогы', text: 'Кернеу 12 В, кедергі 4 Ом. Ток күші:', options: ['3 А', '48 А', '16 А', '8 А'], correctAnswer: 0, explanation: 'I = U/R = 12/4 = 3 А', language: 'kk' },

  // ── Kazakh (kk) — Тарих ───────────────────────────────────────────────────
  { id: 'qb-kk-hist-1', subject: 'history', topic: 'Ежелгі Қазақстан', text: '«Алтын адам» қай қорғаннан табылды?', options: ['Есік', 'Берел', 'Шілікті', 'Бесшатыр'], correctAnswer: 0, explanation: 'Есік қорғанынан 1969 ж. табылды', language: 'kk' },
  { id: 'qb-kk-hist-2', subject: 'history', topic: 'Қазақ хандығы', text: 'Қазақ хандығы қай жылы құрылды?', options: ['1465', '1520', '1370', '1610'], correctAnswer: 0, explanation: '1465 жылы Жәнібек пен Керей', language: 'kk' },
  { id: 'qb-kk-hist-3', subject: 'history', topic: 'Қазақ хандығы', text: '«Жеті Жарғы» заңын кім жасады?', options: ['Тәуке хан', 'Қасым хан', 'Абылай хан', 'Есім хан'], correctAnswer: 0, explanation: 'Тәуке хан «Жеті Жарғы» жасады', language: 'kk' },
  { id: 'qb-kk-hist-4', subject: 'history', topic: 'Ресейге қосылу', text: 'Кіші жүз Ресейге қай жылы қосылды?', options: ['1731', '1740', '1822', '1861'], correctAnswer: 0, explanation: '1731 ж. Әбілқайыр хан тұсында', language: 'kk' },
  { id: 'qb-kk-hist-5', subject: 'history', topic: 'Қазақстан XX ғасырда', text: 'Қазақстан тәуелсіздігін қай күні жариялады?', options: ['16 желтоқсан 1991', '1 желтоқсан 1991', '25 қазан 1990', '30 тамыз 1995'], correctAnswer: 0, explanation: '1991 жылы 16 желтоқсан — Тәуелсіздік күні', language: 'kk' },

  // ── Kazakh (kk) — Биология ────────────────────────────────────────────────
  { id: 'qb-kk-bio-1', subject: 'biology', topic: 'Жасуша', text: 'Митохондриялардың негізгі функциясы:', options: ['АТФ синтезі', 'Ақуыз синтезі', 'ДНҚ сақтау', 'Жасуша бөлінуі'], correctAnswer: 0, explanation: 'Митохондриялар — АТФ синтездейді', language: 'kk' },
  { id: 'qb-kk-bio-2', subject: 'biology', topic: 'Генетика', text: 'Адам жасушасындағы хромосомалар саны:', options: ['46', '23', '48', '44'], correctAnswer: 0, explanation: '46 хромосома = 23 жұп', language: 'kk' },
  { id: 'qb-kk-bio-3', subject: 'biology', topic: 'Генетика', text: 'Менделдің екінші заңы:', options: ['F₂-де 3:1 ажырау', 'F₁ біркелкілігі', 'Тәуелсіз тұқым қуалау', 'Тізбектелген тұқым қуалау'], correctAnswer: 0, explanation: 'Ажырау заңы — F₂-де 3:1', language: 'kk' },
  { id: 'qb-kk-bio-4', subject: 'biology', topic: 'Анатомия', text: 'Үлкен қан айналым шеңбері қайдан басталады?', options: ['Сол қарыншадан', 'Оң қарыншадан', 'Сол жүрекшеден', 'Оң жүрекшеден'], correctAnswer: 0, explanation: 'Сол қарынша → аорта → үлкен шеңбер', language: 'kk' },

  // ── Kazakh (kk) — Химия ───────────────────────────────────────────────────
  { id: 'qb-kk-chem-1', subject: 'chemistry', topic: 'Атом құрылысы', text: 'Оттегі атомындағы (Z = 8) протондар саны:', options: ['8', '16', '6', '2'], correctAnswer: 0, explanation: 'Z = 8 → 8 протон', language: 'kk' },
  { id: 'qb-kk-chem-2', subject: 'chemistry', topic: 'Химиялық реакциялар', text: '2H₂ + O₂ → 2H₂O реакциясы:', options: ['Қосылу', 'Ыдырау', 'Алмасу', 'Орын басу'], correctAnswer: 0, explanation: 'Екі зат біріккен — қосылу', language: 'kk' },
  { id: 'qb-kk-chem-3', subject: 'chemistry', topic: 'Органикалық химия', text: 'Алкандардың жалпы формуласы:', options: ['CₙH₂ₙ₊₂', 'CₙH₂ₙ', 'CₙH₂ₙ₋₂', 'CₙHₙ'], correctAnswer: 0, explanation: 'Алкандар — CₙH₂ₙ₊₂', language: 'kk' },
]

// ── Deduplication ─────────────────────────────────────────────────────────────
// Normalize text for comparison: lowercase, collapse whitespace, strip punctuation edges

function normalizeText(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim()
}

// Deduplicate QUESTIONS array by text similarity
const SEEN_TEXTS = new Set<string>()
const SEEN_IDS = new Set<string>()
const DEDUPED_QUESTIONS: BankQuestion[] = []

for (const q of QUESTIONS) {
  const key = normalizeText(q.text)
  if (SEEN_TEXTS.has(key) || SEEN_IDS.has(q.id)) continue
  SEEN_TEXTS.add(key)
  SEEN_IDS.add(q.id)
  DEDUPED_QUESTIONS.push(q)
}

/** Check if a question with identical text already exists */
export function isDuplicate(text: string): boolean {
  return SEEN_TEXTS.has(normalizeText(text))
}

/** Check if an ID already exists */
export function isIdTaken(id: string): boolean {
  return SEEN_IDS.has(id)
}

/** Get current question count (for reporting) */
export function getQuestionCount(): { total: number; bySubject: Record<string, number>; byLanguage: Record<string, number> } {
  const bySubject: Record<string, number> = {}
  const byLanguage: Record<string, number> = {}
  for (const q of DEDUPED_QUESTIONS) {
    bySubject[q.subject] = (bySubject[q.subject] ?? 0) + 1
    const lang = q.language ?? 'ru'
    byLanguage[lang] = (byLanguage[lang] ?? 0) + 1
  }
  return { total: DEDUPED_QUESTIONS.length, bySubject, byLanguage }
}

// ── Index by subject → topic → questions ─────────────────────────────────────

const INDEX = new Map<string, Map<string, BankQuestion[]>>()

for (const q of DEDUPED_QUESTIONS) {
  if (!INDEX.has(q.subject)) INDEX.set(q.subject, new Map())
  const topicMap = INDEX.get(q.subject)!
  if (!topicMap.has(q.topic)) topicMap.set(q.topic, [])
  topicMap.get(q.topic)!.push(q)
}

export const AVAILABLE_SUBJECTS = [...INDEX.keys()]

/**
 * Get questions for given topics, with fallback to random questions from subject.
 * Distributes questions across topics proportionally.
 */
export function getQuestionsForTopics(
  subject: string,
  topics: string[],
  count: number,
  language?: 'ru' | 'kk' | 'en',
): BankQuestion[] {
  const subjectMap = INDEX.get(subject)
  if (!subjectMap) return []

  // Language filter helper
  const langMatch = (q: BankQuestion) => !language || (q.language ?? 'ru') === language

  const result: BankQuestion[] = []
  const used = new Set<string>()

  // First: try to get questions from specified topics
  for (const topic of topics) {
    if (result.length >= count) break
    const topicQs = subjectMap.get(topic)?.filter(langMatch)
    if (!topicQs) continue

    for (const q of topicQs) {
      if (result.length >= count) break
      if (!used.has(q.id)) {
        result.push(q)
        used.add(q.id)
      }
    }
  }

  // Second: fuzzy match — topic names may not match exactly
  if (result.length < count) {
    for (const topic of topics) {
      if (result.length >= count) break
      const topicLower = topic.toLowerCase()
      for (const [mapTopic, qs] of subjectMap) {
        if (result.length >= count) break
        if (mapTopic.toLowerCase().includes(topicLower) || topicLower.includes(mapTopic.toLowerCase())) {
          for (const q of qs.filter(langMatch)) {
            if (result.length >= count) break
            if (!used.has(q.id)) {
              result.push(q)
              used.add(q.id)
            }
          }
        }
      }
    }
  }

  // Third: fill remaining from any questions in subject
  if (result.length < count) {
    const allQs = [...subjectMap.values()].flat().filter(langMatch)
    // Shuffle
    const shuffled = allQs.sort(() => Math.random() - 0.5)
    for (const q of shuffled) {
      if (result.length >= count) break
      if (!used.has(q.id)) {
        result.push(q)
        used.add(q.id)
      }
    }
  }

  return result
}
