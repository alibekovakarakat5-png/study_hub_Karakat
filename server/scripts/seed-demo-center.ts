// ── Seed a believable B2B demo center ───────────────────────────────────────
//
// Creates a self-contained "StudyHub Демо-центр" so a sales demo of the
// /center dashboard looks ALIVE: a director, 2 teachers, 2 classes, 14
// students with varied diagnostics (strong / weak / inactive) and some graded
// assignment submissions. Idempotent-ish: wipes & recreates the demo org each
// run (only touches demo-* accounts, never real users like Никита/Каракат).
//
// Usage: cd server && npx tsx scripts/seed-demo-center.ts

import bcrypt from 'bcryptjs'
import { prisma } from '../src/lib/prisma'

const PASS = 'Demo2026'
const INVITE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const code = () => Array.from({ length: 6 }, () => INVITE_CHARS[Math.floor(Math.random() * INVITE_CHARS.length)]).join('')

async function uniqueClassCode(): Promise<string> {
  let c = code(); while (await prisma.class.findUnique({ where: { inviteCode: c } })) c = code(); return c
}
async function uniqueOrgCode(): Promise<string> {
  let c = code(); while (await prisma.organization.findUnique({ where: { inviteCode: c } })) c = code(); return c
}

// Random helpers for believable spread
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]!
const between = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1))

const FIRST = ['Алишер', 'Дана', 'Ерлан', 'Аружан', 'Тимур', 'Камила', 'Нурлан', 'Аяна', 'Санжар', 'Мадина', 'Дамир', 'Жанель', 'Арман', 'Сабина', 'Бекзат', 'Аделя']
const LAST  = ['Серіков', 'Ахметова', 'Болатов', 'Жумабекова', 'Қасымов', 'Нұрланова', 'Сейтжан', 'Оразбекова', 'Тлеуов', 'Сагинтаева']

async function makeUser(name: string, email: string, role: 'teacher' | 'student'): Promise<string> {
  const hash = await bcrypt.hash(PASS, 10)
  const u = await prisma.user.upsert({
    where:  { email },
    create: { name, email, passwordHash: hash, role, city: 'Алматы', grade: role === 'student' ? between(10, 11) : null },
    update: { name, role },
  })
  return u.id
}

