// ── Batch-generate a library of AI lessons into Каракат's draft library ──────
//
// Curated ~30 ENT topics across Math, Physics, Biology, Chemistry, History KZ.
// Each lesson is generated via the live /api/ai/generate-lesson endpoint
// (Claude CLI primary → cache → Groq fallback) and saved as a draft.
//
// Sequential (~90s per fresh lesson via Claude). Already-cached topics return
// instantly. Per-lesson errors are caught and skipped so one failure doesn't
// abort the batch.
//
// Usage: cd server && npx tsx scripts/batch-lessons.ts

const BASE = process.env.API_BASE ?? 'http://localhost:3001'
const TEACHER = { email: 'alibekovakarakat5@gmail.com', password: 'Karakat2026' }
const LANG = (process.env.LESSON_LANG ?? 'ru') as 'ru' | 'kk'  // set LESSON_LANG=kk for Kazakh

interface Topic { topic: string; subject: string; difficulty?: 'easy' | 'medium' | 'hard'; quiz?: number }

const TOPICS: Topic[] = [
  // ── Математика ─────────────────────────────────────────────────────────
  { topic: 'Проценты и пропорции — нахождение процента, числа по проценту, процентное изменение', subject: 'math' },
  { topic: 'Обыкновенные дроби — сложение, вычитание, умножение, деление, сокращение', subject: 'math' },
  { topic: 'Квадратные уравнения и дискриминант D = b²−4ac, формула корней', subject: 'math' },
  { topic: 'Теорема Виета — сумма и произведение корней квадратного уравнения', subject: 'math' },
  { topic: 'Арифметическая и геометрическая прогрессии — формулы n-го члена и суммы', subject: 'math' },
  { topic: 'Производная функции — определение, правила дифференцирования, производные элементарных функций', subject: 'math', difficulty: 'hard' },
  { topic: 'Логарифмы — определение, свойства, логарифмические уравнения', subject: 'math', difficulty: 'hard' },
  { topic: 'Тригонометрия — основные тождества, формулы приведения, значения углов', subject: 'math', difficulty: 'hard' },

  // ── Математическая грамотность ───────────────────────────────────────────
  { topic: 'Чтение графиков и диаграмм — извлечение данных, столбчатые и круговые диаграммы', subject: 'math', difficulty: 'easy' },
  { topic: 'Текстовые задачи на проценты, скидки и наценки', subject: 'math' },
  { topic: 'Задачи на движение, скорость, время и совместную работу', subject: 'math' },
  { topic: 'Финансовая грамотность — простые и сложные проценты, вклады и кредиты', subject: 'math' },

  // ── Физика ───────────────────────────────────────────────────────────────
  { topic: 'Кинематика — равномерное и равноускоренное движение, формулы пути и скорости', subject: 'physics' },
  { topic: 'Законы Ньютона — три закона динамики и их применение', subject: 'physics' },
  { topic: 'Электрический ток — закон Ома, последовательное и параллельное соединение', subject: 'physics' },
  { topic: 'Работа, мощность и энергия — кинетическая и потенциальная энергия', subject: 'physics' },
  { topic: 'Механические колебания и волны — период, частота, длина волны', subject: 'physics', difficulty: 'hard' },

  // ── Биология ───────────────────────────────────────────────────────────
  { topic: 'Строение клетки — органоиды и их функции, эукариоты и прокариоты', subject: 'biology' },
  { topic: 'Генетика — законы Менделя, моно- и дигибридное скрещивание, задачи', subject: 'biology' },
  { topic: 'Деление клетки — митоз и мейоз, фазы и биологический смысл', subject: 'biology' },
  { topic: 'Фотосинтез и клеточное дыхание — световая и темновая фазы, АТФ', subject: 'biology' },
  { topic: 'Эволюция — теория Дарвина, естественный отбор, доказательства эволюции', subject: 'biology' },
  { topic: 'Анатомия человека — системы органов, кровообращение и пищеварение', subject: 'biology' },

  // ── Химия ─────────────────────────────────────────────────────────────
  { topic: 'Строение атома и периодический закон Менделеева', subject: 'chemistry' },
  { topic: 'Растворы и концентрации — массовая доля, молярная концентрация, задачи', subject: 'chemistry' },
  { topic: 'Химические реакции — типы реакций и расстановка коэффициентов', subject: 'chemistry' },
  { topic: 'Кислоты, основания и соли — свойства и реакции нейтрализации', subject: 'chemistry' },
  { topic: 'Органическая химия — углеводороды: алканы, алкены, алкины', subject: 'chemistry', difficulty: 'hard' },

  // ── История Казахстана ───────────────────────────────────────────────────
  { topic: 'Образование Казахского ханства — Керей и Жанибек, XV век', subject: 'history' },
  { topic: 'Казахстан в составе Российской империи — присоединение и реформы XVIII-XIX вв', subject: 'history' },
  { topic: 'Независимость Казахстана 1991 — распад СССР, становление государственности', subject: 'history' },
]

