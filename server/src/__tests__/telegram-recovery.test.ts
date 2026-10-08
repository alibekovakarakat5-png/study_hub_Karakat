import 'express-async-errors'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import express from 'express'
import request from 'supertest'

process.env.JWT_SECRET = 'telegram-tests-only'
process.env.DATABASE_URL = 'postgresql://unused:unused@127.0.0.1:1/unused'
process.env.TELEGRAM_WEBHOOK_SECRET = 'synthetic-webhook-secret'
delete process.env.TELEGRAM_BOT_TOKEN

const modules = async () => import('../lib/telegramAccount')
const update = (text = '/reset', chat = { id: 123, type: 'private' }, from = 123) => ({ update_id: 1, message: { message_id: 1, text, chat, from: { id: from } } })

async function fixture() {
  const { createTelegramAccountHandler } = await modules()
  let at = Date.now()
  let user: { id: string; telegramChatId: string; resetRequestedAt: Date | null; resetToken?: string | null; resetTokenExp?: Date | null } | null = { id: 'synthetic', telegramChatId: '123', resetRequestedAt: null }
  const sent: { text: string; url?: string }[] = []
  let lookups = 0
  let fail = false
  const db = { user: {
    findUnique: async ({ where }: { where: { telegramChatId: string } }) => { lookups++; return user?.telegramChatId === where.telegramChatId ? user : null },
    updateMany: async (args: { where: { id: string; telegramChatId?: string; resetToken?: string; OR?: { resetRequestedAt: null | { lte: Date } }[] }; data: object }) => {
      if (!user || user.id !== args.where.id) return { count: 0 }
      if (args.where.telegramChatId && args.where.telegramChatId !== user.telegramChatId) return { count: 0 }
      if (args.where.resetToken && args.where.resetToken !== user.resetToken) return { count: 0 }
      if (args.where.OR && user.resetRequestedAt && user.resetRequestedAt > (args.where.OR[1].resetRequestedAt as { lte: Date }).lte) return { count: 0 }
      Object.assign(user, args.data); return { count: 1 }
    },
  } }
  const handle = createTelegramAccountHandler(db as never, async (_chatId, text, url) => { if (fail) throw new Error('offline'); sent.push({ text, url }) }, () => at)
  return { handle, sent, user: () => user, lookups: () => lookups, unlinked: () => { user = null }, testUser: () => { user!.id = 'review_test_synthetic' }, advance: () => { at += 60_001 }, fail: () => { fail = true } }
}

test('only the linked private Telegram identity can request recovery', async () => {
  const f = await fixture()
  for (const msg of [update('/reset', { id: -123, type: 'group' }), update('/reset', { id: 123, type: 'private' }, 456), update('/reset', { id: 123, type: '' })]) assert.equal(await f.handle(msg), true)
  assert.equal(f.lookups(), 0)
  assert.equal(f.sent.length, 0)
  assert.equal(await f.handle(update('ordinary conversation')), false)
})

test('unknown Telegram and review accounts receive guidance without a recovery credential', async () => {
  for (const mode of ['unlinked', 'testUser'] as const) {
    const f = await fixture(); f[mode]()
    await f.handle(update())
    assert.equal(f.sent.length, 1); assert.equal(f.sent[0].url, undefined)
    assert.equal(f.user()?.resetToken, undefined)
  }
})

test('recovery hashes the secret, sets 15-minute expiry and suppresses concurrent duplicates', async () => {
  const f = await fixture(); const { resetTokenKey, recoveryDuration } = await modules()
  await Promise.all([f.handle(update()), f.handle(update('/start reset_password'))])
  assert.equal(f.sent.length, 1)
  const link = new URL(f.sent[0].url!)
  assert.equal(link.origin, 'https://study-hub-karakat.vercel.app')
  assert.equal(link.search, '')
  const token = new URLSearchParams(link.hash.slice(1)).get('token')!
  assert.match(token, /^tg1_[a-f0-9]{64}$/)
  assert.equal(f.user()!.resetToken, resetTokenKey(token))
  assert.notEqual(f.user()!.resetToken, token)
  assert.equal(f.user()!.resetTokenExp!.getTime() - f.user()!.resetRequestedAt!.getTime(), recoveryDuration)
  f.advance(); await f.handle(update())
  assert.equal(f.sent.length, 2); assert.notEqual(f.sent[0].url, f.sent[1].url)
})

test('failed delivery invalidates its pending token and keeps request cooldown', async () => {
  const f = await fixture(); f.fail()
  await assert.rejects(f.handle(update()), /delivery failed/)
  assert.equal(f.user()!.resetToken, null)
  assert.equal(f.user()!.resetTokenExp, null)
  assert.ok(f.user()!.resetRequestedAt)
})

