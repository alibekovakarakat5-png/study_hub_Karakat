// ── StudyHub Cron Jobs ────────────────────────────────────────────────────────
//
// Runs scheduled tasks on the server:
//   • 09:00 Almaty (04:00 UTC) — daily ENT question to all Telegram users
//   • 08:00 Almaty (03:00 UTC) — daily stats report to admin
//
// Usage: call startCronJobs() once in index.ts after server starts.

import cron from 'node-cron'
import { prisma } from './prisma'
import { tg } from './telegram'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

// ── Low-level send (duplicated here to avoid circular import) ─────────────────

async function sendMsg(chat_id: string | number, text: string, extra?: Record<string, unknown>) {
  if (!BOT_TOKEN) return
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ chat_id, text, parse_mode: 'HTML', ...extra }),
    })
  } catch (err) {
    console.error('[Cron] sendMsg failed:', err)
  }
}

// ── Question bank (same fallback as telegram.ts) ──────────────────────────────

const FALLBACK_QUESTIONS = [
  { id: 'f1',  subject: 'Математика',  q: 'Вычислите: 2³ × 2⁴',                                     options: ['2⁶','2⁷','4⁷','2¹²'],                        correct: 1, explanation: '2³ × 2⁴ = 2^(3+4) = 2⁷ = 128' },
  { id: 'f2',  subject: 'История КЗ', q: 'В каком году провозглашена независимость Казахстана?',     options: ['1990','1991','1992','1993'],                   correct: 1, explanation: '16 декабря 1991 года — День независимости' },
  { id: 'f3',  subject: 'Математика',  q: 'Дискриминант уравнения x² - 5x + 6 = 0 равен:',          options: ['1','4','25','49'],                             correct: 0, explanation: 'D = b² - 4ac = 25 - 24 = 1' },
  { id: 'f4',  subject: 'История КЗ', q: 'Кто основал Казахское ханство?',                           options: ['Аблай хан','Касым хан','Жанибек и Керей','Тауке хан'], correct: 2, explanation: 'Основано в 1465 году ханами Жанибеком и Кереем' },
  { id: 'f5',  subject: 'Математика',  q: 'Найдите 35% от числа 240.',                              options: ['72','84','96','120'],                          correct: 1, explanation: '240 × 0.35 = 84' },
  { id: 'f6',  subject: 'Физика',      q: 'Скорость света в вакууме приблизительно равна:',         options: ['3×10⁶ м/с','3×10⁸ м/с','3×10¹⁰ м/с','3×10⁵ м/с'], correct: 1, explanation: 'c ≈ 3×10⁸ м/с' },
  { id: 'f7',  subject: 'История КЗ', q: 'Столица перенесена в Астану в:',                          options: ['1995','1997','1999','2001'],                   correct: 1, explanation: 'Столица перенесена 10 декабря 1997 года' },
  { id: 'f8',  subject: 'Математика',  q: 'log₂ 32 = ?',                                            options: ['4','5','6','3'],                               correct: 1, explanation: '2⁵ = 32, значит log₂ 32 = 5' },
  { id: 'f9',  subject: 'Биология',    q: 'Какой органоид клетки называют «энергетической станцией»?', options: ['Рибосома','Митохондрия','Лизосома','Ядро'],  correct: 1, explanation: 'Митохондрии синтезируют АТФ' },
  { id: 'f10', subject: 'Химия',       q: 'Формула серной кислоты:',                                options: ['HCl','HNO₃','H₂SO₄','H₃PO₄'],                correct: 2, explanation: 'H₂SO₄ — серная кислота' },
  { id: 'f11', subject: 'Математика',  q: 'Сумма углов треугольника равна:',                        options: ['90°','180°','270°','360°'],                   correct: 1, explanation: 'Сумма углов любого треугольника = 180°' },
  { id: 'f12', subject: 'Физика',      q: 'Единица измерения электрического сопротивления:',        options: ['Ампер','Вольт','Ом','Ватт'],                   correct: 2, explanation: 'Сопротивление измеряется в Омах (Ω)' },
  { id: 'f13', subject: 'История КЗ', q: 'Первый президент Казахстана:',                             options: ['Токаев','Назарбаев','Кунаев','Масимов'],       correct: 1, explanation: 'Нурсултан Назарбаев — первый президент РК' },
  { id: 'f14', subject: 'Математика',  q: 'Площадь круга радиусом 5 м:',                            options: ['10π м²','25π м²','50π м²','100π м²'],         correct: 1, explanation: 'S = πr² = π×5² = 25π м²' },
  { id: 'f15', subject: 'Химия',       q: 'Атомный номер кислорода:',                               options: ['6','7','8','9'],                               correct: 2, explanation: 'Кислород (O) имеет атомный номер 8' },
  { id: 'f16', subject: 'Биология',    q: 'Сколько хромосом в клетках человека?',                   options: ['23','44','46','48'],                           correct: 2, explanation: '46 хромосом = 23 пары в диплоидном наборе' },
  { id: 'f17', subject: 'Физика',      q: 'Закон Ома: I = ?',                                       options: ['U×R','U/R','R/U','U²/R'],                     correct: 1, explanation: 'I = U/R — сила тока = напряжение / сопротивление' },
  { id: 'f18', subject: 'Математика',  q: 'Производная функции y = x³ равна:',                      options: ['3x','x²','3x²','3x⁴'],                        correct: 2, explanation: '(xⁿ)\' = n·x^(n-1), значит (x³)\' = 3x²' },
  { id: 'f19', subject: 'История КЗ', q: 'Год образования Казахской ССР:',                           options: ['1920','1925','1930','1936'],                   correct: 1, explanation: 'Казахская АССР образована в 1925, ССР — 1936. Чаще спрашивают 1920 (КирАССР) или 1925' },
  { id: 'f20', subject: 'Химия',       q: 'Какое вещество является катализатором в реакции Габера?', options: ['Pt','Fe','Ni','Cu'],                          correct: 1, explanation: 'В синтезе аммиака (процесс Габера) катализатор — железо (Fe)' },
]

