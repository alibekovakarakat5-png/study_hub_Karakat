import { test } from 'node:test'
import assert from 'node:assert/strict'
import { emptyIeltsState, transitionIelts, type IeltsState } from '../lib/ieltsBot'
import { finishWriting } from '../lib/ieltsWritingFlow'
import { validateWritingFeedback, type WritingEvaluator, type WritingJob } from '../lib/ieltsWriting'
import { reviewWritingEvaluator } from '../lib/ieltsWritingReview'
import { createIeltsBotHandler, type IeltsRequest } from '../lib/ieltsBotHandler'
import { memoryIeltsBotStore } from './ielts-bot-fixture'
import { evaluateIeltsWriting } from '../lib/ieltsWritingAI'

const essay = 'I think money can be a useful gift because students needs books and equipment. However, a personal gift can show care and help young people develop their interests.'
const id = 'aaaaaaaaaaaaaaaa', date = new Date('2026-10-16T01:00:00Z')
const step = (s: IeltsState, c: string) => transitionIelts(s, c, date, id)
function draft() { let s = step(emptyIeltsState(), 'i:goal:7.0').state; s = step(s, 'i:w:task:gifts').state; return step(s, essay).state }

test('legacy progress survives module switches, full drafts stay per task, old consent is invalid', () => {
  let s = { ...emptyIeltsState(), target: '7.0', cursor: 2 }
  s = step(s, '/today').state
  const reading = structuredClone(s.active)
  s = step(s, 'i:w:task:gifts').state; s = step(s, essay).state
  const revision = s.writing!.revision
  assert.equal(s.writing!.draft, essay); assert.equal(s.writing!.submissions.length, 0)
  assert.match(step(s, '/writing').reply.text, /Groq/)
  s = step(s, 'i:w:task:health').state; assert.equal(s.writing!.draft, '')
  s = step(s, 'i:w:task:gifts').state; assert.equal(s.writing!.draft, essay)
  assert.equal(step(s, `i:w:check:${revision}`).reply.work, undefined)
  assert.deepEqual(step(s, '/today').state.active, reading)
  assert.deepEqual(s.completedMissions, [0, 1])
})

test('book lesson selected early does not skip earlier lessons and follows verified keys', () => {
  let s = step(emptyIeltsState(), 'i:goal:7.0').state
  const start = step(s, 'i:lesson:6'); s = start.state
  assert.match(start.reply.text, /101 Helpful Hints/); assert.ok(start.reply.text.length < 4096)
  for (const [i, answer] of [1, 2, 0, 0].entries()) s = step(s, `i:a:${id}:${i}:${answer}`).state
  assert.equal(s.correct, 4); assert.equal(s.cursor, 0); assert.deepEqual(s.completedMissions, [6])
  assert.equal(step(s, '/today').state.active?.mission, 0)
  s = step(s, 'i:lesson:6').state
  for (const [i, answer] of [1, 2, 0, 0].entries()) s = step(s, `i:a:${id}:${i}:${answer}`).state
  assert.equal(s.answered, 4); assert.equal(s.correct, 4); assert.equal(s.reviewed, 4)
})

test('writing result saves exact version, revision receives prior feedback, grammar is grounded', async () => {
  let s = draft(), r = step(s, `i:w:check:${s.writing!.revision}`), job = r.reply.work!
  assert.equal(job.text, essay); assert.equal(job.previousText, undefined)
  s = finishWriting(r.state, job, await reviewWritingEvaluator(job), date).state
  assert.equal(s.writing!.submissions.length, 1); assert.deepEqual(s.grammar!.pending, ['agreement'])
  s = step(s, 'i:g:topic:agreement').state
  s = step(s, `i:g:a:${id}:1`).state; assert.equal(s.grammar!.answered, 1); assert.deepEqual(s.grammar!.pending, ['agreement'])
  assert.equal(step(s, `i:g:a:${id}:1`).state.grammar!.answered, 1)
  s = step(s, 'i:g:topic:agreement').state; s = step(s, `i:g:a:${id}:0`).state
  assert.equal(s.grammar!.correct, 1); assert.deepEqual(s.grammar!.pending, [])
  s = step(s, '/writing').state; s = step(s, essay.replace('students needs', 'students need')).state
  r = step(s, `i:w:check:${s.writing!.revision}`); job = r.reply.work!
  assert.equal(job.previousText, essay); assert.ok(job.previousFeedback)
  const result = finishWriting(r.state, job, await reviewWritingEvaluator(job), date)
  assert.equal(result.state.writing!.submissions.length, 2); assert.match(result.reply.text, /Сравнение/)
})

test('outage retains draft, stale results never replace new text, quota includes failed calls', async () => {
  let s = draft(), r = step(s, `i:w:check:${s.writing!.revision}`)
  const old = r.reply.work!, edited = step(r.state, essay + ' I agree.').state
  const stale = finishWriting(edited, old, await reviewWritingEvaluator(old), date)
  assert.equal(stale.state.writing!.submissions.length, 0); assert.equal(stale.state.writing!.draft, essay + ' I agree.')
  for (let i = 0; i < 5; i++) {
    r = step(s, `i:w:check:${s.writing!.revision}`); assert.ok(r.reply.work)
    s = finishWriting(r.state, r.reply.work!, null, date).state
    assert.equal(s.writing!.draft, essay); assert.equal(s.writing!.submissions.length, 0)
  }
  assert.equal(step(s, `i:w:check:${s.writing!.revision}`).reply.work, undefined)
  assert.ok(transitionIelts(s, `i:w:check:${s.writing!.revision}`, new Date('2026-10-17T01:00:00Z')).reply.work)
})

