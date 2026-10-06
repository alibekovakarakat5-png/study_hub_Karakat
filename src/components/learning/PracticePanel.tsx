import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { learningApi, suggestLearningLesson } from '@/lib/learning'
import type { LearningAttempt, LearningDraft, LearningRecord, LearningState } from '@/lib/learning'

const field = 'w-full rounded-xl border border-slate-600 bg-slate-950 p-3'
const button = 'rounded-xl bg-blue-600 px-4 py-2.5 disabled:opacity-40'
export default function PracticePanel({ state, onAttempt, onDraft }: { state: LearningState; onAttempt: (a: LearningRecord<LearningAttempt>) => void; onDraft: (d: LearningRecord<LearningDraft>) => void }) {
  const suggested = suggestLearningLesson(state.memory?.data, state.curriculum, state.attempts)
  const fresh = (topicId: string): LearningDraft => ({ topicId, writing: '', reflection: '', answers: Array(state.curriculum.find(l => l.id === topicId)?.quiz.length ?? 0).fill(-1), parentId: null })
  const [draft, setDraft] = useState<LearningDraft>(() => state.draft?.data ?? fresh(suggested.id))
  const [mode, setMode] = useState<'light' | 'standard'>('standard')
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [notice, setNotice] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [retry, setRetry] = useState(0)
  const [changeTo, setChangeTo] = useState<string | null>(null)
  const revision = useRef(state.draft?.revision ?? 0)
  const saved = useRef(state.draft ? JSON.stringify(state.draft.data) : '')
  const saveLock = useRef(false)
  const actionLock = useRef(false)
  const attemptRequest = useRef<{ value: string; id: string } | null>(null)
  const memoryRevision = useRef(state.memory?.revision ?? 0)
  const latest = useRef(draft)
  latest.current = draft
  const lesson = state.curriculum.find(l => l.id === draft.topicId) ?? suggested
  const dirty = JSON.stringify(draft) !== saved.current
  const parent = state.attempts.find(a => a.data.id === draft.parentId)
  const selectedAttempt = state.attempts.find(a => a.id === selected)

  useEffect(() => {
    // A newly imported next step replaces an untouched starter, never a learner's work.
    if (memoryRevision.current === (state.memory?.revision ?? 0)) return
    memoryRevision.current = state.memory?.revision ?? 0
    if (!draft.writing && !draft.reflection && draft.answers.every(a => a < 0) && draft.topicId !== suggested.id) {
      setDraft({ topicId: suggested.id, writing: '', reflection: '', answers: Array(suggested.quiz.length).fill(-1), parentId: null })
    }
  }, [state.memory?.revision, suggested.id, suggested.quiz.length, draft])

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (JSON.stringify(latest.current) !== saved.current) e.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [])
  useEffect(() => {
    if (!dirty || saveLock.current || saveError) return
    const timeout = setTimeout(async () => {
      saveLock.current = true; setSaving(true)
      const snapshot = latest.current
      try {
        const { record } = await learningApi.draft(snapshot, revision.current)
        revision.current = record.revision; saved.current = JSON.stringify(snapshot); onDraft(record)
      } catch (e) { setSaveError((e as Error).message) }
      finally { saveLock.current = false; setSaving(false) }
    }, 900)
    return () => clearTimeout(timeout)
  }, [draft, dirty, saving, saveError, retry, onDraft])

  async function submit() {
    if (actionLock.current) return
    actionLock.current = true; setBusy(true); setError(''); setNotice('')
    const snapshot = JSON.stringify({ ...draft, mode })
    if (attemptRequest.current?.value !== snapshot) attemptRequest.current = { value: snapshot, id: crypto.randomUUID() }
    try { const { record } = await learningApi.attempt(draft, attemptRequest.current.id, mode); onAttempt(record); setSelected(record.id); setNotice('Работа сохранена. Мини-тест проверен, свободный текст пока не оценён.'); }
    catch (e) { setError((e as Error).message) } finally { setBusy(false); actionLock.current = false }
  }
  async function feedback(attempt: LearningRecord<LearningAttempt>) {
    if (actionLock.current) return
    actionLock.current = true; setBusy(true); setError('')
    try { const { record } = await learningApi.feedback(attempt.data.id); onAttempt(record); setSelected(record.id) }
    catch (e) { setError((e as Error).message) } finally { setBusy(false); actionLock.current = false }
  }
  return <div className="space-y-6">
    <div className="rounded-2xl bg-blue-950/40 p-5 space-y-3"><h2 className="text-xl font-semibold">Сегодня: точнее → естественнее → устойчивее</h2><p>{state.memory?.data.nextStep ? `Из вашей сводки: ${state.memory.data.nextStep}` : 'Начните с короткого текста или перенесите прошлое обучение на вкладке «Память».'}</p><p className="text-sm text-slate-300">{state.draft ? 'Открыт сохранённый черновик.' : `Предложено: ${suggested.title}.`} Темы можно выбирать. Это стартовая практика английского для IELTS, не полный экзамен.</p></div>
    <div className="flex flex-wrap gap-4"><label>Занятие<select aria-label="Занятие" className={`${field} mt-1`} value={draft.topicId} disabled={busy || saving} onChange={e => { if (draft.writing || draft.reflection || draft.answers.some(a => a !== -1)) setChangeTo(e.target.value); else { setDraft(fresh(e.target.value)); setSelected(null) } }}>{state.curriculum.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}</select></label><label>Нагрузка<select aria-label="Нагрузка занятия" className={`${field} mt-1`} value={mode} disabled={busy} onChange={e => setMode(e.target.value as typeof mode)}><option value="standard">Обычный день · {lesson.minutes} минут</option><option value="light">Лёгкий день · 10 минут</option></select></label></div>
    {changeTo && <div role="alert" className="rounded-xl border border-amber-700 p-4"><p>Смена темы очистит поля текущего черновика. Сохранённые попытки останутся в истории. При необходимости сначала нажмите «Сохранить попытку».</p><button className="mr-4 text-amber-300 underline" onClick={() => { setDraft(fresh(changeTo)); setSelected(null); setChangeTo(null) }}>Перейти и очистить черновик</button><button onClick={() => setChangeTo(null)}>Остаться</button></div>}
    <article className="rounded-2xl border border-slate-700 p-5 space-y-5">
      <h2 className="text-2xl font-semibold">{lesson.title}</h2>
      <p>{lesson.rule}</p><p className="rounded-xl bg-blue-950 p-3 text-blue-200">{lesson.mnemonic}</p>
      <ul className="space-y-2 list-disc pl-5" lang="en">{lesson.examples.map(example => <li key={example}>{example}</li>)}</ul>
      <h3 className="font-semibold">Вспомните без подсказки</h3>
      {lesson.quiz.map((q, i) => <fieldset key={q.text} className="space-y-2"><legend>{i + 1}. {q.text}</legend>{q.options.map((option, j) => <label className="inline-flex gap-2 mr-5" key={option}><input type="radio" name={`coach-${lesson.id}-${i}`} disabled={busy} checked={draft.answers[i] === j} onChange={() => setDraft(d => ({ ...d, answers: d.answers.map((a, n) => n === i ? j : a) }))} />{option}</label>)}</fieldset>)}
      <h3 className="font-semibold">Теперь ваш текст</h3><p>{mode === 'light' ? 'Напишите 2–3 собственных предложения с правилом занятия. Большой текст можно оставить на другой день.' : lesson.writingPrompt}</p>
      {parent && <details><summary className="cursor-pointer text-blue-300">Предыдущая версия — сравнить</summary><p className="whitespace-pre-wrap mt-3">{parent.data.writing}</p>{parent.data.feedback && <ReactMarkdown>{parent.data.feedback}</ReactMarkdown>}</details>}
      <label className="block">Моя работа<textarea aria-label="Моя работа" className={field} rows={8} maxLength={12000} disabled={busy} value={draft.writing} onChange={e => setDraft(d => ({ ...d, writing: e.target.value }))} /></label>
      <p className="text-sm text-slate-400">{draft.writing.trim() ? draft.writing.trim().split(/\s+/).length : 0} слов · {saving ? 'Сохраняем черновик…' : dirty ? 'Черновик ещё не сохранён' : 'Черновик сохранён в аккаунте'}</p>
      {saveError && <div role="alert" className="rounded-xl bg-red-950 p-3"><p>Черновик не сохранён: {saveError}</p><button className="text-blue-300 underline" onClick={() => { setSaveError(''); setRetry(n => n + 1) }}>Повторить сохранение</button><p className="text-xs">Если другая вкладка сохранила новую версию, скопируйте свой текст перед обновлением страницы.</p></div>}
      <details><summary className="cursor-pointer text-blue-300">Устная практика · {mode === 'light' ? '1' : '1–2'} минуты</summary><p className="mt-3">{lesson.speakingPrompt}</p><p className="text-sm text-slate-400 mt-2">Произнесите ответ вслух, запишите себя своим диктофоном и повторите. В этом занятии аудио не загружается и не оценивается.</p></details>
      <label className="block">Что получилось, где запнулся и что хочу исправить<textarea aria-label="Что получилось, где запнулся и что хочу исправить" className={field} rows={3} maxLength={2000} disabled={busy} value={draft.reflection} onChange={e => setDraft(d => ({ ...d, reflection: e.target.value }))} /></label>
      <p>Фразы для активного использования: <span className="text-blue-300">{lesson.chunks.join(' · ')}</span></p>
      <button className={button} disabled={busy || draft.answers.some(a => a < 0) || draft.writing.trim().length < 30} onClick={() => void submit()}>Сохранить попытку и проверить мини-тест</button>
    </article>
    {notice && <p role="status" className="text-emerald-300">{notice}</p>}{error && <p role="alert" className="rounded-xl bg-red-950 p-3 text-red-200">{error}</p>}
    <section className="space-y-4"><h2 className="text-xl font-semibold">Мои работы и повторные попытки</h2><p className="text-sm text-slate-400">Последние 100 работ. Результат мини-теста показывает ответы в этом упражнении, не освоение темы или IELTS band.</p>{!state.attempts.length && <p>Пока нет сохранённых попыток.</p>}
      {state.attempts.map(a => <article key={a.id} className="rounded-xl border border-slate-700 p-4 space-y-3"><button className="w-full text-left" onClick={() => setSelected(selected === a.id ? null : a.id)}><span className="font-semibold">{state.curriculum.find(l => l.id === a.data.topicId)?.title}</span><span className="block text-sm text-slate-400">{new Date(a.data.createdAt).toLocaleString()} · мини-тест {a.data.score.correct}/{a.data.score.total} · {a.data.parentId ? 'повторная работа' : 'первая версия'} · {a.data.feedback ? 'есть разбор ИИ' : 'текст ещё не разобран'}</span></button>
        {selectedAttempt?.id === a.id && <><p className="whitespace-pre-wrap">{a.data.writing}</p><details><summary>Ответы и объяснения мини-теста</summary>{state.curriculum.find(l => l.id === a.data.topicId)?.quiz.map((q, i) => <p className="mt-2" key={q.text}>{a.data.answers[i] === q.answer ? '✓' : '○'} {q.text} — {q.options[q.answer]}. {q.why}</p>)}</details>{a.data.feedback ? <div className="rounded-xl bg-slate-800 p-4 space-y-3"><p className="text-sm text-amber-200">Тренировочный разбор ИИ</p><ReactMarkdown>{a.data.feedback}</ReactMarkdown></div> : <button className={button} disabled={busy || !state.memory?.data.aiConsent} onClick={() => void feedback(a)}>Получить разбор Skylla</button>}<button className="block text-blue-300 underline" disabled={busy || saving || dirty} onClick={() => { setDraft({ topicId: a.data.topicId, answers: [...a.data.answers], writing: a.data.writing, reflection: '', parentId: a.data.id }); attemptRequest.current = null; setNotice('Редактируйте текст выше. Новая попытка сохранится отдельно от предыдущей.') }}>Доработать эту работу</button><p className="text-xs text-slate-400">Ошибка повторяется? Добавьте её своими словами во вкладку «Ошибки и фразы».</p></>}
      </article>)}
    </section>
  </div>
}
