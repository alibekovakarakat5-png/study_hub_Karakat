// ── StudyHub Telegram Bot ─────────────────────────────────────────────────────
//
// Роль бота: заинтересовать → диагностировать → отправить на платформу
//
// Потоки: ЕНТ диагностика, Поступление за рубеж, Выбор профессии, IELTS, Стартап
// Знания: БД (mentor_qa, vocab_word, ent_question) + hardcoded fallback
// Никакого внешнего AI — всё на собственных данных
//
// Env: TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT
// Webhook: POST /api/telegram/webhook

import { prisma } from './prisma'

const BOT_TOKEN  = process.env.TELEGRAM_BOT_TOKEN
const ADMIN_CHAT = process.env.TELEGRAM_ADMIN_CHAT ?? process.env.TELEGRAM_CHAT_ID
const APP_URL    = process.env.APP_URL ?? 'https://skylla.netlify.app'

// ── Low-level helpers ─────────────────────────────────────────────────────────

async function call(method: string, body: Record<string, unknown>): Promise<unknown> {
  if (!BOT_TOKEN) return
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  return res.json()
}

async function sendMsg(chat_id: string | number, text: string, extra?: Record<string, unknown>) {
  return call('sendMessage', { chat_id, text, parse_mode: 'HTML', disable_web_page_preview: true, ...extra })
}

async function editMsg(chat_id: string | number, message_id: number, text: string, extra?: Record<string, unknown>) {
  return call('editMessageText', { chat_id, message_id, text, parse_mode: 'HTML', ...extra })
}

async function answerCallback(callback_query_id: string, text?: string) {
  return call('answerCallbackQuery', { callback_query_id, text })
}

// ── Keyboard builders ─────────────────────────────────────────────────────────

const MAIN_MENU_KB = {
  inline_keyboard: [
    [
      { text: '🎓 Подготовка к ЕНТ',    callback_data: 'flow:ent' },
      { text: '🌍 Поступление за рубеж', callback_data: 'flow:abroad' },
    ],
    [
      { text: '🧭 Выбор профессии', callback_data: 'flow:career' },
      { text: '🇬🇧 IELTS',          callback_data: 'flow:ielts' },
    ],
    [
      { text: '🚀 Стартап',        callback_data: 'flow:startup' },
      { text: '📊 Мой прогресс',   callback_data: 'flow:progress' },
    ],
  ],
}

const BACK_TO_MENU = [[{ text: '↩️ Главное меню', callback_data: 'flow:main' }]]

function optKb(flow: string, opts: string[]) {
  const rows: { text: string; callback_data: string }[][] = []
  for (let i = 0; i < opts.length; i += 2) {
    const row = [{ text: opts[i]!, callback_data: `${flow}:ans:${i}` }]
    if (opts[i + 1]) row.push({ text: opts[i + 1]!, callback_data: `${flow}:ans:${i + 1}` })
    rows.push(row)
  }
  return { inline_keyboard: rows }
}

// ── ENT question bank ─────────────────────────────────────────────────────────

interface Question {
  id: string; subject: string; q: string
  options: string[]; correct: number; explanation: string
}