test('pending check can be recovered after timeout but cannot overwrite a newer job', async () => {
  const s = draft(), first = step(s, `i:w:check:${s.writing!.revision}`), job = first.reply.work!
  assert.equal(step(first.state, `i:w:check:${s.writing!.revision}`).reply.work, undefined)
  const recovered = transitionIelts(first.state, `i:w:check:${s.writing!.revision}`, new Date(date.getTime() + 46000), 'bbbbbbbbbbbbbbbb')
  assert.ok(recovered.reply.work)
  const stale = finishWriting(recovered.state, job, await reviewWritingEvaluator(job))
  assert.equal(stale.state.writing!.job!.id, 'bbbbbbbbbbbbbbbb')
  assert.equal(stale.state.writing!.submissions.length, 0)
})

test('input limits preserve the previous draft and feedback fits a Telegram message', async () => {
  const s = draft()
  assert.equal(step(s, 'x'.repeat(3501)).state.writing!.draft, essay)
  const short = step(s, 'Too short.').state
  assert.equal(step(short, `i:w:check:${short.writing!.revision}`).reply.work, undefined)
  const pending = step(s, `i:w:check:${s.writing!.revision}`), job = pending.reply.work!
  const f = await reviewWritingEvaluator(job)
  f.strengths = 's'.repeat(260); f.criteria = { task:'t'.repeat(200),coherence:'c'.repeat(200),vocabulary:'v'.repeat(200),grammar:'g'.repeat(200) }
  f.corrections = Array.from({length:3},()=>({quote:essay.slice(0,150),replacement:'r'.repeat(180),reason:'r'.repeat(200),topic:null}))
  f.nextStep='n'.repeat(300); f.comparison='c'.repeat(250)
  assert.ok(finishWriting(pending.state, job, f).reply.text.length <= 4096)
})

test('handler sends no essay before consent, duplicates call AI once, subscription gate applies', async () => {
  const store = memoryIeltsBotStore(), jobs: WritingJob[] = [], sent: Record<string, unknown>[] = []
  let membership = 'member'
  const transport: IeltsRequest = async <T>(method: string, body?: Record<string, unknown>) => {
    if (method === 'getChatMember') return { status: membership } as T
    if (method === 'sendMessage') sent.push(body!)
    return { message_id: 101 } as T
  }
  const evaluate: WritingEvaluator = async job => { jobs.push(job); return reviewWritingEvaluator(job) }
  const handle = createIeltsBotHandler(store, transport, { channelId: '@test', channelUrl: 'https://t.me/skyllaAI', accountPrefix: 'test:' }, evaluate)
  const send = (update_id: number, text: string) => handle({ update_id, message: { chat: { id: 101, type: 'private' }, from: { id: 101 }, text } })
  await send(1, 'i:goal:7.0'); await send(2, 'i:w:task:gifts'); await send(3, essay)
  assert.equal(jobs.length, 0); assert.equal((await store.read('test:101')).writing!.draft, essay)
  const c = `i:w:check:${(await store.read('test:101')).writing!.revision}`
  await Promise.all([send(4, c), send(4, c)])
  assert.equal(jobs.length, 1); assert.equal((await store.read('test:101')).writing!.submissions.length, 1)
  await send(5, essay + ' Another point.'); membership = 'left'; await send(6, 'i:w:check:3')
  assert.equal(jobs.length, 1)
  await send(7, '/draft'); assert.match(String(sent.at(-1)!.text), /Another point/)
  await send(8, '/feedback'); assert.match(String(sent.at(-1)!.text), /разбор версии/)
  assert.equal((await store.read('test:202')).writing, undefined)
})

test('provider payload contains only disclosed text data, rejects hallucinated corrections', async () => {
  const job: WritingJob = { id, taskId: 'gifts', revision: 2, text: essay, startedAt: date.toISOString() }
  const feedback = await reviewWritingEvaluator(job)
  assert.throws(() => validateWritingFeedback({ ...feedback, corrections: [{ ...feedback.corrections[0], quote: 'not in essay' }] }, essay))
  const originalFetch = global.fetch, originalKey = process.env.GROQ_API_KEY
  process.env.GROQ_API_KEY = 'synthetic-test-key'
  let body: any
  global.fetch = async (url, options) => { assert.equal(url, 'https://api.groq.com/openai/v1/chat/completions'); body = JSON.parse(String(options!.body)); return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(feedback) } }] })) }
  try {
    await evaluateIeltsWriting(job)
    const input = JSON.parse(body.messages[1].content)
    assert.deepEqual(Object.keys(input).sort(), ['minimumWords', 'studentText', 'task'])
    assert.equal(input.studentText, essay); assert.match(body.messages[0].content, /untrusted data/)
  } finally { global.fetch = originalFetch; if (originalKey === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = originalKey }
})
