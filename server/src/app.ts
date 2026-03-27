import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import * as Sentry from '@sentry/node'
import type { Request, Response, NextFunction } from 'express'

import path from 'path'
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
import telegramRoutes      from './routes/telegram'
import uploadRoutes        from './routes/uploads'
import studyAbroadRoutes   from './routes/studyAbroad'
import courseGenerateRoutes from './routes/courseGenerate'
import referralRoutes      from './routes/referral'
import classesRoutes       from './routes/classes'
import assignmentsRoutes   from './routes/assignments'
import aiTestRoutes        from './routes/aiTest'
import orgsRoutes          from './routes/organizations'
import { tg }              from './lib/telegram'
import { setupSwagger }    from './lib/swagger'

// ── Sentry error tracking ────────────────────────────────────────────────────

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  })
}

const app = express()

// ── Security headers ────────────────────────────────────────────────────────
app.use(helmet())

// ── Rate limiting ───────────────────────────────────────────────────────────

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,    // 15 minutes
  max: 200,                     // 200 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много запросов, попробуйте позже' },
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,    // 15 minutes
  max: 15,                      // 15 auth attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много попыток входа, попробуйте через 15 минут' },
})

app.use(globalLimiter)

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json({ limit: '2mb' }))

// ── Routes ────────────────────────────────────────────────────────────────────

app.use('/api/auth',            authLimiter, authRoutes)
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
app.use('/api/telegram',        telegramRoutes)
app.use('/api/uploads',         uploadRoutes)
app.use('/api/study-abroad',    studyAbroadRoutes)
app.use('/api/courses',         courseGenerateRoutes) // adds /api/courses/generate
app.use('/api/referral',        referralRoutes)
app.use('/api/classes',        classesRoutes)
app.use('/api/assignments',    assignmentsRoutes)
app.use('/api/ai',             aiTestRoutes)
app.use('/api/orgs',           orgsRoutes)

// ── Static file serving for uploads ──────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// ── Swagger API docs ─────────────────────────────────────────────────────────

setupSwagger(app)

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
  Sentry.captureException(err)
  tg.error(err.message, err.stack)

  const isDev = process.env.NODE_ENV !== 'production'
  res.status(500).json({
    error: 'Внутренняя ошибка сервера',
    ...(isDev ? { details: err.message } : {}),
  })
})

export default app
