// ── /api/ai/generate-test org-awareness tests ──────────────────────────────
//
// Confirms that POST /api/ai/generate-test prefers the requesting teacher's
// org content for variant 1 when content matches the topic, and that orgB
// content never bleeds into orgA's response.
//
// Mocks Groq via fetch interceptor so no real API call.

import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import dotenv from 'dotenv'
import path from 'path'
import type { Server } from 'http'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

import app from '../app'
import { prisma } from '../lib/prisma'
import { assertSafeDatabase, cleanupTestData, createTestUser, TEST_PREFIX } from './helpers'

let server: Server
let originalFetch: typeof fetch
let orgAOwnerToken: string
let orgAId: string

function mockGroq(): void {
  originalFetch = globalThis.fetch
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    if (url.includes('api.groq.com')) {
      // Return a generic 3-variant test (this is what generateTest expects)
      const variants = Array.from({ length: 3 }, (_, vi) => ({
        variantIndex: vi + 1,
        questions: Array.from({ length: 5 }, (_, qi) => ({
          id: `v${vi + 1}_q${qi + 1}`,
          text: `AI fallback Q${vi + 1}.${qi + 1}`,
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0,
          explanation: 'AI generated',
        })),
      }))
      return new Response(JSON.stringify({
        choices: [{ message: { content: JSON.stringify({ variants }) } }],
      }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }
    return originalFetch(input as Parameters<typeof fetch>[0], init)
  }) as typeof fetch
}
function restoreFetch(): void { if (originalFetch) globalThis.fetch = originalFetch }

async function seedLesson(orgId: string | null, label: string, topicId: string): Promise<void> {
  await prisma.content.create({
    data: {
      type: 'ent_lesson',
      active: true,
      orgId,
      data: {
        subject: 'math',
        topics: [topicId],
        title: `${TEST_PREFIX}aitest_${label}`,
        moduleTitle: `${TEST_PREFIX}mod_${label}`,
        theory: 'Теория для теста '.repeat(40),
        // 6 questions per lesson — picker takes 2 per lesson by default,
        // so we need 3 lessons for a full 5-question variant. Easier to
        // give one lesson lots of questions.
        quiz: Array.from({ length: 6 }, (_, i) => ({
          q: `aiTest Q${i + 1} from ${label}`,
          options: ['A', 'B', 'C', 'D'],
          correct: 0,
          explanation: '',
        })),
      },
    },
  })
}

describe('POST /api/ai/generate-test (org-aware)', () => {
  before(async () => {
    assertSafeDatabase()
    server = app.listen(0)
    await cleanupTestData()
    mockGroq()
    if (!process.env.GROQ_API_KEY) process.env.GROQ_API_KEY = 'test-mock-key'

    const a = await createTestUser({ role: 'teacher', suffix: 'ait_a_owner' })
    orgAOwnerToken = a.token
    const orgARes = await request(server).post('/api/orgs')
      .set('Authorization', `Bearer ${orgAOwnerToken}`)
      .send({ name: `${TEST_PREFIX}ait_orgA`, type: 'tutoring_center' })
    assert.equal(orgARes.status, 201)
    orgAId = orgARes.body.org.id

    const b = await createTestUser({ role: 'teacher', suffix: 'ait_b_owner' })
    const orgBRes = await request(server).post('/api/orgs')
      .set('Authorization', `Bearer ${b.token}`)
      .send({ name: `${TEST_PREFIX}ait_orgB`, type: 'tutoring_center' })
    assert.equal(orgBRes.status, 201)

    // Seed three lessons in orgA so the picker can find ≥5 questions on this topic.
    await seedLesson(orgAId, 'A1', 'trigonometry')
    await seedLesson(orgAId, 'A2', 'trigonometry')
    await seedLesson(orgAId, 'A3', 'trigonometry')
    await seedLesson(orgBRes.body.org.id, 'B', 'trigonometry')
    await seedLesson(null, 'GLOBAL', 'trigonometry')
  })

  after(async () => {
    restoreFetch()
    await cleanupTestData()
    await prisma.$disconnect()
    server.close()
    setTimeout(() => process.exit(0), 100).unref()
  })

  it('orgA teacher gets variant 1 from orgA content, never orgB', async () => {
    const res = await request(server)
      .post('/api/ai/generate-test')
      .set('Authorization', `Bearer ${orgAOwnerToken}`)
      .send({ topic: 'Тригонометрия', subject: 'math', difficulty: 'medium', questionCount: 5 })
    assert.equal(res.status, 200, JSON.stringify(res.body).slice(0, 300))

    const text = JSON.stringify(res.body)
    assert.ok(text.includes('aiTest Q1 from A1') || text.includes('aiTest Q1 from A2') || text.includes('aiTest Q1 from A3'),
      'expected at least one orgA question in variant 1')
    assert.ok(!text.includes('from B'), 'orgB content must NOT appear')

    const meta = res.body.meta as { fromOrg?: number; fromGlobal?: number; fromAI?: number }
    assert.ok((meta?.fromOrg ?? 0) >= 1, `expected fromOrg >= 1, got ${meta?.fromOrg}`)
  })

  it('falls back to pure AI when topic does not match any content', async () => {
    const res = await request(server)
      .post('/api/ai/generate-test')
      .set('Authorization', `Bearer ${orgAOwnerToken}`)
      .send({ topic: 'Совершенно неизвестная тема ХYZ', subject: 'math', difficulty: 'medium', questionCount: 5 })
    assert.equal(res.status, 200, JSON.stringify(res.body).slice(0, 300))
    const meta = res.body.meta as { fromOrg?: number; fromAI?: number }
    assert.ok((meta?.fromAI ?? 0) >= 1, `expected fromAI >= 1, got ${meta?.fromAI}`)
    assert.equal(meta?.fromOrg ?? 0, 0)
  })
})
