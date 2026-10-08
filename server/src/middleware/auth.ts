import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { validReviewSession, allowedTestRequest } from '../lib/reviewStore'
import { TEST_USER_PREFIX } from '../lib/reviewCatalog'

// ── Extend Express Request ────────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

// ── JWT helpers ───────────────────────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET ?? (() => {
  console.warn('⚠️  JWT_SECRET not set — using insecure default. Set JWT_SECRET in .env for production!')
  return 'dev-secret-change-in-production'
})()

export interface JwtPayload {
  userId: string
  role: string
  email: string
  reviewSession?: { ownerId: string; sessionId: string }
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: payload.reviewSession ? '30m' : '7d' })
}

// ── Middleware ────────────────────────────────────────────────────────────────

export function createTokenVerifier(validateSession = validReviewSession) {
return async function verify(req: Request, res: Response, next: NextFunction): Promise<void> {
  // Token normally comes in the Authorization header. For links opened directly
  // in a new browser tab (e.g. parent/center report HTML), we also accept it as
  // a ?token= query param since the browser can't set headers on a plain link.
  const header = req.headers.authorization
  const queryToken = typeof req.query['token'] === 'string' ? req.query['token'] : null
  const token = header?.startsWith('Bearer ') ? header.slice(7) : queryToken

  if (!token) {
    res.status(401).json({ error: 'Требуется авторизация' })
    return
  }

  let payload: JwtPayload
  try {
    payload = jwt.verify(token, JWT_SECRET) as JwtPayload
    if (typeof payload.userId !== 'string' || typeof payload.role !== 'string' || typeof payload.email !== 'string') throw new Error('Invalid claims')
  } catch {
    res.status(401).json({ error: 'Токен недействителен или истёк' })
    return
  }
  if (payload.userId.startsWith(TEST_USER_PREFIX) || payload.reviewSession) {
    const session = payload.reviewSession
    if (!payload.userId.startsWith(TEST_USER_PREFIX) || !session || !header?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Тестовый аккаунт доступен только через кабинет владельца.' }); return
    }
    try {
      if (!await validateSession(session.ownerId, session.sessionId, payload.userId)) {
        res.status(401).json({ error: 'Тестовая сессия завершена. Вернитесь в кабинет владельца.' }); return
      }
    } catch { res.status(503).json({ error: 'Не удалось проверить тестовую сессию.' }); return }
    if (!allowedTestRequest(req.method, req.originalUrl.split('?')[0])) {
      res.status(403).json({ error: 'Это действие отключено в тестовой сессии. Доступны IELTS и просмотр учебных кабинетов.' }); return
    }
  }
  req.user = payload
  next()
}

}
export const verifyToken = createTokenVerifier()

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Требуется авторизация' })
      return
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Недостаточно прав' })
      return
    }
    next()
  }
}

// Also cover public mutation routes (registration, billing callbacks, etc.) when
// the browser is in a test session; route-local authentication alone misses them.
export function guardReviewTestTraffic(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer /, '')
  const claims = token ? jwt.decode(token) as Partial<JwtPayload> | null : null
  if (claims && (claims.reviewSession || (typeof claims.userId === 'string' && claims.userId.startsWith(TEST_USER_PREFIX)))) {
    void verifyToken(req, res, next).catch(next)
  } else next()
}
