import crypto from 'crypto'
import { prisma } from './prisma'
import { TEST_USER_PREFIX } from './reviewCatalog'
import type { TelegramUpdate } from './telegram'

export const recoveryDuration = 15 * 60_000
export const recoveryCooldown = 60_000
export const resetTokenKey = (token: string) => token.startsWith('tg1_')
  ? 'sha256:' + crypto.createHash('sha256').update(token).digest('hex') : token
export const linkTokenKey = (token: string) => 'link1:' + crypto.createHash('sha256').update(token).digest('hex')
export const accountSite = () => new URL(process.env.APP_URL || 'https://study-hub-karakat.vercel.app').origin

// Never propagate Telegram request URLs, response bodies, or credentials to logs.
export async function telegramRequest<T>(method: string, body: Record<string, unknown> = {}): Promise<T> {
  try {
    if (!process.env.TELEGRAM_BOT_TOKEN) throw new Error()
    const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(8000),
    })
    const data = await response.json() as { ok?: boolean; result: T }
    if (!response.ok || data.ok !== true) throw new Error()
    return data.result
  } catch { throw new Error('Telegram request failed') }
}

let botUsername = ''
let configured = false
export function telegramAccountOptions() {
  return { available: configured, botUrl: configured ? `https://t.me/${botUsername}?start=reset_password` : null }
}

export async function configureTelegramAccount() {
  configured = false
  if (!process.env.TELEGRAM_BOT_TOKEN) return
  const bot = await telegramRequest<{ username: string }>('getMe')
  if (!/^[a-zA-Z0-9_]{5,32}$/.test(bot.username)) throw new Error('Invalid Telegram bot identity')
  if (process.env.NODE_ENV === 'production') {
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET
    const url = process.env.TELEGRAM_WEBHOOK_URL
    if (!secret || !url || new URL(url).protocol !== 'https:') throw new Error('Telegram webhook is not configured')
    await telegramRequest('setWebhook', { url, secret_token: secret, allowed_updates: ['message', 'callback_query'] })
  }
  botUsername = bot.username
  configured = true
}

type Send = (chatId: number, text: string, url?: string) => Promise<void>
const send: Send = async (chatId, text, url) => {
  await telegramRequest('sendMessage', {
    chat_id: chatId, text, protect_content: true, link_preview_options: { is_disabled: true },
    ...(url ? { reply_markup: { inline_keyboard: [[{ text: 'Задать новый пароль', url }]] } } : {}),
  })
}

// Commands are handled before conversational AI; no account lookup by email.
export function createTelegramAccountHandler(db = prisma, deliver: Send = send, now = () => Date.now()) {
  return async (update: TelegramUpdate): Promise<boolean> => {
    const message = update.message
    const text = message?.text?.trim() || ''
    const reset = /^\/reset(?:@\w+)?$/.test(text) || /^\/start(?:@\w+)?\s+reset_password$/.test(text)
    const link = text.match(/^\/(?:start|link)(?:@\w+)?\s+(\S+)$/)
    if (!reset && !link) return false
    // A group/chat ID or a forwarded message is never proof of account ownership.
    if (!message || message.chat.type !== 'private' || message.chat.id !== message.from?.id ||
        !Number.isSafeInteger(message.chat.id) || message.chat.id <= 0) return true
    const chatId = message.chat.id
    if (!reset) {
      const code = link![1].toUpperCase()
      if (!/^[A-F0-9]{64}$/.test(code)) {
        await deliver(chatId, 'Код привязки устарел или неверен. Получите новый в настройках Study Hub.'); return true
      }
      try {
        await db.$transaction(async tx => {
          const row = await tx.telegramLinkToken.findUnique({ where: { token: linkTokenKey(code) } })
          if (!row || row.expiresAt.getTime() <= now() || row.userId.startsWith(TEST_USER_PREFIX)) throw new Error('Invalid link')
          const changed = await tx.user.updateMany({ where: { id: row.userId, telegramChatId: null }, data: { telegramChatId: String(chatId) } })
          if (changed.count !== 1) throw new Error('Already linked')
          const used = await tx.telegramLinkToken.deleteMany({ where: { id: row.id, token: row.token, expiresAt: { gt: new Date(now()) } } })
          if (used.count !== 1) throw new Error('Already used')
        })
      } catch {
        await deliver(chatId, 'Привязка не выполнена: код истёк, уже использован или аккаунт уже связан с Telegram. Проверьте настройки Study Hub.'); return true
      }
      await deliver(chatId, 'Telegram привязан к Study Hub. Теперь команда /reset поможет восстановить пароль. Вернитесь в настройки и нажмите «Проверить привязку».')
      return true
    }

    const user = await db.user.findUnique({ where: { telegramChatId: String(chatId) }, select: { id: true } })
    if (!user || user.id.startsWith(TEST_USER_PREFIX)) {
      await deliver(chatId, 'Этот Telegram ещё не привязан к Study Hub. Если вы вошли на другом устройстве, откройте Настройки → Telegram и выполните привязку. Если входа нигде нет — обратитесь к владельцу платформы. Указания email недостаточно для восстановления.'); return true
    }
    const token = 'tg1_' + crypto.randomBytes(32).toString('hex')
    const key = resetTokenKey(token)
    const reserved = await db.user.updateMany({
      where: { id: user.id, telegramChatId: String(chatId), OR: [{ resetRequestedAt: null }, { resetRequestedAt: { lte: new Date(now() - recoveryCooldown) } }] },
      data: { resetToken: key, resetTokenExp: new Date(now() + recoveryDuration), resetRequestedAt: new Date(now()) },
    })
    // Duplicate updates and concurrent requests cannot rotate/flood links during the cooldown.
    if (!reserved.count) return true
    try {
      await deliver(chatId, 'Восстановление пароля Study Hub. Ссылка действует 15 минут и только один раз. Новый запрос /reset доступен через минуту. Никому не пересылайте ссылку. Пароль задаётся только на сайте.', `${accountSite()}/reset-password#token=${token}`)
    } catch {
      await db.user.updateMany({ where: { id: user.id, resetToken: key }, data: { resetToken: null, resetTokenExp: null } })
      throw new Error('Telegram recovery delivery failed')
    }
    return true
  }
}
export const handleTelegramAccount = createTelegramAccountHandler()
