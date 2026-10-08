import 'express-async-errors'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import express from 'express'
import request from 'supertest'

delete process.env.SMTP_HOST
process.env.JWT_SECRET = 'recovery-tests-only'
process.env.DATABASE_URL = 'postgresql://unused:unused@127.0.0.1:1/unused'

async function fixture() {
  const { default: auth } = await import('../routes/auth')
  const { prisma } = await import('../lib/prisma')
  const { signToken } = await import('../middleware/auth')
  const app = express().use(express.json()).use('/api/auth', auth)
  return { app, prisma, signToken }
}

test('missing mail configuration is an explicit unavailable response without account lookup', async () => {
  const { app, prisma } = await fixture()
  const original = prisma.user.findUnique
  let lookedUp = false
  prisma.user.findUnique = (async () => { lookedUp = true; throw new Error('Unexpected database access') }) as never
  try {
    const res = await request(app).post('/api/auth/forgot-password').send({ email: 'synthetic@example.invalid' })
    assert.equal(res.status, 503)
    assert.equal(lookedUp, false)
    assert.equal(res.body.ok, undefined)
  } finally { prisma.user.findUnique = original }
})

test('authenticated profile never exposes password or reset credentials', async () => {
  const { app, prisma, signToken } = await fixture()
  const original = prisma.user.findUnique
  prisma.user.findUnique = (async () => ({ id: 'synthetic', authVersion: 0, email: 'synthetic@example.invalid', role: 'admin', passwordHash: 'private-hash', resetToken: 'private-reset-token', resetTokenExp: new Date(), telegramChatId: 'private-chat' })) as never
  try {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer ' + signToken({ userId: 'synthetic', email: 'synthetic@example.invalid', role: 'admin' }))
    assert.equal(res.status, 200)
    assert.equal(res.body.user.id, 'synthetic')
    assert.equal(JSON.stringify(res.body).includes('private'), false)
    assert.equal(res.body.user.resetTokenExp, undefined)
  } finally { prisma.user.findUnique = original }
})

test('password reset consumes a token once even when two requests passed the initial lookup', async () => {
  const { app, prisma } = await fixture()
  const find = prisma.user.findFirst; const update = prisma.user.updateMany
  const transaction = prisma.$transaction; const remove = prisma.telegramLinkToken.deleteMany
  prisma.$transaction = (async (fn: (tx: typeof prisma) => Promise<unknown>) => fn(prisma)) as never
  prisma.telegramLinkToken.deleteMany = (async () => ({ count: 0 })) as never
  let consumed = false
  prisma.user.findFirst = (async () => ({ id: 'synthetic' })) as never
  prisma.user.updateMany = (async (args: { where: { id: string; resetToken: string; resetTokenExp: { gt: Date } }; data: { resetToken: null; passwordHash: string } }) => {
    assert.equal(args.where.id, 'synthetic')
    assert.equal(args.where.resetToken, 'a'.repeat(64))
    assert.ok(args.where.resetTokenExp.gt instanceof Date)
    assert.equal(args.data.resetToken, null)
    assert.match(args.data.passwordHash, /^\$2/)
    if (consumed) return { count: 0 }
    consumed = true; return { count: 1 }
  }) as never
  try {
    const results = await Promise.all([1, 2].map(() => request(app).post('/api/auth/reset-password').send({ token: 'a'.repeat(64), password: 'synthetic-new-password' })))
    assert.deepEqual(results.map(r => r.status).sort(), [200, 400])
  } finally { prisma.user.findFirst = find; prisma.user.updateMany = update; prisma.$transaction = transaction; prisma.telegramLinkToken.deleteMany = remove }
})

