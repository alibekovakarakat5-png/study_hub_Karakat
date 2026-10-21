import type { IeltsState, IeltsReply } from './ieltsBot'
import { grammarPractice, grammarTopics, writingTask, writingTasks, writingWordCount, type GrammarTopic } from './ieltsWritingContent'
import type { WritingFeedback, WritingJob } from './ieltsWriting'

const navigation = [[{ text: '✍️ Writing', data: 'i:writing' }, { text: '📖 Reading', data: 'i:reading' }], [{ text: '🧩 Грамматика', data: 'i:grammar' }, { text: '📈 Прогресс', data: 'i:progress' }]]
const choices = writingTasks.map(t => [{ text: t.title, data: `i:w:task:${t.id}` }])
const disclosure = 'Проверка с ИИ: в Groq будут переданы условие задания, твой текст и, при повторной проверке, предыдущая проверенная версия с разбором. Telegram ID, имя профиля и телефон не передаются. Не включай личные данные в эссе. ИИ может ошибаться; это учебный разбор, не официальный IELTS band. Нажатие «Проверить с ИИ» означает согласие на эту передачу для текущей версии.'
function controls(state: IeltsState): NonNullable<IeltsReply['buttons']> {
  const w = state.writing!
  return [[{ text: '💡 План и подсказки', data: 'i:w:hint' }, { text: '📝 Мой текст', data: 'i:w:draft' }],
    ...(w.draft ? [[{ text: 'Проверить с ИИ', data: `i:w:check:${w.revision}` }]] : []),
    [{ text: 'Последний разбор', data: 'i:w:feedback' }], ...navigation]
}
function draftReply(state: IeltsState): IeltsReply {
  const w = state.writing!, task = writingTask(w.taskId), words = writingWordCount(w.draft)
  return { text: `${task.title} · версия ${w.revision} · ${words} слов\n${words < task.minWords ? `Для полного ответа нужно минимум ${task.minWords} слов. Можно проверить отрывок от 20 слов, но выводы будут ограничены.\n` : ''}${w.job ? 'Проверка запущена. Если ответа нет больше 45 секунд, можно повторить согласие.\n' : ''}${w.draft ? 'Текст сохранён. Для исправления пришли новую полную версию одним сообщением (до 3500 знаков).\n\n' : 'Пришли свой текст одним сообщением (до 3500 знаков).\n\n'}${disclosure}`, buttons: controls(state) }
}
export function writingFeedbackReply(job: Pick<WritingJob, 'revision' | 'taskId'>, f: WritingFeedback): IeltsReply {
  return { text: `${writingTask(job.taskId).title} · разбор версии ${job.revision}\nУчебная обратная связь ИИ, не официальный балл IELTS.\n\nЧто получилось: ${f.strengths}\n\nЗадание: ${f.criteria.task}\nСвязность: ${f.criteria.coherence}\nЛексика: ${f.criteria.vocabulary}\nГрамматика: ${f.criteria.grammar}\n\n${f.corrections.map(c => `«${c.quote}» → «${c.replacement}»\n${c.reason}`).join('\n\n') || 'Конкретные исправления не выделены — это не гарантия отсутствия ошибок.'}\n\n${f.comparison ? `Сравнение: ${f.comparison}\n\n` : ''}Следующий шаг: ${f.nextStep}\nПришли исправленную полную версию. Новая проверка потребует отдельного согласия.`, buttons: navigation }
}
export function finishWriting(state: IeltsState, job: WritingJob, feedback: WritingFeedback | null, now = new Date()): { state: IeltsState; reply: IeltsReply } {
  state = structuredClone(state)
  const w = state.writing
  if (!w || w.job?.id !== job.id || w.revision !== job.revision || w.taskId !== job.taskId) return { state, reply: { text: 'Текст или задание изменились во время проверки. Текущий черновик сохранён; для него нужно новое согласие.', buttons: navigation } }
  delete w.job
  if (!feedback) { w.error = 'unavailable'; return { state, reply: { ...draftReply(state), text: 'Проверка сейчас недоступна. Текст сохранён, разбор не выдан. Повтори позже с новым согласием.\n\n' + disclosure } } }
  delete w.error
  w.submissions.push({ taskId: job.taskId, text: job.text, revision: job.revision, feedback, at: now.toISOString() })
  w.submissions = w.submissions.slice(-10)
  state.grammar ??= { pending: [], answered: 0, correct: 0 }
  for (const c of feedback.corrections) if (c.topic && !state.grammar.pending.includes(c.topic)) state.grammar.pending.push(c.topic)
  return { state, reply: writingFeedbackReply(job, feedback) }
}
export function transitionWriting(state: IeltsState, command: string, now: Date, id: string): IeltsReply | null {
  if (['/feedback', 'i:w:feedback'].includes(command)) {
    const last = state.writing?.submissions.filter(s => s.taskId === state.writing!.taskId).at(-1)
    return last ? writingFeedbackReply(last, last.feedback) : { text: 'Для выбранной темы ещё нет сохранённого разбора.', buttons: navigation }
  }
  if (['/writing', 'i:writing'].includes(command)) {
    state.skill = 'writing'
    return { text: 'IELTS Academic · Writing. Выбери Task 1 или Task 2. Черновики разных тем сохраняются.\n' + (state.writing ? `Текущая тема: ${writingTask(state.writing.taskId).title}. Можно продолжить текст или выбрать другую.\n\n${disclosure}` : 'После выбора пришли свой текст. До отдельного нажатия «Проверить с ИИ» он не отправляется в Groq.'), buttons: [...choices, ...(state.writing ? controls(state) : navigation)] }
  }
  const taskId = command.startsWith('i:w:task:') ? command.slice(9) : ''
  if (writingTasks.some(t => t.id === taskId)) {
    state.skill = 'writing'
    const old = state.writing
    if (!old) state.writing = { taskId, draft: '', revision: 1, submissions: [] }
    else if (old.taskId !== taskId) {
      old.drafts ??= {}; old.drafts[old.taskId] = old.draft
      old.taskId = taskId; old.draft = old.drafts[taskId] ?? ''; old.revision++; delete old.job; delete old.error
    }
    const task = writingTask(taskId)
    return { text: `${task.title}\n\n${task.prompt}\n\nМинимум ${task.minWords} слов.\nИсточник: ${task.source}\n\n${draftReply(state).text}`, buttons: controls(state) }
  }
  if (['/grammar', 'i:grammar'].includes(command)) {
    state.skill = 'grammar'
    state.grammar ??= { pending: [], answered: 0, correct: 0 }
    const pending = state.grammar.pending
    return { text: pending.length ? 'В разборе Writing отмечены темы для тренировки. Начни с них:' : 'Выбери тему для тренировки. Без разбора Writing это общая практика, не диагностика твоих ошибок.', buttons: [...(pending.length ? pending : grammarTopics).map(t => [{ text: grammarPractice[t].title, data: `i:g:topic:${t}` }]), ...navigation] }
  }
  const topic = command.startsWith('i:g:topic:') ? command.slice(10) as GrammarTopic : null
  if (topic && grammarTopics.includes(topic)) {
    state.skill = 'grammar'; state.grammar ??= { pending: [], answered: 0, correct: 0 }
    state.grammar.active = { id, topic }
    const q = grammarPractice[topic]
    return { text: `${q.title}\n\n${q.rule}\n\n${q.prompt}\n\n${q.source}`, buttons: q.choices.map((text, n) => [{ text, data: `i:g:a:${id}:${n}` }]) }
  }
  if (command.startsWith('i:g:a:')) {
    const m = /^i:g:a:([a-f0-9]{16}):([0-2])$/.exec(command), g = state.grammar
    if (!m || !g?.active || g.active.id !== m[1]) return { text: 'Эта грамматическая попытка уже завершена. Выбери новую тренировку.', buttons: navigation }
    const q = grammarPractice[g.active.topic], correct = Number(m[2]) === q.correct, topic = g.active.topic
    g.answered++; if (correct) { g.correct++; g.pending = g.pending.filter(t => t !== topic) } else if (!g.pending.includes(topic)) g.pending.push(topic)
    delete g.active
    return { text: `${correct ? 'Верно.' : `Верный ответ: ${q.choices[q.correct]}.`} ${q.explanation}`, buttons: [[{ text: 'Повторить правило', data: `i:g:topic:${topic}` }], ...navigation] }
  }
  const w = state.writing
  if (command === 'i:w:hint' || command === '/hint' && state.skill === 'writing') return w ? { text: writingTask(w.taskId).help, buttons: controls(state) } : { text: 'Сначала выбери тему Writing.', buttons: choices }
  if (['/draft', 'i:w:draft'].includes(command)) return w ? { text: w.draft ? `Твой текст · версия ${w.revision}\n\n${w.draft}` : 'Черновик пока пуст.', buttons: [[{ text: 'Продолжить Writing', data: 'i:writing' }]] } : { text: 'Сначала выбери тему Writing.', buttons: choices }
  if (command.startsWith('i:w:check:')) {
    if (!w || command !== `i:w:check:${w.revision}`) return { text: 'Это согласие относится к другой версии. Открой Writing и проверь текущую.', buttons: navigation }
    if (writingWordCount(w.draft) < 20) return { ...draftReply(state), text: 'Для полезного разбора нужно хотя бы 20 английских слов. Дополни текст.\n\n' + disclosure }
    if (w.job && now.getTime() - Date.parse(w.job.startedAt) < 45000) return { text: 'Эта версия уже проверяется. Текст сохранён; позже открой /feedback.', buttons: navigation }
    if (w.submissions.some(s => s.revision === w.revision)) return { text: 'Эта версия уже проверена. Открой /feedback или пришли исправленную версию.', buttons: navigation }
    const day = now.toISOString().slice(0, 10)
    if (w.usage?.day !== day) w.usage = { day, count: 0 }
    if (w.usage!.count >= 5) return { text: 'Сегодня использованы 5 попыток проверки. Черновик сохранён. Лимит обновится в 00:00 UTC; пока можно тренировать грамматику и Reading.', buttons: navigation }
    const prior = w.submissions.filter(s => s.taskId === w.taskId).at(-1)
    w.job = { id, taskId: w.taskId, revision: w.revision, text: w.draft, previousText: prior?.text, previousFeedback: prior?.feedback, startedAt: now.toISOString() }; w.usage!.count++
    return { text: 'Согласие принято. Проверяю текст; результат сохраню. Если сообщение не придёт, открой /feedback.', work: w.job }
  }
  if (state.skill === 'writing' && !command.startsWith('/') && !command.startsWith('i:')) {
    if (!w) return { text: 'Сначала выбери тему, затем пришли текст.', buttons: choices }
    if (!command.trim() || command.length > 3500) return { text: 'Пришли полную версию одним сообщением от 1 до 3500 знаков. Прежний черновик сохранён.', buttons: navigation }
    w.draft = command; w.revision++; delete w.job; delete w.error
    return draftReply(state)
  }
  return null
}
