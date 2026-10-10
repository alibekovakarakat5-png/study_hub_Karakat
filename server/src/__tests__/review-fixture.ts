import 'express-async-errors'
import express from 'express'
import { createReviewRouter, createReviewFeed } from '../routes/review'
import { createTokenVerifier, signToken } from '../middleware/auth'
import { fixtureId, admissionsFixtureId, isAdmissionsPersona } from '../lib/reviewStore'
import { isClassroomPersona, reviewClassroomId, reviewClassroomUserId } from '../lib/reviewClassroom'
import { createLearningRouter } from '../routes/learning'
import { createModuleProgressRouter } from '../routes/moduleProgress'
import type { LearningRecord, LearningRepository } from '../lib/learningRepository'

export function memoryRepository(): LearningRepository {
  const rows = new Map<string, LearningRecord>()
  return {
    async get(u, id) { return structuredClone(rows.get(u + ':' + id) ?? null) },
    async list(u, prefix, limit = 100) { return structuredClone([...rows.entries()].filter(([k, r]) => k.startsWith(u + ':') && r.id.startsWith(prefix)).map(([, r]) => r).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, limit)) },
    async put(u, id, data, revision) {
      const key = u + ':' + id
      if ((rows.get(key)?.revision ?? 0) !== revision) return null
      const row = { id, revision: revision + 1, data: structuredClone(data), updatedAt: new Date().toISOString() }
      rows.set(key, row); return structuredClone(row)
    },
    async remove(u, id) { rows.delete(u + ':' + id) },
    async removePrefix(u, prefix) { for (const k of rows.keys()) if (k.startsWith(u + ':' + prefix)) rows.delete(k) },
  }
}
export function reviewFixture() {
  const repo = memoryRepository(); const learning = memoryRepository()
  const progress = memoryRepository()
  const owners = new Set(['owner-a', 'owner-b'])
  const owner = async (u: string) => owners.has(u)
  const auth = createTokenVerifier(async (ownerId, sessionId, userId) => {
    const row = await repo.get(ownerId, 'session-' + sessionId)
    return !!row && row.data.userId === userId && !row.data.endedAt && Number(row.data.expiresAt) > Date.now() && owners.has(ownerId)
  }, async () => true)
  const app = express().use(express.json({ limit: '2mb' }))
  const persona = async (ownerId: string, name: string, runId?: string) => ({ id: isAdmissionsPersona(name) ? admissionsFixtureId(ownerId, runId!, name) : isClassroomPersona(name) ? reviewClassroomUserId(reviewClassroomId(ownerId, runId!), name) : fixtureId(ownerId, name), email: 'test@studyhub.invalid', role: name === 'parent' ? 'parent' : name === 'teacher' || name === 'center' || name === 'classroom-curator' ? 'teacher' : 'student', name: 'Synthetic ' + name, grade: isClassroomPersona(name) ? 6 : 11, city: 'Test', isPremium: false })
  app.use('/api/review', createReviewRouter({ repo, owner, persona: persona as never, auth }))
  app.use('/api/review-feed', createReviewFeed({ repo, owner }))
  app.use('/api/learning', createLearningRouter(learning, async () => 'Synthetic feedback for browser verification only.', auth))
  // Real HTTP handler and authorization; only its database adapter is substituted.
  const db = { moduleProgress: {
    async upsert(args: { where: { userId_moduleId: { userId: string; moduleId: string } }; create: Record<string, unknown>; update: Record<string, unknown> }) {
      const { userId, moduleId } = args.where.userId_moduleId
      const old = await progress.get(userId, moduleId)
      return (await progress.put(userId, moduleId, old ? { ...old.data, ...args.update } : args.create, old?.revision ?? 0))!.data
    },
    async findMany(args: { where: { userId: string } }) { return (await progress.list(args.where.userId, '')).map(r => r.data) },
    async findUnique(args: { where: { userId_moduleId: { userId: string; moduleId: string } } }) { const { userId, moduleId } = args.where.userId_moduleId; return (await progress.get(userId, moduleId))?.data ?? null },
  } }
  app.use('/api/module-progress', createModuleProgressRouter(db as never, auth))
  app.get('/api/content', auth, (_req, res) => res.json({ items: [] }))
  app.get('/api/admissions', auth, (_req, res) => res.json({ deadlines: [] }))
  const country = { id:'synthetic-country',countryCode:'XX',nameRu:'Тестовая страна',nameEn:'Test country',nameKk:'Test',flagEmoji:'🌐',region:'Europe',requirements:{visa:'Тестовое условие',documents:['Тестовый документ'],language:'Тестовый язык'},universities:[],scholarships:[],timeline:[],costs:{tuitionUSD:'Test',livingUSD:'Test',insuranceUSD:'Test'},languageReqs:{primary:'Test',tests:[]},mentorWhatsApp:'',isActive:true,order:0 }
  app.get('/api/study-abroad', auth, (_req,res) => res.json({countries:[country]}))
  app.get('/api/study-abroad/XX', auth, (_req,res) => res.json({country}))
  app.get('/api/auth/me', auth, (req, res) => res.json({ user: req.user }))
  app.post('/api/billing/pay', auth, (_req, res) => res.json({ shouldNeverExecute: true }))
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => res.status(500).json({ error: err.message }))
  const token = (id = 'owner-a', role = 'admin') => signToken({ userId: id, role, email: id + '@example.invalid' })
  return { repo, app, token, owners, auth, learning, progress }
}
