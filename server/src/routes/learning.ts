import { Router, type RequestHandler } from 'express'
import { z } from 'zod'
import rateLimit from 'express-rate-limit'
import { verifyToken } from '../middleware/auth'
import { learningRepository, type LearningRepository, type LearningRecord } from '../lib/learningRepository'
import { learningCurriculum, gradeLearningQuiz } from '../lib/learningCurriculum'
import { learningContext } from '../lib/learningContext'
import { askSkylla } from '../lib/growthAI'

const text = (max: number) => z.string().trim().max(max)
const revision = z.number().int().min(0)
export const learningMemorySchema = z.object({
  source: z.enum(['chatgpt', 'teacher', 'self', 'other']), sourceDate: text(40),
  summary: text(18000), goal: text(400), strengths: z.array(text(180)).max(20),
  completedTopics: z.array(text(180)).max(30), focusAreas: z.array(text(180)).max(20),
  nextStep: text(600), interests: text(400), dailyMinutes: z.number().int().min(5).max(120),
  aiConsent: z.boolean(),
}).strict()
const memoryInput = z.object({ profile: learningMemorySchema, revision, confirmed: z.literal(true) }).strict()
const draftSchema = z.object({ topicId: text(80), writing: text(12000), reflection: text(2000), answers: z.array(z.number().int().min(-1).max(10)).max(10), parentId: z.string().uuid().nullable() }).strict()
const attemptSchema = draftSchema.extend({ id: z.string().uuid(), mode: z.enum(['light', 'standard']) }).strict()
const itemSchema = z.object({ kind: z.enum(['error', 'phrase']), topic: text(100).min(1), original: text(500), correction: text(500).min(1), explanation: text(1000) }).strict()
type Mentor = (question: string, history: { role: 'user' | 'assistant'; content: string }[], context: string) => Promise<string>
const failure: RequestHandler = (_req, res) => { res.status(409).json({ error: 'Данные изменились в другой вкладке. Обновите страницу; ваш текст остаётся в форме.' }) }

