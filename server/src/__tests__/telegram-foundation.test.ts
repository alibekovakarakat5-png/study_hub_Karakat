import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'crypto'
import request from 'supertest'
import { createTelegramRequest, TelegramDeliveryError } from '../lib/telegramTransport'
import { publishManualPost } from '../lib/channelPublication'
import { reviewPublicationStore } from '../lib/telegramReview'
import { ieltsEntry, entMiniResult } from '../lib/telegramContent'

process.env.ANTHROPIC_API_KEY = 'test-only'
process.env.GROQ_API_KEY = 'test-only'
process.env.DATABASE_URL = 'postgresql://unused:unused@127.0.0.1:1/unused'
process.env.REVIEW_BUILD_SHA = 'aaaaaaaa'
process.env.TELEGRAM_ADMIN_CHAT_ID = '456'
process.env.TELEGRAM_CHANNEL_ID = '@synthetic_channel'
process.env.TELEGRAM_BOT_TOKEN = 'synthetic-token'
const fixture = async () => (await import('./review-fixture')).reviewFixture()

test('transport verifies HTTP and Telegram envelopes and never exposes secrets', async () => {
  const cases = [
    { response: new Response(JSON.stringify({ ok: false, description: 'PRIVATE TOKEN', error_code: 400 }), { status: 200 }), outcome: 'rejected' },
    { response: new Response(JSON.stringify({ ok: false, error_code: 429 }), { status: 429 }), outcome: 'rejected' },
    { response: new Response(JSON.stringify({ ok: false }), { status: 503 }), outcome: 'unknown' },
    { response: new Response('not-json', { status: 200 }), outcome: 'unknown' },
    { response: new Response(JSON.stringify({ ok: true }), { status: 200 }), outcome: 'unknown' },
  ]
  for (const c of cases) {
    const send = createTelegramRequest(() => 'SECRET', async () => c.response)
    await assert.rejects(send('sendMessage'), e => e instanceof TelegramDeliveryError && e.outcome === c.outcome && !/PRIVATE|SECRET/.test(String(e)))
  }
  let calls = 0
  await assert.rejects(createTelegramRequest(() => undefined, async () => { calls++; throw Error() })('sendMessage'), e => e instanceof TelegramDeliveryError && e.outcome === 'not-configured')
  assert.equal(calls, 0)
  const receipt = await createTelegramRequest(() => 'test', async () => new Response(JSON.stringify({ ok: true, result: { message_id: 42 } })))<{ message_id: number }>('sendMessage')
  assert.equal(receipt.message_id, 42)
})

test('concurrent confirmations send once and durable status survives a new service instance', async () => {
  const f = await fixture(); const id = randomUUID(); const store = reviewPublicationStore(f.telegram, 'isolated')
  await store.prepare(id, 'Synthetic post', 'synthetic-channel')
  let calls = 0
  const send = async () => { calls++; await new Promise(resolve => setTimeout(resolve, 20)); return { message_id: 11 } }
  await Promise.all([publishManualPost(store, id, send), publishManualPost(store, id, send)])
  assert.equal(calls, 1)
  const resumed = await publishManualPost(reviewPublicationStore(f.telegram, 'isolated'), id, send)
  assert.equal(resumed.status, 'published'); assert.equal(resumed.messageId, 11); assert.equal(calls, 1)
})

test('rejection can be explicitly retried; timeout and malformed receipt never resend', async () => {
  const f = await fixture(); const store = reviewPublicationStore(f.telegram, 'isolated')
  for (const mode of ['rejected', 'timeout', 'malformed']) {
    const id = randomUUID(); await store.prepare(id, mode, 'synthetic')
    const result = await publishManualPost(store, id, async () => {
      if (mode === 'malformed') return { message_id: 0 }
      throw new TelegramDeliveryError(mode === 'rejected' ? 'rejected' : 'unknown', 403)
    })
    assert.equal(result.status, mode === 'rejected' ? 'failed' : 'unknown')
    let calls = 0
    const next = await publishManualPost(store, id, async () => { calls++; return { message_id: 22 } })
    assert.equal(calls, mode === 'rejected' ? 1 : 0)
    assert.equal(next.status, mode === 'rejected' ? 'published' : 'unknown')
  }
})