const FALLBACK_QUESTIONS: Question[] = [
  { id: 'f1',  subject: 'Математика',  q: 'Вычислите: 2³ × 2⁴',                                     options: ['2⁶','2⁷','4⁷','2¹²'],                         correct: 1, explanation: '2³ × 2⁴ = 2^(3+4) = 2⁷ = 128' },
  { id: 'f2',  subject: 'История КЗ', q: 'В каком году провозглашена независимость Казахстана?',     options: ['1990','1991','1992','1993'],                    correct: 1, explanation: '16 декабря 1991 года' },
  { id: 'f3',  subject: 'Математика',  q: 'Дискриминант уравнения x² − 5x + 6 = 0 равен:',          options: ['1','4','25','49'],                              correct: 0, explanation: 'D = b² − 4ac = 25 − 24 = 1' },
  { id: 'f4',  subject: 'История КЗ', q: 'Кто основал Казахское ханство?',                           options: ['Аблай хан','Касым хан','Жанибек и Керей','Тауке хан'], correct: 2, explanation: 'Основано в 1465 году' },
  { id: 'f5',  subject: 'Математика',  q: 'Найдите 35% от числа 240.',                              options: ['72','84','96','120'],                           correct: 1, explanation: '240 × 0.35 = 84' },
  { id: 'f6',  subject: 'Физика',      q: 'Скорость света в вакууме:',                              options: ['3×10⁶ м/с','3×10⁸ м/с','3×10¹⁰ м/с','3×10⁵ м/с'], correct: 1, explanation: 'c ≈ 3×10⁸ м/с' },
  { id: 'f7',  subject: 'История КЗ', q: 'Столица перенесена в Астану в:',                          options: ['1995','1997','1999','2001'],                    correct: 1, explanation: '10 декабря 1997 года' },
  { id: 'f8',  subject: 'Математика',  q: 'log₂ 32 = ?',                                            options: ['4','5','6','3'],                                correct: 1, explanation: '2⁵ = 32' },
  { id: 'f9',  subject: 'Биология',    q: '«Энергетическая станция» клетки — это:',                 options: ['Рибосома','Митохондрия','Лизосома','Ядро'],     correct: 1, explanation: 'Митохондрии синтезируют АТФ' },
  { id: 'f10', subject: 'Химия',       q: 'Формула серной кислоты:',                                options: ['HCl','HNO₃','H₂SO₄','H₃PO₄'],                 correct: 2, explanation: 'H₂SO₄ — серная кислота' },
  { id: 'f11', subject: 'Математика',  q: 'Сумма углов треугольника:',                              options: ['90°','180°','270°','360°'],                    correct: 1, explanation: 'Всегда 180°' },
  { id: 'f12', subject: 'Физика',      q: 'Единица сопротивления:',                                 options: ['Ампер','Вольт','Ом','Ватт'],                   correct: 2, explanation: 'Ом (Ω)' },
  { id: 'f13', subject: 'История КЗ', q: 'Первый президент Казахстана:',                             options: ['Токаев','Назарбаев','Кунаев','Масимов'],       correct: 1, explanation: 'Нурсултан Назарбаев' },
  { id: 'f14', subject: 'Математика',  q: 'Площадь круга радиусом 5:',                              options: ['10π','25π','50π','100π'],                      correct: 1, explanation: 'S = πr² = 25π' },
  { id: 'f15', subject: 'Биология',    q: 'Сколько хромосом в клетках человека?',                   options: ['23','44','46','48'],                            correct: 2, explanation: '46 = 23 пары' },
]

const LABELS = ['A', 'B', 'C', 'D']

async function getRandomQuestion(): Promise<Question> {
  try {
    const rows = await prisma.content.findMany({ where: { type: 'ent_question', active: true }, take: 30 })
    if (rows.length > 0) {
      const r = rows[Math.floor(Math.random() * rows.length)]!
      const d = r.data as Record<string, unknown>
      return { id: r.id, subject: String(d.subject ?? 'ЕНТ'), q: String(d.question ?? d.q ?? ''),
               options: (d.options as string[]) ?? [], correct: Number(d.correct ?? 0), explanation: String(d.explanation ?? '') }
    }
  } catch { /* fallback */ }
  const idx = Math.floor(Math.random() * FALLBACK_QUESTIONS.length)
  return FALLBACK_QUESTIONS[idx]!
}

async function get5Questions(): Promise<Question[]> {
  try {
    const rows = await prisma.content.findMany({ where: { type: 'ent_question', active: true }, take: 50 })
    if (rows.length >= 5) {
      return rows.sort(() => Math.random() - 0.5).slice(0, 5).map(r => {
        const d = r.data as Record<string, unknown>
        return { id: r.id, subject: String(d.subject ?? 'ЕНТ'), q: String(d.question ?? d.q ?? ''),
                 options: (d.options as string[]) ?? [], correct: Number(d.correct ?? 0), explanation: String(d.explanation ?? '') }
      })
    }
  } catch { /* fallback */ }
  return [...FALLBACK_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5)
}

// ── State machine ─────────────────────────────────────────────────────────────

type FlowType = 'idle' | 'ent_diag' | 'abroad' | 'career' | 'startup'

interface UserState {
  flow: FlowType
  step: number
  score: number
  answers: number[]
  questions: Question[]
  lastActive: number
}

const userStates = new Map<string, UserState>()

const STATE_TTL = 60 * 60 * 1000 // 1 hour

// Periodic cleanup of stale states every 30 minutes
setInterval(() => {
  const cutoff = Date.now() - STATE_TTL
  for (const [key, state] of userStates) {
    if (state.lastActive < cutoff) userStates.delete(key)
  }
}, 30 * 60 * 1000)

function getState(chatId: number): UserState {
  const key = String(chatId)
  if (!userStates.has(key)) userStates.set(key, { flow: 'idle', step: 0, score: 0, answers: [], questions: [], lastActive: Date.now() })
  return userStates.get(key)!
}

function setState(chatId: number, patch: Partial<UserState>): void {
  userStates.set(String(chatId), { ...getState(chatId), ...patch, lastActive: Date.now() })
}

function resetState(chatId: number): void {
  userStates.delete(String(chatId))
}

// ── Main menu ─────────────────────────────────────────────────────────────────