async function api(path: string, opts: RequestInit & { token?: string } = {}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(opts.headers as Record<string, string> | undefined ?? {}) }
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`
  const res = await fetch(`${BASE}${path}`, { ...opts, headers })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`${path}: ${(body as { error?: string })?.error ?? res.status}`)
  return body as Record<string, unknown>
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// Wait until the backend answers /api/health. The backend can restart (tsx
// watch / heavy CLI spawn), so we pause the batch until it's back instead of
// failing the rest of the queue.
async function waitForHealth(maxMs = 120_000): Promise<boolean> {
  const start = Date.now()
  while (Date.now() - start < maxMs) {
    try {
      const r = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(4000) })
      if (r.ok) return true
    } catch { /* not up yet */ }
    await sleep(3000)
  }
  return false
}

async function main() {
  console.log(`\n📚 Batch lesson generation — ${TOPICS.length} topics\n`)
  const login = await api('/api/auth/login', { method: 'POST', body: JSON.stringify(TEACHER) })
  const token = login.token as string
  console.log(`🔐 ${(login.user as { name: string }).name}\n`)

  let ok = 0, cached = 0, failed = 0
  for (let n = 0; n < TOPICS.length; n++) {
    const t = TOPICS[n]!
    const tag = `[${n + 1}/${TOPICS.length}] ${t.subject} · ${t.topic.slice(0, 50)}…`

    let done = false
    for (let attempt = 1; attempt <= 2 && !done; attempt++) {
      // Backend may have bounced after the previous heavy CLI spawn — wait for it.
      const healthy = await waitForHealth()
      if (!healthy) { console.log(`✗ ${tag} — backend down >120s, skip`); break }

      const t0 = Date.now()
      try {
        const gen = await api('/api/ai/generate-lesson', {
          method: 'POST', token,
          body: JSON.stringify({ topic: t.topic, subject: t.subject, difficulty: t.difficulty ?? 'medium', quizCount: t.quiz ?? 6, lang: LANG }),
        })
        const lesson = gen.lesson as { title: string; theory: string; keyFormulas?: unknown[]; quiz: unknown[] }
        const wasCached = gen.cached as boolean
        // Tag KK drafts so they're distinguishable in the library
        const draftTitle = LANG === 'kk' ? `🇰🇿 ${lesson.title}` : lesson.title
        await api('/api/ai/drafts', {
          method: 'POST', token,
          body: JSON.stringify({ title: draftTitle, topic: t.topic, subject: t.subject, difficulty: t.difficulty ?? 'medium', lesson }),
        })
        const secs = Math.round((Date.now() - t0) / 1000)
        console.log(`✓ ${tag}  (${wasCached ? 'cache' : (gen.provider as string)}, ${secs}s, ${lesson.theory.length}ch, ${lesson.quiz.length}q)`)
        ok++; if (wasCached) cached++
        done = true
      } catch (e) {
        const msg = e instanceof Error ? e.message.slice(0, 80) : String(e)
        if (attempt === 1) {
          console.log(`… ${tag} — попытка 1 не удалась (${msg}), повтор после восстановления backend`)
          await sleep(5000)   // give backend time to come back
        } else {
          console.log(`✗ ${tag}  — ${msg}`)
          failed++
        }
      }
    }
    await sleep(2000)   // breathing room between heavy CLI spawns
  }

  console.log(`\n══════════════════════════════════════════`)
  console.log(`  ✅ Готово: ${ok} уроков (${cached} из кеша), ошибок: ${failed}`)
  console.log(`══════════════════════════════════════════\n`)
}

main().catch(e => { console.error('FATAL', e); process.exit(1) })
