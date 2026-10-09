import 'express-async-errors'
import { test, type TestContext } from 'node:test'
import assert from 'node:assert/strict'
import express from 'express'
import request from 'supertest'
import { classroomScore, studentContent } from '../lib/classroomContent'

process.env.JWT_SECRET = 'classroom-test-only'
process.env.DATABASE_URL = 'postgresql://unused:unused@127.0.0.1:1/unused'
function mockMethod(t: TestContext, obj: any, key: string, replacement: (...args: any[]) => any) { const original = obj[key]; obj[key] = replacement; t.after(() => { obj[key] = original }) }
const questions = [{ id: 'q1', text: 'He ___ daily.', options: ['reads', 'read'], correctAnswer: 0, explanation: 'He takes -s.', topic: 'Grammar' }]
async function fixture(t: TestContext) {
  const { prisma } = await import('../lib/prisma')
  const { signToken } = await import('../middleware/auth')
  const { default: assignments } = await import('../routes/assignments')
  const { default: classes } = await import('../routes/classes')
  const app = express().use(express.json()).use('/api/assignments', assignments).use('/api/classes', classes)
  const assignment = { id: 'a1', teacherId: 'owner', type: 'test', content: { questions }, class: { members: [{ studentId: 'student' }] } }
  mockMethod(t, prisma.user, 'findUnique', async ({ where }: { where: { id: string } }) => ({ id: where.id, authVersion: 0, role: where.id === 'owner' ? 'admin' : where.id === 'teacher2' ? 'teacher' : 'student', parentTgChatId: null }))
  mockMethod(t, prisma.assignment, 'findUnique', async () => assignment)
  const token = (id: string) => 'Bearer ' + signToken({ userId: id, role: id === 'owner' ? 'admin' : id === 'teacher2' ? 'teacher' : 'student', email: `${id}@example.invalid` })
  return { app, prisma, token, assignment }
}

test('only display content reaches students; grading rejects malformed and out-of-range answers', () => {
  assert.deepEqual(studentContent({ questions, secretKeys: [0] }), { questions: [{ id: 'q1', text: questions[0].text, options: ['reads', 'read'], topic: 'Grammar' }] })
  for (const answers of [null, [], [2], [-1], ['0'], [0, 1], [0.5]]) assert.throws(() => classroomScore(questions, answers))
  assert.equal(classroomScore(questions, [0]), 100)
  assert.equal(classroomScore(questions, [1]), 0)
})

test('answer explanations unlock only for the student who submitted; outsiders denied', async t => {
  const { app, prisma, token } = await fixture(t)
  let submitted = false
  mockMethod(t, prisma.assignmentSubmission, 'findUnique', async ({ where }: { where: { assignmentId_studentId: { studentId: string } } }) => {
    assert.equal(where.assignmentId_studentId.studentId, 'student')
    return submitted ? { id: 's1', answers: [0], score: 100 } : null
  })
  let res = await request(app).get('/api/assignments/a1').set('Authorization', token('student'))
  assert.equal(res.status, 200); assert.equal(res.body.assignment.content.questions[0].correctAnswer, undefined)
  submitted = true
  res = await request(app).get('/api/assignments/a1').set('Authorization', token('student'))
  assert.equal(res.body.assignment.content.questions[0].explanation, 'He takes -s.')
  assert.equal((await request(app).get('/api/assignments/a1').set('Authorization', token('outsider'))).status, 403)
})

test('server grades a valid attempt and rejects partial attempts and duplicate submissions', async t => {
  const { app, prisma, token } = await fixture(t)
  let saved: unknown = null
  mockMethod(t, prisma.assignmentSubmission, 'findUnique', async () => saved)
  mockMethod(t, prisma.assignmentSubmission, 'create', async ({ data }: { data: Record<string, unknown> }) => { saved = { id: 's1', ...data }; return saved })
  const submit = (answers: unknown, user = 'student') => request(app).post('/api/assignments/a1/submit').set('Authorization', token(user)).send({ answers })
  assert.equal((await submit([], 'outsider')).status, 403)
  assert.equal((await submit([])).status, 400); assert.equal(saved, null)
  const result = await submit([0]); assert.equal(result.status, 201); assert.equal(result.body.submission.score, 100)
  assert.equal((await submit([1])).status, 409)
})

test('a concurrent duplicate submission returns conflict rather than overwriting the first attempt', async t => {
  const { app, prisma, token } = await fixture(t)
  mockMethod(t, prisma.assignmentSubmission, 'findUnique', async () => null)
  mockMethod(t, prisma.assignmentSubmission, 'create', async () => { throw Object.assign(new Error('duplicate'), { code: 'P2002' }) })
  assert.equal((await request(app).post('/api/assignments/a1/submit').set('Authorization', token('student')).send({ answers: [0] })).status, 409)
})

test('owner can edit or clear a goal date; invalid dates and other accounts cannot change it', async t => {
  const { app, prisma, token } = await fixture(t)
  let value: Date | null = null
  mockMethod(t, prisma.class, 'updateMany', async ({ where, data }: { where: { teacherId: string }; data: { targetDate: Date | null } }) => {
    if (where.teacherId !== 'owner') return { count: 0 }
    value = data.targetDate; return { count: 1 }
  })
  const change = (targetDate: string | null, user = 'owner') => request(app).patch('/api/classes/c1/goal').set('Authorization', token(user)).send({ targetDate })
  assert.equal((await change('2026-10-15')).status, 200); assert.equal((value as unknown as Date).toISOString(), '2026-10-15T00:00:00.000Z')
  assert.equal((await change('2026-02-30')).status, 400)
  assert.equal((await change('2026-10-16', 'teacher2')).status, 404)
  assert.equal((await change('2026-10-16', 'student')).status, 403)
  assert.equal((await change(null)).status, 200); assert.equal(value, null)
})

test('class detail and list hide answer keys and detail hides other students', async t => {
  const { app, prisma, token, assignment } = await fixture(t)
  const cls = { id: 'c1', teacherId: 'owner', members: [{ studentId: 'student' }, { studentId: 'other' }], assignments: [{ ...assignment, submissions: [] }] }
  mockMethod(t, prisma.class, 'findMany', async () => [cls])
  mockMethod(t, prisma.class, 'findUnique', async () => cls)
  const detail = await request(app).get('/api/classes/c1').set('Authorization', token('student'))
  assert.equal(detail.status, 200); assert.deepEqual(detail.body.class.members, [{ studentId: 'student' }])
  assert.equal(JSON.stringify(detail.body).includes('correctAnswer'), false)
  const list = await request(app).get('/api/classes').set('Authorization', token('student'))
  assert.equal(JSON.stringify(list.body.classes[0].assignments[0].content).includes('explanation'), false)
})

test('grading is bound to the requested assignment and cannot edit a foreign submission', async t => {
  const { app, prisma, token } = await fixture(t)
  mockMethod(t, prisma.assignmentSubmission, 'updateMany', async ({ where }: { where: { id: string; assignmentId: string } }) => {
    assert.equal(where.assignmentId, 'a1'); assert.equal(where.id, 'foreign'); return { count: 0 }
  })
  const grade = (id: string) => request(app).put('/api/assignments/a1/grade/foreign').set('Authorization', token(id)).send({ score: 80, feedback: 'Next step' })
  assert.equal((await grade('student')).status, 403)
  assert.equal((await grade('teacher2')).status, 403)
  assert.equal((await grade('owner')).status, 404)
})
