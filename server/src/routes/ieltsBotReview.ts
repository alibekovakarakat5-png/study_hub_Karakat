import { Router, type RequestHandler } from 'express'
import { z } from 'zod'
import { verifyToken } from '../middleware/auth'
import { admissionsFixtureId } from '../lib/reviewStore'
import { createIeltsBotStore, type IeltsBotStore } from '../lib/ieltsBotStore'
import { createIeltsBotHandler, type IeltsRequest } from '../lib/ieltsBotHandler'
import type { IeltsReply } from '../lib/ieltsBot'
import { TelegramDeliveryError } from '../lib/telegramTransport'
import { reviewWritingEvaluator } from '../lib/ieltsWritingReview'

export function createIeltsBotReviewRouter(store: IeltsBotStore = createIeltsBotStore(), auth: RequestHandler = verifyToken) {
  const router = Router(); router.use(auth)
  router.use((req, res, next) => {
    const scope = req.user?.reviewSession
    if (!scope?.admissionsRunId || !['ielts-bot-learner', 'ielts-bot-outsider'].some(p => admissionsFixtureId(scope.ownerId, scope.admissionsRunId!, p) === req.user!.userId)) { res.status(403).json({ error: 'Запустите выделенную роль IELTS-бота из кабинета владельца.' }); return }
    res.setHeader('Cache-Control', 'no-store'); next()
  })
  router.get('/', async (req, res) => res.json({ state: await store.read(`review:${req.user!.userId}:101`) }))
  router.post('/update', async (req, res) => {
    const parsed = z.object({ updateId: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER - 1), command: z.string().min(1).max(4096), membership: z.enum(['member', 'absent', 'unavailable']), delivery: z.enum(['success', 'timeout']), ai: z.enum(['success', 'unavailable']).default('success') }).strict().safeParse(req.body)
    if (!parsed.success) { res.status(400).json({ error: 'Некорректная тестовая команда.' }); return }
    const input = parsed.data, replies: IeltsReply[] = []
    let sends = 0
    const fake: IeltsRequest = async <T>(method: string, body?: Record<string, unknown>): Promise<T> => {
      if (method === 'getChatMember') {
        if (input.membership === 'unavailable') throw new TelegramDeliveryError('unknown')
        return { status: input.membership === 'member' ? 'member' : 'left' } as T
      }
      if (method === 'answerCallbackQuery') return true as T
      if (method !== 'sendMessage') throw new Error('Unsupported synthetic operation')
      sends++
      if (input.delivery === 'timeout') throw new TelegramDeliveryError('unknown')
      const keyboard = body?.reply_markup as { inline_keyboard: { text: string; callback_data?: string; url?: string }[][] } | undefined
      replies.push({ text: String(body?.text), buttons: keyboard?.inline_keyboard.map(row => row.map(b => ({ text: b.text, data: b.callback_data, url: b.url }))) })
      return { message_id: 101 } as T
    }
    const handle = createIeltsBotHandler(store, fake, { channelId: '@synthetic', channelUrl: 'https://t.me/skyllaAI', accountPrefix: `review:${req.user!.userId}:` }, async job => {
      if (input.ai === 'unavailable') throw Error('Synthetic provider outage')
      return reviewWritingEvaluator(job)
    })
    const base = { chat: { id: 101, type: 'private' }, from: { id: 101 } }
    await handle(input.command.startsWith('i:') ? { update_id: input.updateId, callback_query: { id: 'synthetic-' + input.updateId, from: { id: 101 }, data: input.command, message: base } } : { update_id: input.updateId, message: { ...base, text: input.command } })
    res.json({ replies, sends, state: await store.read(`review:${req.user!.userId}:101`) })
  })
  return router
}
export default createIeltsBotReviewRouter()
