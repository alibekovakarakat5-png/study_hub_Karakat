import { Router, type RequestHandler } from 'express'
import { z } from 'zod'
import { verifyToken } from '../middleware/auth'
import { admissionsFixtureId } from '../lib/reviewStore'
import { createProgressRepository, type LearningRepository } from '../lib/learningRepository'
import { reviewPublicationStore } from '../lib/telegramReview'
import { publishManualPost, publicationNotice } from '../lib/channelPublication'
import { createTelegramRequest } from '../lib/telegramTransport'
import { appSite, automaticChannelPolicy, entMiniResult, ieltsEntry } from '../lib/telegramContent'

export function createTelegramReviewRouter(repo: LearningRepository = createProgressRepository('owner-review-v1-telegram-'), auth: RequestHandler = verifyToken) {
  const router = Router()
  router.use(auth)
  router.use((req, res, next) => {
    const scope = req.user?.reviewSession
    if (!scope?.admissionsRunId || !['telegram-reviewer', 'telegram-outsider'].some(p => admissionsFixtureId(scope.ownerId, scope.admissionsRunId!, p) === req.user!.userId)) {
      res.status(403).json({ error: 'Откройте тестовую роль из сценария Telegram в кабинете владельца.' }); return
    }
    res.setHeader('Cache-Control', 'no-store')
    next()
  })
  router.get('/', async (req, res) => res.json({
    policy: automaticChannelPolicy, ielts: ieltsEntry(appSite(), '\n\n📖 Тестовое слово: practice — практика'), ent: entMiniResult(3),
    publications: (await repo.list(req.user!.userId, 'publication-', 100)).map(row => row.data),
  }))
  router.post('/drafts', async (req, res) => {
    const { id, text } = z.object({ id: z.string().uuid(), text: z.string().trim().min(1).max(3000) }).strict().parse(req.body)
    const post = await reviewPublicationStore(repo, req.user!.userId).prepare(id, text, 'synthetic-channel')
    res.json({ post, notice: publicationNotice(post) })
  })
  router.post('/publish', async (req, res) => {
    const { id, outcome } = z.object({ id: z.string().uuid(), outcome: z.enum(['success', 'rejected', 'timeout']) }).strict().parse(req.body)
    const store = reviewPublicationStore(repo, req.user!.userId)
    if (!await store.get(id)) { res.status(404).json({ error: 'Черновик этой тестовой роли не найден.' }); return }
    let requests = 0
    // No live fetch, credentials or selectable destination. Only this response is substituted.
    const request = createTelegramRequest(() => 'synthetic-only', async () => {
      requests++
      if (outcome === 'timeout') throw new Error('Synthetic timeout')
      return new Response(JSON.stringify(outcome === 'success' ? { ok: true, result: { message_id: 101 } } : { ok: false, error_code: 403 }), { status: outcome === 'success' ? 200 : 403 })
    })
    const post = await publishManualPost(store, id, (target, text) => request('sendMessage', { chat_id: target, text }))
    res.json({ post, notice: publicationNotice(post), requests })
  })
  router.use((err: unknown, _req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
    if (err instanceof z.ZodError) { res.status(400).json({ error: 'Проверьте текст и выбранный вариант доставки.' }); return }
    next(err)
  })
  return router
}
export default createTelegramReviewRouter()
