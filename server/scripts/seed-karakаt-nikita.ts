// ── Seed: Karakаt (teacher) + Nikita (student) + ENT class ──────────────────
//
// Idempotent — safe to run multiple times.
// Creates / updates:
//   Teacher : Каракат  alibekovakarakat5@gmail.com  role=teacher
//   Student : Никита   nikita@studyhub.kz    role=student  pass=nikita2026
//   Class   : "ЕНТ — Подготовка к Ветеринарии 2026"
//   Membership: Никита → class
//   Diagnostic: Никита → math+biology+chemistry (medium level, нужна помощь)
//
// Usage:  cd server && npx tsx scripts/seed-karakаt-nikita.ts

import bcrypt from 'bcryptjs'
import { prisma } from '../src/lib/prisma'

const TEACHER_EMAIL  = 'alibekovakarakat5@gmail.com'
const TEACHER_NAME   = 'Каракат Алибекова'
const STUDENT_EMAIL  = 'nikita@studyhub.kz'
const STUDENT_PASS   = 'nikita2026'
const CLASS_NAME     = 'ЕНТ — Подготовка к Ветеринарии 2026'
const CLASS_SUBJECT  = 'ent-prep'
const CLASS_DESC     = 'Группа подготовки к ЕНТ. Профильные предметы: Биология + Химия. Цель — ветеринарный факультет.'

