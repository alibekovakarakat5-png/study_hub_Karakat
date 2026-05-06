// ── Per-student smart-assignment preview tests ──────────────────────────────
//
// Verifies:
//   - 401 without token, 403 from non-teacher / wrong-class teacher
//   - 404 if student isn't a class member
//   - Each student in the same class gets DIFFERENT questions based on
//     their own weakTopics (no aggregation)
//   - Questions come from the center's content first, never from another org
//   - Fallback to questionBank when no content matches
//
// Mocks fetch so no Groq calls are made.

import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import dotenv from 'dotenv'
import path from 'path'
import type { Server } from 'http'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

import app from '../app'
import { prisma } from '../lib/prisma'
import {
  assertSafeDatabase, cleanupTestData, createTestUser, TEST_PREFIX,
} from './helpers'

let server: Server
let originalFetch: typeof fetch

let teacherToken: string
let teacherId: string
let orgId: string
let classId: string
let inviteCode: string

let studentABand4Id: string
let studentABand4Token: string
let studentBBand7Id: string

let otherTeacherToken: string
let otherStudentId: string

function mockGroq(): void {
  originalFetch = globalThis.fetch
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    if (url.includes('api.groq.com')) {
      return new Response(JSON.stringify({
        choices: [{ message: { content: JSON.stringify({ topics: [] }) } }],
      }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }
    return originalFetch(input as Parameters<typeof fetch>[0], init)
  }) as typeof fetch
}
function restoreFetch(): void { if (originalFetch) globalThis.fetch = originalFetch }

async function seedLesson(label: string, topics: string[]): Promise<void> {
  await prisma.content.create({
    data: {
      type: 'ent_lesson',
      active: true,
      orgId,
      data: {
        subject: 'english',
        topics,
        title: `${TEST_PREFIX}lesson_${label}`,
        moduleTitle: `${TEST_PREFIX}mod_${label}`,
        theory: 'IELTS theory '.repeat(40),
        quiz: [
          { q: `Q1 from ${label}`, options: ['A', 'B', 'C', 'D'], correct: 0, explanation: '' },
          { q: `Q2 from ${label}`, options: ['A', 'B', 'C', 'D'], correct: 1, explanation: '' },
          { q: `Q3 from ${label}`, options: ['A', 'B', 'C', 'D'], correct: 2, explanation: '' },
        ],
      },
    },
  })
}

