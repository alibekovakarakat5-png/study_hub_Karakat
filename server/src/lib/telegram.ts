// ── Telegram Notification Service ────────────────────────────────────────────
// Uses Telegram Bot API via plain fetch — no extra packages needed.
// Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in server/.env

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID   = process.env.TELEGRAM_CHAT_ID

async function send(text: string): Promise<void> {
  if (!BOT_TOKEN || !CHAT_ID) return // silently skip if not configured
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id:    CHAT_ID,
        text,
        parse_mode: 'HTML',
      }),
    })
  } catch (err) {
    // never crash the server because of Telegram
    console.error('[Telegram] Failed to send notification:', err)
  }
}

function now(): string {
  return new Date().toLocaleString('ru-KZ', { timeZone: 'Asia/Almaty' })
}

// ── Notification helpers ───────────────────────────────────────────────────────

export const tg = {
  /** Server started */
  serverStart: () =>
    send(`✅ <b>Сервер запущен</b>\n🕐 ${now()}`),

  /** New user registered */
  newUser: (name: string, email: string, role: string, city?: string | null) =>
    send(
      `🆕 <b>Новый пользователь</b>\n` +
      `👤 ${name}\n` +
      `📧 ${email}\n` +
      `🎭 ${role}` +
      (city ? `\n📍 ${city}` : '') +
      `\n🕐 ${now()}`
    ),

  /** New subscription created (admin) */
  newSubscription: (userName: string, planName: string, expires: string) =>
    send(
      `🔔 <b>Новая подписка</b>\n` +
      `👤 ${userName}\n` +
      `📦 ${planName}\n` +
      `📅 до ${expires}\n` +
      `🕐 ${now()}`
    ),

  /** Payment recorded */
  newPayment: (userName: string, amount: number, method: string, planName?: string) =>
    send(
      `💰 <b>Оплата получена</b>\n` +
      `👤 ${userName}\n` +
      `💵 ${amount.toLocaleString('ru-RU')} ₸\n` +
      `💳 ${method}` +
      (planName ? `\n📦 ${planName}` : '') +
      `\n🕐 ${now()}`
    ),

  /** Support message from user */
  support: (name: string, email: string, message: string) =>
    send(
      `💬 <b>Обращение в поддержку</b>\n` +
      `👤 ${name}\n` +
      `📧 ${email}\n` +
      `📝 ${message.slice(0, 500)}\n` +
      `🕐 ${now()}`
    ),

  /** Server-side error */
  error: (message: string, stack?: string) =>
    send(
      `🚨 <b>Ошибка сервера</b>\n` +
      `<code>${message.slice(0, 300)}</code>` +
      (stack ? `\n<code>${stack.slice(0, 400)}</code>` : '') +
      `\n🕐 ${now()}`
    ),

  /** Daily stats summary (call via cron or admin action) */
  dailyStats: (users: number, premium: number, revenueToday: number) =>
    send(
      `📊 <b>Ежедневная статистика</b>\n` +
      `👥 Пользователей: ${users.toLocaleString('ru-RU')}\n` +
      `👑 Премиум: ${premium.toLocaleString('ru-RU')}\n` +
      `💰 Доход сегодня: ${revenueToday.toLocaleString('ru-RU')} ₸\n` +
      `🕐 ${now()}`
    ),
}