export function createLearningRouter(repo: LearningRepository, mentor: Mentor, auth: RequestHandler = verifyToken) {
  const router = Router()
  router.use(auth)
  // Shared across chat and feedback: free access has a bounded operating cost.
  const aiLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 30, keyGenerator: req => req.user!.userId, message: { error: 'Лимит: 30 обращений к Skylla в час. Продолжайте упражнения и повторение без ИИ.' } })
  const pending = new Set<string>()
  const id = (value: unknown) => z.string().uuid().parse(value)
  const getAIContext = async (userId: string, mode: string) => {
    const [memory, items, attempts] = await Promise.all([repo.get(userId, 'memory'), repo.list(userId, 'item-', 100), repo.list(userId, 'attempt-', 3)])
    if (memory?.data.aiConsent !== true) return null
    const ordered = items.sort((a, b) => String(a.data.nextReviewAt).localeCompare(String(b.data.nextReviewAt)))
    return learningContext(memory, ordered, attempts, mode)
  }
  router.get('/', async (req, res) => {
    const userId = req.user!.userId
    const [memory, draft, turns, attempts, items] = await Promise.all([
      repo.get(userId, 'memory'), repo.get(userId, 'draft'), repo.list(userId, 'turn-', 40), repo.list(userId, 'attempt-', 100), repo.list(userId, 'item-', 100),
    ])
    res.json({ memory, draft, turns: turns.reverse(), attempts, items, curriculum: learningCurriculum })
  })
  router.put('/memory', async (req, res, next) => {
    const data = memoryInput.parse(req.body)
    const saved = await repo.put(req.user!.userId, 'memory', { ...data.profile, confirmedAt: new Date().toISOString(), evidence: 'learner-reported' }, data.revision)
    if (!saved) {
      const current = await repo.get(req.user!.userId, 'memory')
      if (current && Object.entries(data.profile).every(([key, value]) => JSON.stringify(current.data[key]) === JSON.stringify(value))) { res.json({ record: current }); return }
      return failure(req, res, next)
    }
    res.json({ record: saved })
  })
  router.delete('/memory', async (req, res) => {
    await repo.remove(req.user!.userId, 'memory')
    res.json({ ok: true })
  })
  router.put('/draft', async (req, res, next) => {
    const input = z.object({ draft: draftSchema, revision }).strict().parse(req.body)
    if (!learningCurriculum.some(l => l.id === input.draft.topicId)) { res.status(400).json({ error: 'Неизвестное занятие.' }); return }
    const saved = await repo.put(req.user!.userId, 'draft', input.draft, input.revision)
    if (!saved) {
      const current = await repo.get(req.user!.userId, 'draft')
      if (current && JSON.stringify(current.data) === JSON.stringify(input.draft)) { res.json({ record: current }); return }
      return failure(req, res, next)
    }
    res.json({ record: saved })
  })
  router.post('/attempts', async (req, res) => {
    const data = attemptSchema.parse(req.body)
    const userId = req.user!.userId
    const score = gradeLearningQuiz(data.topicId, data.answers)
    if (!score || data.writing.length < 30) { res.status(400).json({ error: 'Ответьте на вопросы и добавьте свой текст (минимум 30 символов).' }); return }
    const prior = await repo.get(userId, 'attempt-' + data.id)
    if (prior) {
      if (JSON.stringify(prior.data.submission) !== JSON.stringify(data)) { res.status(409).json({ error: 'Эта попытка уже сохранена с другим ответом.' }); return }
      res.json({ record: prior }); return
    }
    if (data.parentId && !(await repo.get(userId, 'attempt-' + data.parentId))) { res.status(400).json({ error: 'Исходная попытка не найдена в вашем аккаунте.' }); return }
    const saved = await repo.put(userId, 'attempt-' + data.id, { ...data, submission: data, score, feedback: null, createdAt: new Date().toISOString() }, 0)
    if (!saved) { res.status(409).json({ error: 'Попытка уже сохранена. Обновите историю.' }); return }
    res.status(201).json({ record: saved })
  })
  router.post('/attempts/:id/feedback', aiLimit, async (req, res, next) => {
    const userId = req.user!.userId
    const attemptId = 'attempt-' + id(req.params.id)
    const attempt = await repo.get(userId, attemptId)
    if (!attempt) { res.status(404).json({ error: 'Работа не найдена.' }); return }
    if (attempt.data.feedback) { res.json({ record: attempt }); return }
    const context = await getAIContext(userId, String(attempt.data.mode))
    if (!context) { res.status(403).json({ error: 'Разрешите использование учебной памяти ИИ в профиле.' }); return }
    const lock = userId + ':' + attemptId
    if (pending.has(lock)) { res.status(409).json({ error: 'Разбор уже готовится. Подождите и обновите историю.' }); return }
    pending.add(lock)
    try {
      const lesson = learningCurriculum.find(l => l.id === attempt.data.topicId)
      const previous = attempt.data.parentId ? await repo.get(userId, 'attempt-' + attempt.data.parentId) : null
      const question = `Разбери учебную работу, не присваивая IELTS band. Покажи 1–3 конкретные ошибки с цитатами, исправлением и объяснением, затем одно новое упражнение для переноса навыка. Отдельно отметь удачное. ${previous ? 'Сравни с предыдущей работой, не называй исправление устойчивым навыком по одной попытке.' : ''}\nДанные работы: ${JSON.stringify({ task: lesson?.writingPrompt, writing: attempt.data.writing, previous: previous?.data.writing })}`
      let feedback: string
      try { feedback = await mentor(question, [], context); if (!feedback.trim()) throw new Error('empty') }
      catch { res.status(502).json({ error: 'Skylla не смогла разобрать работу. Работа сохранена — повторите запрос позже.' }); return }
      const saved = await repo.put(userId, attemptId, { ...attempt.data, feedback: feedback.slice(0, 12000), feedbackAt: new Date().toISOString() }, attempt.revision)
      if (!saved) return failure(req, res, next)
      res.json({ record: saved })
    } finally { pending.delete(lock) }
  })
  router.post('/chat', aiLimit, async (req, res) => {
    const data = z.object({ id: z.string().uuid(), message: text(12000).min(1), mode: z.enum(['light', 'standard']) }).strict().parse(req.body)
    const userId = req.user!.userId
    const existing = await repo.get(userId, 'turn-' + data.id)
    if (existing) {
      if (existing.data.message !== data.message || existing.data.mode !== data.mode) { res.status(409).json({ error: 'Этот запрос уже использован для другого сообщения.' }); return }
      res.json({ record: existing }); return
    }
    const context = await getAIContext(userId, data.mode)
    if (!context) { res.status(403).json({ error: 'Сохраните учебный профиль и разрешите передачу выбранного учебного контекста ИИ.' }); return }
    if (pending.has(userId)) { res.status(409).json({ error: 'Skylla уже отвечает. Дождитесь ответа.' }); return }
    pending.add(userId)
    try {
      const turns = (await repo.list(userId, 'turn-', 5)).reverse()
      const history = turns.flatMap(r => [{ role: 'user' as const, content: String(r.data.message).slice(0, 6000) }, { role: 'assistant' as const, content: String(r.data.reply).slice(0, 6000) }])
      let reply: string
      try { reply = await mentor(data.message, history, context); if (!reply.trim()) throw new Error('empty') }
      catch { res.status(502).json({ error: 'Skylla временно недоступна. Сообщение осталось в поле; повторите отправку.' }); return }
      const saved = await repo.put(userId, 'turn-' + data.id, { message: data.message, reply: reply.slice(0, 12000), mode: data.mode, createdAt: new Date().toISOString() }, 0)
      if (!saved) { res.status(409).json({ error: 'Ответ уже сохранён. Обновите диалог.' }); return }
      res.json({ record: saved })
    } finally { pending.delete(userId) }
  })
  router.delete('/chat', async (req, res) => {
    if (pending.has(req.user!.userId)) { res.status(409).json({ error: 'Дождитесь завершения ответа перед удалением диалога.' }); return }
    await repo.removePrefix(req.user!.userId, 'turn-')
    res.json({ ok: true })
  })
  router.post('/items', async (req, res) => {
    const data = z.object({ id: z.string().uuid(), item: itemSchema }).strict().parse(req.body)
    const userId = req.user!.userId
    const existing = await repo.get(userId, 'item-' + data.id)
    if (existing) {
      if (JSON.stringify(existing.data.input) !== JSON.stringify(data.item)) { res.status(409).json({ error: 'Запись уже существует с другим содержимым.' }); return }
      res.json({ record: existing }); return
    }
    if ((await repo.list(userId, 'item-', 100)).length >= 100) { res.status(400).json({ error: 'В журнале 100 записей. Удалите ненужные перед добавлением.' }); return }
    const saved = await repo.put(userId, 'item-' + data.id, { ...data.item, input: data.item, streak: 0, nextReviewAt: new Date().toISOString(), history: [] }, 0)
    if (!saved) { res.status(409).json({ error: 'Запись уже добавлена. Обновите журнал.' }); return }
    res.status(201).json({ record: saved })
  })
  router.post('/items/:id/review', async (req, res, next) => {
    const data = z.object({ revision, recalled: z.boolean(), example: text(1000).min(10) }).strict().parse(req.body)
    const itemId = 'item-' + id(req.params.id)
    const item = await repo.get(req.user!.userId, itemId)
    if (!item) { res.status(404).json({ error: 'Запись не найдена.' }); return }
    const streak = data.recalled ? Math.min(Number(item.data.streak) + 1, 4) : 0
    const days = [1, 3, 7, 14, 30][streak]
    const history = Array.isArray(item.data.history) ? item.data.history : []
    const saved = await repo.put(req.user!.userId, itemId, { ...item.data, streak, nextReviewAt: new Date(Date.now() + days * 86400000).toISOString(), history: [...history, { ...data, at: new Date().toISOString(), evidence: 'self-review' }].slice(-20) }, data.revision)
    if (!saved) return failure(req, res, next)
    res.json({ record: saved })
  })
  router.delete('/items/:id', async (req, res) => { await repo.remove(req.user!.userId, 'item-' + id(req.params.id)); res.json({ ok: true }) })
  router.get('/export', async (req, res) => {
    const records = await repo.list(req.user!.userId, '', 1001)
    res.json({ format: 'studyhub-learning-archive', version: 1, exportedAt: new Date().toISOString(), truncated: records.length > 1000, records: records.slice(0, 1000) })
  })
  // Validate every boundary here instead of letting validation failures become HTTP 500.
  router.use((err: unknown, _req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
    if (err instanceof z.ZodError) { res.status(400).json({ error: 'Проверьте заполнение полей и размер текста.', details: err.issues.map(i => i.path.join('.')) }); return }
    next(err)
  })
  return router
}

export default createLearningRouter(learningRepository, (question, history, context) => askSkylla(question, 'ученик', history, context))
