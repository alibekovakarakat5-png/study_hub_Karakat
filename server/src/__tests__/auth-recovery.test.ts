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
  prisma.user.findUnique = (async () => ({ id: 'synthetic', email: 'synthetic@example.invalid', role: 'admin', passwordHash: 'private-hash', resetToken: 'private-reset-token', resetTokenExp: new Date(), telegramChatId: 'private-chat' })) as never
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
  let consumed = false
  prisma.user.findFirst = (async () => ({ id: 'synthetic' })) as never
  prisma.user.updateMany = (async (args: { where: { id: string; resetToken: string; resetTokenExp: { gt: Date } }; data: { resetToken: null; passwordHash: string } }) => {
    assert.equal(args.where.id, 'synthetic')
    assert.equal(args.where.resetToken, 'one-use-token')
    assert.ok(args.where.resetTokenExp.gt instanceof Date)
    assert.equal(args.data.resetToken, null)
    assert.match(args.data.passwordHash, /^\$2/)
    if (consumed) return { count: 0 }
    consumed = true; return { count: 1 }
  }) as never
  try {
    const results = await Promise.all([1, 2].map(() => request(app).post('/api/auth/reset-password').send({ token: 'one-use-token', password: 'synthetic-new-password' })))
    assert.deepEqual(results.map(r => r.status).sort(), [200, 400])
  } finally { prisma.user.findFirst = find; prisma.user.updateMany = update }
})