const LABELS = ['A', 'B', 'C', 'D']

type Question = typeof FALLBACK_QUESTIONS[0]

async function getQuestions(count: number): Promise<Question[]> {
  // Try DB first — get more than needed so we can randomize
  try {
    const dbRows = await prisma.content.findMany({
      where: { type: 'ent_question', active: true },
      take: count * 3,
    })
    if (dbRows.length >= count) {
      return dbRows
        .sort(() => Math.random() - 0.5)
        .slice(0, count)
        .map(r => {
          const d = r.data as Record<string, unknown>
          return {
            id: r.id,
            subject: String(d.subject ?? 'ЕНТ'),
            q: String(d.question ?? d.q ?? ''),
            options: (d.options as string[]) ?? [],
            correct: Number(d.correct ?? 0),
            explanation: String(d.explanation ?? ''),
          }
        })
    }
  } catch { /* fallback */ }

  // Shuffle fallback bank
  const shuffled = [...FALLBACK_QUESTIONS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

function buildQuestionText(q: Question): string {
  const optionLines = q.options.map((o, i) => `${LABELS[i]}. ${o}`).join('\n')
  return (
    `🌅 <b>Вопрос дня — ${q.subject}</b>\n\n` +
    `${q.q}\n\n` +
    `${optionLines}\n\n` +
    `Ответ — нажми кнопку ниже 👇`
  )
}

function buildQuestionKeyboard(questionId: string) {
  return {
    inline_keyboard: [
      LABELS.slice(0, 4).map((label, i) => ({
        text: label,
        callback_data: `ans:${questionId}:${i}`,
      })),
    ],
  }
}

// ── Daily question broadcast ──────────────────────────────────────────────────

async function sendDailyQuestions() {
  console.log('[Cron] Starting daily question broadcast...')

  const users = await prisma.user.findMany({
    where: { telegramChatId: { not: null } },
    select: { id: true, telegramChatId: true, name: true },
  })

  if (users.length === 0) {
    console.log('[Cron] No users with Telegram linked, skipping.')
    return
  }

  // Get enough questions to vary between users (one per user, cycling)
  const questions = await getQuestions(Math.min(users.length, FALLBACK_QUESTIONS.length))

  let sent = 0
  let failed = 0

  for (let i = 0; i < users.length; i++) {
    const user = users[i]!
    const q = questions[i % questions.length]!

    try {
      const text = buildQuestionText(q)
      const reply_markup = buildQuestionKeyboard(q.id)

      await sendMsg(user.telegramChatId!, text, { reply_markup })

      // Small delay to avoid hitting Telegram rate limits (30 msg/sec global)
      await new Promise(r => setTimeout(r, 50))
      sent++
    } catch (err) {
      console.error(`[Cron] Failed to send to ${user.telegramChatId}:`, err)
      failed++
    }
  }

  console.log(`[Cron] Daily questions sent: ${sent} ok, ${failed} failed`)
  tg.dailyStats(users.length, 0, 0).catch(() => {})
}

// ── Daily stats report to admin ───────────────────────────────────────────────

async function sendDailyStats() {
  try {
    const [totalUsers, premiumUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isPremium: true } }),
    ])
    await tg.dailyStats(totalUsers, premiumUsers, 0)
  } catch (err) {
    console.error('[Cron] Daily stats failed:', err)
  }
}

// ── Exported for manual trigger (admin route) ─────────────────────────────────

export const sendDailyQuestionsNow = sendDailyQuestions

// ── Register all cron jobs ────────────────────────────────────────────────────

export function startCronJobs() {
  // Daily ENT question — 09:00 Almaty (UTC+5) = 04:00 UTC
  cron.schedule('0 4 * * *', () => {
    sendDailyQuestions().catch(err => console.error('[Cron] sendDailyQuestions error:', err))
  }, { timezone: 'UTC' })

  // Daily stats to admin — 08:00 Almaty (UTC+5) = 03:00 UTC
  cron.schedule('0 3 * * *', () => {
    sendDailyStats().catch(err => console.error('[Cron] sendDailyStats error:', err))
  }, { timezone: 'UTC' })

  console.log('[Cron] Jobs registered: daily question @ 09:00 Almaty, stats @ 08:00 Almaty')
}