async function showMainMenu(chatId: number) {
  resetState(chatId)
  await sendMsg(chatId,
    `👋 <b>Привет! Я бот StudyHub</b>\n\n` +
    `Помогаю казахстанским школьникам:\n\n` +
    `🎓 Подготовиться к ЕНТ\n` +
    `🌍 Поступить за рубеж\n` +
    `🧭 Выбрать профессию\n` +
    `🇬🇧 Сдать IELTS\n` +
    `🚀 Запустить стартап\n\n` +
    `Выбери направление 👇`,
    { reply_markup: MAIN_MENU_KB },
  )
}

// ── Flow: /question (one random ENT question) ─────────────────────────────────

async function handleQuestion(chatId: number) {
  const q = await getRandomQuestion()
  const lines = q.options.map((o, i) => `${LABELS[i]}. ${o}`).join('\n')
  const text = `📚 <b>${q.subject}</b>\n\n${q.q}\n\n${lines}`
  const kb = { inline_keyboard: [LABELS.slice(0, q.options.length).map((l, i) => ({ text: l, callback_data: `ans:${q.id}:${i}` }))] }
  await sendMsg(chatId, text, { reply_markup: kb })
}

async function handleQuestionAnswer(chatId: number, messageId: number, questionId: string, answerIdx: number) {
  let q = FALLBACK_QUESTIONS.find(x => x.id === questionId)
  if (!q) {
    try {
      const dbQ = await prisma.content.findUnique({ where: { id: questionId } })
      if (dbQ) {
        const d = dbQ.data as Record<string, unknown>
        q = { id: dbQ.id, subject: String(d.subject ?? 'ЕНТ'), q: String(d.question ?? d.q ?? ''),
              options: (d.options as string[]) ?? [], correct: Number(d.correct ?? 0), explanation: String(d.explanation ?? '') }
      }
    } catch { /* ignore */ }
  }
  if (!q) { await editMsg(chatId, messageId, '⚠️ Вопрос не найден. Попробуй /question'); return }

  const isCorrect = answerIdx === q.correct
  const result =
    `📚 <b>${q.subject}</b>\n\n${q.q}\n\n` +
    (isCorrect
      ? `✅ <b>Правильно!</b> ${LABELS[q.correct]}. ${q.options[q.correct]}\n\n`
      : `❌ <b>Неверно.</b> Правильный: ${LABELS[q.correct]}. ${q.options[q.correct]}\n\n`) +
    `💡 ${q.explanation}`

  await editMsg(chatId, messageId, result, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🎯 Ещё вопрос', callback_data: 'flow:question' }],
        [{ text: '📚 500+ вопросов на платформе', url: `${APP_URL}/diagnostic` }],
        BACK_TO_MENU[0]!,
      ],
    },
  })
}

// ── Flow: ENT диагностика (5 вопросов) ───────────────────────────────────────

async function startEntDiag(chatId: number) {
  const questions = await get5Questions()
  setState(chatId, { flow: 'ent_diag', step: 0, score: 0, answers: [], questions })
  await showEntQ(chatId, 0, questions)
}

async function showEntQ(chatId: number, step: number, questions: Question[]) {
  const q = questions[step]!
  const lines = q.options.map((o, i) => `${LABELS[i]}. ${o}`).join('\n')
  await sendMsg(chatId,
    `🎓 <b>Мини-диагностика ЕНТ — ${step + 1}/5</b>\n\n<b>${q.subject}</b>\n${q.q}\n\n${lines}`,
    { reply_markup: { inline_keyboard: [q.options.map((_, i) => ({ text: LABELS[i]!, callback_data: `diag:ans:${i}` }))] } },
  )
}

async function handleEntDiagAns(chatId: number, ansIdx: number) {
  const s = getState(chatId)
  if (s.flow !== 'ent_diag') return
  const q = s.questions[s.step]!
  const correct = ansIdx === q.correct
  const newScore = s.score + (correct ? 1 : 0)
  const nextStep = s.step + 1

  await sendMsg(chatId,
    correct
      ? `✅ <b>Правильно!</b> ${q.explanation}`
      : `❌ <b>Неверно.</b> Правильный ответ: <b>${LABELS[q.correct]}</b>. ${q.explanation}`,
  )

  if (nextStep >= 5) {
    resetState(chatId)
    const projected = Math.round(newScore * 24 + 20) // 20–140 scale approx
    const level = newScore <= 1 ? '🔴 Начальный' : newScore <= 3 ? '🟡 Средний' : '🟢 Хороший'
    const advice = newScore <= 1
      ? 'Нужна серьёзная подготовка. Персональный план закроет пробелы быстрее.'
      : newScore <= 3
      ? 'Хорошая база! Осталось закрыть слабые темы — платформа покажет какие.'
      : 'Отличный результат! Ещё немного — и 120+. Платформа поможет довести до максимума.'

    await sendMsg(chatId,
      `📊 <b>Результат диагностики ЕНТ</b>\n\n` +
      `Правильных ответов: <b>${newScore}/5</b>\n` +
      `Прогноз балла ЕНТ: <b>~${projected}</b>\n` +
      `Уровень: ${level}\n\n${advice}`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🎯 Полная диагностика (40 вопросов)', url: `${APP_URL}/diagnostic` }],
            [{ text: '📚 Получить учебный план',            url: `${APP_URL}/dashboard` }],
            BACK_TO_MENU[0]!,
          ],
        },
      },
    )
  } else {
    setState(chatId, { step: nextStep, score: newScore })
    await showEntQ(chatId, nextStep, s.questions)
  }
}