test('lost database receipt holds the claim instead of resending a possibly delivered post', async () => {
  const f = await fixture(); const store = reviewPublicationStore(f.telegram, 'isolated'); const id = randomUUID()
  await store.prepare(id, 'post', 'synthetic')
  let calls = 0
  const send = async () => { calls++; return { message_id: 50 } }
  const result = await publishManualPost({ ...store, finish: async () => { throw Error('db unavailable') } }, id, send)
  assert.equal(result.status, 'unknown')
  await publishManualPost(store, id, send)
  assert.equal(calls, 1); assert.equal((await store.get(id))?.status, 'publishing')
})

test('IELTS has no ENT callback or band promise; ENT reports only actual answers', () => {
  const entry = ieltsEntry('https://example.invalid')
  assert.match(JSON.stringify(entry), /ielts-coach/)
  assert.doesNotMatch(JSON.stringify(entry), /flow:question|6\.0\+|полный курс/)
  assert.match(entMiniResult(3), /3\/5/)
  assert.doesNotMatch(entMiniResult(3), /~\d|120\+/)
})

test('automatic news entrypoints fail closed and manual broadcast cannot send', async () => {
  const { generateChannelPost, generateChannelPostForType } = await import('../lib/growthAI')
  await assert.rejects(generateChannelPost(), /отключена/)
  await assert.rejects(generateChannelPostForType('ielts'), /отключена/)
  const { sendChannelPostNow } = await import('../lib/cron')
  assert.equal((await sendChannelPostNow()).enabled, false)
})

test('real admin command handlers preview before sending, persist receipts, and never publish approved AI ideas', async t => {
  const { prisma } = await import('../lib/prisma')
  type Row = { id: string; type: string; body: string; telegramChatId: string | null; status: string; telegramMessageId: number | null; deliveryError: string | null }
  const rows = new Map<string, Row>()
  const replace = (name: string, value: unknown) => {
    const delegate = prisma.contentIdea as unknown as Record<string, unknown>
    const original = delegate[name]
    Object.defineProperty(delegate, name, { value, writable: true, configurable: true })
    t.after(() => Object.defineProperty(delegate, name, { value: original, writable: true, configurable: true }))
  }
  const matches = (row: Row, where: { id: string; type: string | { not: string }; status?: string | { in: string[] } }) => row.id === where.id && (typeof where.type === 'string' ? row.type === where.type : row.type !== where.type.not) && (!where.status || (typeof where.status === 'string' ? row.status === where.status : where.status.in.includes(row.status)))
  replace('upsert', async ({ where, create }: { where: { id: string }; create: Row }) => {
    if (!rows.has(where.id)) rows.set(where.id, { ...create, status: 'draft', telegramMessageId: null, deliveryError: null })
    return structuredClone(rows.get(where.id))
  })
  replace('findFirst', async ({ where }: { where: { id: string; type: string } }) => {
    const row = rows.get(where.id); return row && matches(row, where) ? structuredClone(row) : null
  })
  replace('updateMany', async ({ where, data }: { where: Parameters<typeof matches>[1]; data: Partial<Row> }) => {
    const row = rows.get(where.id); if (!row || !matches(row, where)) return { count: 0 }
    rows.set(where.id, { ...row, ...data }); return { count: 1 }
  })
  const messages: { chat_id: string; text: string }[] = []
  t.mock.method(global, 'fetch', async (_url: string, init: RequestInit) => {
    messages.push(JSON.parse(String(init.body)))
    return new Response(JSON.stringify({ ok: true, result: { message_id: 314 } }))
  })
  const { handleGrowthCommand, handleGrowthCallback } = await import('../lib/growthBot')
  assert.equal(await handleGrowthCommand(999, '/g_publish forbidden', 900), false)
  assert.equal(await handleGrowthCommand(456, '/g_publish Synthetic manual post', 900), true)
  assert.equal(messages.filter(m => m.chat_id === '@synthetic_channel').length, 0)
  assert.equal(rows.get('tg-manual-900')?.status, 'draft')
  await Promise.all([handleGrowthCallback(456, 'g:publish:tg-manual-900'), handleGrowthCallback(456, 'g:publish:tg-manual-900')])
  assert.equal(messages.filter(m => m.chat_id === '@synthetic_channel').length, 1)
  assert.equal(rows.get('tg-manual-900')?.telegramMessageId, 314)
  assert.equal(rows.get('tg-manual-900')?.status, 'published')
  await handleGrowthCommand(456, '/g_publish Synthetic manual post', 900)
  assert.equal(messages.filter(m => m.chat_id === '@synthetic_channel').length, 1)
  rows.set('ai-idea', { id: 'ai-idea', type: 'post', body: 'Unverified news', status: 'draft', telegramChatId: null, telegramMessageId: null, deliveryError: null })
  await handleGrowthCallback(456, 'g:content_approve:ai-idea')
  assert.equal(rows.get('ai-idea')?.status, 'approved')
  assert.equal(messages.filter(m => m.chat_id === '@synthetic_channel').length, 1)
  assert.match(messages.at(-1)!.text, /Публикации не было/)
})

