// ── Parent Notification Helper ────────────────────────────────────────────────
//
// Sends Telegram messages to parents linked via parentTgChatId.
// Fire-and-forget — never throws, never blocks.

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

export async function notifyParent(chatId: string, text: string): Promise<void> {
  if (!BOT_TOKEN || !chatId) return
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    })
  } catch {
    // Silent fail — notification is best-effort
  }
}

/**
 * Send weekly summary to all parents who have linked their Telegram.
 * Called by cron job (e.g., every Sunday evening).
 */
export async function sendWeeklyParentSummaries(): Promise<void> {
  if (!BOT_TOKEN) return

  // Dynamic import to avoid circular deps
  const { prisma } = await import('./prisma')

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  // Find all students with linked parents
  const students = await prisma.user.findMany({
    where: { parentTgChatId: { not: null }, role: 'student' },
    select: { id: true, name: true, parentTgChatId: true },
  })

  for (const student of students) {
    if (!student.parentTgChatId) continue

    // Count submissions this week
    const submissions = await prisma.assignmentSubmission.findMany({
      where: { studentId: student.id, submittedAt: { gte: weekAgo } },
      select: { score: true },
    })

    if (submissions.length === 0) {
      await notifyParent(student.parentTgChatId, `📊 Отчёт за неделю: ${student.name} не сдал(а) ни одного задания. Напомните о занятиях!`)
      continue
    }

    const scores = submissions.filter(s => s.score !== null).map(s => s.score!)
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null

    const msg = [
      `📊 <b>Недельный отчёт: ${student.name}</b>`,
      ``,
      `📝 Заданий сдано: ${submissions.length}`,
      avgScore !== null ? `📈 Средний балл: ${avgScore}%` : '',
      avgScore !== null && avgScore >= 80 ? `🎉 Отличный результат!` : '',
      avgScore !== null && avgScore < 50 ? `⚠️ Рекомендуем усилить подготовку` : '',
    ].filter(Boolean).join('\n')

    await notifyParent(student.parentTgChatId, msg)
  }
}
