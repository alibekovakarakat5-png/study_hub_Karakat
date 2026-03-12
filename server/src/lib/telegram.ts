// ── StudyHub Telegram Bot ─────────────────────────────────────────────────────
//
// Two modes in one file:
//   1. Admin notifications  — send() helpers (newUser, error, etc.)
//   2. User-facing bot      — handleUpdate() processes webhook payloads
//
// Env vars required:
//   TELEGRAM_BOT_TOKEN   — bot token from @BotFather
//   TELEGRAM_ADMIN_CHAT  — your personal / admin chat ID (receives notifications)
//
// To register the webhook run once:
//   curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
//        -d '{"url":"https://YOUR_SERVER/api/telegram/webhook"}'

import { prisma } from './prisma'
import { askTutor, getRemainingQuestions } from './claude'

const BOT_TOKEN   = process.env.TELEGRAM_BOT_TOKEN
const ADMIN_CHAT  = process.env.TELEGRAM_ADMIN_CHAT ?? process.env.TELEGRAM_CHAT_ID

// ── Low-level API call ────────────────────────────────────────────────────────

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
  return call('sendMessage', { chat_id, text, parse_mode: 'HTML', ...extra })
}

async function editMsg(chat_id: string | number, message_id: number, text: string, extra?: Record<string, unknown>) {
  return call('editMessageText', { chat_id, message_id, text, parse_mode: 'HTML', ...extra })
}

async function answerCallback(callback_query_id: string, text?: string) {
  return call('answerCallbackQuery', { callback_query_id, text })
}

async function sendTyping(chat_id: number) {
  return call('sendChatAction', { chat_id, action: 'typing' })
}

// ── ENT question bank (fallback if DB is empty) ───────────────────────────────

const FALLBACK_QUESTIONS = [
  {
    id: 'f1', subject: 'Математика',
    q: 'Вычислите: 2³ × 2⁴',
    options: ['2⁶', '2⁷', '4⁷', '2¹²'],
    correct: 1,
    explanation: '2³ × 2⁴ = 2^(3+4) = 2⁷ = 128',
  },
  {
    id: 'f2', subject: 'История КЗ',
    q: 'В каком году была провозглашена независимость Казахстана?',
    options: ['1990', '1991', '1992', '1993'],
    correct: 1,
    explanation: '16 декабря 1991 года — День независимости Казахстана',
  },
  {
    id: 'f3', subject: 'Математика',
    q: 'Дискриминант уравнения x² - 5x + 6 = 0 равен:',
    options: ['1', '4', '25', '49'],
    correct: 0,
    explanation: 'D = b² - 4ac = 25 - 24 = 1',
  },
  {
    id: 'f4', subject: 'История КЗ',
    q: 'Кто основал Казахское ханство?',
    options: ['Аблай хан', 'Касым хан', 'Жанибек и Керей', 'Тауке хан'],
    correct: 2,
    explanation: 'Казахское ханство основано в 1465 году ханами Жанибеком и Кереем',
  },
  {
    id: 'f5', subject: 'Математика',
    q: 'Найдите 35% от числа 240.',
    options: ['72', '84', '96', '120'],
    correct: 1,
    explanation: '240 × 0.35 = 84',
  },
  {
    id: 'f6', subject: 'Физика',
    q: 'Скорость света в вакууме приблизительно равна:',
    options: ['3×10⁶ м/с', '3×10⁸ м/с', '3×10¹⁰ м/с', '3×10⁵ м/с'],
    correct: 1,
    explanation: 'c ≈ 3×10⁸ м/с — скорость света в вакууме',
  },
  {
    id: 'f7', subject: 'История КЗ',
    q: 'Столица Казахстана была перенесена в Астану в:',
    options: ['1995', '1997', '1999', '2001'],
    correct: 1,
    explanation: 'Столица перенесена из Алматы в Астану 10 декабря 1997 года',
  },
  {
    id: 'f8', subject: 'Математика',
    q: 'log₂ 32 = ?',
    options: ['4', '5', '6', '3'],
    correct: 1,
    explanation: '2⁵ = 32, значит log₂ 32 = 5',
  },
  {
    id: 'f9', subject: 'Биология',
    q: 'Какой органоид клетки называют «энергетической станцией»?',
    options: ['Рибосома', 'Митохондрия', 'Лизосома', 'Ядро'],
    correct: 1,
    explanation: 'Митохондрии синтезируют АТФ — основной источник энергии клетки',
  },
  {
    id: 'f10', subject: 'Химия',
    q: 'Формула серной кислоты:',
    options: ['HCl', 'HNO₃', 'H₂SO₄', 'H₃PO₄'],
    correct: 2,
    explanation: 'H₂SO₄ — серная кислота. HCl — соляная, HNO₃ — азотная',
  },
]

