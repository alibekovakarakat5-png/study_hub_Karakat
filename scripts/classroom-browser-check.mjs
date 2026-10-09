// Synthetic browser/API fixture. No production account, data, or message is changed.
import { createRequire } from 'node:module'
import path from 'node:path'
import assert from 'node:assert/strict'
import { englishOlympiadGrade6 } from './materials/english-olympiad-grade6.mjs'
const require = createRequire(path.resolve('.studyhub-local/browser-test/package.json'))
const { chromium } = require('playwright')
let questionsCount = 0
const ids = new Set()
for (const lesson of englishOlympiadGrade6) for (const q of lesson.content.questions ?? lesson.content.quiz ?? []) {
  assert.ok(!ids.has(q.id)); ids.add(q.id); questionsCount++
  assert.ok(q.options.length >= 2 && Number.isInteger(q.correctAnswer) && q.correctAnswer >= 0 && q.correctAnswer < q.options.length)
  assert.ok(q.explanation.length > 30)
}
assert.equal(questionsCount, 48)
const browser = await chromium.launch({ channel: 'msedge', headless: true })
let targetDate = '2026-10-15'; let submission = null
const fullAssignment = { ...englishOlympiadGrade6[0], id: 'a1', classId: 'c1' }
const clean = () => ({ ...fullAssignment, content: { ...fullAssignment.content, questions: fullAssignment.content.questions.map(({ correctAnswer, explanation, ...rest }) => rest) } })
const errors = []
async function session(role) {
  const context = await browser.newContext({ viewport: { width: role === 'student' ? 390 : 1280, height: 900 } })
  const user = { id: role, name: role === 'student' ? 'Ученица' : 'Куратор', role, email: `${role}@example.invalid` }
  await context.addInitScript(({ user }) => {
    localStorage.setItem('studyhub-token', 'synthetic-only')
    localStorage.setItem('studyhub-storage', JSON.stringify({ state: { user, isAuthenticated: true, onboardingCompleted: true }, version: 0 }))
  }, { user })
  await context.route('**/*', async route => {
    const url = new URL(route.request().url()); const method = route.request().method()
    if (!url.pathname.startsWith('/api/')) return url.hostname === '127.0.0.1' ? route.continue() : route.abort()
    const cls = { id: 'c1', name: 'English · 6 класс', description: 'Языковое расследование', targetDate, inviteCode: 'ABC234', assignments: [{ ...clean(), submissions: submission ? [submission] : [] }], members: [{ id: 'm1', student: { id: 'student', name: 'Ученица' } }] }
    let result = {}
    if (url.pathname === '/api/auth/me') result = { user }
    else if (url.pathname === '/api/classes') result = { classes: [cls] }
    else if (url.pathname === '/api/classes/c1') result = { class: cls, progress: [{ studentId: 'student', submitted: submission ? 1 : 0, total: 1, avgScore: submission?.score ?? null }] }
    else if (url.pathname === '/api/classes/c1/goal') { targetDate = route.request().postDataJSON().targetDate; result = { targetDate } }
    else if (url.pathname === '/api/assignments/a1' && method === 'GET') result = { assignment: submission ? fullAssignment : clean(), submission }
    else if (url.pathname === '/api/assignments/a1/submit') {
      const { answers } = route.request().postDataJSON(); assert.equal(answers.length, 12)
      const score = Math.round(100 * fullAssignment.content.questions.filter((q, i) => answers[i] === q.correctAnswer).length / 12)
      submission = { id: 's1', assignmentId: 'a1', studentId: 'student', student: { id: 'student', name: 'Ученица' }, answers, score, feedback: null, submittedAt: new Date().toISOString() }; result = { submission }
    }
    else if (url.pathname === '/api/assignments/a1/results') result = { assignment: fullAssignment, submissions: submission ? [submission] : [], stats: {} }
    else if (url.pathname === '/api/assignments/a1/grade/s1') { submission = { ...submission, ...route.request().postDataJSON() }; result = { submission } }
    return route.fulfill({ json: result })
  })
  const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message))
  return page
}
try {
  const student = await session('student')
  await student.goto('http://127.0.0.1:4321/classroom')
  await student.getByRole('button', { name: /01 · Старт/ }).click()
  assert.equal(await student.getByText(/Верный ответ:/).count(), 0)
  await student.locator('input[name="question-0"][value="1"]').check()
  await student.reload(); await student.getByRole('button', { name: /01 · Старт/ }).click()
  assert.equal(await student.locator('input[name="question-0"][value="1"]').isChecked(), true)
  for (let i = 1; i < 12; i++) await student.locator(`input[name="question-${i}"][value="${fullAssignment.content.questions[i].correctAnswer}"]`).check()
  await student.getByRole('button', { name: 'Сдать и посмотреть разбор' }).click()
  await student.getByRole('heading', { name: 'Работа сохранена · 100%' }).waitFor()
  await student.getByText(/Верный ответ:/).first().waitFor()
  assert.equal(await student.getByText(/Верный ответ:/).count(), 12)
  await student.getByRole('button', { name: '← К маршруту' }).click()
  await student.getByRole('button', { name: /01 · Старт.*Результат/ }).waitFor()
  assert.equal(await student.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
  await student.screenshot({ path: '.studyhub-local/classroom-student.png', fullPage: true })
  const owner = await session('admin')
  await owner.goto('http://127.0.0.1:4321/classroom')
  await owner.getByLabel('Дата подготовки').fill('2026-10-18')
  await owner.getByRole('button', { name: 'Сохранить дату' }).click()
  await owner.getByText(/Дата сохранена/).waitFor(); await owner.reload()
  assert.equal(await owner.getByLabel('Дата подготовки').inputValue(), '2026-10-18')
  await owner.getByRole('button', { name: /01 · Старт/ }).click()
  await owner.getByLabel('Комментарий ученице').fill('Хорошо! Повтори сочетания завтра.')
  await owner.getByRole('button', { name: 'Сохранить комментарий и оценку' }).click()
  await owner.getByText(/Оценка и комментарий сохранены/).waitFor()
  await student.reload(); await student.getByRole('button', { name: /01 · Старт/ }).click()
  await student.getByText('Хорошо! Повтори сочетания завтра.').waitFor()
  await owner.screenshot({ path: '.studyhub-local/classroom-curator.png', fullPage: true })
  assert.deepEqual(errors, [])
  console.log('PASS: 48 authored questions; mobile draft/reload, submit/review, result status; curator date/reload and feedback visible to student. Synthetic API only.')
} finally { await browser.close() }
