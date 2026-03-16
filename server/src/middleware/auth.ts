import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// ── Extend Express Request ────────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; role: string; email: string }
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
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

// ── Middleware ────────────────────────────────────────────────────────────────

export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Требуется авторизация' })
    return
  }

  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Токен недействителен или истёк' })
  }
}

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
