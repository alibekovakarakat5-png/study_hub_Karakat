import { randomUUID } from 'crypto'
import { ieltsBotMissions, ieltsBotQuestions } from './ieltsBotLessons'
import { transitionWriting } from './ieltsWritingFlow'
import type { WritingState, WritingJob, GrammarState } from './ieltsWriting'

export type IeltsReply = { text: string; buttons?: { text: string; data?: string; url?: string }[][]; work?: WritingJob }
export type IeltsAttempt = { id: string; mission: number; mode: 'practice' | 'review'; ids: string[]; answers: number[]; startedAt: string }
export type IeltsState = {
  version: 1; target: string | null; cursor: number; active: IeltsAttempt | null;
  correct: number; answered: number; reviewed: number; mistakes: string[];
  skill?: 'reading' | 'writing' | 'grammar'; writing?: WritingState; grammar?: GrammarState; completedMissions?: number[];
  history: { id: string; mode: 'practice' | 'review'; correct: number; total: number; at: string }[];
}
export const emptyIeltsState = (): IeltsState => ({ version: 1, target: null, cursor: 0, active: null, correct: 0, answered: 0, reviewed: 0, mistakes: [], history: [] })
const menu: NonNullable<IeltsReply['buttons']> = [
  [{ text: '📖 Reading', data: 'i:reading' }, { text: '✍️ Writing', data: 'i:writing' }],
  [{ text: '🎯 Моё задание', data: 'i:today' }],
  [{ text: '🛠 Разобрать ошибку', data: 'i:mistakes' }, { text: '📈 Мой прогресс', data: 'i:progress' }],
  [{ text: '⚙️ Изменить цель', data: 'i:goal' }],
  [{ text: '🧩 Грамматика', data: 'i:grammar' }],
]
const goals = (): IeltsReply => ({ text: 'Какой результат IELTS тебе нужен? Это твоя цель, не оценка текущего уровня. Мини-задания бота не определяют IELTS band.', buttons: [['6.0', '6.5', '7.0'], ['7.5', '8.0']].map(row => row.map(target => ({ text: target, data: 'i:goal:' + target }))) })
export const ieltsReadOnlyCommand = (command: string) => ['/progress', 'i:progress', '/help', '/privacy', '/feedback', 'i:w:feedback', '/draft', 'i:w:draft'].includes(command)
export function ieltsMembershipReply(channelUrl: string, unavailable = false): IeltsReply {
  return { text: unavailable ? 'Сейчас не удалось проверить подписку. Это не означает, что ты не подписан. Попробуй ещё раз; сохранённые результаты доступны через /progress.' : 'Чтобы получать задания, подпишись на канал Skylla.hub и нажми «Проверить подписку». Здесь будут практика, разборы и твой сохранённый прогресс.', buttons: [[{ text: 'Открыть канал', url: channelUrl }], [{ text: 'Проверить подписку', data: 'i:check' }]] }
}
export function isIeltsChannelMember(member: { status?: string; is_member?: boolean }) {
  return ['creator', 'administrator', 'member'].includes(member.status ?? '') || member.status === 'restricted' && member.is_member === true
}
function question(state: IeltsState): IeltsReply {
  const a = state.active!, index = a.answers.length, q = ieltsBotQuestions.find(q => q.id === a.ids[index])!
  return { text: `${a.mode === 'review' ? 'Возвращаемся к ошибке' : ieltsBotMissions[a.mission].title} · ${index + 1}/${a.ids.length}\n\n${q.passage ? q.passage + '\n\n' : ''}${q.prompt}\n\n${q.source ?? 'Авторская мини-практика, не официальный тест IELTS.'}`, buttons: [...q.choices.map((text, choice) => [{ text, data: `i:a:${a.id}:${index}:${choice}` }]), [{ text: '💡 Как искать ответ', data: 'i:r:hint' }], [{ text: '✍️ Writing', data: 'i:writing' }]] }
}
export function transitionIelts(previous: IeltsState, command: string, now = new Date(), attemptId = randomUUID().replace(/-/g, '').slice(0, 16)): { state: IeltsState; reply: IeltsReply } {
  const state = structuredClone(previous), result = (reply: IeltsReply) => ({ state, reply })
  state.completedMissions ??= Array.from({ length: Math.min(state.cursor, ieltsBotMissions.length) }, (_, i) => i)
  if (command === '/privacy') return result({ text: 'Бот хранит Telegram ID, цель, ответы Reading, черновики Writing, историю разборов и результаты грамматики. В боте доступны последние 10 разборов. При нажатии «Проверить с ИИ» в Groq отправляются условие, текст и предыдущая проверенная версия с разбором. Telegram ID, имя профиля и телефон не передаются; не включай личные данные в эссе. Отписка не удаляет результаты: /progress, /draft, /feedback доступны. Данные пока не связаны с аккаунтом сайта. По вопросам удаления обратись к владельцу канала.' })
  if (command === '/help') return result({ text: 'IELTS Academic: /reading — тексты и вопросы, /writing — Task 1 и Task 2, /hint — помощь, /draft — сохранённый текст, /feedback — разбор, /grammar — грамматика, /today — продолжить Reading, /mistakes — повтор ошибок Reading, /progress — результаты, /goal — цель, /privacy — данные. Writing проверяется ИИ только после согласия: до 5 попыток в сутки UTC, без официального band. Есть 7 занятий Reading/Vocabulary, 3 темы Writing и 3 грамматических правила. Speaking, Listening и полного пробника пока нет.', buttons: menu })
  if (command === '/progress' || command === 'i:progress') return result({ text: `Цель: ${state.target ?? 'не выбрана'}\nЗавершено мини-занятий: ${state.completedMissions.length}/${ieltsBotMissions.length}\nПервые ответы: ${state.correct}/${state.answered} верно\nОшибок на повторение: ${state.mistakes.length}\nУспешных повторений: ${state.reviewed}\n${state.active ? 'Есть незавершённое задание — /today продолжит его.' : 'Новое задание — /today.'}\n\nWriting: ${state.writing?.submissions.length ?? 0} сохранённых разборов; текущая версия ${state.writing?.revision ?? 0}.\nГрамматика: ${state.grammar?.correct ?? 0}/${state.grammar?.answered ?? 0}; тем на повтор: ${state.grammar?.pending.length ?? 0}.\nЭто результаты практики, не прогноз IELTS band. Последние результаты:\n${state.history.slice(-5).map(h => `${h.at.slice(0, 10)} · ${h.mode === 'review' ? 'повтор' : 'практика'} · ${h.correct}/${h.total}`).join('\n') || 'Пока нет завершённых попыток.'}`, buttons: menu })
  if (command === '/goal' || command === 'i:goal') return result(goals())
  if (/^i:goal:(6\.0|6\.5|7\.0|7\.5|8\.0)$/.test(command)) { state.target = command.slice(7); return result({ text: `Цель ${state.target} сохранена. Прежние результаты и незавершённое задание сохранены. Начнём с короткой практики и разберём каждую ошибку.`, buttons: menu }) }
  if (!state.target) return result(goals())
  const writingReply = transitionWriting(state, command, now, attemptId)
  if (writingReply) return result(writingReply)
  if (['/reading', 'i:reading'].includes(command)) { state.skill = 'reading'; return result({ text: 'Reading · выбери короткую практику или текст из книги. Незавершённая попытка продолжится с сохранённого вопроса.', buttons: [[{ text: 'Продолжить мини-практику', data: 'i:today' }], [{ text: 'Из книги · International English Students', data: 'i:lesson:6' }], ...menu] }) }
  if (command === 'i:r:hint' || command === '/hint') return result({ text: 'Найди ключевые слова вопроса и их перефразирование в тексте. Для True требуется подтверждение; False — прямое противоречие; Not Given — данных недостаточно. Проверяй слова only, all, most и сравнения. Не используй знания вне текста.', buttons: [[{ text: 'Вернуться к вопросу', data: 'i:today' }], ...menu] })
  if (command.startsWith('i:a:')) {
    const match = command.match(/^i:a:([a-f0-9]{16}):(\d+):([0-2])$/), active = state.active
    if (!match || !active || active.id !== match[1] || active.answers.length !== Number(match[2])) return result({ text: 'Этот вопрос уже отвечен или относится к другой попытке. Нажми «Моё задание», чтобы продолжить с сохранённого места.', buttons: menu })
    const q = ieltsBotQuestions.find(q => q.id === active.ids[active.answers.length])!, answer = Number(match[3]), correct = answer === q.correct
    active.answers.push(answer)
    if (active.mode === 'practice') { state.answered++; if (correct) state.correct++ }
    if (correct) { state.mistakes = state.mistakes.filter(id => id !== q.id); if (active.mode === 'review') state.reviewed++ }
    else if (!state.mistakes.includes(q.id)) state.mistakes.push(q.id)
    let text = `${correct ? 'Верно.' : `Верный ответ: ${q.choices[q.correct]}.`}\n${q.explanation}`
    if (active.answers.length === active.ids.length) {
      const score = active.answers.filter((a, i) => a === ieltsBotQuestions.find(q => q.id === active.ids[i])!.correct).length
      state.history.push({ id: active.id, mode: active.mode, correct: score, total: active.ids.length, at: now.toISOString() }); state.history = state.history.slice(-100)
      if (active.mode === 'practice') {
        if (!state.completedMissions.includes(active.mission)) state.completedMissions.push(active.mission)
        while (state.completedMissions.includes(state.cursor)) state.cursor++
      }
      state.active = null; text += `\n\nСохранено: ${score}/${active.ids.length}. ${state.mistakes.length ? 'Следующий полезный шаг — разобрать ошибку.' : 'Можно переходить к следующей мини-практике.'}`
    } else text += '\n\nОтвет сохранён. Нажми «Моё задание» для следующего вопроса.'
    return result({ text, buttons: menu })
  }
  if (['/today', 'i:today', '/mistakes', 'i:mistakes', 'i:lesson:6'].includes(command)) {
    state.skill = 'reading'
    if (state.active) return result(question(state))
    const review = command.endsWith('mistakes')
    if (review && !state.mistakes.length) return result({ text: 'Ошибок на повторение пока нет. Продолжай практику.', buttons: menu })
    if (!review && command !== 'i:lesson:6' && state.cursor >= ieltsBotMissions.length) return result({ text: 'Все доступные занятия завершены. Можно повторить ошибки, заново пройти текст из книги или перейти к Writing.', buttons: menu })
    const mission = command === 'i:lesson:6' ? 6 : state.cursor
    state.active = { id: attemptId, mission, mode: review || state.completedMissions.includes(mission) ? 'review' : 'practice', ids: review ? [state.mistakes[0]] : ieltsBotMissions[mission].ids, answers: [], startedAt: now.toISOString() }
    return result(question(state))
  }
  return result({ text: 'Твой учебный маршрут сохранён. Выбери задание или разбор ошибки. Мини-практика не определяет IELTS band.', buttons: menu })
}