async function main() {
  console.log('\n══════════════════════════════════════════')
  console.log('  StudyHub seed: Каракат + Никита + класс')
  console.log('══════════════════════════════════════════\n')

  // ── 1. Teacher: Каракат ───────────────────────────────────────────────────

  let teacher = await prisma.user.findUnique({ where: { email: TEACHER_EMAIL } })

  if (teacher) {
    if (teacher.role !== 'teacher') {
      teacher = await prisma.user.update({
        where: { id: teacher.id },
        data:  { role: 'teacher', name: TEACHER_NAME },
      })
      console.log(`✓ Обновлена роль: ${TEACHER_EMAIL} → teacher`)
    } else {
      console.log(`✓ Учитель уже существует: ${TEACHER_EMAIL} (id=${teacher.id.slice(0,12)}…)`)
    }
  } else {
    const hash = await bcrypt.hash('karakаt2026', 10)
    teacher = await prisma.user.create({
      data: {
        name:         TEACHER_NAME,
        email:        TEACHER_EMAIL,
        passwordHash: hash,
        role:         'teacher',
        city:         'Алматы',
      },
    })
    console.log(`✓ Создан учитель: ${TEACHER_EMAIL}  pass=karakаt2026  (id=${teacher.id.slice(0,12)}…)`)
  }

  // ── 2. Student: Никита ────────────────────────────────────────────────────

  let student = await prisma.user.findUnique({ where: { email: STUDENT_EMAIL } })

  if (student) {
    console.log(`✓ Студент уже существует: ${STUDENT_EMAIL} (id=${student.id.slice(0,12)}…)`)
  } else {
    const hash = await bcrypt.hash(STUDENT_PASS, 10)
    student = await prisma.user.create({
      data: {
        name:            'Никита',
        email:           STUDENT_EMAIL,
        passwordHash:    hash,
        role:            'student',
        targetSpecialty: 'Ветеринария',
        city:            'Алматы',
      },
    })
    console.log(`✓ Создан студент: ${STUDENT_EMAIL}  pass=${STUDENT_PASS}  (id=${student.id.slice(0,12)}…)`)
  }

  // ── 3. Class ──────────────────────────────────────────────────────────────

  const INVITE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  function genCode(): string {
    let code = ''
    for (let i = 0; i < 6; i++) code += INVITE_CHARS[Math.floor(Math.random() * INVITE_CHARS.length)]
    return code
  }

  let cls = await prisma.class.findFirst({
    where: { teacherId: teacher.id, name: CLASS_NAME },
    include: { _count: { select: { members: true } } },
  })

  if (cls) {
    console.log(`✓ Класс уже существует: "${CLASS_NAME}"  inviteCode=${cls.inviteCode}`)
  } else {
    // generate unique invite code
    let inviteCode = genCode()
    while (await prisma.class.findUnique({ where: { inviteCode } })) inviteCode = genCode()

    cls = await prisma.class.create({
      data: {
        name:        CLASS_NAME,
        subject:     CLASS_SUBJECT,
        description: CLASS_DESC,
        teacherId:   teacher.id,
        inviteCode,
      },
      include: { _count: { select: { members: true } } },
    })
    console.log(`✓ Создан класс: "${CLASS_NAME}"  inviteCode=${cls.inviteCode}`)
  }

  // ── 4. Membership ─────────────────────────────────────────────────────────

  const existing = await prisma.classMembership.findUnique({
    where: { classId_studentId: { classId: cls.id, studentId: student.id } },
  })

  if (existing) {
    console.log(`✓ Никита уже в классе`)
  } else {
    await prisma.classMembership.create({
      data: { classId: cls.id, studentId: student.id },
    })
    console.log(`✓ Никита добавлен в класс`)
  }

  // ── 5. Diagnostic results for Nikita (ENT baseline) ──────────────────────
  // Цель: «нужна реальная подготовка» — средний-низкий уровень

  const subjects = [
    {
      subject: 'math_literacy',
      score: 9, maxScore: 25, percentage: 36,
      weakTopics: ['Проценты и пропорции', 'Уравнения', 'Диаграммы и графики'],
    },
    {
      subject: 'biology',
      score: 14, maxScore: 30, percentage: 47,
      weakTopics: ['Генетика', 'Эволюция', 'Анатомия человека'],
    },
    {
      subject: 'chemistry',
      score: 11, maxScore: 30, percentage: 37,
      weakTopics: ['Органическая химия', 'Растворы и концентрации', 'Реакции'],
    },
    {
      subject: 'history_kz',
      score: 16, maxScore: 20, percentage: 80,
      weakTopics: ['Независимость'],
    },
  ]

  for (const s of subjects) {
    await prisma.diagnosticResult.deleteMany({
      where: { userId: student.id, subject: s.subject },
    })
    await prisma.diagnosticResult.create({
      data: {
        userId:  student.id,
        subject: s.subject,
        scores: {
          score:      s.score,
          maxScore:   s.maxScore,
          percentage: s.percentage,
          level:      s.percentage < 50 ? 'low' : s.percentage < 75 ? 'medium' : 'high',
          weakTopics: s.weakTopics,
          strongTopics: [],
        },
      },
    })
  }
  console.log(`✓ Диагностика Никиты установлена (math=36%, bio=47%, chem=37%, history=80%)`)

  // ── Summary ───────────────────────────────────────────────────────────────

  console.log('\n══════════════════════════════════════════')
  console.log('  ✅ ГОТОВО')
  console.log('══════════════════════════════════════════')
  console.log('\n📋 Аккаунты:')
  console.log(`  Учитель:  ${TEACHER_EMAIL}   (ваш аккаунт — роль обновлена до teacher)`)
  console.log(`  Студент:  ${STUDENT_EMAIL}  /  ${STUDENT_PASS}`)
  console.log(`\n🏫 Класс: "${CLASS_NAME}"`)
  console.log(`  Invite code: ${cls.inviteCode}`)
  console.log(`\n🎯 Профиль Никиты:`)
  console.log(`  Цель: Ветеринарный факультет`)
  console.log(`  Профильные: Биология + Химия`)
  console.log(`  Слабые места: Генетика, Органика, Концентрации, Проценты`)
  console.log(`\n👉 Войдите как ${TEACHER_EMAIL} → /teacher или /center`)
  console.log(`👉 Войдите как Никита → /dashboard или /courses\n`)

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
