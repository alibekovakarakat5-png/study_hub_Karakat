import type { Question } from '@/types'

export const diagnosticQuestions: Question[] = [
  // МАТЕМАТИКА
  {
    id: 'math-1',
    subject: 'math',
    topic: 'Алгебра',
    text: 'Решите уравнение: 2x² - 5x + 3 = 0. Найдите сумму корней.',
    options: ['2.5', '1.5', '3', '5'],
    correctAnswer: 0,
    difficulty: 'easy',
    explanation: 'По теореме Виета, сумма корней = -b/a = 5/2 = 2.5',
  },
  {
    id: 'math-2',
    subject: 'math',
    topic: 'Геометрия',
    text: 'Площадь треугольника со сторонами 3, 4 и 5 равна:',
    options: ['6', '10', '12', '7.5'],
    correctAnswer: 0,
    difficulty: 'easy',
    explanation: 'Это прямоугольный треугольник (3²+4²=5²). S = (3×4)/2 = 6',
  },
  {
    id: 'math-3',
    subject: 'math',
    topic: 'Функции',
    text: 'Найдите производную функции f(x) = 3x³ - 2x + 1',
    options: ['9x² - 2', '9x² + 1', '3x² - 2', '6x - 2'],
    correctAnswer: 0,
    difficulty: 'medium',
    explanation: 'f\'(x) = 3·3x² - 2 = 9x² - 2',
  },
  {
    id: 'math-4',
    subject: 'math',
    topic: 'Тригонометрия',
    text: 'Чему равен sin(30°) + cos(60°)?',
    options: ['1', '0.5', '1.5', '0'],
    correctAnswer: 0,
    difficulty: 'easy',
    explanation: 'sin(30°) = 0.5 и cos(60°) = 0.5, поэтому 0.5 + 0.5 = 1',
  },
  {
    id: 'math-5',
    subject: 'math',
    topic: 'Логарифмы',
    text: 'Вычислите: log₂(8) + log₃(27)',
    options: ['6', '5', '9', '8'],
    correctAnswer: 0,
    difficulty: 'medium',
    explanation: 'log₂(8) = 3 (так как 2³=8) и log₃(27) = 3 (так как 3³=27). 3+3=6',
  },

  // ФИЗИКА
  {
    id: 'phys-1',
    subject: 'physics',
    topic: 'Механика',
    text: 'Тело массой 5 кг движется с ускорением 2 м/с². Какая сила действует на тело?',
    options: ['10 Н', '2.5 Н', '7 Н', '20 Н'],
    correctAnswer: 0,
    difficulty: 'easy',
    explanation: 'По второму закону Ньютона: F = ma = 5 × 2 = 10 Н',
  },
  {
    id: 'phys-2',
    subject: 'physics',
    topic: 'Кинематика',
    text: 'Автомобиль разгоняется от 0 до 20 м/с за 5 секунд. Найдите пройденный путь.',
    options: ['50 м', '100 м', '25 м', '75 м'],
    correctAnswer: 0,
    difficulty: 'medium',
    explanation: 'a = 20/5 = 4 м/с². S = at²/2 = 4×25/2 = 50 м',
  },
  {
    id: 'phys-3',
    subject: 'physics',
    topic: 'Электричество',
    text: 'Сопротивление проводника 10 Ом, напряжение 220 В. Какова сила тока?',
    options: ['22 А', '2200 А', '2.2 А', '0.045 А'],
    correctAnswer: 0,
    difficulty: 'easy',
    explanation: 'По закону Ома: I = U/R = 220/10 = 22 А',
  },
  {
    id: 'phys-4',
    subject: 'physics',
    topic: 'Оптика',
    text: 'Скорость света в вакууме приблизительно равна:',
    options: ['3 × 10⁸ м/с', '3 × 10⁶ м/с', '3 × 10¹⁰ м/с', '3 × 10⁵ м/с'],
    correctAnswer: 0,
    difficulty: 'easy',
    explanation: 'Скорость света в вакууме c ≈ 3 × 10⁸ м/с',
  },

  // ИСТОРИЯ КАЗАХСТАНА
  {
    id: 'hist-1',
    subject: 'history',
    topic: 'Новейшая история',
    text: 'В каком году Казахстан объявил о своей независимости?',
    options: ['1991', '1990', '1989', '1993'],
    correctAnswer: 0,
    difficulty: 'easy',
    explanation: 'Казахстан объявил независимость 16 декабря 1991 года',
  },
  {
    id: 'hist-2',
    subject: 'history',
    topic: 'Средневековье',
    text: 'Какое государство существовало на территории Казахстана в VI-VIII веках?',
    options: ['Тюркский каганат', 'Золотая Орда', 'Казахское ханство', 'Могулистан'],
    correctAnswer: 0,
    difficulty: 'medium',
    explanation: 'Тюркский каганат (552-603 гг.) был одним из крупнейших государств в Центральной Азии',
  },
  {
    id: 'hist-3',
    subject: 'history',
    topic: 'Казахское ханство',
    text: 'Кто были основателями Казахского ханства?',
    options: ['Керей и Жанибек', 'Абылай и Тауке', 'Касым и Хакназар', 'Тауке и Аблай'],
    correctAnswer: 0,
    difficulty: 'easy',
    explanation: 'Казахское ханство было основано Кереем и Жанибеком в 1465 году',
  },

  // АНГЛИЙСКИЙ ЯЗЫК
  {
    id: 'eng-1',
    subject: 'english',
    topic: 'Grammar',
    text: 'Choose the correct form: "If I ___ rich, I would travel the world."',
    options: ['were', 'was', 'am', 'will be'],
    correctAnswer: 0,
    difficulty: 'medium',
    explanation: 'В условных предложениях второго типа используется were для всех лиц',
  },
  {
    id: 'eng-2',
    subject: 'english',
    topic: 'Vocabulary',
    text: 'What is the synonym of "abundant"?',
    options: ['plentiful', 'scarce', 'empty', 'tiny'],
    correctAnswer: 0,
    difficulty: 'medium',
    explanation: 'Abundant = plentiful, означает "обильный, изобилующий"',
  },
  {
    id: 'eng-3',
    subject: 'english',
    topic: 'Grammar',
    text: 'Select the correct sentence:',
    options: [
      'She has been working here since 2020.',
      'She has been working here for 2020.',
      'She is working here since 2020.',
      'She works here since 2020.',
    ],
    correctAnswer: 0,
    difficulty: 'easy',
    explanation: 'Present Perfect Continuous + since для указания начала действия',
  },

  // ИНФОРМАТИКА
  {
    id: 'inf-1',
    subject: 'informatics',
    topic: 'Алгоритмы',
    text: 'Какая временная сложность у бинарного поиска?',
    options: ['O(log n)', 'O(n)', 'O(n²)', 'O(1)'],
    correctAnswer: 0,
    difficulty: 'medium',
    explanation: 'Бинарный поиск делит массив пополам на каждом шаге → O(log n)',
  },
  {
    id: 'inf-2',
    subject: 'informatics',
    topic: 'Системы счисления',
    text: 'Переведите число 1010₂ в десятичную систему:',
    options: ['10', '12', '8', '5'],
    correctAnswer: 0,
    difficulty: 'easy',
    explanation: '1×2³ + 0×2² + 1×2¹ + 0×2⁰ = 8 + 0 + 2 + 0 = 10',
  },
  {
    id: 'inf-3',
    subject: 'informatics',
    topic: 'Программирование',
    text: 'Что выведет код: print(len("Hello World"))?',
    options: ['11', '10', '12', '9'],
    correctAnswer: 0,
    difficulty: 'easy',
    explanation: '"Hello World" содержит 11 символов (включая пробел)',
  },

  // БИОЛОГИЯ
  {
    id: 'bio-1',
    subject: 'biology',
    topic: 'Клеточная биология',
    text: 'Какой органоид клетки отвечает за синтез белка?',
    options: ['Рибосома', 'Митохондрия', 'Лизосома', 'Аппарат Гольджи'],
    correctAnswer: 0,
    difficulty: 'easy',
    explanation: 'Рибосомы — органоиды, осуществляющие биосинтез белка (трансляцию)',
  },
  {
    id: 'bio-2',
    subject: 'biology',
    topic: 'Генетика',
    text: 'Сколько хромосом содержит соматическая клетка человека?',
    options: ['46', '23', '48', '44'],
    correctAnswer: 0,
    difficulty: 'easy',
    explanation: 'Соматические клетки человека содержат 46 хромосом (23 пары)',
  },

  // ХИМИЯ
  {
    id: 'chem-1',
    subject: 'chemistry',
    topic: 'Общая химия',
    text: 'Какой элемент имеет атомный номер 6?',
    options: ['Углерод (C)', 'Азот (N)', 'Кислород (O)', 'Бор (B)'],
    correctAnswer: 0,
    difficulty: 'easy',
    explanation: 'Углерод (Carbon) имеет атомный номер 6 в таблице Менделеева',
  },
  {
    id: 'chem-2',
    subject: 'chemistry',
    topic: 'Органическая химия',
    text: 'Какова формула этанола?',
    options: ['C₂H₅OH', 'CH₃OH', 'C₃H₇OH', 'C₂H₄O₂'],
    correctAnswer: 0,
    difficulty: 'easy',
    explanation: 'Этанол (этиловый спирт) имеет формулу C₂H₅OH',
  },

  // ГЕОГРАФИЯ
  {
    id: 'geo-1',
    subject: 'geography',
    topic: 'Казахстан',
    text: 'Какое место в мире занимает Казахстан по площади территории?',
    options: ['9-е', '5-е', '7-е', '12-е'],
    correctAnswer: 0,
    difficulty: 'easy',
    explanation: 'Казахстан — 9-я по площади страна в мире (2 724 900 км²)',
  },
  {
    id: 'geo-2',
    subject: 'geography',
    topic: 'Природные ресурсы',
    text: 'Какое озеро Казахстана является самым большим?',
    options: ['Балхаш', 'Зайсан', 'Алаколь', 'Тенгиз'],
    correctAnswer: 0,
    difficulty: 'easy',
    explanation: 'Озеро Балхаш — крупнейшее озеро, целиком расположенное на территории Казахстана',
  },

  // РУССКИЙ ЯЗЫК
  {
    id: 'rus-1',
    subject: 'russian',
    topic: 'Орфография',
    text: 'В каком слове пишется НН?',
    options: ['стеклянный', 'кожаный', 'серебряный', 'ветреный'],
    correctAnswer: 0,
    difficulty: 'medium',
    explanation: 'Стеклянный — исключение: стеклянный, оловянный, деревянный пишутся с НН',
  },
  {
    id: 'rus-2',
    subject: 'russian',
    topic: 'Пунктуация',
    text: 'Укажите предложение, в котором нужно поставить тире:',
    options: [
      'Москва — столица России.',
      'Он весёлый и добрый.',
      'На улице холодно.',
      'Дети играли в парке.',
    ],
    correctAnswer: 0,
    difficulty: 'easy',
    explanation: 'Тире ставится между подлежащим и сказуемым, выраженными существительными в Им. падеже',
  },
]

export function getQuestionsBySubject(subject: string): Question[] {
  return diagnosticQuestions.filter(q => q.subject === subject)
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