test('Telegram link resets the linked password once, rejects stored digest and expired tokens, and revokes old sessions', async () => {
  const { app, prisma, signToken } = await fixture()
  const { createTelegramAccountHandler, resetTokenKey } = await import('../lib/telegramAccount')
  const bcrypt = (await import('bcryptjs')).default
  const original = { findUnique: prisma.user.findUnique, findFirst: prisma.user.findFirst, updateMany: prisma.user.updateMany, update: prisma.user.update, transaction: prisma.$transaction, remove: prisma.telegramLinkToken.deleteMany }
  const user = { id: 'linked-user', email: 'linked@example.invalid', role: 'student', authVersion: 0, passwordHash: await bcrypt.hash('before-reset', 4), telegramChatId: '123', resetToken: null as string | null, resetTokenExp: null as Date | null, resetRequestedAt: null as Date | null }
  let sentUrl = ''; let clearedLinks = 0
  prisma.user.findUnique = (async () => ({ ...user })) as never
  prisma.user.findFirst = (async ({ where }: { where: { resetToken: string; resetTokenExp: { gt: Date } } }) => user.resetToken === where.resetToken && user.resetTokenExp && user.resetTokenExp > where.resetTokenExp.gt ? { ...user } : null) as never
  prisma.user.update = (async () => ({ ...user })) as never
  prisma.user.updateMany = (async ({ where, data }: { where: { resetToken?: string; resetTokenExp?: { gt: Date } }; data: Record<string, unknown> }) => {
    if (where.resetToken && (where.resetToken !== user.resetToken || !user.resetTokenExp || user.resetTokenExp <= where.resetTokenExp!.gt)) return { count: 0 }
    const version = user.authVersion
    Object.assign(user, data)
    if (data.authVersion) user.authVersion = version + 1
    return { count: 1 }
  }) as never
  prisma.$transaction = (async (fn: (tx: typeof prisma) => Promise<unknown>) => fn(prisma)) as never
  prisma.telegramLinkToken.deleteMany = (async () => { clearedLinks++; return { count: 1 } }) as never
  try {
    const oldSession = signToken({ userId: user.id, email: user.email, role: user.role })
    const handle = createTelegramAccountHandler(prisma, async (_chat, _text, url) => { sentUrl = url! })
    await handle({ update_id: 1, message: { message_id: 1, chat: { id: 123, type: 'private' }, from: { id: 123 }, text: '/reset' } })
    const token = new URLSearchParams(new URL(sentUrl).hash.slice(1)).get('token')!
    assert.equal(user.resetToken, resetTokenKey(token))
    assert.equal((await request(app).post('/api/auth/reset-password').send({ token: user.resetToken, password: 'after-reset' })).status, 400)
    assert.equal((await request(app).post('/api/auth/reset-password').send({ token, password: 'after-reset' })).status, 200)
    assert.equal(await bcrypt.compare('after-reset', user.passwordHash), true)
    assert.equal(user.authVersion, 1); assert.equal(clearedLinks, 1)
    assert.equal((await request(app).get('/api/auth/me').set('Authorization', 'Bearer ' + oldSession)).status, 401)
    assert.equal((await request(app).post('/api/auth/reset-password').send({ token, password: 'another-password' })).status, 400)
    assert.equal((await request(app).post('/api/auth/login').send({ email: user.email, password: 'before-reset' })).status, 401)
    const login = await request(app).post('/api/auth/login').send({ email: user.email, password: 'after-reset' })
    assert.equal(login.status, 200)
    assert.equal((await request(app).get('/api/auth/me').set('Authorization', 'Bearer ' + login.body.token)).status, 200)
    user.resetToken = resetTokenKey(token); user.resetTokenExp = new Date(Date.now() - 1)
    assert.equal((await request(app).post('/api/auth/reset-password').send({ token, password: 'expired-password' })).status, 400)
  } finally { prisma.user.findUnique = original.findUnique; prisma.user.findFirst = original.findFirst; prisma.user.updateMany = original.updateMany; prisma.user.update = original.update; prisma.$transaction = original.transaction; prisma.telegramLinkToken.deleteMany = original.remove }
})