const LABELS = ['A', 'B', 'C', 'D']

async function getRandomQuestion() {
  try {
    // Try to pull from DB first
    const dbQ = await prisma.content.findFirst({
      where: { type: 'ent_question', active: true },
      orderBy: { id: 'desc' }, // random-ish: take latest, rotate by time
    })
    if (dbQ) {
      const d = dbQ.data as Record<string, unknown>
      return {
        id: dbQ.id,
        subject: String(d.subject ?? 'ЕНТ'),
        q: String(d.question ?? d.q ?? ''),
        options: (d.options as string[]) ?? [],
        correct: Number(d.correct ?? 0),
        explanation: String(d.explanation ?? ''),
      }
    }
  } catch { /* fallback */ }

  // Fallback to hardcoded bank, rotate by hour
  const idx = new Date().getHours() % FALLBACK_QUESTIONS.length
  return FALLBACK_QUESTIONS[idx]!
}

// ── Message builders ──────────────────────────────────────────────────────────

function buildQuestionMessage(q: typeof FALLBACK_QUESTIONS[0]) {
  const optionLines = q.options.map((o, i) => `${LABELS[i]}. ${o}`).join('\n')
  return (
    `📚 <b>${q.subject}</b>\n\n` +
    `${q.q}\n\n` +
    `${optionLines}`
  )
}

function buildQuestionKeyboard(questionId: string) {
  return {
    inline_keyboard: [
      LABELS.slice(0, 4).map((label, i) => ({
        text: label,
        callback_data: `ans:${questionId}:${i}`,
      })),
    ],
  }
}

const WELCOME_TEXT =
  `👋 <b>Привет! Я StudyHub Bot</b>\n\n` +
  `Помогу тебе готовиться к ЕНТ прямо в Telegram.\n\n` +
  `<b>Просто напиши любой вопрос по ЕНТ</b> — я отвечу как репетитор! 🤖\n` +
  `(до 10 AI-ответов в день, бесплатно)\n\n` +
  `<b>Команды:</b>\n` +
  `🎯 /question — вопрос ЕНТ с вариантами ответа\n` +
  `📊 /progress — твой прогресс на платформе\n` +
  `🔗 /link <код> — привязать аккаунт StudyHub\n` +
  `❓ /help — все команды\n\n` +
  `Чтобы видеть свой прогресс — привяжи аккаунт:\n` +
  `<a href="https://skylla.netlify.app/settings">skylla.netlify.app/settings</a> → "Подключить Telegram"`

const HELP_TEXT =
  `<b>StudyHub Bot — AI репетитор ЕНТ</b>\n\n` +
  `🤖 <b>Просто напиши вопрос</b> — получи объяснение от AI\n` +
  `   Математика, История КЗ, Физика, Химия, Биология...\n` +
  `   Лимит: 10 вопросов в день (бесплатно)\n\n` +
  `🎯 /question — случайный вопрос ЕНТ с вариантами\n` +
  `📊 /progress — прогресс (нужен привязанный аккаунт)\n` +
  `🔗 /link <6-значный код> — привязать аккаунт\n` +
  `❓ /help — это сообщение\n\n` +
  `<a href="https://skylla.netlify.app">Открыть StudyHub →</a>`

// ── Command handlers ──────────────────────────────────────────────────────────

async function handleStart(chatId: number, args: string) {
  // /start <token> — deep link from settings page
  if (args.trim()) {
    await handleLink(chatId, args.trim())
    return
  }
  await sendMsg(chatId, WELCOME_TEXT, { disable_web_page_preview: true })
}

async function handleHelp(chatId: number) {
  await sendMsg(chatId, HELP_TEXT, { disable_web_page_preview: true })
}

async function handleQuestion(chatId: number) {
  const q = await getRandomQuestion()
  const text = buildQuestionMessage(q)
  const reply_markup = buildQuestionKeyboard(q.id)
  await sendMsg(chatId, text, { reply_markup })
}

async function handleProgress(chatId: number) {
  const user = await prisma.user.findUnique({
    where: { telegramChatId: String(chatId) },
    include: { studyPlans: { where: { isActive: true }, take: 1 } },
  })

  if (!user) {
    await sendMsg(
      chatId,
      `❌ <b>Аккаунт не привязан</b>\n\nОтправь /link КОД чтобы привязать.\n` +
      `Код получи на <a href="https://skylla.netlify.app/settings">skylla.netlify.app/settings</a>`,
      { disable_web_page_preview: true },
    )
    return
  }

  const plan = user.studyPlans[0]
  const streakEmoji = (user.streak ?? 0) >= 7 ? '🔥' : (user.streak ?? 0) >= 3 ? '⚡' : '📅'

  let text = `📊 <b>Прогресс ${user.name}</b>\n\n`
  text += `${streakEmoji} Стрик: <b>${user.streak ?? 0} дней</b>\n`
  text += `⏱ Всего минут занятий: <b>${user.totalStudyMinutes ?? 0}</b>\n`
  if (plan) {
    const pct = plan.totalModules > 0
      ? Math.round((plan.completedModules / plan.totalModules) * 100)
      : 0
    text += `\n📚 <b>Учебный план</b>\n`
    text += `Выполнено модулей: ${plan.completedModules}/${plan.totalModules} (${pct}%)\n`
    const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10))
    text += `${bar}\n`
  }
  text += `\n<a href="https://skylla.netlify.app/dashboard">Открыть платформу →</a>`

  await sendMsg(chatId, text, { disable_web_page_preview: true })
}