test('link commands reject short legacy codes and never bind group identities', async () => {
  const f = await fixture()
  await f.handle(update('/link ABC123'))
  assert.equal(f.sent.length, 1)
  await f.handle(update('/link ' + 'A'.repeat(64), { id: -1, type: 'group' }, -1))
  assert.equal(f.sent.length, 1); assert.equal(f.lookups(), 0)
})

test('link consumption and account assignment share a transaction and require unlinked account', async () => {
  const { createTelegramAccountHandler, linkTokenKey } = await modules()
  const code = 'A'.repeat(64); let consumed = false; let linked = false
  const tx = {
    telegramLinkToken: {
      findUnique: async ({ where }: { where: { token: string } }) => { assert.equal(where.token, linkTokenKey(code)); return consumed ? null : { id: 'link', userId: 'synthetic', token: linkTokenKey(code), expiresAt: new Date(Date.now() + 60000) } },
      deleteMany: async ({ where }: { where: { expiresAt: { gt: Date } } }) => { assert.ok(where.expiresAt.gt instanceof Date); consumed = true; return { count: 1 } },
    },
    user: { updateMany: async ({ where }: { where: { telegramChatId: null } }) => { assert.equal(where.telegramChatId, null); if (linked) return { count: 0 }; linked = true; return { count: 1 } } },
  }
  const db = { $transaction: async (fn: (client: typeof tx) => Promise<void>) => fn(tx) }
  const sent: string[] = []
  const handle = createTelegramAccountHandler(db as never, async (_id, text) => { sent.push(text) })
  await handle(update('/link ' + code)); await handle(update('/link ' + code))
  assert.ok(linked && consumed); assert.match(sent[0], /Telegram привязан/); assert.match(sent[1], /не выполнена/)
})

test('webhook rejects missing and forged secrets before touching accounts', async () => {
  const { default: router } = await import('../routes/telegram')
  const app = express().use(express.json()).use('/webhook', router)
  for (const secret of ['', 'forged-secret', 'synthetic-webhook-secrex']) {
    const res = await request(app).post('/webhook/webhook').set('X-Telegram-Bot-Api-Secret-Token', secret).send(update())
    assert.equal(res.status, 403)
  }
  const privateMismatch = await request(app).post('/webhook/webhook').set('X-Telegram-Bot-Api-Secret-Token', 'synthetic-webhook-secret').send(update('/reset', { id: 123, type: 'group' }))
  assert.equal(privateMismatch.status, 200)
})

test('Telegram transport rejects HTTP and API failures without exposing tokens', async () => {
  const { telegramRequest } = await modules()
  const original = global.fetch
  process.env.TELEGRAM_BOT_TOKEN = 'synthetic-private-token'
  try {
    for (const [status, ok] of [[200, false], [500, true]] as const) {
      global.fetch = (async () => new Response(JSON.stringify({ ok, description: 'private' }), { status })) as typeof fetch
      await assert.rejects(telegramRequest('sendMessage'), { message: 'Telegram request failed' })
    }
  } finally { global.fetch = original; delete process.env.TELEGRAM_BOT_TOKEN }
})

test('normal sessions are revoked after password or role changes, legacy version zero remains compatible', async () => {
  const { prisma } = await import('../lib/prisma')
  const { validAccountSession } = await import('../middleware/auth')
  const original = prisma.user.findUnique
  let authVersion = 0
  prisma.user.findUnique = (async () => ({ authVersion, role: 'student' })) as never
  const claims = { userId: 'synthetic', role: 'student', email: 'test@example.invalid' }
  try {
    assert.equal(await validAccountSession(claims), true)
    authVersion = 1
    assert.equal(await validAccountSession(claims), false)
    assert.equal(await validAccountSession({ ...claims, authVersion: 1 }), true)
    assert.equal(await validAccountSession({ ...claims, authVersion: 1, role: 'admin' }), false)
  } finally { prisma.user.findUnique = original }
})

test('owner access reads normal and SQL-encoded JSON; malformed records fail closed', async () => {
  const { prisma } = await import('../lib/prisma')
  const { isReviewOwner } = await import('../lib/reviewStore')
  const originalUser = prisma.user.findUnique; const originalRecord = prisma.moduleProgress.findUnique
  prisma.user.findUnique = (async () => ({ role: 'admin' })) as never
  let answers: unknown = { revision: 1, data: { enabled: true } }
  prisma.moduleProgress.findUnique = (async () => ({ moduleId: 'owner-review-v1-access', answers, updatedAt: new Date() })) as never
  try {
    assert.equal(await isReviewOwner('synthetic'), true)
    answers = JSON.stringify(answers)
    assert.equal(await isReviewOwner('synthetic'), true)
    for (const bad of ['invalid-json', null, {}, { data: {} }]) { answers = bad; assert.equal(await isReviewOwner('synthetic'), false) }
  } finally { prisma.user.findUnique = originalUser; prisma.moduleProgress.findUnique = originalRecord }
})