// ── Flow: Поступление за рубеж (3 вопроса) ───────────────────────────────────

const ABROAD_QS = [
  { text: '🌍 <b>Поступление за рубеж</b>\n\nЕсть ли у тебя языковой сертификат?',
    opts: ['✅ IELTS 6.0+', '📝 IELTS < 6', '📖 Учу английский', '❌ Нет'] },
  { text: '💰 Какой бюджет на учёбу в год?',
    opts: ['До $5 000', '$5 000–15 000', '$15 000+', '🎓 Только грант'] },
  { text: '🗺️ Какой регион интересует?',
    opts: ['🇪🇺 Европа', '🌏 Азия', '🇺🇸 США/Канада', '🌐 Любой'] },
]

async function startAbroadFlow(chatId: number) {
  setState(chatId, { flow: 'abroad', step: 0, score: 0, answers: [], questions: [] })
  const q = ABROAD_QS[0]!
  await sendMsg(chatId, q.text, { reply_markup: optKb('abroad', q.opts) })
}

async function handleAbroadAns(chatId: number, idx: number) {
  const s = getState(chatId)
  if (s.flow !== 'abroad') return
  const newAnswers = [...s.answers, idx]
  const nextStep = s.step + 1

  if (nextStep < ABROAD_QS.length) {
    setState(chatId, { step: nextStep, answers: newAnswers })
    const q = ABROAD_QS[nextStep]!
    await sendMsg(chatId, q.text, { reply_markup: optKb('abroad', q.opts) })
    return
  }

  resetState(chatId)
  const [cert, budget, region] = newAnswers

  let countries: string[]
  let grants: string

  if (cert === 0) {
    // IELTS 6+
    if (region === 0) { countries = ['🇩🇪 Германия (бесплатно)', '🇦🇹 Австрия', '🇳🇱 Нидерланды']; grants = 'DAAD, Erasmus+' }
    else if (region === 1) { countries = ['🇰🇷 Корея (NIIED)', '🇯🇵 Япония (MEXT)']; grants = 'NIIED, MEXT' }
    else if (region === 2) { countries = ['🇺🇸 США', '🇨🇦 Канада']; grants = 'Scholarship.com' }
    else { countries = ['🇩🇪 Германия', '🇰🇷 Корея', '🇨🇿 Чехия']; grants = 'DAAD, NIIED' }
  } else if (cert === 3 || budget === 3) {
    // Ищет грант / нет сертификата
    countries = ['🇭🇺 Венгрия (Stipendium Hungaricum)', '🇨🇳 Китай (CSC грант)', '🇹🇷 Турция']
    grants = 'Stipendium Hungaricum, CSC, Болашак'
  } else {
    if (region === 0) { countries = ['🇵🇱 Польша', '🇨🇿 Чехия', '🇭🇺 Венгрия']; grants = 'Erasmus+, Болашак' }
    else { countries = ['🇨🇳 Китай', '🇲🇾 Малайзия', '🇰🇿 Болашак']; grants = 'CSC, Болашак' }
  }

  await sendMsg(chatId,
    `🎯 <b>Подходящие страны для тебя:</b>\n\n` +
    countries.join('\n') + '\n\n' +
    `🏆 Доступные гранты: ${grants}\n\n` +
    `Полный гайд по документам, дедлайнам и требованиям — на платформе:`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🌍 Открыть Admit Lab',         url: `${APP_URL}/abroad` }],
          [{ text: '📋 Roadmap поступления',        url: `${APP_URL}/abroad` }],
          BACK_TO_MENU[0]!,
        ],
      },
    },
  )
}

// ── Flow: Выбор профессии (4 вопроса) ────────────────────────────────────────

const CAREER_QS = [
  { text: '🧭 <b>Выбор профессии</b>\n\nЧто тебе нравится делать?',
    opts: ['📊 Решать задачи/анализ', '🗣️ Общаться/убеждать', '🎨 Создавать/творить', '⚙️ Организовывать'] },
  { text: '📚 Какой предмет в школе нравится больше?',
    opts: ['➗ Математика/Физика', '📖 История/Литература', '🎭 Творческие предметы', '🔬 Биология/Химия'] },
  { text: '💼 Что важнее в карьере?',
    opts: ['💰 Высокий доход', '🌍 Польза обществу', '🎨 Творческая свобода', '🏠 Стабильность'] },
  { text: '🌐 Как предпочитаешь работать?',
    opts: ['💻 Один / удалённо', '👥 В команде', '🚀 Свой бизнес', '🏢 Чёткая структура'] },
]