async function handleLink(chatId: number, token: string) {
  const code = token.trim().toUpperCase()

  const linkToken = await prisma.telegramLinkToken.findUnique({ where: { token: code } })

  if (!linkToken) {
    await sendMsg(chatId, `❌ <b>Неверный или устаревший код.</b>\n\nПолучи новый код на странице настроек: <a href="https://skylla.netlify.app/settings">skylla.netlify.app/settings</a>`, { disable_web_page_preview: true })
    return
  }

  if (linkToken.expiresAt < new Date()) {
    await prisma.telegramLinkToken.delete({ where: { id: linkToken.id } })
    await sendMsg(chatId, `⏰ <b>Код истёк.</b> Сгенерируй новый в настройках.`)
    return
  }

  // Link the account
  await prisma.user.update({
    where: { id: linkToken.userId },
    data: { telegramChatId: String(chatId) },
  })
  await prisma.telegramLinkToken.delete({ where: { id: linkToken.id } })

  const user = await prisma.user.findUnique({ where: { id: linkToken.userId } })

  await sendMsg(
    chatId,
    `✅ <b>Аккаунт привязан!</b>\n\n` +
    `Привет, ${user?.name ?? 'друг'}! 🎉\n\n` +
    `Теперь ты можешь:\n` +
    `🎯 /question — тренировочный вопрос ЕНТ\n` +
    `📊 /progress — следить за своим прогрессом\n\n` +
    `Удачи на ЕНТ! 💪`,
  )
}

// ── AI tutor handler ──────────────────────────────────────────────────────────

async function handleAiTutor(
  chatId: number,
  text: string,
  from?: { id: number; first_name?: string; username?: string },
) {
  const userId = String(chatId) // use chatId as rate-limit key (no auth needed)
  const remaining = getRemainingQuestions(userId)

  if (remaining === 0) {
    await sendMsg(
      chatId,
      `⏳ <b>Лимит исчерпан</b>\n\nТы использовал все ${10} AI-ответов на сегодня.\n\nЛимит сбросится в полночь.\n\nПока можешь тренироваться: /question`,
    )
    return
  }

  // Show typing indicator while Claude is thinking
  await sendTyping(chatId)

  try {
    const result = await askTutor(userId, text, from?.first_name)

    if ('limitReached' in result) {
      await sendMsg(chatId, `⏳ <b>Лимит AI-вопросов исчерпан.</b> Сбросится в полночь.`)
      return
    }

    const { answer, remaining: left } = result

    // Append remaining count hint when getting low
    const hint = left <= 3
      ? `\n\n<i>AI-вопросов осталось сегодня: ${left}</i>`
      : ''

    await sendMsg(chatId, `🤖 ${answer}${hint}`)
  } catch (err) {
    console.error('[Bot] AI tutor error:', err)
    await sendMsg(
      chatId,
      `⚠️ AI-репетитор временно недоступен. Попробуй позже или используй /question`,
    )
  }
}

// ── Callback query handler (inline button answers) ────────────────────────────

const pendingQuestions = new Map<string, typeof FALLBACK_QUESTIONS[0]>()

