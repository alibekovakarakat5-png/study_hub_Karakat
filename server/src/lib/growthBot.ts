// ── StudyHub Growth Assistant ─────────────────────────────────────────────────
//
// Admin-only Telegram bot module for business growth:
//   Block 1 — Lead management (find, add, list, analyze)
//   Block 2 — Lead warming (monitor warm signals, notify admin)
//   Block 3 — Content machine (daily posts/reels/stories via AI)
//   Block 4 — Competitor analytics
//   Block 5 — Project manager (grants, hackathons, tasks, document processing)
//
// Only responds to ADMIN_CHAT — all other users are ignored.
// Commands prefixed with /g_ to avoid collision with user-facing bot.

import { prisma } from './prisma'
import { generateContent, analyzeLead, processDocument, analyzeCompetitor } from './growthAI'

const BOT_TOKEN   = process.env.TELEGRAM_BOT_TOKEN
const ADMIN_CHAT  = process.env.TELEGRAM_ADMIN_CHAT ?? process.env.TELEGRAM_CHAT_ID
const CHANNEL_ID  = process.env.TELEGRAM_CHANNEL_ID // Marketing_Admin channel

// ── Helpers ──────────────────────────────────────────────────────────────────

async function send(text: string, extra?: Record<string, unknown>) {
  if (!BOT_TOKEN || !ADMIN_CHAT) return
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ chat_id: ADMIN_CHAT, text, parse_mode: 'HTML', disable_web_page_preview: true, ...extra }),
  })
}

async function sendToChannel(text: string) {
  if (!BOT_TOKEN || !CHANNEL_ID) return
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ chat_id: CHANNEL_ID, text, parse_mode: 'HTML', disable_web_page_preview: true }),
  })
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function truncate(s: string, max = 300): string {
  return s.length > max ? s.slice(0, max) + '...' : s
}

// ── State for multi-step flows ───────────────────────────────────────────────

type GrowthFlow =
  | 'idle'
  | 'add_lead'       // step 0: name, 1: type, 2: source, 3: contact, 4: notes
  | 'add_task'        // step 0: title, 1: type, 2: deadline, 3: url
  | 'add_competitor'  // step 0: name, 1: url, 2: description
  | 'analyze_doc'     // waiting for document/text

interface GrowthState {
  flow: GrowthFlow
  step: number
  data: Record<string, string>
}

let growthState: GrowthState = { flow: 'idle', step: 0, data: {} }

function resetGrowth() {
  growthState = { flow: 'idle', step: 0, data: {} }
}

// ── Check if message is from admin ───────────────────────────────────────────

export function isAdmin(chatId: number): boolean {
  return String(chatId) === String(ADMIN_CHAT)
}

// ── Main command router ──────────────────────────────────────────────────────

export async function handleGrowthCommand(chatId: number, text: string): Promise<boolean> {
  if (!isAdmin(chatId)) return false

  // Commands
  if (text === '/g')            { await showGrowthMenu(); return true }
  if (text === '/g_help')       { await showGrowthMenu(); return true }
  if (text === '/g_leads')      { await listLeads(); return true }
  if (text === '/g_add_lead')   { await startAddLead(); return true }
  if (text === '/g_content')    { await generateDailyContent(); return true }
  if (text === '/g_tasks')      { await listTasks(); return true }
  if (text === '/g_add_task')   { await startAddTask(); return true }
  if (text === '/g_competitors'){ await listCompetitors(); return true }
  if (text === '/g_add_comp')   { await startAddCompetitor(); return true }
  if (text === '/g_analyze')    { await startAnalyzeDoc(); return true }
  if (text === '/g_stats')      { await showGrowthStats(); return true }
  if (text === '/g_cancel')     { resetGrowth(); await send('❌ Отменено.'); return true }

  // Publish text directly to channel
  if (text.startsWith('/g_publish ')) {
    const msg = text.slice(11).trim()
    if (msg) { await publishToChannel(msg); return true }
  }

  // Find leads with keyword
  if (text.startsWith('/g_find ')) {
    const keyword = text.slice(8).trim()
    if (keyword) { await findLeads(keyword); return true }
  }

  // Handle multi-step flow input
  if (growthState.flow !== 'idle') {
    await handleFlowInput(text)
    return true
  }

  return false
}

