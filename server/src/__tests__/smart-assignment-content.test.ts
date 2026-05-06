// ── Smart-assignment with org content tests ─────────────────────────────────
//
// End-to-end: orgA seeds an ent_lesson tagged with "trigonometry"; orgB seeds
// one tagged the same way. orgA's owner generates a smart-assignment for a
// class; the resulting assignment must contain ONLY questions sourced from
// orgA's lesson, never orgB's. Falls back to questionBank if no content
// match. Mocks the topic tagger via fetch interceptor so no real Groq call.

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

let orgAOwnerToken: string
let orgAId: string
let orgAClassId: string
let orgBOwnerToken: string
let orgBId: string

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

async function buildOrgWithClassAndStudent(label: 'A' | 'B'): Promise<{
  ownerToken: string; orgId: string; classId: string; studentId: string
}> {
  const owner = await createTestUser({ role: 'teacher', suffix: `sm_${label}_owner` })
  const orgRes = await request(server)
    .post('/api/orgs')
    .set('Authorization', `Bearer ${owner.token}`)
    .send({ name: `${TEST_PREFIX}sm_${label}`, type: 'tutoring_center' })
  assert.equal(orgRes.status, 201)
  const orgId = orgRes.body.org.id as string

  const classRes = await request(server)
    .post('/api/classes')
    .set('Authorization', `Bearer ${owner.token}`)
    .send({ name: `${TEST_PREFIX}sm_${label}_class`, subject: 'math' })
  assert.equal(classRes.status, 201)
  const classId = classRes.body.class.id as string
  const inviteCode = classRes.body.class.inviteCode as string

  const student = await createTestUser({ role: 'student', suffix: `sm_${label}_student` })
  const joinRes = await request(server)
    .post('/api/classes/join')
    .set('Authorization', `Bearer ${student.token}`)
    .send({ inviteCode })
  assert.equal(joinRes.status, 200)

  await prisma.diagnosticResult.create({
    data: {
      userId: student.id,
      subject: 'math',
      scores: { score: 5, maxScore: 10, percentage: 50, level: 'medium', weakTopics: ['Тригонометрия'] },
    },
  })

  return { ownerToken: owner.token, orgId, classId, studentId: student.id }
}

async function seedLesson(orgId: string | null, label: string): Promise<string> {
  const item = await prisma.content.create({
    data: {
      type: 'ent_lesson',
      active: true,
      orgId,
      data: {
        subject: 'math',
        topics: ['trigonometry'],
        title: `${TEST_PREFIX}lesson_${label}`,
        moduleTitle: `${TEST_PREFIX}mod_${label}`,
        theory: 'Тригонометрия. '.repeat(50),
        quiz: [
          { q: `Q1 from ${label}`, options: ['A', 'B', 'C', 'D'], correct: 0, explanation: '' },
          { q: `Q2 from ${label}`, options: ['A', 'B', 'C', 'D'], correct: 1, explanation: '' },
          { q: `Q3 from ${label}`, options: ['A', 'B', 'C', 'D'], correct: 2, explanation: '' },
        ],
        sourceMaterial: `${TEST_PREFIX}material_${label}`,
      },
    },
  })
  return item.id
}

