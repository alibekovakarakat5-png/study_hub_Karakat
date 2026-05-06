// ── Setup demo environment for review ──────────────────────────────────────
//
// Creates / refreshes the IELTS demo:
//   - Director account (director@demo.test / demo12345) → "IELTS Demo Center"
//   - Class "IELTS Demo Class" subject=english
//   - 3 students (aigerim, bekzhan, dina) at different bands with diagnostics
//
// Idempotent: if accounts exist, logs in and re-uses them.
//
// Usage: cd server && npx tsx scripts/setup-demo.ts

import { prisma } from '../src/lib/prisma'

const BASE = process.env.DEMO_BASE ?? 'http://localhost:3001'

async function api(path: string, opts: RequestInit & { token?: string } = {}): Promise<{ status: number; body: unknown }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> | undefined ?? {}),
  }
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`
  const res = await fetch(`${BASE}${path}`, { ...opts, headers })
  let body: unknown = null
  try { body = await res.json() } catch { /* not json */ }
  return { status: res.status, body }
}

async function getOrCreateUser(name: string, email: string, role: 'teacher' | 'student' | 'admin'): Promise<{ token: string; id: string }> {
  // Try register
  const reg = await api('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password: 'demo12345', role }),
  })
  if (reg.status === 201 || reg.status === 200) {
    const b = reg.body as { token: string; user: { id: string } }
    return { token: b.token, id: b.user.id }
  }
  // Fall back to login
  const login = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password: 'demo12345' }),
  })
  if (login.status !== 200) {
    throw new Error(`Cannot register or login ${email}: register=${reg.status} login=${login.status} body=${JSON.stringify(login.body).slice(0, 200)}`)
  }
  const b = login.body as { token: string; user: { id: string } }
  return { token: b.token, id: b.user.id }
}

async function main(): Promise<void> {
  console.log(`Setting up demo against ${BASE}…\n`)

  // ── Director ────────────────────────────────────────────────────────────
  const director = await getOrCreateUser('Айгуль Назарбаева', 'director@demo.test', 'teacher')
  console.log(`✓ Director: director@demo.test (id=${director.id.slice(0, 12)}…)`)

  // ── Find or create org ─────────────────────────────────────────────────
  const orgsRes = await api('/api/orgs/mine', { token: director.token })
  const orgsBody = orgsRes.body as { orgs?: Array<{ id: string; name: string }> }
  let orgId: string
  if (orgsBody.orgs && orgsBody.orgs.length > 0) {
    orgId = orgsBody.orgs[0]!.id
    console.log(`✓ Using existing org: ${orgsBody.orgs[0]!.name}  (id=${orgId.slice(0, 12)}…)`)
  } else {
    const r = await api('/api/orgs', {
      method: 'POST',
      token: director.token,
      body: JSON.stringify({ name: 'IELTS Demo Center', type: 'tutoring_center', city: 'Astana' }),
    })
    if (r.status !== 201) throw new Error(`org create failed: ${r.status} ${JSON.stringify(r.body)}`)
    orgId = (r.body as { org: { id: string } }).org.id
    console.log(`✓ Created org: IELTS Demo Center  (id=${orgId.slice(0, 12)}…)`)
  }

  // ── Find or create class "IELTS Demo Class" ────────────────────────────
  const classesRes = await api('/api/classes', { token: director.token })
  const classes = (classesRes.body as { classes?: Array<{ id: string; name: string; inviteCode: string }> }).classes ?? []
  let classId: string
  let inviteCode: string
  const existing = classes.find((c) => c.name === 'IELTS Demo Class')
  if (existing) {
    classId = existing.id
    inviteCode = existing.inviteCode
    console.log(`✓ Using existing class: IELTS Demo Class  invite=${inviteCode}`)
  } else {
    const r = await api('/api/classes', {
      method: 'POST',
      token: director.token,
      body: JSON.stringify({ name: 'IELTS Demo Class', subject: 'english' }),
    })
    if (r.status !== 201) throw new Error(`class create failed: ${r.status} ${JSON.stringify(r.body)}`)
    const b = r.body as { class: { id: string; inviteCode: string } }
    classId = b.class.id
    inviteCode = b.class.inviteCode
    console.log(`✓ Created class: IELTS Demo Class  invite=${inviteCode}`)
  }

  // ── 3 students with diagnostics ────────────────────────────────────────
  const students = [
    { name: 'Айгерим Сатпаева (Band 4)', email: 'aigerim@demo.test',
      weakTopics: ['Времена глагола', 'Чтение', 'Артикли', 'Условные предложения'], percentage: 30 },
    { name: 'Бекжан Касымов (Band 5.5)',  email: 'bekzhan@demo.test',
      weakTopics: ['Условные предложения', 'Чтение'], percentage: 55 },
    { name: 'Дина Алибекова (Band 7)',    email: 'dina@demo.test',
      weakTopics: ['Академическая лексика'], percentage: 85 },
  ]

  for (const s of students) {
    const u = await getOrCreateUser(s.name, s.email, 'student')

    // Join class (idempotent — 409 if already member)
    const j = await api('/api/classes/join', {
      method: 'POST', token: u.token,
      body: JSON.stringify({ inviteCode }),
    })
    const joinNote = j.status === 200 ? 'joined' : j.status === 409 ? 'already member' : `status=${j.status}`

    // Refresh diagnostic
    await prisma.diagnosticResult.deleteMany({
      where: { userId: u.id, subject: 'english' },
    })
    await prisma.diagnosticResult.create({
      data: {
        userId: u.id,
        subject: 'english',
        scores: {
          score: Math.floor((s.percentage / 100) * 40),
          maxScore: 40,
          percentage: s.percentage,
          level: s.percentage < 40 ? 'low' : s.percentage < 70 ? 'medium' : 'high',
          weakTopics: s.weakTopics,
        },
      },
    })

    console.log(`✓ Student: ${s.email} (${joinNote})  weakTopics=[${s.weakTopics.join(', ')}]`)
  }

  console.log(`\n══════════════════════════════════════════════════════════════`)
  console.log(` ✅ DEMO ENVIRONMENT READY`)
  console.log(`══════════════════════════════════════════════════════════════`)
  console.log(`\nDirector:  director@demo.test  / demo12345  →  /center`)
  console.log(`Students:`)
  console.log(`  aigerim@demo.test  / demo12345  (Band 4 — 4 weak topics)`)
  console.log(`  bekzhan@demo.test  / demo12345  (Band 5.5 — 2 weak topics)`)
  console.log(`  dina@demo.test     / demo12345  (Band 7 — 1 weak topic)`)
  console.log(`\nClass invite code: ${inviteCode}`)
  console.log(`\nIELTS lessons in this org: see Materials tab in Center Dashboard`)

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
