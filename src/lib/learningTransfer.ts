import type { LearningProfile, Lesson, LearningAttempt, LearningRecord } from './learning'

export const blankProfile = (): LearningProfile => ({ source: 'self', sourceDate: '', summary: '', goal: '', strengths: [], completedTopics: [], focusAreas: [], nextStep: '', interests: '', dailyMinutes: 25, aiConsent: false })

export const transferPrompt = `Составь учебную сводку для продолжения моего английского в Study Hub. Используй только то, что действительно есть в этой переписке; не обещай доступ ко всей памяти аккаунта. Не добавляй контакты, документы, здоровье и другие личные сведения. Отличай пройденную тему от устойчивого навыка. Баллы тестов — только с названием и датой, неизвестное оставь пустым. Верни JSON без пояснений:
{"format":"studyhub-learning-profile","version":1,"profile":{"source":"chatgpt","sourceDate":"","summary":"Краткая история обучения, ошибки с примерами и что помогало; до 18000 символов","goal":"","strengths":[],"completedTopics":[],"focusAreas":[],"nextStep":"Где остановились и конкретное следующее упражнение","interests":"Без личных данных","dailyMinutes":25,"aiConsent":false}}
Не назначай IELTS band по небольшим упражнениям. Ученик проверит сводку перед импортом.`

/** Import is local and whitelisted. Raw chats cannot create trusted scores or instructions. */
export function parseLearningImport(raw: string): LearningProfile {
  const fenced = raw.match(/```json\s*([\s\S]*?)```/i)
  const value = (fenced?.[1] ?? raw).trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  if (!value) throw new Error('Вставьте учебную сводку.')
  if (value.length > 60000) throw new Error('Сводка слишком большая. Выберите только учебную часть (до 18 000 символов текста).')
  if (!value.startsWith('{') && !/^\[\s*(?:\{|\[|"|\])/.test(value)) {
    if (value.length > 18000) throw new Error('Сократите учебную сводку до 18 000 символов.')
    return { ...blankProfile(), source: 'chatgpt', summary: value }
  }
  let json: unknown
  try { json = JSON.parse(value) } catch { throw new Error('JSON повреждён. Исправьте файл или вставьте обычную текстовую сводку.') }
  if (!json || typeof json !== 'object' || Array.isArray(json)) throw new Error('Это не учебный профиль. Сначала получите краткую сводку по предложенному запросу.')
  const envelope = json as Record<string, unknown>
  const direct = envelope.format === undefined && typeof envelope.summary === 'string'
  if (!direct && (envelope.format !== 'studyhub-learning-profile' || envelope.version !== 1 || !envelope.profile || typeof envelope.profile !== 'object' || Array.isArray(envelope.profile))) throw new Error('В файле нет учебной сводки. Используйте запрос для ChatGPT выше или вставьте обычный текст об обучении. Полный архив чатов не подходит.')
  const p = direct ? envelope : envelope.profile as Record<string, unknown>
  const field = (key: string, max: number) => {
    if (p[key] === undefined) return ''
    if (typeof p[key] !== 'string' || p[key].length > max) throw new Error(`Проверьте поле ${key}: допустимо до ${max} символов.`)
    return p[key].trim()
  }
  const list = (key: string, count: number) => {
    if (p[key] === undefined) return []
    if (!Array.isArray(p[key]) || p[key].length > count || p[key].some(v => typeof v !== 'string' || v.length > 180)) throw new Error(`Проверьте список ${key}.`)
    return (p[key] as string[]).map(v => v.trim()).filter(Boolean)
  }
  const dailyMinutes = p.dailyMinutes ?? 25
  if (typeof dailyMinutes !== 'number' || !Number.isInteger(dailyMinutes) || dailyMinutes < 5 || dailyMinutes > 120) throw new Error('Время занятий должно быть от 5 до 120 минут.')
  return { source: ['chatgpt', 'teacher', 'self', 'other'].includes(String(p.source)) ? p.source as LearningProfile['source'] : 'other', sourceDate: field('sourceDate', 40), summary: field('summary', 18000), goal: field('goal', 400), strengths: list('strengths', 20), completedTopics: list('completedTopics', 30), focusAreas: list('focusAreas', 20), nextStep: field('nextStep', 600), interests: field('interests', 400), dailyMinutes, aiConsent: false }
}

export function suggestLearningLesson(profile: LearningProfile | undefined, lessons: Lesson[], attempts: LearningRecord<LearningAttempt>[]) {
  const next = (profile?.nextStep ?? '').toLowerCase()
  const aliases: [RegExp, string][] = [[/verb patterns|глагольн.*модел|day\s*8|день\s*8/i, 'verb-patterns'], [/complex|сложн.*предлож/i, 'complex-sentences'], [/collocation|предлог/i, 'collocations'], [/article|артикл/i, 'articles'], [/agreement|согласован/i, 'agreement'], [/tense|времен/i, 'tenses'], [/checkpoint|после паузы|повтор/i, 'checkpoint']]
  const requested = aliases.find(([pattern]) => pattern.test(next))?.[1]
  if (requested && !attempts.some(a => a.data.topicId === requested)) return lessons.find(l => l.id === requested) ?? lessons[0]
  const recent = attempts[0]
  if (recent && (recent.data.score.correct < recent.data.score.total || !recent.data.feedback)) return lessons.find(l => l.id === recent.data.topicId) ?? lessons[0]
  return lessons.find(l => !attempts.some(a => a.data.topicId === l.id) && !profile?.completedTopics.some(t => t.toLowerCase() === l.title.toLowerCase())) ?? lessons.find(l => l.id === 'checkpoint') ?? lessons[0]
}