describe('smart-assignment with org content', () => {
  before(async () => {
    assertSafeDatabase()
    server = app.listen(0)
    await cleanupTestData()
    mockGroq()
    if (!process.env.GROQ_API_KEY) process.env.GROQ_API_KEY = 'test-mock-key'

    const a = await buildOrgWithClassAndStudent('A')
    orgAOwnerToken = a.ownerToken; orgAId = a.orgId; orgAClassId = a.classId
    const b = await buildOrgWithClassAndStudent('B')
    orgBOwnerToken = b.ownerToken; orgBId = b.orgId

    // Seed lessons:
    //   - orgA private lesson — questions should appear
    //   - orgB private lesson — questions must NOT appear in orgA's assignment
    //   - global lesson — appears as fallback / second-tier source
    await seedLesson(orgAId, 'A')
    await seedLesson(orgBId, 'B')
    await seedLesson(null, 'GLOBAL')
  })

  after(async () => {
    restoreFetch()
    await cleanupTestData()
    await prisma.$disconnect()
    server.close()
    setTimeout(() => process.exit(0), 100).unref()
  })

  it('orgA owner generating smart-assignment gets orgA questions, never orgB', async () => {
    const res = await request(server)
      .post('/api/smart-assignment/generate')
      .set('Authorization', `Bearer ${orgAOwnerToken}`)
      .send({ classId: orgAClassId, subject: 'math', questionCount: 6 })
    assert.equal(res.status, 201, JSON.stringify(res.body).slice(0, 300))

    const text = JSON.stringify(res.body)
    assert.ok(text.includes('Q1 from A') || text.includes('Q2 from A') || text.includes('Q3 from A'),
      'expected at least one orgA question in the assignment')
    assert.ok(!text.includes('Q1 from B') && !text.includes('Q2 from B') && !text.includes('Q3 from B'),
      'orgB questions must never appear')

    assert.ok(res.body.meta.orgContentUsed >= 1,
      `expected orgContentUsed >= 1, got ${res.body.meta.orgContentUsed}`)
    assert.deepEqual(res.body.meta.weakTopicIds, ['trigonometry'])
  })

  it('orgB owner generating gets orgB questions, never orgA', async () => {
    const cls = await request(server)
      .post('/api/classes')
      .set('Authorization', `Bearer ${orgBOwnerToken}`)
      .send({ name: `${TEST_PREFIX}sm_B_class2`, subject: 'math' })
    assert.equal(cls.status, 201)
    const inviteCode = cls.body.class.inviteCode as string

    const student2 = await createTestUser({ role: 'student', suffix: 'sm_B_student2' })
    await request(server).post('/api/classes/join')
      .set('Authorization', `Bearer ${student2.token}`)
      .send({ inviteCode })

    await prisma.diagnosticResult.create({
      data: {
        userId: student2.id,
        subject: 'math',
        scores: { score: 5, maxScore: 10, percentage: 50, level: 'medium', weakTopics: ['Тригонометрия'] },
      },
    })

    const res = await request(server)
      .post('/api/smart-assignment/generate')
      .set('Authorization', `Bearer ${orgBOwnerToken}`)
      .send({ classId: cls.body.class.id, subject: 'math', questionCount: 6 })
    assert.equal(res.status, 201, JSON.stringify(res.body).slice(0, 300))

    const text = JSON.stringify(res.body)
    assert.ok(text.includes('from B'), 'expected orgB content')
    assert.ok(!text.includes('Q1 from A') && !text.includes('Q2 from A') && !text.includes('Q3 from A'),
      'orgA questions must never appear in orgB output')
  })

  it('falls back to questionBank when no content matches the topic', async () => {
    const cls = await request(server)
      .post('/api/classes')
      .set('Authorization', `Bearer ${orgAOwnerToken}`)
      .send({ name: `${TEST_PREFIX}sm_fallback`, subject: 'physics' })
    assert.equal(cls.status, 201)
    const inviteCode = cls.body.class.inviteCode as string

    const studentFb = await createTestUser({ role: 'student', suffix: 'sm_fallback_student' })
    await request(server).post('/api/classes/join')
      .set('Authorization', `Bearer ${studentFb.token}`)
      .send({ inviteCode })

    await prisma.diagnosticResult.create({
      data: {
        userId: studentFb.id,
        subject: 'physics',
        scores: { score: 3, maxScore: 10, percentage: 30, level: 'low', weakTopics: ['Кинематика'] },
      },
    })

    const res = await request(server)
      .post('/api/smart-assignment/generate')
      .set('Authorization', `Bearer ${orgAOwnerToken}`)
      .send({ classId: cls.body.class.id, subject: 'physics', questionCount: 5 })
    assert.equal(res.status, 201, JSON.stringify(res.body).slice(0, 300))

    assert.ok(Array.isArray(res.body.assignment.content.questions))
    assert.ok(res.body.assignment.content.questions.length >= 1)
    assert.equal(res.body.meta.orgContentUsed, 0)
  })
})
