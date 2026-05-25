// ── CLI: Generate AI lesson + publish to class as assignment ────────────────
//
// Usage:
//   npx tsx scripts/publish-lesson.ts "<topic>" [difficulty] [quizCount]
//
// Defaults: difficulty=medium, quizCount=5, subject=math
// Logs in as Каракат, picks her first class, publishes as type='reading'.
//
// Reuses the same /api/ai/generate-lesson endpoint → cache works as usual:
// on repeat topics returns from DB (0 tokens, ~600ms).

const BASE = process.env.API_BASE ?? 'http://localhost:3001'
const TEACHER_EMAIL = 'alibekovakarakat5@gmail.com'
const TEACHER_PASS  = 'karakаt2026'

const topic      = process.argv[2] ?? 'Проценты и пропорции — определение, формулы, задачи'
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
  console.log('  AI Lesson Generator — CLI publish')
  console.log('══════════════════════════════════════════════════════════\n')
  console.log(`📚 Тема:       ${topic}`)
  console.log(`📐 Предмет:    ${subject}`)
  console.log(`🎚 Сложность:  ${difficulty}`)
  console.log(`❓ Вопросов:   ${quizCount}\n`)

  // ── 1. Login as Каракат ──────────────────────────────────────────────────
  console.log('🔐 Логин как Каракат...')
  const login = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: TEACHER_EMAIL, password: TEACHER_PASS }),
  })
  const token = login.token as string
  const user  = login.user  as { id: string; name: string }
  console.log(`   ✓ ${user.name}`)

  // ── 2. Find first class ──────────────────────────────────────────────────
  const cls = await api('/api/classes', { token })
  const classes = (cls.classes as Array<{ id: string; name: string; inviteCode: string }>)
  if (classes.length === 0) {
    throw new Error('У учителя нет классов')
  }
  const target = classes[0]!
  console.log(`🏫 Класс:      ${target.name} (${target.inviteCode})\n`)

  // ── 3. Generate lesson ───────────────────────────────────────────────────
  console.log('🤖 Генерирую урок (может занять до 20 сек — или быстро если из кеша)...')
  const t0 = Date.now()
  const gen = await api('/api/ai/generate-lesson', {
    method: 'POST',
    token,
    body: JSON.stringify({ topic, subject, difficulty, quizCount }),
  })
  const ms     = Date.now() - t0
  const lesson = gen.lesson as {
    title: string
    theory: string
    keyFormulas?: { formula: string; name: string }[]
    quiz: { id: string; text: string; options: string[]; correctAnswer: number; explanation: string }[]
  }
  const cached = gen.cached as boolean
  console.log(`   ${cached ? '💾 Из кеша' : '✨ Свежая генерация'} за ${ms} мс`)
  console.log(`   🤖 Провайдер: ${gen.provider ?? 'unknown'}`)
  if (cached) console.log(`   📊 hitCount: ${gen.hitCount}`)
  console.log(`   📝 Title:    "${lesson.title}"`)
  console.log(`   📖 Теории:   ${lesson.theory.length} символов`)
  console.log(`   🧮 Формул:   ${lesson.keyFormulas?.length ?? 0}`)
  console.log(`   ✍️  Вопросов: ${lesson.quiz.length}\n`)

  // ── 4. Publish as assignment ─────────────────────────────────────────────
  console.log('📤 Публикую урок как задание...')
  const pub = await api('/api/assignments', {
    method: 'POST',
    token,
    body: JSON.stringify({
      classId:     target.id,
      title:       lesson.title,
      description: `AI-урок. Тема: ${topic}`,
      type:        'reading',
      content:     {
        theory:      lesson.theory,
        keyFormulas: lesson.keyFormulas ?? [],
        quiz:        lesson.quiz,
        isLesson:    true,
      },
    }),
  })
  const assignment = pub.assignment as { id: string; title: string }
  console.log(`   ✓ Assignment id=${assignment.id.slice(0, 12)}…\n`)

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log('══════════════════════════════════════════════════════════')
  console.log('  ✅ ГОТОВО')
  console.log('══════════════════════════════════════════════════════════')
  console.log(`\n📋 Урок "${lesson.title}" опубликован в классе "${target.name}".`)
  console.log(`👀 Никита увидит его в «Задания от учителя» на /dashboard.`)
  console.log(`\n📖 Превью теории:\n`)
  console.log(lesson.theory.slice(0, 600).split('\n').map(l => '   ' + l).join('\n'))
  console.log(lesson.theory.length > 600 ? '   ...' : '')
  console.log('')
}

main().catch(e => {
  console.error('\n❌ Ошибка:', e instanceof Error ? e.message : e)
  process.exit(1)
})