// ── Growth callback handler ──────────────────────────────────────────────────

export async function handleGrowthCallback(chatId: number, data: string): Promise<boolean> {
  if (!isAdmin(chatId)) return false
  if (!data.startsWith('g:')) return false

  const parts = data.split(':')

  // Lead status updates: g:lead_status:<id>:<status>
  if (parts[1] === 'lead_status' && parts[2] && parts[3]) {
    await updateLeadStatus(parts[2], parts[3])
    return true
  }

  // Task status updates: g:task_status:<id>:<status>
  if (parts[1] === 'task_status' && parts[2] && parts[3]) {
    await updateTaskStatus(parts[2], parts[3])
    return true
  }

  // Content approval: g:content_approve:<id>
  if (parts[1] === 'content_approve' && parts[2]) {
    await approveContent(parts[2])
    return true
  }

  // Content archive: g:content_archive:<id>
  if (parts[1] === 'content_archive' && parts[2]) {
    await archiveContent(parts[2])
    return true
  }

  // Lead type selection in add flow
  if (parts[1] === 'lead_type' && parts[2]) {
    growthState.data.type = parts[2]
    growthState.step = 2
    await send('📍 <b>Источник лида:</b>\n\nОткуда нашёл? (telegram / instagram / google_maps / manual)')
    return true
  }

  // Task type selection in add flow
  if (parts[1] === 'task_type' && parts[2]) {
    growthState.data.type = parts[2]
    growthState.step = 2
    await send('📅 <b>Дедлайн:</b>\n\nУкажи дату (DD.MM.YYYY) или «нет» если без дедлайна:')
    return true
  }

  return false
}

// ── Growth Menu ──────────────────────────────────────────────────────────────

async function showGrowthMenu() {
  await send(
    `🚀 <b>Growth Assistant</b>\n\n` +
    `<b>📌 Лиды:</b>\n` +
    `/g_leads — список лидов\n` +
    `/g_add_lead — добавить лид\n` +
    `/g_find &lt;keyword&gt; — AI-поиск лидов\n\n` +
    `<b>📲 Контент:</b>\n` +
    `/g_content — сгенерировать контент на сегодня\n` +
    `/g_publish &lt;текст&gt; — опубликовать в канал\n\n` +
    `<b>📋 Задачи:</b>\n` +
    `/g_tasks — список задач/грантов\n` +
    `/g_add_task — добавить задачу\n\n` +
    `<b>📊 Аналитика:</b>\n` +
    `/g_competitors — конкуренты\n` +
    `/g_add_comp — добавить конкурента\n` +
    `/g_stats — общая статистика\n\n` +
    `<b>📄 Документы:</b>\n` +
    `/g_analyze — анализ текста/PDF\n\n` +
    `/g_cancel — отменить текущий ввод`,
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// Block 1 — LEADS
// ══════════════════════════════════════════════════════════════════════════════

async function listLeads() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  if (leads.length === 0) {
    await send('📭 Лидов пока нет. Добавь первый: /g_add_lead')
    return
  }

  const statusEmoji: Record<string, string> = {
    new: '🆕', contacted: '📞', warm: '🔥', converted: '✅', rejected: '❌',
  }

  let text = `📌 <b>Последние лиды (${leads.length})</b>\n\n`
  for (const lead of leads) {
    const emoji = statusEmoji[lead.status] ?? '📌'
    text += `${emoji} <b>${esc(lead.name)}</b>\n`
    text += `   Тип: ${lead.type} | Источник: ${lead.source}\n`
    if (lead.contact) text += `   Контакт: ${esc(lead.contact)}\n`
    text += `   Статус: ${lead.status} | Скор: ${lead.score}/10\n\n`
  }

  // Add status update buttons for the first 3 leads
  const buttons = leads.slice(0, 3).map(lead => ([
    { text: `📞 ${lead.name.slice(0, 15)}`, callback_data: `g:lead_status:${lead.id}:contacted` },
    { text: `🔥 Тёплый`, callback_data: `g:lead_status:${lead.id}:warm` },
    { text: `✅`, callback_data: `g:lead_status:${lead.id}:converted` },
  ]))

  await send(text, { reply_markup: { inline_keyboard: buttons } })
}

async function startAddLead() {
  growthState = { flow: 'add_lead', step: 0, data: {} }
  await send(
    `➕ <b>Добавить лид</b>\n\nВведи название (имя, центр, школа):`,
  )
}

async function findLeads(keyword: string) {
  await send(`🔍 Ищу лиды по запросу: <b>${esc(keyword)}</b>...`)

  try {
    const result = await analyzeLead(keyword)
    await send(
      `🔍 <b>AI-анализ: ${esc(keyword)}</b>\n\n${result}`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '➕ Добавить как лид', callback_data: 'g:lead_type:center' }],
          ],
        },
      },
    )
  } catch (err) {
    await send(`⚠️ Ошибка AI: ${esc(String(err))}`)
  }
}

