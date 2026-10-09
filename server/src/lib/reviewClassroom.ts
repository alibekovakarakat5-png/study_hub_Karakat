import { createHash, randomBytes } from 'crypto'
import { prisma } from './prisma'
import material from '../data/english-olympiad-grade6.json'
import { TEST_USER_PREFIX } from './reviewCatalog'

export const classroomPersonaIds = ['classroom-student', 'classroom-curator', 'classroom-outsider'] as const
export const isClassroomPersona = (id: string) => (classroomPersonaIds as readonly string[]).includes(id)
export const reviewClassroomId = (owner: string, runId: string) => TEST_USER_PREFIX + createHash('sha256').update(owner + ':' + runId).digest('hex').slice(0, 24) + '_class'
export const reviewClassroomUserId = (classId: string, persona: string) => classId + '_' + persona

// Upserts never overwrite attempts or edits on a resumed run. A new run has new IDs.
export async function provisionReviewClassroom(owner: string, runId: string, persona: string) {
  if (!isClassroomPersona(persona)) throw new Error('Unknown classroom persona')
  const classId = reviewClassroomId(owner, runId)
  const teacherId = reviewClassroomUserId(classId, 'classroom-curator')
  const studentId = reviewClassroomUserId(classId, 'classroom-student')
  await prisma.$transaction(async tx => {
    for (const name of classroomPersonaIds) {
      const id = reviewClassroomUserId(classId, name)
      await tx.user.upsert({ where: { id }, update: {}, create: {
        id, email: id + '@studyhub.invalid', name: name === 'classroom-curator' ? 'Тестовый куратор' : name === 'classroom-student' ? 'Тестовая ученица' : 'Ученик вне класса',
        role: name === 'classroom-curator' ? 'teacher' : 'student', grade: 6,
        passwordHash: '!test-account-no-password-login', city: 'Тестовые данные',
      } })
    }
    await tx.class.upsert({ where: { id: classId }, update: {}, create: {
      id: classId, name: 'Проверка · английский · 6 класс', subject: 'english', teacherId,
      description: 'Тестовая копия 7 занятий. Данные настоящих учеников не изменяются.',
      targetDate: new Date('2026-10-15T00:00:00Z'), inviteCode: randomBytes(24).toString('hex'),
    } })
    await tx.classMembership.upsert({ where: { classId_studentId: { classId, studentId } }, update: {}, create: { classId, studentId } })
    for (const [i, lesson] of material.lessons.entries()) {
      await tx.assignment.upsert({ where: { id: `${classId}_a${i + 1}` }, update: {}, create: {
        id: `${classId}_a${i + 1}`, classId, teacherId, ...lesson,
      } })
    }
  }, { timeout: 15000 })
  const user = await prisma.user.findUniqueOrThrow({ where: { id: reviewClassroomUserId(classId, persona) }, select: { id: true, email: true, role: true, name: true, grade: true, city: true, isPremium: true } })
  return user
}

export function allowedClassroomMutation(method: string, path: string, scope?: { classroomId?: string }, userId?: string) {
  const id = scope?.classroomId
  if (!id || !/^review_test_[a-f0-9]{24}_class$/.test(id)) return false
  if (userId === reviewClassroomUserId(id, 'classroom-curator')) {
    if (method === 'PATCH' && path === `/api/classes/${id}/goal`) return true
    if (method === 'PUT' && new RegExp(`^/api/assignments/${id}_a[1-7]/grade/[^/]+$`).test(path)) return true
  }
  return userId === reviewClassroomUserId(id, 'classroom-student') && method === 'POST' && new RegExp(`^/api/assignments/${id}_a[1-7]/submit$`).test(path)
}
