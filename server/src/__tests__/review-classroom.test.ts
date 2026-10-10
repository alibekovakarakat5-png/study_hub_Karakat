import { test, type TestContext } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'crypto'
import request from 'supertest'
import { allowedClassroomMutation, reviewClassroomId, reviewClassroomUserId, provisionReviewClassroom } from '../lib/reviewClassroom'
import { reviewCatalog } from '../lib/reviewCatalog'
import { prisma } from '../lib/prisma'
process.env.REVIEW_BUILD_SHA = 'aaaaaaaa'

test('classroom review covers both roles, writing feedback and outsider isolation', () => {
  const scenario = reviewCatalog.find(s => s.id === 'classroom-olympiad-v1')!
  assert.equal(scenario.steps.length, 9)
  assert.deepEqual(new Set(scenario.steps.map(s => s.persona)), new Set(['classroom-student', 'classroom-curator', 'classroom-outsider']))
  for (const step of scenario.steps) assert.ok(step.action && step.expected)
})

test('test writes are restricted to the signed class, assignment and correct role', () => {
  const id = reviewClassroomId('owner', 'run1'), other = reviewClassroomId('owner', 'run2')
  const student = reviewClassroomUserId(id, 'classroom-student'), curator = reviewClassroomUserId(id, 'classroom-curator')
  const scope = { classroomId: id }
  assert.equal(allowedClassroomMutation('POST', `/api/assignments/${id}_a1/submit`, scope, student), true)
  assert.equal(allowedClassroomMutation('PATCH', `/api/classes/${id}/goal`, scope, curator), true)
  assert.equal(allowedClassroomMutation('PUT', `/api/assignments/${id}_a6/grade/sub1`, scope, curator), true)
  for (const path of [`/api/assignments/${other}_a1/submit`, '/api/assignments/real/submit', `/api/assignments/${id}_a8/submit`, `/api/assignments/${id}_a1/submit/extra`, '/api/classes/join']) assert.equal(allowedClassroomMutation('POST', path, scope, student), false)
  assert.equal(allowedClassroomMutation('PATCH', `/api/classes/${id}/goal`, scope, student), false)
  assert.equal(allowedClassroomMutation('POST', `/api/assignments/${id}_a1/submit`, scope, curator), false)
  assert.equal(allowedClassroomMutation('POST', `/api/assignments/${id}_a1/submit`, undefined, student), false)
  assert.equal(allowedClassroomMutation('DELETE', `/api/classes/${id}`, scope, curator), false)
})

function mockMethod(t: TestContext, obj: any, key: string, fn: (...args: any[]) => any) { const original = obj[key]; obj[key] = fn; t.after(() => { obj[key] = original }) }
test('provisioning is idempotent per run and isolates owners and new runs with all seven lessons', async t => {
  const rows = { user: new Map(), class: new Map(), classMembership: new Map(), assignment: new Map() }
  const tx = Object.fromEntries(Object.entries(rows).map(([name, store]) => [name, { upsert: async ({ where, create, update }: any) => {
    assert.deepEqual(update, {}, 'never reset existing attempts or edits')
    const key = where.id ?? JSON.stringify(where.classId_studentId)
    if (!store.has(key)) store.set(key, structuredClone(create))
    return store.get(key)
  } }]))
  mockMethod(t, prisma, '$transaction', async fn => fn(tx))
  mockMethod(t, prisma.user, 'findUniqueOrThrow', async ({ where }) => rows.user.get(where.id))
  const first = await provisionReviewClassroom('owner1', 'run1', 'classroom-student')
  const id = reviewClassroomId('owner1', 'run1')
  rows.class.get(id).targetDate = new Date('2026-10-18T00:00:00Z')
  await provisionReviewClassroom('owner1', 'run1', 'classroom-curator')
  assert.equal(rows.assignment.size, 7); assert.equal(rows.class.size, 1); assert.equal(rows.classMembership.size, 1)
  assert.equal(rows.class.get(id).targetDate.toISOString(), '2026-10-18T00:00:00.000Z')
  assert.equal(first.grade, 6)
  assert.equal([...rows.assignment.values()].reduce((sum, a) => sum + (a.content.quiz ?? a.content.questions ?? []).length, 0), 48)
  await provisionReviewClassroom('owner1', 'run2', 'classroom-student')
  await provisionReviewClassroom('owner2', 'run1', 'classroom-student')
  assert.equal(rows.assignment.size, 21); assert.equal(rows.class.size, 3)
  assert.equal(rows.classMembership.size, 3, 'outsider never joins any class')
})

test('review launch scopes signed mutation rights and refuses personas outside the scenario', async () => {
  const { reviewFixture } = await import('./review-fixture')
  const f = reviewFixture(), runId = randomUUID(), sessionId = randomUUID()
  await request(f.app).post('/api/review/runs').set('Authorization', 'Bearer ' + f.token()).send({ id: runId, scenarioId: 'classroom-olympiad-v1', frontendSha: 'aaaaaaaa' }).expect(201)
  const start = (persona: string, id = sessionId) => request(f.app).post('/api/review/sessions').set('Authorization', 'Bearer ' + f.token()).send({ id, runId, persona })
  assert.equal((await start('student-a')).status, 400)
  const session = await start('classroom-student'); assert.equal(session.status, 200)
  const id = reviewClassroomId('owner-a', runId)
  assert.equal(session.body.path, '/classroom?class=' + id)
  const feedback = await request(f.app).post('/api/review/feedback').set('Authorization', 'Bearer ' + f.token()).set('X-StudyHub-Build', 'aaaaaaaa').send({ id: randomUUID(), runId, stepId: 'route', text: 'Synthetic classroom feedback', path: '/classroom?class=private', sessionId })
  assert.equal(feedback.status, 201)
  assert.equal(feedback.body.record.data.persona, 'classroom-student')
  const exported = await request(f.app).get('/api/review/export').set('Authorization', 'Bearer ' + f.token())
  assert.equal(exported.body.feedback[0].data.scenarioId, 'classroom-olympiad-v1')
  assert.equal(exported.body.feedback[0].data.path, '/classroom')
  f.app.post('/api/assignments/:id/submit', f.auth, (_req, res) => res.json({ reachedHandler: true }))
  const token = 'Bearer ' + session.body.token
  assert.equal((await request(f.app).post(`/api/assignments/${id}_a1/submit`).set('Authorization', token)).status, 200)
  assert.equal((await request(f.app).post('/api/assignments/real/submit').set('Authorization', token)).status, 403)
  await request(f.app).delete('/api/review/sessions/' + sessionId).set('Authorization', 'Bearer ' + f.token()).expect(200)
  assert.equal((await request(f.app).post(`/api/assignments/${id}_a1/submit`).set('Authorization', token)).status, 401)
})
