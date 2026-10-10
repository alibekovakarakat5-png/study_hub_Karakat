import { Router, type RequestHandler } from 'express'
import { randomBytes, randomUUID, createHash, timingSafeEqual } from 'crypto'
import { z } from 'zod'
import { verifyToken, signToken } from '../middleware/auth'
import { reviewStore, isReviewOwner, provisionPersona, isAdmissionsPersona } from '../lib/reviewStore'
import { evidenceContext, screenshotSchema, evidenceDigest } from '../lib/reviewEvidence'
import { reviewBuild, reviewCatalog, reviewPersonas } from '../lib/reviewCatalog'
import type { LearningRepository } from '../lib/learningRepository'
import { isClassroomPersona, reviewClassroomId } from '../lib/reviewClassroom'

const uuid = z.string().uuid()
const revision = z.number().int().min(1)
const sha = z.string().regex(/^(?:[a-f0-9]{7,40}|unknown)$/)
const comment = z.string().trim().max(4000)
const hash = (value: string) => createHash('sha256').update(value).digest('hex')
export type ReviewDependencies = {
  repo: LearningRepository; owner: (id: string) => Promise<boolean>;
  persona: typeof provisionPersona; auth?: RequestHandler;
}
const live: ReviewDependencies = { repo: reviewStore, owner: isReviewOwner, persona: provisionPersona }
function cleanPath(input: string) {
  if (!input.startsWith('/') || input.startsWith('//')) return '/'
  return input.split(/[?#]/)[0].slice(0, 160)
}
async function report(repo: LearningRepository, userId: string, withImages = false) {
  const [runs, feedback] = await Promise.all([repo.list(userId, 'run-', 501), repo.list(userId, 'feedback-', 501)])
  const attachments = []
  if (withImages) for (const row of feedback.slice(0,500)) {
    if (typeof row.data.screenshotId === 'string') {
      const image = await repo.get(userId, 'attachment-' + row.data.screenshotId)
      if (image) attachments.push(image)
    }
  }
  return { format: 'studyhub-owner-review', version: 2, exportedAt: new Date().toISOString(), truncated: runs.length > 500 || feedback.length > 500, runs: runs.slice(0, 500), feedback: feedback.slice(0, 500), ...(withImages ? { attachments } : {}) }
}
export function createReviewRouter(deps: ReviewDependencies = live) {
  const { repo, owner } = deps
  const router = Router()
  router.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next() })
  router.use(deps.auth ?? verifyToken)
  router.use(async (req, res, next) => {
    if (req.user?.reviewSession || req.user?.role !== 'admin' || !await owner(req.user.userId)) {
      res.status(403).json({ error: 'Этот кабинет доступен только назначенному владельцу. Права выдаются через служебную процедуру.' }); return
    }
    next()
  })
  router.get('/', async (req, res) => {
    const [runs, feedback, sessions] = await Promise.all([repo.list(req.user!.userId, 'run-', 101), repo.list(req.user!.userId, 'feedback-', 201), repo.list(req.user!.userId, 'session-', 51)])
    res.json({ catalog: reviewCatalog, personas: reviewPersonas, build: reviewBuild(), runs: runs.slice(0, 100), feedback: feedback.slice(0, 200), sessions: sessions.slice(0, 50), truncated: runs.length > 100 || feedback.length > 200 || sessions.length > 50,
      services: { storage: 'reachable', ai: process.env.GROQ_API_KEY ? 'configured-not-tested' : 'not-configured', email: process.env.SMTP_HOST ? 'configured-not-tested' : 'not-configured' }, checkedAt: new Date().toISOString() })
  })
  router.post('/runs', async (req, res) => {
    const input = z.object({ id: uuid, scenarioId: z.string(), frontendSha: sha }).strict().parse(req.body)
    const scenario = reviewCatalog.find(c => c.id === input.scenarioId)
    if (!scenario) { res.status(400).json({ error: 'Неизвестный сценарий.' }); return }
    const old = await repo.get(req.user!.userId, 'run-' + input.id)
    if (old) {
      if (old.data.scenarioId !== input.scenarioId || old.data.frontendSha !== input.frontendSha) { res.status(409).json({ error: 'Номер проверки уже использован.' }); return }
      res.json({ record: old }); return
    }
    const record = await repo.put(req.user!.userId, 'run-' + input.id, { ...input, backend: reviewBuild(), scenario, steps: {}, createdAt: new Date().toISOString() }, 0)
    if (!record) { res.status(409).json({ error: 'Проверка уже создана. Обновите список.' }); return }
    res.status(201).json({ record })
  })
  router.put('/runs/:id/steps/:stepId', async (req, res) => {
    const input = z.object({ revision, outcome: z.enum(['passed', 'failed', 'unclear', 'skipped']), comment, path: z.string().max(2048), sessionId: uuid.optional() }).strict().parse(req.body)
    const key = 'run-' + uuid.parse(req.params.id)
    const run = await repo.get(req.user!.userId, key)
    const scenario = run?.data.scenario as typeof reviewCatalog[number] | undefined
    if (!run || !scenario?.steps.some(s => s.id === req.params.stepId)) { res.status(404).json({ error: 'Шаг проверки не найден.' }); return }
    if (run.data.scenarioId === 'admissions-review-v1') {
      const step = scenario.steps.find(s => s.id === req.params.stepId)!
      const session = input.sessionId ? await repo.get(req.user!.userId, 'session-' + input.sessionId) : null
      if (!session || session.data.runId !== run.data.id || session.data.persona !== step.persona || step.path !== cleanPath(input.path)) { res.status(400).json({ error: 'Проверьте страницу и тестовую роль.' }); return }
    }
    if (req.get('X-StudyHub-Build') !== run.data.frontendSha || (run.data.backend as { sha: string }).sha !== reviewBuild().sha) {
      res.status(409).json({ error: 'Версия сайта или сервера изменилась. Начните новую проверку текущего выпуска; прежние результаты сохранены.' }); return
    }
    if (['failed', 'unclear'].includes(input.outcome) && !input.comment) { res.status(400).json({ error: 'Опишите, что произошло.' }); return }
    const value = { outcome: input.outcome, comment: input.comment, path: cleanPath(input.path), at: new Date().toISOString() }
    const saved = await repo.put(req.user!.userId, key, { ...run.data, steps: { ...(run.data.steps as object), [String(req.params.stepId)]: value } }, input.revision)
    if (!saved) { res.status(409).json({ error: 'Проверка изменена в другой вкладке. Текст сохраните перед обновлением.' }); return }
    res.json({ record: saved })
  })
  router.post('/feedback', async (req, res) => {
    const input = z.object({ id: uuid, ...evidenceContext, text: comment.min(1), screenshotId: uuid.optional(), outcome: z.enum(['failed','unclear']).optional() }).strict().parse(req.body)
    const run = await repo.get(req.user!.userId, 'run-' + input.runId)
    const step = (run?.data.scenario as typeof reviewCatalog[number] | undefined)?.steps.find(s => s.id === input.stepId)
    if (!run || !step) { res.status(404).json({ error: 'Шаг проверки не найден.' }); return }
    const normalized = { ...input, path: cleanPath(input.path) }
    const digest = evidenceDigest(normalized)
    const key = 'feedback-' + input.id
    const previous = await repo.get(req.user!.userId, key)
    if (previous) {
      if (previous.data.digest ? previous.data.digest !== digest : previous.data.text !== input.text || previous.data.runId !== input.runId || previous.data.stepId !== input.stepId || previous.data.path !== normalized.path) { res.status(409).json({ error: 'Замечание с таким номером уже существует.' }); return }
      res.json({ record: previous }); return
    }
    if (req.get('X-StudyHub-Build') !== run.data.frontendSha || (run.data.backend as { sha: string }).sha !== reviewBuild().sha) { res.status(409).json({ error: 'Версия изменилась. Черновик сохраните; начните проверку текущей версии.' }); return }
    const session = input.sessionId ? await repo.get(req.user!.userId, 'session-' + input.sessionId) : null
    if (input.sessionId && (!session || session.data.runId !== input.runId)) { res.status(400).json({ error: 'Тестовая роль относится к другой проверке.' }); return }
    if (run.data.scenarioId === 'admissions-review-v1' && (!session || session.data.persona !== step.persona || step.path !== normalized.path)) { res.status(400).json({ error: 'Страница или фактическая роль не совпадает с шагом. Откройте нужную страницу тестовым кандидатом.' }); return }
    if (input.screenshotId) {
      const image = await repo.get(req.user!.userId, 'attachment-' + input.screenshotId)
      if (!image || image.data.runId !== input.runId || image.data.stepId !== input.stepId || image.data.path !== normalized.path || image.data.sessionId !== input.sessionId || image.data.section !== input.section || image.data.capturedAt !== input.capturedAt) { res.status(400).json({ error: 'Скриншот не относится к этому замечанию.' }); return }
    }
    const record = await repo.put(req.user!.userId, key, { ...normalized, digest, scenarioId: run.data.scenarioId, persona: session?.data.persona ?? 'owner', frontendSha: run.data.frontendSha, backend: run.data.backend, status: 'new', history: [], createdAt: new Date().toISOString() }, 0)
    if (!record) { res.status(409).json({ error: 'Замечание уже добавлено.' }); return }
    res.status(201).json({ record })
  })
  router.post('/attachments', async (req, res) => {
    const input = z.object({ id: uuid, ...evidenceContext, dataUrl: screenshotSchema }).strict().parse(req.body)
    const data = { ...input, path: cleanPath(input.path) }
    const old = await repo.get(req.user!.userId, 'attachment-' + input.id)
    if (old) { res.status(evidenceDigest(old.data) === evidenceDigest(data) ? 200 : 409).json({ id: input.id, error: 'Этот номер изображения уже использован.' }); return }
    const run = await repo.get(req.user!.userId, 'run-' + input.runId)
    const step = (run?.data.scenario as typeof reviewCatalog[number] | undefined)?.steps.find(s => s.id === input.stepId)
    const session = input.sessionId ? await repo.get(req.user!.userId, 'session-' + input.sessionId) : null
    if (!run || !step || (input.sessionId && (!session || session.data.runId !== input.runId))) { res.status(400).json({ error: 'Не найден контекст изображения.' }); return }
    if (req.get('X-StudyHub-Build') !== run.data.frontendSha || (run.data.backend as { sha: string }).sha !== reviewBuild().sha) { res.status(409).json({ error: 'Версия изменилась; изображение осталось в черновике.' }); return }
    if (run.data.scenarioId === 'admissions-review-v1' && (!session || session.data.persona !== step.persona || step.path !== data.path)) { res.status(400).json({ error: 'Скриншот относится к другой странице или роли.' }); return }
    const record = await repo.put(req.user!.userId, 'attachment-' + input.id, data, 0)
    res.status(record ? 201 : 409).json({ id: input.id })
  })
  router.get('/attachments/:id', async (req, res) => {
    const record = await repo.get(req.user!.userId, 'attachment-' + uuid.parse(req.params.id))
    if (!record) { res.status(404).json({ error: 'Изображение не найдено.' }); return }
    res.json({ record })
  })
  router.patch('/feedback/:id', async (req, res) => {
    const input = z.object({ revision, status: z.enum(['new', 'in-progress', 'ready', 'accepted']), note: comment, fixedSha: sha.optional(), proofRunId: uuid.optional() }).strict().parse(req.body)
    const key = 'feedback-' + uuid.parse(req.params.id)
    const item = await repo.get(req.user!.userId, key)
    if (!item) { res.status(404).json({ error: 'Замечание не найдено.' }); return }
    if (input.status === 'ready' && (!input.fixedSha || input.fixedSha === 'unknown' || !input.note)) { res.status(400).json({ error: 'Укажите версию исправления и что изменено.' }); return }
    if (input.status === 'accepted') {
      const proof = input.proofRunId ? await repo.get(req.user!.userId, 'run-' + input.proofRunId) : null
      const outcomes = proof?.data.steps as Record<string, { outcome: string }> | undefined
      if (item.data.status !== 'ready' || !proof || proof.id === 'run-' + item.data.runId || proof.data.scenarioId !== item.data.scenarioId || outcomes?.[String(item.data.stepId)]?.outcome !== 'passed' || proof.data.frontendSha !== item.data.fixedSha || (proof.data.backend as { sha: string }).sha !== item.data.fixedSha) {
        res.status(400).json({ error: 'Для принятия пройдите этот шаг в новой проверке на версии исправления сайта и сервера.' }); return
      }
    }
    const history = item.data.history as unknown[]
    const record = await repo.put(req.user!.userId, key, { ...item.data, status: input.status, fixedSha: input.status === 'ready' ? input.fixedSha : item.data.fixedSha ?? null, history: [...history, { ...input, at: new Date().toISOString() }].slice(-50) }, input.revision)
    if (!record) { res.status(409).json({ error: 'Замечание изменено. Обновите очередь.' }); return }
    res.json({ record })
  })
  router.post('/sessions', async (req, res) => {
    const input = z.object({ id: uuid, persona: z.string(), runId: uuid }).strict().parse(req.body)
    const spec = reviewPersonas.find(p => p.id === input.persona)
    const run = await repo.get(req.user!.userId, 'run-' + input.runId)
    if (!spec || !run) { res.status(400).json({ error: 'Выберите проверку и тестовую роль.' }); return }
    const runScenario = run.data.scenario as typeof reviewCatalog[number]
    if (!runScenario.steps.some(step => step.persona === spec.id)) { res.status(400).json({ error: 'Эта роль не входит в выбранный сценарий.' }); return }
    const classroomId = isClassroomPersona(spec.id) ? reviewClassroomId(req.user!.userId, input.runId) : undefined
    const user = await deps.persona(req.user!.userId, spec.id, input.runId)
    const key = 'session-' + input.id
    let session = await repo.get(req.user!.userId, key)
    if (session && (session.data.userId !== user.id || session.data.runId !== input.runId || session.data.endedAt || Number(session.data.expiresAt) <= Date.now())) { res.status(409).json({ error: 'Сессия завершена или относится к другой проверке.' }); return }
    if (!session) session = await repo.put(req.user!.userId, key, { userId: user.id, persona: spec.id, runId: input.runId, startedAt: new Date().toISOString(), expiresAt: Date.now() + 30 * 60 * 1000 }, 0)
    if (!session) { res.status(409).json({ error: 'Сессия уже создаётся.' }); return }
    res.json({ token: signToken({ userId: user.id, email: user.email, role: user.role, reviewSession: { ownerId: req.user!.userId, sessionId: input.id, ...(classroomId ? { classroomId } : {}), ...(isAdmissionsPersona(spec.id) ? { admissionsRunId: input.runId } : {}) } }), user, session, path: classroomId ? '/classroom?class=' + classroomId : spec.path })
  })
  router.delete('/sessions/:id', async (req, res) => {
    const key = 'session-' + uuid.parse(req.params.id)
    const row = await repo.get(req.user!.userId, key)
    if (row && !row.data.endedAt) {
      const saved = await repo.put(req.user!.userId, key, { ...row.data, endedAt: new Date().toISOString() }, row.revision)
      if (!saved) { res.status(409).json({ error: 'Сессия изменилась. Повторите завершение.' }); return }
    }
    res.json({ ok: true })
  })
  router.get('/export', async (req, res) => { res.json(await report(repo, req.user!.userId, true)) })
  router.post('/reader-key', async (req, res) => {
    const secret = randomBytes(32).toString('hex'); const keyId = randomUUID()
    const old = await repo.get(req.user!.userId, 'reader-key')
    const expiresAt = Date.now() + 7 * 86400000
    const saved = await repo.put(req.user!.userId, 'reader-key', { keyId, digest: hash(secret), expiresAt }, old?.revision ?? 0)
    if (!saved) { res.status(409).json({ error: 'Ключ изменён в другой вкладке.' }); return }
    res.json({ key: `${req.user!.userId}.${keyId}.${secret}`, expiresAt })
  })
  router.delete('/reader-key', async (req, res) => { await repo.remove(req.user!.userId, 'reader-key'); res.json({ ok: true }) })
  router.use((err: unknown, _req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
    if (err instanceof z.ZodError) { res.status(400).json({ error: 'Проверьте поля запроса.' }); return } next(err)
  })
  return router
}
export function createReviewFeed(deps: Pick<ReviewDependencies, 'repo' | 'owner'> = live) {
  const router = Router()
  router.use(async (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store')
    const parts = req.headers.authorization?.replace(/^Bearer /, '').split('.') ?? []
    if (parts.length !== 3 || parts[2].length !== 64) { res.status(401).json({ error: 'Нужен ключ чтения очереди.' }); return }
    const row = await deps.repo.get(parts[0], 'reader-key')
    const digest = hash(parts[2])
    if (!row || row.data.keyId !== parts[1] || Number(row.data.expiresAt) <= Date.now() || typeof row.data.digest !== 'string' || row.data.digest.length !== digest.length || !timingSafeEqual(Buffer.from(row.data.digest), Buffer.from(digest)) || !await deps.owner(parts[0])) {
      res.status(401).json({ error: 'Ключ истёк или отозван.' }); return
    }
    res.locals.reviewOwner = parts[0]
    next()
  })
  router.get('/', async (_req, res) => res.json(await report(deps.repo, res.locals.reviewOwner)))
  router.get('/attachments/:id', async (req, res) => {
    if (!uuid.safeParse(req.params.id).success) { res.status(400).json({ error: 'Неверный номер изображения.' }); return }
    const record = await deps.repo.get(res.locals.reviewOwner, 'attachment-' + req.params.id)
    if (!record) { res.status(404).json({ error: 'Изображение не найдено.' }); return }
    res.json({ record })
  })
  return router
}
export default createReviewRouter()