const CAREER_PROFILES = [
  { name: 'Аналитик / Инженер',     jobs: ['Data Scientist', 'Software Engineer', 'Financial Analyst', 'Product Manager'] },
  { name: 'Коммуникатор / Лидер',   jobs: ['Marketing Manager', 'PR-специалист', 'Юрист', 'HR-директор'] },
  { name: 'Творческая личность',    jobs: ['UX/UI Designer', 'Контент-криэйтор', 'Архитектор', 'Журналист'] },
  { name: 'Организатор / Менеджер', jobs: ['Project Manager', 'Операционный директор', 'Врач', 'Логист'] },
]

async function startCareerFlow(chatId: number) {
  setState(chatId, { flow: 'career', step: 0, score: 0, answers: [], questions: [] })
  const q = CAREER_QS[0]!
  await sendMsg(chatId, q.text, { reply_markup: optKb('career', q.opts) })
}

async function handleCareerAns(chatId: number, idx: number) {
  const s = getState(chatId)
  if (s.flow !== 'career') return
  const newAnswers = [...s.answers, idx]
  const nextStep = s.step + 1

  if (nextStep < CAREER_QS.length) {
    setState(chatId, { step: nextStep, answers: newAnswers })
    const q = CAREER_QS[nextStep]!
    await sendMsg(chatId, q.text, { reply_markup: optKb('career', q.opts) })
    return
  }

  resetState(chatId)
  const counts = [0, 0, 0, 0]
  newAnswers.forEach(a => { if (a < 4) counts[a]++ })
  const profileIdx = counts.indexOf(Math.max(...counts))
  const profile = CAREER_PROFILES[profileIdx] ?? CAREER_PROFILES[0]!

  await sendMsg(chatId,
    `🧭 <b>Твой карьерный профиль:</b>\n\n` +
    `<b>${profile.name}</b>\n\n` +
    `Подходящие профессии:\n` +
    profile.jobs.map(j => `— ${j}`).join('\n') + '\n\n' +
    `Пройди полный тест и узнай, в каком вузе лучше учиться на эту специальность:`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔮 Полный тест профориентации', url: `${APP_URL}/career-test` }],
          [{ text: '🎓 Подобрать специальность',    url: `${APP_URL}/ent` }],
          BACK_TO_MENU[0]!,
        ],
      },
    },
  )
}

// ── Flow: IELTS ───────────────────────────────────────────────────────────────

async function startIeltsFlow(chatId: number) {
  resetState(chatId)

  let wordBlock = ''
  try {
    const words = await prisma.content.findMany({ where: { type: 'vocab_word', active: true }, take: 30 })
    if (words.length > 0) {
      const w = words[new Date().getDate() % words.length]!
      const d = w.data as Record<string, unknown>
      wordBlock = `\n\n📖 <b>Слово дня:</b> <b>${d.word}</b> — ${d.definition}` +
                  (d.example ? `\n<i>«${d.example}»</i>` : '')
    }
  } catch { /* ignore */ }

  await sendMsg(chatId,
    `🇬🇧 <b>IELTS подготовка</b>\n\n` +
    `IELTS нужен для:\n` +
    `— Поступления в зарубежные вузы\n` +
    `— Иммиграции (Канада, Австралия)\n` +
    `— Работы за границей\n\n` +
    `Band 6.0+ открывает большинство европейских вузов.` + wordBlock,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📚 IELTS Lab — полный курс',  url: `${APP_URL}/ielts` }],
          [{ text: '🎯 Вопрос дня по ЕНТ/IELTS',  callback_data: 'flow:question' }],
          BACK_TO_MENU[0]!,
        ],
      },
    },
  )
}

// ── Flow: Стартап (2 вопроса) ─────────────────────────────────────────────────

const STARTUP_QS = [
  { text: '🚀 <b>Стартапы со StudyHub</b>\n\nНа какой стадии твоя идея?',
    opts: ['💡 Просто идея', '🧪 Уже тестирую', '👥 Ищу команду', '💰 Нужны инвестиции'] },
  { text: '🏭 В какой сфере?',
    opts: ['📚 EdTech', '💻 IT/Технологии', '🌱 Социальный бизнес', '🛒 Другое'] },
]