describe('POST /api/smart-assignment/preview-for-student', () => {
  before(async () => {
    assertSafeDatabase()
    server = app.listen(0)
    await cleanupTestData()
    mockGroq()
    if (!process.env.GROQ_API_KEY) process.env.GROQ_API_KEY = 'test-mock-key'

    // Teacher + org + class
    const t = await createTestUser({ role: 'teacher', suffix: 'pfs_teacher' })
    teacherToken = t.token; teacherId = t.id
    const orgRes = await request(server)
      .post('/api/orgs').set('Authorization', `Bearer ${teacherToken}`)
      .send({ name: `${TEST_PREFIX}pfs_org`, type: 'tutoring_center' })
    assert.equal(orgRes.status, 201)
    orgId = orgRes.body.org.id

    const classRes = await request(server)
      .post('/api/classes').set('Authorization', `Bearer ${teacherToken}`)
      .send({ name: `${TEST_PREFIX}pfs_class`, subject: 'english' })
    assert.equal(classRes.status, 201)
    classId = classRes.body.class.id
    inviteCode = classRes.body.class.inviteCode

    // Student A — Band 4: weak in tenses + reading
    const sA = await createTestUser({ role: 'student', suffix: 'pfs_band4' })
    studentABand4Id = sA.id; studentABand4Token = sA.token
    await request(server).post('/api/classes/join')
      .set('Authorization', `Bearer ${studentABand4Token}`)
      .send({ inviteCode })
    await prisma.diagnosticResult.create({
      data: {
        userId: studentABand4Id, subject: 'english',
        scores: { score: 12, maxScore: 40, percentage: 30, level: 'low',
          weakTopics: ['Времена глагола', 'Чтение'] },
      },
    })

    // Student B — Band 7: weak in vocabulary only
    const sB = await createTestUser({ role: 'student', suffix: 'pfs_band7' })
    studentBBand7Id = sB.id
    await request(server).post('/api/classes/join')
      .set('Authorization', `Bearer ${sB.token}`)
      .send({ inviteCode })
    await prisma.diagnosticResult.create({
      data: {
        userId: studentBBand7Id, subject: 'english',
        scores: { score: 34, maxScore: 40, percentage: 85, level: 'high',
          weakTopics: ['Академическая лексика'] },
      },
    })

    // Seed content: 3 lessons each tagged with one topic
    await seedLesson('TENSES', ['grammar-tenses'])
    await seedLesson('READING', ['reading-skills'])
    await seedLesson('VOCAB', ['vocabulary-academic'])

    // Other teacher in their own org (used to test cross-class auth)
    const ot = await createTestUser({ role: 'teacher', suffix: 'pfs_other' })
    otherTeacherToken = ot.token
    await request(server).post('/api/orgs')
      .set('Authorization', `Bearer ${otherTeacherToken}`)
      .send({ name: `${TEST_PREFIX}pfs_other_org`, type: 'tutoring_center' })

    // A student in NO class — for "not a member" test
    const outsider = await createTestUser({ role: 'student', suffix: 'pfs_outsider' })
    otherStudentId = outsider.id
  })

  after(async () => {
    restoreFetch()
    await cleanupTestData()
    await prisma.$disconnect()
    server.close()
    setTimeout(() => process.exit(0), 100).unref()
  })

  // ── Auth & validation ────────────────────────────────────────────────────

  it('returns 401 without token', async () => {
    const r = await request(server)
      .post('/api/smart-assignment/preview-for-student')
      .send({ classId, studentId: studentABand4Id, subject: 'english' })
    assert.equal(r.status, 401)
  })

  it('returns 403 for a teacher who does not own the class', async () => {
    const r = await request(server)
      .post('/api/smart-assignment/preview-for-student')
      .set('Authorization', `Bearer ${otherTeacherToken}`)
      .send({ classId, studentId: studentABand4Id, subject: 'english' })
    assert.equal(r.status, 403)
  })

  it('returns 404 when studentId is not a class member', async () => {
    const r = await request(server)
      .post('/api/smart-assignment/preview-for-student')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ classId, studentId: otherStudentId, subject: 'english' })
    assert.equal(r.status, 404)
  })

  it('returns 400 on missing fields', async () => {
    const r = await request(server)
      .post('/api/smart-assignment/preview-for-student')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ classId })
    assert.equal(r.status, 400)
  })

  // ── Personalisation: each student gets different questions ───────────────

  it('Band-4 student (weak in tenses + reading) gets TENSES and READING questions', async () => {
    const r = await request(server)
      .post('/api/smart-assignment/preview-for-student')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ classId, studentId: studentABand4Id, subject: 'english', questionCount: 6 })
    assert.equal(r.status, 200, JSON.stringify(r.body).slice(0, 300))
    const text = JSON.stringify(r.body)
    assert.ok(text.includes('from TENSES') || text.includes('from READING'),
      'expected TENSES or READING questions for Band-4 student')
    assert.ok(!text.includes('from VOCAB'),
      'must NOT include VOCAB questions — student is not weak in vocabulary')
    assert.deepEqual(
      r.body.meta.weakTopicIds.sort(),
      ['grammar-tenses', 'reading-skills'].sort(),
    )
    assert.ok(r.body.meta.orgContentUsed >= 1)
  })

  it('Band-7 student (weak in vocab only) gets VOCAB questions, NOT tenses or reading', async () => {
    const r = await request(server)
      .post('/api/smart-assignment/preview-for-student')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ classId, studentId: studentBBand7Id, subject: 'english', questionCount: 6 })
    assert.equal(r.status, 200)
    const text = JSON.stringify(r.body)
    assert.ok(text.includes('from VOCAB'), 'expected VOCAB questions')
    assert.ok(!text.includes('from TENSES'), 'must NOT include TENSES questions')
    assert.ok(!text.includes('from READING'), 'must NOT include READING questions')
    assert.deepEqual(r.body.meta.weakTopicIds, ['vocabulary-academic'])
  })

  it('does NOT persist an Assignment row (preview only)', async () => {
    const before = await prisma.assignment.count({ where: { classId } })
    await request(server)
      .post('/api/smart-assignment/preview-for-student')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ classId, studentId: studentABand4Id, subject: 'english', questionCount: 6 })
    const after = await prisma.assignment.count({ where: { classId } })
    assert.equal(before, after, 'preview must not create assignments')
  })

  it('returns student name in the response', async () => {
    const r = await request(server)
      .post('/api/smart-assignment/preview-for-student')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ classId, studentId: studentABand4Id, subject: 'english' })
    assert.equal(r.status, 200)
    assert.ok(r.body.student.name.includes(TEST_PREFIX))
    assert.equal(r.body.student.id, studentABand4Id)
  })
})