async function updateLeadStatus(leadId: string, status: string) {
  try {
    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: { status },
    })
    await send(`✅ Лид <b>${esc(lead.name)}</b> обновлён → <b>${status}</b>`)
  } catch {
    await send('⚠️ Лид не найден.')
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// Block 2 — LEAD WARMING (AI suggestions for warm leads)
// ══════════════════════════════════════════════════════════════════════════════

export async function checkWarmLeads() {
  // Called by cron — finds new leads and suggests outreach
  const newLeads = await prisma.lead.findMany({
    where: { status: 'new', createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    take: 5,
  })

  if (newLeads.length === 0) return

  let text = `🔥 <b>Новые лиды за 24ч — пора писать!</b>\n\n`
  for (const lead of newLeads) {
    text += `• <b>${esc(lead.name)}</b> (${lead.type})\n`
    if (lead.contact) text += `  📞 ${esc(lead.contact)}\n`
    if (lead.description) text += `  📝 ${esc(truncate(lead.description, 100))}\n`
    text += '\n'
  }
  text += `Обнови статус после контакта: /g_leads`

  await send(text)
}

// ── Direct channel publish ───────────────────────────────────────────────────

async function publishToChannel(text: string) {
  if (!CHANNEL_ID) {
    await send('⚠️ TELEGRAM_CHANNEL_ID не настроен в .env')
    return
  }
  await sendToChannel(text)
  await send(`✅ Опубликовано в канал Marketing_Admin`)
}

// ══════════════════════════════════════════════════════════════════════════════
// Block 3 — CONTENT MACHINE
// ══════════════════════════════════════════════════════════════════════════════

async function generateDailyContent() {
  await send('🎨 Генерирую контент-план на сегодня...')

  try {
    const result = await generateContent()

    // Parse AI response and save ideas to DB
    const ideas = parseContentIdeas(result)
    for (const idea of ideas) {
      await prisma.contentIdea.create({ data: idea })
    }

    // Send formatted result
    await send(`📲 <b>Контент на сегодня:</b>\n\n${result}`)

    // Show approval buttons for saved ideas
    const saved = await prisma.contentIdea.findMany({
      where: { status: 'draft' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    if (saved.length > 0) {
      const buttons = saved.map(idea => ([
        { text: `✅ ${idea.title.slice(0, 25)}`, callback_data: `g:content_approve:${idea.id}` },
        { text: `🗑`, callback_data: `g:content_archive:${idea.id}` },
      ]))
      await send('Одобри контент для публикации:', { reply_markup: { inline_keyboard: buttons } })
    }
  } catch (err) {
    await send(`⚠️ Ошибка генерации: ${esc(String(err))}`)
  }
}

function parseContentIdeas(aiResponse: string): Array<{
  type: string; platform: string; title: string; body: string; tags: string[]
}> {
  // Parse structured AI response into content ideas
  const ideas: Array<{ type: string; platform: string; title: string; body: string; tags: string[] }> = []

  // Split by numbered items or emoji markers
  const blocks = aiResponse.split(/\n(?=\d+\.|📱|🎬|📸|📝|💡)/).filter(Boolean)

  for (const block of blocks) {
    const lines = block.trim().split('\n').filter(Boolean)
    if (lines.length === 0) continue

    const firstLine = lines[0]!.replace(/^\d+\.\s*/, '').replace(/^[📱🎬📸📝💡]\s*/, '')

    // Detect type from keywords
    let type = 'post'
    let platform = 'instagram'
    const lower = block.toLowerCase()
    if (lower.includes('reels') || lower.includes('видео') || lower.includes('рилс')) { type = 'reels'; platform = 'instagram' }
    else if (lower.includes('story') || lower.includes('стори')) { type = 'story'; platform = 'instagram' }
    else if (lower.includes('tiktok') || lower.includes('тикток')) { type = 'reels'; platform = 'tiktok' }
    else if (lower.includes('telegram') || lower.includes('канал')) { type = 'post'; platform = 'telegram' }
    else if (lower.includes('carousel') || lower.includes('карусель')) { type = 'carousel'; platform = 'instagram' }

    // Extract tags
    const tagMatch = block.match(/#[\wА-Яа-яёЁ]+/g)
    const tags = tagMatch ? tagMatch.map(t => t.slice(1)) : ['studyhub', 'ent', 'education']

    ideas.push({
      type,
      platform,
      title: truncate(firstLine, 200),
      body: truncate(lines.slice(1).join('\n'), 1000),
      tags,
    })
  }

  // Return at least empty array, max 10
  return ideas.slice(0, 10)
}

async function approveContent(ideaId: string) {
  try {
    const idea = await prisma.contentIdea.update({
      where: { id: ideaId },
      data: { status: 'approved' },
    })

    // Auto-publish to Marketing_Admin channel
    const tags = (idea.tags as string[] | null) ?? []
    const hashtags = tags.map(t => `#${t}`).join(' ')
    const channelPost =
      `📲 <b>${esc(idea.title)}</b>\n\n` +
      (idea.body ? `${esc(idea.body)}\n\n` : '') +
      (hashtags ? hashtags : '')
    await sendToChannel(channelPost)

    await send(`✅ Контент одобрен и опубликован в канал: <b>${esc(idea.title)}</b>`)
  } catch {
    await send('⚠️ Контент не найден.')
  }
}

async function archiveContent(ideaId: string) {
  try {
    await prisma.contentIdea.update({
      where: { id: ideaId },
      data: { status: 'archived' },
    })
    await send('🗑 Контент убран в архив.')
  } catch {
    await send('⚠️ Контент не найден.')
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// Block 4 — COMPETITOR ANALYTICS
// ══════════════════════════════════════════════════════════════════════════════

async function listCompetitors() {
  const comps = await prisma.competitor.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 10,
  })

  if (comps.length === 0) {
    await send('📊 Конкурентов пока нет. Добавь: /g_add_comp')
    return
  }

  let text = `📊 <b>Конкуренты (${comps.length})</b>\n\n`
  for (const c of comps) {
    text += `🏢 <b>${esc(c.name)}</b>\n`
    if (c.url) text += `   🔗 ${esc(c.url)}\n`
    if (c.description) text += `   📝 ${esc(truncate(c.description, 100))}\n`
    const features = c.features as string[] | null
    if (features && features.length > 0) {
      text += `   ⚡ ${features.slice(0, 3).join(', ')}\n`
    }
    text += '\n'
  }

  await send(text)
}

async function startAddCompetitor() {
  growthState = { flow: 'add_competitor', step: 0, data: {} }
  await send('🏢 <b>Добавить конкурента</b>\n\nВведи название:')
}

// ══════════════════════════════════════════════════════════════════════════════
// Block 5 — PROJECT MANAGER (Tasks, Grants, Docs)
// ══════════════════════════════════════════════════════════════════════════════

async function listTasks() {
  const tasks = await prisma.growthTask.findMany({
    where: { status: { not: 'done' } },
    orderBy: [{ priority: 'asc' }, { deadline: 'asc' }],
    take: 15,
  })

  if (tasks.length === 0) {
    await send('✅ Все задачи выполнены! Добавь новую: /g_add_task')
    return
  }

  const priorityEmoji: Record<string, string> = {
    urgent: '🔴', high: '🟠', medium: '🟡', low: '🟢',
  }
  const typeEmoji: Record<string, string> = {
    grant: '🎓', hackathon: '🏆', contest: '🏅', feature: '⚡', bug: '🐛', other: '📋',
  }

  let text = `📋 <b>Задачи (${tasks.length})</b>\n\n`
  for (const t of tasks) {
    const p = priorityEmoji[t.priority] ?? '📋'
    const tp = typeEmoji[t.type] ?? '📋'
    const deadline = t.deadline
      ? ` | 📅 ${t.deadline.toLocaleDateString('ru-KZ', { timeZone: 'Asia/Almaty' })}`
      : ''
    const statusMark = t.status === 'in_progress' ? '🔄' : '⬜'
    text += `${statusMark} ${p}${tp} <b>${esc(t.title)}</b>${deadline}\n`
    if (t.url) text += `   🔗 ${esc(t.url)}\n`
    text += '\n'
  }

  // Quick action buttons for first 3
  const buttons = tasks.slice(0, 3).map(t => ([
    { text: `🔄 ${t.title.slice(0, 15)}`, callback_data: `g:task_status:${t.id}:in_progress` },
    { text: `✅ Done`, callback_data: `g:task_status:${t.id}:done` },
  ]))

  await send(text, { reply_markup: { inline_keyboard: buttons } })
}

async function startAddTask() {
  growthState = { flow: 'add_task', step: 0, data: {} }
  await send('📋 <b>Добавить задачу</b>\n\nВведи название:')
}

async function updateTaskStatus(taskId: string, status: string) {
  try {
    const task = await prisma.growthTask.update({
      where: { id: taskId },
      data: { status },
    })
    const emoji = status === 'done' ? '✅' : '🔄'
    await send(`${emoji} Задача <b>${esc(task.title)}</b> → <b>${status}</b>`)
  } catch {
    await send('⚠️ Задача не найдена.')
  }
}

async function startAnalyzeDoc() {
  growthState = { flow: 'analyze_doc', step: 0, data: {} }
  await send(
    '📄 <b>Анализ документа</b>\n\n' +
    'Отправь текст или перешли сообщение.\n' +
    'AI разобьёт на уроки и предложит структуру для StudyHub.\n\n' +
    '/g_cancel — отмена',
  )
}

// ── Growth stats ─────────────────────────────────────────────────────────────

async function showGrowthStats() {
  const [
    totalLeads,
    newLeads,
    warmLeads,
    convertedLeads,
    pendingTasks,
    draftContent,
    approvedContent,
    competitors,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: 'new' } }),
    prisma.lead.count({ where: { status: 'warm' } }),
    prisma.lead.count({ where: { status: 'converted' } }),
    prisma.growthTask.count({ where: { status: { not: 'done' } } }),
    prisma.contentIdea.count({ where: { status: 'draft' } }),
    prisma.contentIdea.count({ where: { status: 'approved' } }),
    prisma.competitor.count(),
  ])

  // Upcoming deadlines
  const upcoming = await prisma.growthTask.findMany({
    where: { deadline: { gte: new Date() }, status: { not: 'done' } },
    orderBy: { deadline: 'asc' },
    take: 3,
  })

  let text =
    `📊 <b>Growth Dashboard</b>\n\n` +
    `<b>📌 Лиды</b>\n` +
    `   Всего: ${totalLeads} | 🆕 ${newLeads} | 🔥 ${warmLeads} | ✅ ${convertedLeads}\n` +
    `   Конверсия: ${totalLeads > 0 ? Math.round(convertedLeads / totalLeads * 100) : 0}%\n\n` +
    `<b>📋 Задачи</b>\n` +
    `   В работе: ${pendingTasks}\n\n` +
    `<b>📲 Контент</b>\n` +
    `   Черновики: ${draftContent} | Одобрено: ${approvedContent}\n\n` +
    `<b>🏢 Конкуренты:</b> ${competitors}\n`

  if (upcoming.length > 0) {
    text += '\n<b>⏰ Ближайшие дедлайны:</b>\n'
    for (const t of upcoming) {
      const date = t.deadline!.toLocaleDateString('ru-KZ', { timeZone: 'Asia/Almaty' })
      text += `   📅 ${date} — ${esc(t.title)}\n`
    }
  }

  await send(text)
}

// ══════════════════════════════════════════════════════════════════════════════
// Multi-step flow handler
// ══════════════════════════════════════════════════════════════════════════════

async function handleFlowInput(text: string) {
  const { flow, step, data } = growthState

  // ── Add Lead flow ──────────────────────────────────────────────────────
  if (flow === 'add_lead') {
    if (step === 0) {
      data.name = text
      growthState.step = 1
      await send(
        '📂 <b>Тип лида:</b>',
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🏫 Центр', callback_data: 'g:lead_type:center' },
                { text: '👨‍🏫 Репетитор', callback_data: 'g:lead_type:tutor' },
              ],
              [
                { text: '🏫 Школа', callback_data: 'g:lead_type:school' },
                { text: '🎓 Студент', callback_data: 'g:lead_type:student' },
              ],
              [{ text: '📦 Другое', callback_data: 'g:lead_type:other' }],
            ],
          },
        },
      )
      return
    }
    if (step === 2) {
      data.source = text.toLowerCase().trim() || 'manual'
      growthState.step = 3
      await send('📞 <b>Контакт</b> (телефон, @username, ссылка) или «нет»:')
      return
    }
    if (step === 3) {
      data.contact = text.toLowerCase() === 'нет' ? '' : text
      growthState.step = 4
      await send('📝 <b>Заметки</b> (описание, подписчики, активность) или «нет»:')
      return
    }
    if (step === 4) {
      const notes = text.toLowerCase() === 'нет' ? null : text
      // Save lead
      const lead = await prisma.lead.create({
        data: {
          name: data.name!,
          type: data.type || 'other',
          source: data.source || 'manual',
          contact: data.contact || null,
          notes,
          status: 'new',
          score: 5,
        },
      })
      resetGrowth()
      await send(
        `✅ <b>Лид добавлен!</b>\n\n` +
        `📌 ${esc(lead.name)}\n` +
        `Тип: ${lead.type} | Источник: ${lead.source}\n` +
        (lead.contact ? `Контакт: ${esc(lead.contact)}\n` : '') +
        (lead.notes ? `Заметки: ${esc(truncate(lead.notes, 150))}\n` : '') +
        `\nСтатус: 🆕 new`,
      )
      return
    }
  }

  // ── Add Task flow ──────────────────────────────────────────────────────
  if (flow === 'add_task') {
    if (step === 0) {
      data.title = text
      growthState.step = 1
      await send(
        '📂 <b>Тип задачи:</b>',
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🎓 Грант', callback_data: 'g:task_type:grant' },
                { text: '🏆 Хакатон', callback_data: 'g:task_type:hackathon' },
              ],
              [
                { text: '🏅 Конкурс', callback_data: 'g:task_type:contest' },
                { text: '⚡ Фича', callback_data: 'g:task_type:feature' },
              ],
              [
                { text: '🐛 Баг', callback_data: 'g:task_type:bug' },
                { text: '📋 Другое', callback_data: 'g:task_type:other' },
              ],
            ],
          },
        },
      )
      return
    }
    if (step === 2) {
      // Parse deadline
      let deadline: Date | null = null
      if (text.toLowerCase() !== 'нет') {
        const parts = text.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/)
        if (parts) {
          deadline = new Date(Number(parts[3]), Number(parts[2]) - 1, Number(parts[1]))
        }
      }
      data.deadline = deadline ? deadline.toISOString() : ''
      growthState.step = 3
      await send('🔗 <b>Ссылка</b> (URL) или «нет»:')
      return
    }
    if (step === 3) {
      const url = text.toLowerCase() === 'нет' ? null : text
      const task = await prisma.growthTask.create({
        data: {
          title: data.title!,
          type: data.type || 'other',
          deadline: data.deadline ? new Date(data.deadline) : null,
          url,
          status: 'pending',
          priority: 'medium',
        },
      })
      resetGrowth()
      const deadlineStr = task.deadline
        ? task.deadline.toLocaleDateString('ru-KZ', { timeZone: 'Asia/Almaty' })
        : 'без дедлайна'
      await send(
        `✅ <b>Задача добавлена!</b>\n\n` +
        `📋 ${esc(task.title)}\n` +
        `Тип: ${task.type} | Приоритет: ${task.priority}\n` +
        `📅 ${deadlineStr}` +
        (task.url ? `\n🔗 ${esc(task.url)}` : ''),
      )
      return
    }
  }

  // ── Add Competitor flow ────────────────────────────────────────────────
  if (flow === 'add_competitor') {
    if (step === 0) {
      data.name = text
      growthState.step = 1
      await send('🔗 <b>URL сайта/инстаграма</b> или «нет»:')
      return
    }
    if (step === 1) {
      data.url = text.toLowerCase() === 'нет' ? '' : text
      growthState.step = 2
      await send('📝 <b>Описание</b> (чем занимаются, сколько подписчиков, цены) или «нет»:')
      return
    }
    if (step === 2) {
      const description = text.toLowerCase() === 'нет' ? null : text

      // If description provided, ask AI to analyze
      let aiNotes = ''
      if (description) {
        try {
          aiNotes = await analyzeCompetitor(data.name!, description)
        } catch { /* ignore AI failure */ }
      }

      const comp = await prisma.competitor.create({
        data: {
          name: data.name!,
          url: data.url || null,
          description,
          notes: aiNotes || null,
        },
      })
      resetGrowth()

      let msg = `✅ <b>Конкурент добавлен!</b>\n\n🏢 ${esc(comp.name)}`
      if (comp.url) msg += `\n🔗 ${esc(comp.url)}`
      if (comp.description) msg += `\n📝 ${esc(truncate(comp.description, 150))}`
      if (aiNotes) msg += `\n\n🤖 <b>AI-анализ:</b>\n${aiNotes}`

      await send(msg)
      return
    }
  }

  // ── Analyze document flow ──────────────────────────────────────────────
  if (flow === 'analyze_doc') {
    resetGrowth()
    await send('🔄 Анализирую текст...')
    try {
      const result = await processDocument(text)
      await send(`📄 <b>Результат анализа:</b>\n\n${result}`)
    } catch (err) {
      await send(`⚠️ Ошибка анализа: ${esc(String(err))}`)
    }
    return
  }
}

