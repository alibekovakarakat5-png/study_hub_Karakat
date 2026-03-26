// ── StudyHub Cron Jobs ────────────────────────────────────────────────────────
//
// Runs scheduled tasks on the server:
//   * 09:00 Almaty (04:00 UTC) — daily ENT question to all Telegram users
//   * 08:00 Almaty (03:00 UTC) — daily stats report to admin
//
// Usage: call startCronJobs() once in index.ts after server starts.

import cron from 'node-cron'
import { prisma } from './prisma'
import { tg } from './telegram'
import { cronDailyContent, cronDeadlineReminder, checkWarmLeads } from './growthBot'
import {
  FALLBACK_QUESTIONS, getQuestions, getRandomQuestion,
  buildQuestionText, buildQuestionKeyboard,
} from './questions'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

// ── Low-level send (separate from telegram.ts to avoid circular import) ──────

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

// ── Daily question broadcast (персонализированный) ───────────────────────────

async function getWeakSubjectForUser(userId: string): Promise<string | null> {
  try {
    const results = await prisma.diagnosticResult.findMany({
      where: { userId }, orderBy: { takenAt: 'desc' }, take: 20,
    })
    if (!results.length) return null
    const bySubject: Record<string, number[]> = {}
    for (const r of results) {
      const s = r.subject ?? 'ЕНТ'
      const d = r.scores as Record<string, unknown>
      const pct = Number(d.percentage ?? d.score ?? 0) / 100
      if (!bySubject[s]) bySubject[s] = []
      bySubject[s].push(pct)
    }
    let weakSubj: string | null = null
    let weakScore = Infinity
    for (const [subj, scores] of Object.entries(bySubject)) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length
      if (avg < weakScore) { weakScore = avg; weakSubj = subj }
    }
    return weakSubj
  } catch { return null }
}

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

  const fallbackQuestions = await getQuestions(Math.min(users.length, FALLBACK_QUESTIONS.length))

  let sent = 0
  let failed = 0

  for (let i = 0; i < users.length; i++) {
    const user = users[i]!

    try {
      // Персонализация: ищем слабый предмет
      const weakSubject = await getWeakSubjectForUser(user.id)
      const q = await getRandomQuestion(weakSubject ?? undefined).catch(() => fallbackQuestions[i % fallbackQuestions.length]!)

      const prefix = weakSubject ? `🎯 <i>Слабая тема: ${weakSubject}</i>\n\n` : `🌅 <b>Вопрос дня</b>\n\n`
      const text = buildQuestionText(q, prefix)
      const reply_markup = buildQuestionKeyboard(q.id)

      await sendMsg(user.telegramChatId!, text, { reply_markup })
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

// ── Weekly progress report (воскресенье) ─────────────────────────────────────

const APP_URL = process.env.APP_URL ?? 'https://studyhub.kz'

async function sendWeeklyReports() {
  console.log('[Cron] Starting weekly progress reports...')

  const users = await prisma.user.findMany({
    where: { telegramChatId: { not: null } },
    select: { id: true, telegramChatId: true, name: true, streak: true, totalStudyMinutes: true },
  })

  let sent = 0

  for (const user of users) {
    try {
      const results = await prisma.diagnosticResult.findMany({
        where: { userId: user.id, takenAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      })

      const streak = user.streak ?? 0
      const streakEmoji = streak >= 7 ? '🔥' : streak >= 3 ? '⚡' : '📅'
      const minutes = user.totalStudyMinutes ?? 0

      let text = `📊 <b>Итоги недели, ${user.name}!</b>\n\n`
      text += `${streakEmoji} Стрик: <b>${streak} дней</b>\n`
      text += `⏱ Время занятий: <b>${minutes} мин</b>\n`

      if (results.length > 0) {
        const percentages = results.map(r => Number((r.scores as Record<string, unknown>).percentage ?? 0))
        const avg = Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
        text += `✅ Тестов пройдено за неделю: <b>${results.length}</b>, средний балл: <b>${avg}%</b>\n`
      } else {
        text += `\n💡 На этой неделе не было практики — начни сейчас!\n`
      }

      text += `\nПродолжай — ЕНТ всё ближе! 🎯`

      await sendMsg(user.telegramChatId!, text, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '📱 Открыть StudyHub', web_app: { url: `${APP_URL}/dashboard` } }],
            [{ text: '🎯 Вопрос дня', callback_data: 'flow:question' }],
          ],
        },
      })

      await new Promise(r => setTimeout(r, 60))
      sent++
    } catch (err) {
      console.error(`[Cron] Weekly report failed for ${user.telegramChatId}:`, err)
    }
  }

  console.log(`[Cron] Weekly reports sent: ${sent}`)
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

// ── Exported for manual trigger ───────────────────────────────────────────────

export const sendDailyQuestionsNow  = sendDailyQuestions
export const sendWeeklyReportsNow   = sendWeeklyReports

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

  // ── Growth Assistant crons ──────────────────────────────────────────────

  // Daily content ideas — 07:00 Almaty (UTC+5) = 02:00 UTC
  cron.schedule('0 2 * * *', () => {
    cronDailyContent().catch(err => console.error('[Cron] cronDailyContent error:', err))
  }, { timezone: 'UTC' })

  // Deadline reminders — 10:00 Almaty (UTC+5) = 05:00 UTC
  cron.schedule('0 5 * * *', () => {
    cronDeadlineReminder().catch(err => console.error('[Cron] cronDeadlineReminder error:', err))
  }, { timezone: 'UTC' })

  // Warm lead check — 12:00 Almaty (UTC+5) = 07:00 UTC
  cron.schedule('0 7 * * *', () => {
    checkWarmLeads().catch(err => console.error('[Cron] checkWarmLeads error:', err))
  }, { timezone: 'UTC' })

  // Weekly progress report — воскресенье 19:00 Almaty (UTC+5) = 14:00 UTC
  cron.schedule('0 14 * * 0', () => {
    sendWeeklyReports().catch(err => console.error('[Cron] sendWeeklyReports error:', err))
  }, { timezone: 'UTC' })

  console.log('[Cron] Jobs registered: daily question @ 09:00, stats @ 08:00, content @ 07:00, deadlines @ 10:00, warm leads @ 12:00, weekly report Sun @ 19:00 (Almaty)')
}
