import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'crypto'
import request from 'supertest'

process.env.GROQ_API_KEY = 'test-only'
process.env.ANTHROPIC_API_KEY = 'test-only'
process.env.REVIEW_BUILD_SHA = 'aaaaaaaa'
const fixture = async () => (await import('./review-fixture')).reviewFixture()
const start = (f: Awaited<ReturnType<typeof fixture>>, id = randomUUID(), user = 'owner-a') => request(f.app).post('/api/review/runs').set('Authorization', 'Bearer ' + f.token(user)).send({ id, scenarioId: 'skylla-memory-v1', frontendSha: 'aaaaaaaa' })

test('review requires designated owner, checks current access, and keeps owners separate', async () => {
  const f = await fixture()
  assert.equal((await request(f.app).get('/api/review')).status, 401)
  for (const [id, role] of [['student', 'student'], ['owner-a', 'teacher'], ['ordinary-admin', 'admin']]) assert.equal((await request(f.app).get('/api/review').set('Authorization', 'Bearer ' + f.token(id, role))).status, 403)
  await start(f)
  const other = await request(f.app).get('/api/review').set('Authorization', 'Bearer ' + f.token('owner-b'))
  assert.equal(other.body.runs.length, 0)
  f.owners.delete('owner-a')
  assert.equal((await request(f.app).get('/api/review').set('Authorization', 'Bearer ' + f.token())).status, 403)
})
test('runs are idempotent; steps validate the catalog, isolate owners and reject stale saves', async () => {
  const f = await fixture(); const id = randomUUID()
  assert.equal((await start(f, id)).status, 201)
  assert.equal((await start(f, id)).status, 200)
  const path = '/api/review/runs/' + id + '/steps/open'
  const data = { revision: 1, outcome: 'failed', comment: 'Button does not respond', path: '/ielts-coach?token=secret#private' }
  assert.equal((await request(f.app).put(path).set('Authorization', 'Bearer ' + f.token('owner-b')).send(data)).status, 404)
  const saved = await request(f.app).put(path).set('Authorization', 'Bearer ' + f.token()).set('X-StudyHub-Build', 'aaaaaaaa').send(data)
  assert.equal(saved.status, 200)
  assert.equal(saved.body.record.data.steps.open.path, '/ielts-coach')
  assert.equal((await request(f.app).put(path).set('Authorization', 'Bearer ' + f.token()).set('X-StudyHub-Build', 'aaaaaaaa').send(data)).status, 409)
  assert.equal((await request(f.app).put(path).set('Authorization', 'Bearer ' + f.token()).set('X-StudyHub-Build', 'aaaaaaaa').send({ ...data, revision: 2, comment: '' })).status, 400)
  assert.equal((await request(f.app).put(path).set('Authorization', 'Bearer ' + f.token()).set('X-StudyHub-Build', 'bbbbbbbb').send({ ...data, revision: 2 })).status, 409)
  process.env.REVIEW_BUILD_SHA = 'bbbbbbbb'
  try { assert.equal((await request(f.app).put(path).set('Authorization', 'Bearer ' + f.token()).set('X-StudyHub-Build', 'aaaaaaaa').send({ ...data, revision: 2 })).status, 409) }
  finally { process.env.REVIEW_BUILD_SHA = 'aaaaaaaa' }
})
test('feedback retries do not duplicate; accepting requires a passed step on the fixed deployed version', async () => {
  const f = await fixture(); const runId = randomUUID(); await start(f, runId)
  const id = randomUUID(); const body = { id, runId, stepId: 'open', text: 'Cannot open cabinet', path: '/ielts-coach?token=secret' }
  const send = () => request(f.app).post('/api/review/feedback').set('Authorization', 'Bearer ' + f.token()).send(body)
  assert.equal((await send()).status, 201); assert.equal((await send()).status, 200)
  assert.equal((await f.repo.list('owner-a', 'feedback-')).length, 1)
  const patch = (data: unknown) => request(f.app).patch('/api/review/feedback/' + id).set('Authorization', 'Bearer ' + f.token()).send(data)
  assert.equal((await patch({ revision: 1, status: 'ready', note: 'Fixed', fixedSha: 'aaaaaaaa' })).status, 200)
  assert.equal((await patch({ revision: 2, status: 'accepted', note: 'Fine', proofRunId: runId })).status, 400)
  const proof = randomUUID(); await start(f, proof)
  await request(f.app).put('/api/review/runs/' + proof + '/steps/open').set('Authorization', 'Bearer ' + f.token()).set('X-StudyHub-Build', 'aaaaaaaa').send({ revision: 1, outcome: 'passed', comment: '', path: '/ielts-coach' })
  assert.equal((await patch({ revision: 2, status: 'accepted', note: 'Retested', proofRunId: proof })).status, 200)
})
test('test sessions use real bounded JWT claims, block owner/payment access and revoke immediately', async () => {
  const f = await fixture(); const runId = randomUUID(); await start(f, runId)
  const id = randomUUID()
  const session = await request(f.app).post('/api/review/sessions').set('Authorization', 'Bearer ' + f.token()).send({ id, runId, persona: 'student-a' })
  assert.equal(session.status, 200)
  const auth = 'Bearer ' + session.body.token
  assert.equal((await request(f.app).get('/api/learning').set('Authorization', auth)).status, 200)
  assert.equal((await request(f.app).get('/api/review').set('Authorization', auth)).status, 403)
  assert.equal((await request(f.app).post('/api/billing/pay').set('Authorization', auth)).status, 403)
  assert.equal((await request(f.app).get('/api/auth/me?token=' + session.body.token)).status, 401)
  await request(f.app).delete('/api/review/sessions/' + id).set('Authorization', 'Bearer ' + f.token())
  assert.equal((await request(f.app).get('/api/learning').set('Authorization', auth)).status, 401)
  assert.equal((await request(f.app).get('/api/learning').set('Authorization', 'Bearer ' + f.token(session.body.user.id, 'student'))).status, 401)
})
test('reader key is scoped to one owner, not exported, cannot mutate and can be revoked', async () => {
  const f = await fixture(); await start(f)
  await start(f, randomUUID(), 'owner-b')
  const result = await request(f.app).post('/api/review/reader-key').set('Authorization', 'Bearer ' + f.token())
  const key = result.body.key
  const report = await request(f.app).get('/api/review-feed').set('Authorization', 'Bearer ' + key)
  assert.equal(report.status, 200); assert.equal(report.body.runs.length, 1)
  assert.equal(JSON.stringify(report.body).includes(key), false)
  assert.equal((await request(f.app).post('/api/review/runs').set('Authorization', 'Bearer ' + key).send({})).status, 401)
  await request(f.app).delete('/api/review/reader-key').set('Authorization', 'Bearer ' + f.token())
  assert.equal((await request(f.app).get('/api/review-feed').set('Authorization', 'Bearer ' + key)).status, 401)
})
test('service records cannot be forged or read through generic progress endpoints', async () => {
  const { default: router } = await import('../routes/moduleProgress')
  const express = (await import('express')).default
  const f = await fixture(); const app = express().use(express.json()).use('/api/module-progress', router)
  const { prisma } = await import('../lib/prisma')
  const original = prisma.user.findUnique
  prisma.user.findUnique = (async () => ({ role: 'admin', authVersion: 0 })) as never
  try {
  for (const method of ['get', 'put'] as const) {
    const res = await request(app)[method]('/api/module-progress/owner-review-v1-access').set('Authorization', 'Bearer ' + f.token('ordinary-admin')).send({ answers: { enabled: true } })
    assert.ok([400, 403].includes(res.status))
  }
  } finally { prisma.user.findUnique = original }
})