// ── Daily content generation (called by cron) ────────────────────────────────

export async function cronDailyContent() {
  try {
    const result = await generateContent()
    const ideas = parseContentIdeas(result)
    for (const idea of ideas) {
      await prisma.contentIdea.create({ data: idea })
    }
    await send(`🌅 <b>Утренний контент-план готов!</b>\n\n${result}\n\nОдобри или отклони: /g_content`)
  } catch (err) {
    console.error('[GrowthBot] cronDailyContent failed:', err)
  }
}

// ── Deadline reminders (called by cron) ──────────────────────────────────────

export async function cronDeadlineReminder() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(23, 59, 59, 999)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const urgent = await prisma.growthTask.findMany({
    where: {
      deadline: { gte: today, lte: tomorrow },
      status: { not: 'done' },
    },
  })

  // Also check tasks due in 3 days
  const threeDays = new Date()
  threeDays.setDate(threeDays.getDate() + 3)
  const upcoming = await prisma.growthTask.findMany({
    where: {
      deadline: { gt: tomorrow, lte: threeDays },
      status: { not: 'done' },
    },
  })

  if (urgent.length === 0 && upcoming.length === 0) return

  let text = ''
  if (urgent.length > 0) {
    text += `🚨 <b>ДЕДЛАЙН СЕГОДНЯ/ЗАВТРА:</b>\n`
    for (const t of urgent) {
      text += `   ❗ ${esc(t.title)}${t.url ? ` — ${esc(t.url)}` : ''}\n`
    }
    text += '\n'
  }
  if (upcoming.length > 0) {
    text += `⏰ <b>Через 2-3 дня:</b>\n`
    for (const t of upcoming) {
      const date = t.deadline!.toLocaleDateString('ru-KZ', { timeZone: 'Asia/Almaty' })
      text += `   📅 ${date} — ${esc(t.title)}\n`
    }
  }

  await send(text)
}
