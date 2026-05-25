// ── CLI: Generate AI lesson and save as draft to teacher's library ───────────
//
// Different from publish-lesson.ts: this only saves to the teacher's personal
// library (TeacherLessonDraft) without creating an Assignment in any class.
// The teacher can review it later in "Мои уроки" panel and decide whether to
// publish or delete.
//
// Usage:
//   npx tsx scripts/save-draft.ts "<topic>" [difficulty] [quizCount] [subject]

const BASE = process.env.API_BASE ?? 'http://localhost:3001'
const TEACHER_EMAIL = 'alibekovakarakat5@gmail.com'
const TEACHER_PASS  = 'karakаt2026'

const topic      = process.argv[2] ?? 'Проценты и пропорции'
const difficulty = (process.argv[3] as 'easy' | 'medium' | 'hard') ?? 'medium'
const quizCount  = parseInt(process.argv[4] ?? '5', 10)
const subject    = process.argv[5] ?? 'math'

async function api(path: string, opts: RequestInit & { token?: string } = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> | undefined ?? {}),
  }
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`
  const res = await fetch(`${BASE}${path}`, { ...opts, headers })
  let body: unknown = null
  try { body = await res.json() } catch { /* not json */ }
  if (!res.ok) {
    const err = (body as { error?: string })?.error ?? `HTTP ${res.status}`
    throw new Error(`${path}: ${err}`)
  }
  return body as Record<string, unknown>
}

async function main() {
  console.log('\n══════════════════════════════════════════════════════════')
  console.log('  AI Lesson → Save to teacher library (draft)')
  console.log('══════════════════════════════════════════════════════════\n')
  console.log(`📚 Тема:       ${topic}`)
  console.log(`📐 Предмет:    ${subject}`)
  console.log(`🎚 Сложность:  ${difficulty}`)
  console.log(`❓ Вопросов:   ${quizCount}\n`)

  const login = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: TEACHER_EMAIL, password: TEACHER_PASS }),
  })
  const token = login.token as string
  const user  = login.user  as { name: string }
  console.log(`🔐 ${user.name}\n`)

  console.log('🤖 Генерирую урок...')
  const t0 = Date.now()
  const gen = await api('/api/ai/generate-lesson', {
    method: 'POST',
    token,
    body: JSON.stringify({ topic, subject, difficulty, quizCount }),
  })
  const lesson = gen.lesson as {
    title: string
    theory: string
    keyFormulas?: { formula: string; name: string }[]
    quiz: unknown[]
  }
  const ms = Date.now() - t0
  console.log(`   ✓ "${lesson.title}"`)
  console.log(`   ${gen.cached ? '💾 из кеша' : '✨ свежая'}, провайдер: ${gen.provider}, ${ms} мс`)
  console.log(`   📖 ${lesson.theory.length} символов теории, ${lesson.keyFormulas?.length ?? 0} формул, ${lesson.quiz.length} вопросов\n`)

  console.log('💾 Сохраняю в «Мои уроки»...')
  const saved = await api('/api/ai/drafts', {
    method: 'POST',
    token,
    body: JSON.stringify({
      title: lesson.title, topic, subject, difficulty, lesson,
    }),
  })
  const draft = saved.draft as { id: string }
  console.log(`   ✓ Draft id: ${draft.id.slice(0, 12)}…\n`)

  console.log('══════════════════════════════════════════════════════════')
  console.log('  ✅ ГОТОВО — урок в библиотеке учителя')
  console.log('══════════════════════════════════════════════════════════')
  console.log(`\n👉 Открой /teacher → AI Урок → внизу «Мои уроки» → "${lesson.title}"`)
  console.log(`   Там можно: просмотреть, отредактировать, опубликовать в класс, удалить.\n`)
}

main().catch(e => {
  console.error('\n❌ Ошибка:', e instanceof Error ? e.message : e)
  process.exit(1)
})
