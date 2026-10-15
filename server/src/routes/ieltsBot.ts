import { Router } from 'express'
import { timingSafeEqual } from 'crypto'
import { ieltsWebhookSecret } from '../lib/ieltsBotConfig'
import { createTelegramRequest } from '../lib/telegramTransport'
import { createIeltsBotStore } from '../lib/ieltsBotStore'
import { createIeltsBotHandler, ieltsUpdateSchema, type IeltsUpdate } from '../lib/ieltsBotHandler'

export function createIeltsWebhookRouter(options: { secret: () => string | undefined; enabled: () => boolean; handle: (update: IeltsUpdate) => Promise<void> }) {
  const router = Router()
  router.post('/webhook', async (req, res) => {
    const secret = options.secret(), incoming = req.get('X-Telegram-Bot-Api-Secret-Token')
    if (!secret || !options.enabled()) { res.status(503).json({ error: 'IELTS bot not configured' }); return }
    if (!incoming || Buffer.byteLength(secret) !== Buffer.byteLength(incoming) || !timingSafeEqual(Buffer.from(secret), Buffer.from(incoming))) { res.status(403).json({ error: 'Forbidden' }); return }
    const update = ieltsUpdateSchema.safeParse(req.body)
    if (!update.success) { res.status(400).json({ error: 'Invalid Telegram update' }); return }
    try { await options.handle(update.data); res.json({ ok: true }) }
    catch { res.status(503).json({ error: 'IELTS update could not be completed' }) }
  })
  return router
}
const handle = createIeltsBotHandler(createIeltsBotStore(), createTelegramRequest(() => process.env.IELTS_TELEGRAM_BOT_TOKEN), {
  channelId: process.env.IELTS_TELEGRAM_REQUIRED_CHANNEL || '@skyllaAI',
  channelUrl: 'https://t.me/skyllaAI', accountPrefix: 'telegram:',
})
export default createIeltsWebhookRouter({
  secret: () => ieltsWebhookSecret(process.env.IELTS_TELEGRAM_BOT_TOKEN, process.env.IELTS_TELEGRAM_WEBHOOK_SECRET),
  enabled: () => !!process.env.IELTS_TELEGRAM_BOT_TOKEN && process.env.IELTS_TELEGRAM_BOT_TOKEN !== process.env.TELEGRAM_BOT_TOKEN && process.env.IELTS_TELEGRAM_BOT_TOKEN !== process.env.POSTFLOW_TELEGRAM_BOT_TOKEN,
  handle,
})
