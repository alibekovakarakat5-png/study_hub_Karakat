import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'crypto'
import express from 'express'
import request from 'supertest'
import { emptyIeltsState, transitionIelts, isIeltsChannelMember } from '../lib/ieltsBot'
import { createIeltsBotHandler, type IeltsRequest, type IeltsUpdate } from '../lib/ieltsBotHandler'
import { createIeltsWebhookRouter } from '../routes/ieltsBot'
import { memoryIeltsBotStore } from './ielts-bot-fixture'
import { TelegramDeliveryError } from '../lib/telegramTransport'
import { ieltsWebhookSecret } from '../lib/ieltsBotConfig'

test('webhook credential is deterministic, distinct from the token, rotates with it and supports an override', () => {
  const secret = ieltsWebhookSecret('test-token-one')!
  assert.match(secret, /^[a-f0-9]{64}$/)
  assert.equal(secret, ieltsWebhookSecret('test-token-one'))
  assert.notEqual(secret, ieltsWebhookSecret('test-token-two'))
  assert.notEqual(secret, 'test-token-one')
  assert.equal(ieltsWebhookSecret(undefined), undefined)
  assert.equal(ieltsWebhookSecret('test-token-one', 'explicit-secret'), 'explicit-secret')
})

process.env.ANTHROPIC_API_KEY = 'test-only'
process.env.GROQ_API_KEY = 'test-only'
process.env.DATABASE_URL = 'postgresql://unused:unused@127.0.0.1:1/unused'
process.env.REVIEW_BUILD_SHA = 'aaaaaaaa'
const chat = (id = 101) => ({ chat: { id, type: 'private' }, from: { id } })
const message = (update_id: number, text: string, id = 101): IeltsUpdate => ({ update_id, message: { ...chat(id), text } })
const callback = (update_id: number, data: string, id = 101): IeltsUpdate => ({ update_id, callback_query: { id: String(update_id), from: { id }, data, message: chat(id) } })
function fixture() {
  const store = memoryIeltsBotStore(), sent: Record<string, unknown>[] = []
  const options = { membership: 'member', delivery: 'success' }
  const transport: IeltsRequest = async <T>(method: string, body?: Record<string, unknown>) => {
    if (method === 'getChatMember') { if (options.membership === 'unavailable') throw Error('Unavailable'); return { status: options.membership } as T }
    if (method === 'answerCallbackQuery') return true as T
    sent.push(body!)
    if (options.delivery === 'timeout') throw new TelegramDeliveryError('unknown')
    return { message_id: sent.length } as T
  }
  const handler = () => createIeltsBotHandler(store, transport, { channelId: '@test', channelUrl: 'https://t.me/skyllaAI', accountPrefix: 'telegram:' })
  return { store, sent, options, handler, handle: handler() }
}
test('membership accepts actual members, including restricted members, and rejects left/unknown', () => {
  for (const status of ['member', 'administrator', 'creator']) assert.equal(isIeltsChannelMember({ status }), true)
  assert.equal(isIeltsChannelMember({ status: 'restricted', is_member: true }), true)
  for (const status of ['left', 'kicked', 'restricted', 'unknown']) assert.equal(isIeltsChannelMember({ status }), false)
})
test('answers persist, stale buttons do not count, review repairs mistakes without rewriting first score', () => {
  let state = transitionIelts(emptyIeltsState(), 'i:goal:7.0').state
  assert.equal(state.target, '7.0')
  state = transitionIelts(state, '/today', new Date(), 'aaaaaaaaaaaaaaaa').state
  state = transitionIelts(state, 'i:a:aaaaaaaaaaaaaaaa:0:0').state
  assert.equal(state.answered, 1); assert.equal(state.correct, 0); assert.deepEqual(state.mistakes, ['library-time'])
  const stale = transitionIelts(state, 'i:a:aaaaaaaaaaaaaaaa:0:1'); assert.equal(stale.state.answered, 1)
  assert.match(transitionIelts(state, '/today').reply.text, /2\/2/)
  state = transitionIelts(state, 'i:a:aaaaaaaaaaaaaaaa:1:1').state; assert.equal(state.cursor, 1)
  state = transitionIelts(state, '/mistakes', new Date(), 'bbbbbbbbbbbbbbbb').state
  state = transitionIelts(state, 'i:a:bbbbbbbbbbbbbbbb:0:1').state
  assert.equal(state.reviewed, 1); assert.equal(state.answered, 2); assert.equal(state.correct, 1); assert.equal(state.mistakes.length, 0)
  const changed = transitionIelts(state, 'i:goal:6.5').state; assert.deepEqual(changed.history, state.history)
})
test('unsubscribed and unavailable checks block new learning but retain progress', async () => {
  const f = fixture(); await f.handle(callback(1, 'i:goal:7.0')); await f.handle(message(2, '/today'))
  const before = await f.store.read('telegram:101'); f.options.membership = 'left'
  await f.handle(message(3, '/today')); assert.deepEqual(await f.store.read('telegram:101'), before)
  assert.match(String(f.sent.at(-1)!.text), /подпишись/)
  await f.handle(message(4, '/progress')); assert.match(String(f.sent.at(-1)!.text), /Цель: 7.0/)
  f.options.membership = 'unavailable'; await f.handle(message(5, '/today')); assert.match(String(f.sent.at(-1)!.text), /не удалось проверить/)
})
test('duplicate and concurrent updates send once; new handler resumes the same attempt', async () => {
  const f = fixture(); await f.handle(callback(1, 'i:goal:7.0'))
  await Promise.all([f.handle(message(2, '/today')), f.handle(message(2, '/today'))])
  assert.equal(f.sent.length, 2)
  const state = await f.store.read('telegram:101'), id = state.active!.id
  await f.handler()(callback(3, `i:a:${id}:0:1`)); await f.handler()(message(4, '/today'))
  assert.match(String(f.sent.at(-1)!.text), /2\/2/); assert.equal((await f.store.read('telegram:101')).answered, 1)
  await f.handle(message(5, '/progress', 202)); assert.equal((await f.store.read('telegram:202')).answered, 0)
})
test('unknown send never retries blindly and a new command recovers committed progress', async () => {
  const f = fixture(); await f.handle(callback(1, 'i:goal:7.0')); f.options.delivery = 'timeout'
  await f.handle(message(2, '/today')); const active = (await f.store.read('telegram:101')).active
  f.options.delivery = 'success'; await f.handle(message(2, '/today')); assert.equal(f.sent.length, 2)
  await f.handle(message(3, '/today')); assert.equal(f.sent.length, 3); assert.deepEqual((await f.store.read('telegram:101')).active, active)
})
test('webhook is closed without configuration and rejects wrong secrets before handling', async () => {
  let calls = 0, enabled = false
  const app = express().use(express.json()).use(createIeltsWebhookRouter({ secret: () => 'test-secret', enabled: () => enabled, handle: async () => { calls++ } }))
  assert.equal((await request(app).post('/webhook').send(message(1, '/start'))).status, 503)
  enabled = true
  assert.equal((await request(app).post('/webhook').set('X-Telegram-Bot-Api-Secret-Token', 'wrong').send(message(1, '/start'))).status, 403)
  assert.equal(calls, 0)
  assert.equal((await request(app).post('/webhook').set('X-Telegram-Bot-Api-Secret-Token', 'test-secret').send(message(1, '/start'))).status, 200)
  assert.equal(calls, 1)
})
test('groups and mismatched sender identity cannot touch private progress', async () => {
  const f = fixture(); await f.handle({ update_id: 1, message: { chat: { id: 101, type: 'group' }, from: { id: 101 }, text: '/today' } })
  await f.handle({ update_id: 2, message: { chat: { id: 101, type: 'private' }, from: { id: 202 }, text: '/today' } })
  assert.equal(f.sent.length, 0)
})
test('owner review uses per-run identities, persistent simulator state and versioned feedback', async () => {
  const { reviewFixture } = await import('./review-fixture'), f = reviewFixture(), owner = 'Bearer ' + f.token(), runId = randomUUID()
  assert.equal((await request(f.app).post('/api/review/runs').set('Authorization', owner).send({ id: runId, scenarioId: 'ielts-bot-v1', frontendSha: 'aaaaaaaa' })).status, 201)
  const launch = async (persona = 'ielts-bot-learner', run = runId) => {
    const r = await request(f.app).post('/api/review/sessions').set('Authorization', owner).send({ id: randomUUID(), runId: run, persona }); assert.equal(r.status, 200)
    return { auth: 'Bearer ' + r.body.token, session: r.body.session.id.slice(8) }
  }
  const a = await launch()
  const send = (auth: string, updateId: number, command: string) => request(f.app).post('/api/ielts-bot-review/update').set('Authorization', auth).send({ updateId, command, membership: 'member', delivery: 'success' })
  assert.equal((await send(a.auth, 1, 'i:goal:7.0')).body.state.target, '7.0')
  assert.equal((await send(a.auth, 1, 'i:goal:7.0')).body.sends, 0)
  assert.equal((await request(f.app).get('/api/ielts-bot-review').set('Authorization', (await launch()).auth)).body.state.target, '7.0')
  assert.equal((await request(f.app).get('/api/ielts-bot-review').set('Authorization', (await launch('ielts-bot-outsider')).auth)).body.state.target, null)
  const fresh = randomUUID(); await request(f.app).post('/api/review/runs').set('Authorization', owner).send({ id: fresh, scenarioId: 'ielts-bot-v1', frontendSha: 'aaaaaaaa' })
  assert.equal((await request(f.app).get('/api/ielts-bot-review').set('Authorization', (await launch('ielts-bot-learner', fresh)).auth)).body.state.target, null)
  assert.equal((await request(f.app).get('/api/ielts-bot-review').set('Authorization', owner)).status, 403)
  const feedback = await request(f.app).post('/api/review/feedback').set('Authorization', owner).set('X-StudyHub-Build', 'aaaaaaaa').send({ id: randomUUID(), runId, stepId: 'goal', sessionId: a.session, text: 'Synthetic IELTS check', path: '/ielts-bot-review' })
  assert.equal(feedback.status, 201); assert.equal(feedback.body.record.data.persona, 'ielts-bot-learner')
})
