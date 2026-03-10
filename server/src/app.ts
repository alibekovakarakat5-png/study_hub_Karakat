import express from 'express'
import cors from 'cors'
import type { Request, Response, NextFunction } from 'express'

import authRoutes          from './routes/auth'
import adminRoutes         from './routes/admin'
import usersRoutes         from './routes/users'
import diagnosticRoutes    from './routes/diagnostic'
import studyPlanRoutes     from './routes/studyPlan'
import moduleProgressRoutes from './routes/moduleProgress'
import entResultsRoutes    from './routes/entResults'
import contentRoutes       from './routes/content'
import admissionsRoutes    from './routes/admissions'
import coursesRoutes       from './routes/courses'
import plansRoutes         from './routes/plans'
import billingRoutes       from './routes/billing'
import { tg }              from './lib/telegram'

const app = express()

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json({ limit: '2mb' }))

// ── Routes ────────────────────────────────────────────────────────────────────

app.use('/api/auth',            authRoutes)
app.use('/api/admin',           adminRoutes)
app.use('/api/users',           usersRoutes)
app.use('/api/diagnostic',      diagnosticRoutes)
app.use('/api/study-plans',     studyPlanRoutes)
app.use('/api/module-progress', moduleProgressRoutes)
app.use('/api/ent-results',     entResultsRoutes)
app.use('/api/content',         contentRoutes)
app.use('/api/admissions',      admissionsRoutes)
app.use('/api/courses',         coursesRoutes)
app.use('/api/plans',           plansRoutes)
app.use('/api/billing',         billingRoutes)

// ── Health check ──────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() })
})

// ── 404 ───────────────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' })
})

// ── Global error handler ──────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error]', err.message)
  tg.error(err.message, err.stack)
  res.status(500).json({ error: 'Внутренняя ошибка сервера' })
})

export default app