async function handleCallbackQuery(
  callbackQueryId: string,
  chatId: number,
  messageId: number,
  data: string,
) {
  await answerCallback(callbackQueryId)

  if (!data.startsWith('ans:')) return

  const [, questionId, answerIdxStr] = data.split(':')
  const answerIdx = Number(answerIdxStr)

  // Try to find question
  let question = pendingQuestions.get(questionId ?? '')

  if (!question) {
    // Fallback: find in hardcoded bank
    question = FALLBACK_QUESTIONS.find(q => q.id === questionId)
  }

  if (!question) {
    // Try DB
    try {
      const dbQ = await prisma.content.findUnique({ where: { id: questionId } })
      if (dbQ) {
        const d = dbQ.data as Record<string, unknown>
        question = {
          id: dbQ.id,
          subject: String(d.subject ?? 'ЕНТ'),
          q: String(d.question ?? d.q ?? ''),
          options: (d.options as string[]) ?? [],
          correct: Number(d.correct ?? 0),
          explanation: String(d.explanation ?? ''),
        }
      }
    } catch { /* ignore */ }
  }

  if (!question) {
    await editMsg(chatId, messageId, '⚠️ Вопрос не найден. Попробуй /question')
    return
  }

  const isCorrect = answerIdx === question.correct
  const correctLabel = LABELS[question.correct]
  const chosenLabel = LABELS[answerIdx]

  const resultText =
    `📚 <b>${question.subject}</b>\n\n` +
    `${question.q}\n\n` +
    (isCorrect
      ? `✅ <b>Правильно!</b> Ответ: ${correctLabel}. ${question.options[question.correct]}\n\n`
      : `❌ <b>Неверно.</b> Ты выбрал ${chosenLabel}.\n✅ Правильный ответ: ${correctLabel}. ${question.options[question.correct]}\n\n`) +
    `💡 ${question.explanation}\n\n` +
    `Ещё вопрос? /question`

  await editMsg(chatId, messageId, resultText, { reply_markup: { inline_keyboard: [] } })
}

// ── Main update handler (called by webhook route) ─────────────────────────────

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
    // ── Message ────────────────────────────────────────────────────────────────
    if (update.message?.text) {
      const chatId = update.message.chat.id
      const text   = update.message.text.trim()

      if (text.startsWith('/start'))    { await handleStart(chatId, text.slice(6).trim()); return }
      if (text === '/help')             { await handleHelp(chatId); return }
      if (text === '/question')         { await handleQuestion(chatId); return }
      if (text === '/progress')         { await handleProgress(chatId); return }
      if (text.startsWith('/link'))     { await handleLink(chatId, text.slice(5).trim()); return }

      // Unknown command or plain text → AI tutor
      await handleAiTutor(chatId, text, update.message.from)
      return
    }

    // ── Callback query (inline button tap) ────────────────────────────────────
    if (update.callback_query) {
      const cq = update.callback_query
      const chatId    = cq.message?.chat.id
      const messageId = cq.message?.message_id
      if (chatId && messageId && cq.data) {
        await handleCallbackQuery(cq.id, chatId, messageId, cq.data)
      }
    }
  } catch (err) {
    console.error('[Bot] handleUpdate error:', err)
  }
}

// ── Admin notifications (unchanged interface) ─────────────────────────────────

function now(): string {
  return new Date().toLocaleString('ru-KZ', { timeZone: 'Asia/Almaty' })
}

async function adminSend(text: string): Promise<void> {
  if (!BOT_TOKEN || !ADMIN_CHAT) return
  try {
    await sendMsg(ADMIN_CHAT, text)
  } catch (err) {
    console.error('[Telegram] Admin send failed:', err)
  }
}

export const tg = {
  serverStart: () =>
    adminSend(`✅ <b>Сервер запущен</b>\n🕐 ${now()}`),

  newUser: (name: string, email: string, role: string, city?: string | null) =>
    adminSend(
      `🆕 <b>Новый пользователь</b>\n👤 ${name}\n📧 ${email}\n🎭 ${role}` +
      (city ? `\n📍 ${city}` : '') + `\n🕐 ${now()}`,
    ),

  newSubscription: (userName: string, planName: string, expires: string) =>
    adminSend(`🔔 <b>Новая подписка</b>\n👤 ${userName}\n📦 ${planName}\n📅 до ${expires}\n🕐 ${now()}`),

  newPayment: (userName: string, amount: number, method: string, planName?: string) =>
    adminSend(
      `💰 <b>Оплата получена</b>\n👤 ${userName}\n💵 ${amount.toLocaleString('ru-RU')} ₸\n💳 ${method}` +
      (planName ? `\n📦 ${planName}` : '') + `\n🕐 ${now()}`,
    ),

  support: (name: string, email: string, message: string) =>
    adminSend(`💬 <b>Обращение в поддержку</b>\n👤 ${name}\n📧 ${email}\n📝 ${message.slice(0, 500)}\n🕐 ${now()}`),

  error: (message: string, stack?: string) =>
    adminSend(
      `🚨 <b>Ошибка сервера</b>\n<code>${message.slice(0, 300)}</code>` +
      (stack ? `\n<code>${stack.slice(0, 400)}</code>` : '') + `\n🕐 ${now()}`,
    ),

  dailyStats: (users: number, premium: number, revenueToday: number) =>
    adminSend(
      `📊 <b>Ежедневная статистика</b>\n👥 Пользователей: ${users.toLocaleString('ru-RU')}\n` +
      `👑 Премиум: ${premium.toLocaleString('ru-RU')}\n💰 Доход сегодня: ${revenueToday.toLocaleString('ru-RU')} ₸\n🕐 ${now()}`,
    ),
}
