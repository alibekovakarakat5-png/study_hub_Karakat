// ── Telegram routes ───────────────────────────────────────────────────────────
//
//  POST /api/telegram/webhook   — receives updates from Telegram servers
//  POST /api/users/me/telegram-link  — generates a one-time link code (in users.ts)

import { Router } from 'express'
import { handleUpdate, type TelegramUpdate } from '../lib/telegram'
import { verifyToken, requireRole } from '../middleware/auth'
import { timingSafeEqual } from 'crypto'
import { handleTelegramAccount } from '../lib/telegramAccount'

const router = Router()

// Secret token to verify requests come from Telegram (set in .env)
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET ?? ''

// ── POST /api/telegram/webhook — receives updates from Telegram ───────────────

router.post('/webhook', async (req, res) => {
  if (!WEBHOOK_SECRET) { res.status(503).json({ error: 'Telegram webhook unavailable' }); return }
  const incoming = req.headers['x-telegram-bot-api-secret-token']
  if (typeof incoming !== 'string' || Buffer.byteLength(incoming) !== Buffer.byteLength(WEBHOOK_SECRET) ||
      !timingSafeEqual(Buffer.from(incoming), Buffer.from(WEBHOOK_SECRET))) {
    res.status(403).json({ error: 'Forbidden' }); return
  }

  const update: TelegramUpdate = req.body
  if (!update || !Number.isSafeInteger(update.update_id)) { res.status(400).json({ error: 'Invalid update' }); return }
  try {
    if (await handleTelegramAccount(update)) { res.json({ ok: true }); return }
  } catch { res.status(503).json({ error: 'Telegram account operation unavailable' }); return }

  // Respond to Telegram immediately (must be within 5s)
  res.json({ ok: true })

  // Process asynchronously — never block the response
  handleUpdate(update).catch(err =>
    console.error('[Telegram webhook] unhandled error:', err)
  )
})

// ── POST /api/telegram/broadcast — admin: trigger daily question now ──────────

router.post('/broadcast', verifyToken, requireRole('admin'), async (_req, res) => {
  // Dynamic import to avoid circular deps
  const { startCronJobs: _ } = await import('../lib/cron')

  // We call the internal function directly via a re-exported helper
  const { sendDailyQuestionsNow } = await import('../lib/cron')
  await sendDailyQuestionsNow()
  res.json({ ok: true })
})

export default router