const STARTUP_TIPS = [
  ['Начни с проблемы, а не с идеи. Поговори с 10 потенциальными клиентами.', 'Создай MVP за 2 недели — не нужно быть идеальным.'],
  ['Собери данные: что работает, что нет?', 'Думай о unit economics уже сейчас.'],
  ['Используй LinkedIn и Telegram для поиска команды.', 'Опиши роли чётко: CTO, CEO, CMO — кто что делает.'],
  ['Изучи pre-seed: Techpreneurs KZ, AIFC.', 'Подготовь pitch deck на 10 слайдов.'],
]

async function startStartupFlow(chatId: number) {
  setState(chatId, { flow: 'startup', step: 0, score: 0, answers: [], questions: [] })
  const q = STARTUP_QS[0]!
  await sendMsg(chatId, q.text, { reply_markup: optKb('startup', q.opts) })
}

async function handleStartupAns(chatId: number, idx: number) {
  const s = getState(chatId)
  if (s.flow !== 'startup') return
  const newAnswers = [...s.answers, idx]
  const nextStep = s.step + 1

  if (nextStep < STARTUP_QS.length) {
    setState(chatId, { step: nextStep, answers: newAnswers })
    const q = STARTUP_QS[nextStep]!
    await sendMsg(chatId, q.text, { reply_markup: optKb('startup', q.opts) })
    return
  }

  resetState(chatId)
  const [stage] = newAnswers
  const tips = STARTUP_TIPS[stage ?? 0] ?? STARTUP_TIPS[0]!

  await sendMsg(chatId,
    `🚀 <b>Roadmap для твоего стартапа:</b>\n\n` +
    tips.map((t, i) => `${i + 1}. ${t}`).join('\n\n') + '\n\n' +
    `StudyHub помогает основателям с менторами, нетворкингом и ресурсами:`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 Startup Lab', url: `${APP_URL}/startup` }],
          [{ text: '📋 Создать проект', url: `${APP_URL}/startup` }],
          BACK_TO_MENU[0]!,
        ],
      },
    },
  )
}

// ── /progress ─────────────────────────────────────────────────────────────────

async function handleProgress(chatId: number) {
  const user = await prisma.user.findUnique({
    where: { telegramChatId: String(chatId) },
    include: { studyPlans: { where: { isActive: true }, take: 1 } },
  })

  if (!user) {
    await sendMsg(chatId,
      `❌ <b>Аккаунт не привязан</b>\n\nЗайди в настройки → "Подключить Telegram" → скопируй код → отправь /link КОД`,
      { reply_markup: {
        inline_keyboard: [
          [{ text: '⚙️ Настройки профиля', url: `${APP_URL}/settings` }],
          BACK_TO_MENU[0]!,
        ],
      } },
    )
    return
  }

  const plan = user.studyPlans[0]
  const streakEmoji = (user.streak ?? 0) >= 7 ? '🔥' : (user.streak ?? 0) >= 3 ? '⚡' : '📅'

  let text = `📊 <b>Прогресс ${user.name}</b>\n\n`
  text += `${streakEmoji} Стрик: <b>${user.streak ?? 0} дней</b>\n`
  text += `⏱ Время занятий: <b>${user.totalStudyMinutes ?? 0} мин</b>\n`
  if (plan) {
    const pct = plan.totalModules > 0 ? Math.round((plan.completedModules / plan.totalModules) * 100) : 0
    const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10))
    text += `\n📚 <b>Учебный план:</b> ${plan.completedModules}/${plan.totalModules} (${pct}%)\n${bar}`
  }

  await sendMsg(chatId, text, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '📱 Открыть дашборд', url: `${APP_URL}/dashboard` }],
        BACK_TO_MENU[0]!,
      ],
    },
  })
}

// ── /link ─────────────────────────────────────────────────────────────────────

async function handleLink(chatId: number, token: string) {
  const code = token.trim().toUpperCase()
  const linkToken = await prisma.telegramLinkToken.findUnique({ where: { token: code } })

  if (!linkToken) {
    await sendMsg(chatId,
      `❌ <b>Неверный или устаревший код.</b>\n\nПолучи новый на странице настроек.`,
      { reply_markup: { inline_keyboard: [[{ text: '⚙️ Настройки', url: `${APP_URL}/settings` }]] } },
    )
    return
  }

  if (linkToken.expiresAt < new Date()) {
    await prisma.telegramLinkToken.delete({ where: { id: linkToken.id } })
    await sendMsg(chatId, `⏰ <b>Код истёк.</b> Сгенерируй новый в настройках.`,
      { reply_markup: { inline_keyboard: [[{ text: '⚙️ Настройки', url: `${APP_URL}/settings` }]] } })
    return
  }

  await prisma.user.update({ where: { id: linkToken.userId }, data: { telegramChatId: String(chatId) } })
  await prisma.telegramLinkToken.delete({ where: { id: linkToken.id } })
  const user = await prisma.user.findUnique({ where: { id: linkToken.userId } })

  await sendMsg(chatId,
    `✅ <b>Аккаунт привязан!</b>\n\nПривет, ${user?.name ?? 'друг'}! 🎉\n\nТеперь я буду присылать тебе вопрос дня и отслеживать твой прогресс.`,
    { reply_markup: {
      inline_keyboard: [
        [{ text: '📱 Открыть платформу', url: `${APP_URL}/dashboard` }],
        BACK_TO_MENU[0]!,
      ],
    } },
  )
}