async function main() {
  console.log('\n🏫 Seeding StudyHub Демо-центр…\n')

  // ── Wipe previous demo accounts (email prefix demo-) ──────────────────────
  const old = await prisma.user.findMany({ where: { email: { startsWith: 'demo-' } }, select: { id: true } })
  if (old.length) {
    const ids = old.map(o => o.id)
    await prisma.assignmentSubmission.deleteMany({ where: { studentId: { in: ids } } })
    await prisma.diagnosticResult.deleteMany({ where: { userId: { in: ids } } })
    await prisma.classMembership.deleteMany({ where: { studentId: { in: ids } } })
    // orgs owned by demo director cascade their classes/assignments
    await prisma.organization.deleteMany({ where: { ownerId: { in: ids } } })
    await prisma.user.deleteMany({ where: { id: { in: ids } } })
    console.log(`   ✓ cleared ${old.length} old demo accounts`)
  }

  // ── Director + org ────────────────────────────────────────────────────────
  const directorId = await makeUser('Айгүл Директорова', 'demo-director@studyhub.kz', 'teacher')
  const orgInvite = await uniqueOrgCode()
  const org = await prisma.organization.create({
    data: {
      name: 'StudyHub Демо-центр', type: 'tutoring_center', city: 'Алматы',
      bin: '123456789012', brandColor: '#2563eb', contactPhone: '77075884651',
      inviteCode: orgInvite, ownerId: directorId,
      members: { create: { userId: directorId, role: 'owner' } },
    },
  })
  console.log(`   ✓ org "${org.name}" (invite ${orgInvite})`)

  // ── Teachers ──────────────────────────────────────────────────────────────
  const t1 = await makeUser('Марат Сапаров', 'demo-teacher1@studyhub.kz', 'teacher')
  const t2 = await makeUser('Гүлнар Ахметова', 'demo-teacher2@studyhub.kz', 'teacher')
  for (const tid of [t1, t2]) {
    await prisma.orgMembership.upsert({
      where: { orgId_userId: { orgId: org.id, userId: tid } },
      create: { orgId: org.id, userId: tid, role: 'teacher' }, update: {},
    })
  }
  console.log('   ✓ 2 teachers joined')

  // ── Classes (scoped to org) ─────────────────────────────────────────────
  const classMath = await prisma.class.create({
    data: { name: 'Математика ЕНТ — группа А', subject: 'math', teacherId: t1, orgId: org.id, inviteCode: await uniqueClassCode() },
  })
  const classBio = await prisma.class.create({
    data: { name: 'Биология ЕНТ — группа Б', subject: 'biology', teacherId: t2, orgId: org.id, inviteCode: await uniqueClassCode() },
  })
  console.log('   ✓ 2 classes')

  // ── An assignment per class (for submissions to reference) ────────────────
  const mathAssignment = await prisma.assignment.create({
    data: {
      classId: classMath.id, teacherId: t1, orgId: org.id, title: 'Проценты — самопроверка', type: 'test',
      content: { questions: [{ id: 'q1', text: '25% от 80?', options: ['15', '20', '25', '30'], correctAnswer: 1, explanation: '0.25×80=20' }] },
    },
  })
  const bioAssignment = await prisma.assignment.create({
    data: {
      classId: classBio.id, teacherId: t2, orgId: org.id, title: 'Клетка — самопроверка', type: 'test',
      content: { questions: [{ id: 'q1', text: 'Где синтез белка?', options: ['Рибосома', 'Ядро', 'Лизосома', 'Аппарат Гольджи'], correctAnswer: 0, explanation: 'Рибосомы' }] },
    },
  })

  // ── Students with varied profiles ─────────────────────────────────────────
  const subjects = ['math', 'biology', 'chemistry', 'history_kz']
  const topicsBySubject: Record<string, string[]> = {
    math: ['Проценты', 'Уравнения', 'Тригонометрия', 'Производная'],
    biology: ['Генетика', 'Клетка', 'Эволюция'],
    chemistry: ['Растворы', 'Органика', 'Реакции'],
    history_kz: ['Независимость', 'Ханство'],
  }

  let strong = 0, weak = 0, inactive = 0
  for (let i = 0; i < 14; i++) {
    const name = `${pick(FIRST)} ${pick(LAST)}`
    const sid = await makeUser(name, `demo-student${i + 1}@studyhub.kz`, 'student')
    const cls = i % 2 === 0 ? classMath : classBio
    const assignment = i % 2 === 0 ? mathAssignment : bioAssignment
    await prisma.classMembership.create({ data: { classId: cls.id, studentId: sid } })

    // Profile: ~30% strong, ~45% mid/weak, ~25% inactive (no diagnostic/submission)
    const roll = Math.random()
    if (roll < 0.25) { inactive++; continue }  // inactive — laggard signal in dashboard

    // Diagnostic across subjects
    for (const subj of subjects) {
      const base = roll < 0.55 ? between(28, 48) : between(60, 92)  // weak vs strong band
      const pct = Math.max(15, Math.min(98, base + between(-8, 8)))
      const max = 30
      const sc = Math.round((pct / 100) * max)
      const weakTopics = pct < 60 ? topicsBySubject[subj]!.slice(0, 2) : []
      await prisma.diagnosticResult.create({
        data: { userId: sid, subject: subj, scores: { score: sc, maxScore: max, percentage: pct, level: pct < 50 ? 'low' : pct < 75 ? 'medium' : 'high', weakTopics, strongTopics: [] } },
      })
    }
    if (roll < 0.55) weak++; else strong++

    // Assignment submission (graded)
    const subScore = roll < 0.55 ? between(20, 55) : between(70, 100)
    await prisma.assignmentSubmission.create({
      data: { assignmentId: assignment.id, studentId: sid, answers: [roll < 0.55 ? 0 : 1], score: subScore },
    })

    // Activity signal
    await prisma.user.update({ where: { id: sid }, data: { streak: between(0, 21), totalStudyMinutes: between(120, 2400), lastActiveDate: new Date(Date.now() - between(0, 6) * 86400000).toISOString() } })
  }

  console.log(`   ✓ 14 students (≈${strong} сильных, ${weak} слабых, ${inactive} неактивных)`)

  console.log('\n══════════════════════════════════════════════════════════')
  console.log('  ✅ Демо-центр готов')
  console.log('══════════════════════════════════════════════════════════')
  console.log(`\n👔 Директор: demo-director@studyhub.kz / ${PASS}  →  /center`)
  console.log(`👨‍🏫 Учителя:  demo-teacher1@studyhub.kz, demo-teacher2@studyhub.kz / ${PASS}`)
  console.log(`🎓 Ученики:  demo-student1..14@studyhub.kz / ${PASS}`)
  console.log(`🏫 Центр:    "StudyHub Демо-центр"  invite ${orgInvite}\n`)

  await prisma.$disconnect()
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