test('owner scenario: role launch, saved draft, delivery, isolation, resume and feedback', async () => {
  const f = await fixture(); const runId = randomUUID()
  const owner = 'Bearer ' + f.token()
  assert.equal((await request(f.app).post('/api/review/runs').set('Authorization', owner).send({ id: runId, scenarioId: 'telegram-foundation-v1', frontendSha: 'aaaaaaaa' })).status, 201)
  const launch = async (run = runId, persona = 'telegram-reviewer') => {
    const r = await request(f.app).post('/api/review/sessions').set('Authorization', owner).send({ id: randomUUID(), runId: run, persona })
    assert.equal(r.status, 200); return { auth: 'Bearer ' + r.body.token, id: r.body.session.id.slice(8) }
  }
  const a = await launch(); const postId = randomUUID()
  const save = await request(f.app).post('/api/telegram-review/drafts').set('Authorization', a.auth).send({ id: postId, text: 'Synthetic test' })
  assert.equal(save.status, 200); assert.equal(save.body.post.status, 'draft')
  const publish = (auth: string) => request(f.app).post('/api/telegram-review/publish').set('Authorization', auth).send({ id: postId, outcome: 'success' })
  assert.equal((await publish(a.auth)).body.requests, 1)
  assert.equal((await publish(a.auth)).body.requests, 0)
  const resumed = await launch()
  assert.equal((await request(f.app).get('/api/telegram-review').set('Authorization', resumed.auth)).body.publications[0].status, 'published')
  const b = await launch(runId, 'telegram-outsider')
  assert.equal((await request(f.app).get('/api/telegram-review').set('Authorization', b.auth)).body.publications.length, 0)
  assert.equal((await publish(b.auth)).status, 404)
  const fresh = randomUUID()
  await request(f.app).post('/api/review/runs').set('Authorization', owner).send({ id: fresh, scenarioId: 'telegram-foundation-v1', frontendSha: 'aaaaaaaa' })
  assert.equal((await request(f.app).get('/api/telegram-review').set('Authorization', (await launch(fresh)).auth)).body.publications.length, 0)
  const feedback = await request(f.app).post('/api/review/feedback').set('Authorization', owner).set('X-StudyHub-Build', 'aaaaaaaa').send({ id: randomUUID(), runId, stepId: 'success', sessionId: a.id, text: 'Synthetic feedback', path: '/telegram-review' })
  assert.equal(feedback.status, 201); assert.equal(feedback.body.record.data.persona, 'telegram-reviewer'); assert.equal(feedback.body.record.data.frontendSha, 'aaaaaaaa')
  assert.equal((await request(f.app).get('/api/telegram-review').set('Authorization', owner)).status, 403)
  assert.equal((await request(f.app).get('/api/telegram-review')).status, 401)
  assert.equal((await request(f.app).post('/api/billing/pay').set('Authorization', a.auth)).status, 403)
})