// ── Free-text handler (keyword matching from DB) ──────────────────────────────

const KEYWORD_MAP = [
  { re: /ент|егэ|экзамен|подготов|готовит|сдать|балл/i,        flow: 'ent' as const },
  { re: /матем|алгебр|геометр|уравнен|формул|логариф|тригон|производн|интеграл/i, flow: 'ent' as const },
  { re: /истори|казахст|хан|ханств|независим/i,                 flow: 'ent' as const },
  { re: /физик|биолог|хими/i,                                   flow: 'ent' as const },
  { re: /поступ|вуз|универс|грант|заграниц|зарубеж|abroad/i,    flow: 'abroad' as const },
  { re: /ielts|айелтс|английск|toefl|speaking|writing|band/i,   flow: 'ielts' as const },
  { re: /профес|карьер|специальн|работ|профориент/i,            flow: 'career' as const },
  { re: /стартап|startup|бизнес|идея|инвест|питч|mvp/i,         flow: 'startup' as const },
]

async function handleFreeText(chatId: number, text: string) {
  // Try DB mentor_qa first
  try {
    const entries = await prisma.content.findMany({ where: { type: 'mentor_qa', active: true }, take: 100 })
    const lower = text.toLowerCase()
    for (const entry of entries) {
      const d = entry.data as Record<string, unknown>
      const keywords = (d.keywords as string[] | undefined) ?? []
      if (keywords.some(kw => lower.includes(kw.toLowerCase()))) {
        const answer = String(d.answer ?? '')
        await sendMsg(chatId, answer, {
          reply_markup: {
            inline_keyboard: [
              [{ text: '📱 Подробнее на StudyHub', url: APP_URL }],
              BACK_TO_MENU[0]!,
            ],
          },
        })
        return
      }
    }
  } catch { /* fallback */ }

  // Keyword → route to matching flow
  for (const { re, flow } of KEYWORD_MAP) {
    if (re.test(text)) {
      await sendMsg(chatId, `Отличный вопрос! Давай разберёмся подробнее 👇`)
      if (flow === 'ent')    { await startEntDiag(chatId); return }
      if (flow === 'abroad') { await startAbroadFlow(chatId); return }
      if (flow === 'ielts')  { await startIeltsFlow(chatId); return }
      if (flow === 'career') { await startCareerFlow(chatId); return }
      if (flow === 'startup'){ await startStartupFlow(chatId); return }
    }
  }

  // No match → show main menu
  await sendMsg(chatId,
    `Не совсем понял вопрос 🤔\n\nВыбери направление — и я помогу:`,
    { reply_markup: MAIN_MENU_KB },
  )
}

// ── Callback query router ─────────────────────────────────────────────────────

async function handleCallback(
  callbackQueryId: string,
  chatId: number,
  messageId: number,
  data: string,
) {
  await answerCallback(callbackQueryId)

  // Main menu flows
  if (data === 'flow:main')     { await showMainMenu(chatId); return }
  if (data === 'flow:ent')      { await sendMsg(chatId, '🎓 <b>Подготовка к ЕНТ</b>\n\nПройди мини-диагностику из 5 вопросов — узнаешь свой примерный балл и слабые места.', { reply_markup: { inline_keyboard: [
    [{ text: '🎯 Пройти мини-диагностику', callback_data: 'flow:ent_diag' }],
    [{ text: '❓ Вопрос дня',              callback_data: 'flow:question' }],
    [{ text: '📚 Учебный план на платформе', url: `${APP_URL}/dashboard` }],
    BACK_TO_MENU[0]!,
  ]}}) ; return }
  if (data === 'flow:ent_diag') { await startEntDiag(chatId); return }
  if (data === 'flow:abroad')   { await startAbroadFlow(chatId); return }
  if (data === 'flow:career')   { await startCareerFlow(chatId); return }
  if (data === 'flow:ielts')    { await startIeltsFlow(chatId); return }
  if (data === 'flow:startup')  { await startStartupFlow(chatId); return }
  if (data === 'flow:question') { await handleQuestion(chatId); return }
  if (data === 'flow:progress') { await handleProgress(chatId); return }

  // ENT diagnostic answers
  if (data.startsWith('diag:ans:')) {
    await handleEntDiagAns(chatId, Number(data.split(':')[2]))
    return
  }

  // Abroad quiz answers
  if (data.startsWith('abroad:ans:')) {
    await handleAbroadAns(chatId, Number(data.split(':')[2]))
    return
  }

  // Career test answers
  if (data.startsWith('career:ans:')) {
    await handleCareerAns(chatId, Number(data.split(':')[2]))
    return
  }

  // Startup quiz answers
  if (data.startsWith('startup:ans:')) {
    await handleStartupAns(chatId, Number(data.split(':')[2]))
    return
  }

  // /question answer (existing format)
  if (data.startsWith('ans:')) {
    const [, questionId, ansStr] = data.split(':')
    await handleQuestionAnswer(chatId, messageId, questionId!, Number(ansStr))
    return
  }
}

