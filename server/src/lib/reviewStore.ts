import crypto from 'crypto'
import { prisma } from './prisma'
import { createProgressRepository } from './learningRepository'
import { REVIEW_PREFIX, TEST_USER_PREFIX, reviewPersonas } from './reviewCatalog'

export const reviewStore = createProgressRepository(REVIEW_PREFIX)
export async function isReviewOwner(userId: string) {
  const [user, access] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
    reviewStore.get(userId, 'access'),
  ])
  return user?.role === 'admin' && access?.data.enabled === true
}
export const fixtureId = (owner: string, persona: string) => TEST_USER_PREFIX + crypto.createHash('sha256').update(owner).digest('hex').slice(0, 20) + '_' + persona
export async function provisionPersona(owner: string, persona: string) {
  const spec = reviewPersonas.find(p => p.id === persona)
  if (!spec) throw new Error('Unknown persona')
  const id = fixtureId(owner, persona)
  // No known password, registration notifications, Telegram identity or external mail.
  const user = await prisma.user.upsert({ where: { id }, update: {}, create: {
    id, name: spec.name, email: id + '@studyhub.invalid', role: spec.role,
    passwordHash: '!test-account-no-password-login', grade: 11, city: 'Тестовые данные',
  } })
  if (persona === 'parent') {
    const student = await provisionPersona(owner, 'student-a')
    await prisma.user.update({ where: { id: student.id }, data: { parentId: id } })
  }
  if (persona === 'center') {
    await prisma.organization.upsert({ where: { id }, update: {}, create: {
      id, name: 'Тестовый центр Study Hub', type: 'tutoring_center', ownerId: id,
      inviteCode: crypto.randomBytes(16).toString('hex'), members: { create: { userId: id, role: 'owner' } },
    } })
  }
  const { passwordHash: _, resetToken: _reset, resetTokenExp: _expiry, ...safe } = user
  return safe
}

export async function validReviewSession(ownerId: string, sessionId: string, userId: string) {
  const row = await reviewStore.get(ownerId, 'session-' + sessionId)
  return !!row && row.data.userId === userId && !row.data.endedAt && Number(row.data.expiresAt) > Date.now() && await isReviewOwner(ownerId)
}

export function allowedTestRequest(method: string, path: string) {
  if (path === '/api/auth/me' && method === 'GET') return true
  if (/^\/api\/learning(?:\/|$)/.test(path)) return true
  // Reuse normal role/tenant checks for read-only views; no impersonation of real users.
  if (method === 'GET' && /^\/api\/(classes|assignments|orgs|content|courses)(?:\/|$)/.test(path)) return true
  if (method === 'GET' && /^\/api\/users\/(?:[^/]+\/children|child\/[^/]+\/overview|me\/analytics)$/.test(path)) return true
  return false
}