// ── Main update handler ───────────────────────────────────────────────────────

export interface TelegramUpdate {
  update_id: number
  message?: {
    message_id: number
    from?: { id: number; first_name?: string; username?: string }
    chat: { id: number }
    text?: string
  }
  callback_query?: {
    id: string
    from: { id: number }
    message?: { message_id: number; chat: { id: number } }
    data?: string
  }
}

export async function handleUpdate(update: TelegramUpdate): Promise<void> {
  try {
    if (update.message?.text) {
      const chatId = update.message.chat.id
      const text   = update.message.text.trim()

      if (text.startsWith('/start')) {
        const payload = text.slice(6).trim()
        if (payload) { await handleLink(chatId, payload); return }
        await showMainMenu(chatId); return
      }
      if (text === '/help')          { await showMainMenu(chatId); return }
      if (text === '/question')      { await handleQuestion(chatId); return }
      if (text === '/progress')      { await handleProgress(chatId); return }
      if (text.startsWith('/link'))  { await handleLink(chatId, text.slice(5).trim()); return }

      // Free text → DB lookup + keyword matching
      await handleFreeText(chatId, text)
      return
    }

    if (update.callback_query) {
      const cq = update.callback_query
      const chatId    = cq.message?.chat.id
      const messageId = cq.message?.message_id
      if (chatId && messageId && cq.data) {
        await handleCallback(cq.id, chatId, messageId, cq.data)
      }
    }
  } catch (err) {
    console.error('[Bot] handleUpdate error:', err)
  }
}

// ── Admin notifications ───────────────────────────────────────────────────────

function now() { return new Date().toLocaleString('ru-KZ', { timeZone: 'Asia/Almaty' }) }

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

async function adminSend(text: string) {
  if (!BOT_TOKEN || !ADMIN_CHAT) return
  try { await sendMsg(ADMIN_CHAT, text) } catch (e) { console.error('[Telegram] admin send failed:', e) }
}

export const tg = {
  serverStart: () => adminSend(`✅ <b>Сервер запущен</b>\n🕐 ${now()}`),

  newUser: (name: string, email: string, role: string, city?: string | null) =>
    adminSend(`🆕 <b>Новый пользователь</b>\n👤 ${escHtml(name)}\n📧 ${escHtml(email)}\n🎭 ${escHtml(role)}${city ? `\n📍 ${escHtml(city)}` : ''}\n🕐 ${now()}`),

  newSubscription: (userName: string, planName: string, expires: string) =>
    adminSend(`🔔 <b>Новая подписка</b>\n👤 ${escHtml(userName)}\n📦 ${escHtml(planName)}\n📅 до ${escHtml(expires)}\n🕐 ${now()}`),

  newPayment: (userName: string, amount: number, method: string, planName?: string) =>
    adminSend(`💰 <b>Оплата</b>\n👤 ${escHtml(userName)}\n💵 ${amount.toLocaleString('ru-RU')} ₸\n💳 ${escHtml(method)}${planName ? `\n📦 ${escHtml(planName)}` : ''}\n🕐 ${now()}`),

  support: (name: string, email: string, message: string) =>
    adminSend(`💬 <b>Поддержка</b>\n👤 ${escHtml(name)}\n📧 ${escHtml(email)}\n📝 ${escHtml(message.slice(0, 500))}\n🕐 ${now()}`),

  error: (message: string, stack?: string) =>
    adminSend(`🚨 <b>Ошибка</b>\n<code>${escHtml(message.slice(0, 300))}</code>${stack ? `\n<code>${escHtml(stack.slice(0, 400))}</code>` : ''}\n🕐 ${now()}`),

  dailyStats: (users: number, premium: number, revenueToday: number) =>
    adminSend(`📊 <b>Статистика</b>\n👥 ${users.toLocaleString('ru-RU')} пользователей\n👑 Премиум: ${premium.toLocaleString('ru-RU')}\n💰 Доход: ${revenueToday.toLocaleString('ru-RU')} ₸\n🕐 ${now()}`),
}
