import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { api, classesApi, assignmentsApi, type DBClass, type DBAssignment, type DBSubmission, type ClassProgressEntry } from '@/lib/api'
import LessonRenderer from '@/components/LessonRenderer'

type Question = { id?: string; text: string; options: string[]; correctAnswer?: number; explanation?: string; topic?: string }
type Content = { theory?: string; text?: string; questions?: Question[]; quiz?: Question[]; minutes?: number; stage?: string; rubric?: string }
const card = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'
const button = 'rounded-xl bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-50'
const field = 'w-full rounded-xl border border-slate-300 p-3 text-slate-900'
const message = (error: unknown) => error instanceof Error ? error.message : 'Не удалось выполнить действие. Попробуйте ещё раз.'

export default function Classroom() {
  const user = useStore(s => s.user)
  return <ClassroomAccount key={user?.id} userId={user?.id ?? ''} curator={user?.role === 'admin' || user?.role === 'teacher'} />
}

function ClassroomAccount({ userId, curator }: { userId: string; curator: boolean }) {
  const [params, setParams] = useSearchParams()
  const [classes, setClasses] = useState<DBClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)
  const [code, setCode] = useState('')
  const [joining, setJoining] = useState(false)
  const selected = classes.find(c => c.id === params.get('class')) ?? classes[0]
  useEffect(() => {
    let active = true
    setLoading(true); setError('')
    classesApi.list().then(data => { if (active) setClasses(data.classes) }).catch(e => { if (active) setError(message(e)) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [version])
  async function join(e: React.FormEvent) {
    e.preventDefault(); setJoining(true); setError('')
    try { const data = await classesApi.join(code); setParams({ class: data.class.id }); setCode(''); setVersion(v => v + 1) }
    catch (e) { setError(message(e)) } finally { setJoining(false) }
  }
  return <main className="min-h-screen bg-indigo-50/50 text-slate-900 px-4 py-7">
    <div className="max-w-5xl mx-auto space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-indigo-700 text-sm font-semibold">Study Hub · занятия с куратором</p><h1 className="text-3xl font-bold mt-1">{curator ? 'Мой учебный класс' : 'Мои занятия'}</h1></div><nav className="flex gap-4 text-sm text-indigo-700"><Link to="/dashboard">Главная</Link>{curator && <Link to="/teacher">Управление классами</Link>}<Link to="/settings">Аккаунт</Link></nav></header>
      {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{error}<button className="ml-3 underline" onClick={() => setVersion(v => v + 1)}>Обновить</button></div>}
      {!curator && <form onSubmit={join} className={`${card} flex flex-wrap items-end gap-3`}><label className="text-sm flex-1 min-w-48">Приглашение от куратора<input aria-label="Код класса" className={`${field} mt-1 uppercase`} value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={6} placeholder="Код из 6 символов" /></label><button className={button} disabled={joining || code.length !== 6}>Присоединиться</button></form>}
      {classes.length > 1 && <label className="block text-sm">Класс<select className={`${field} mt-1 bg-white`} value={selected?.id ?? ''} onChange={e => setParams({ class: e.target.value })}>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>}
      {loading ? <p role="status">Загружаем занятия…</p> : selected ? <ClassRoom key={`${selected.id}:${version}`} initial={selected} userId={userId} curator={curator} /> : !error && <div className={card}>{curator ? <p>Классов пока нет. <Link to="/teacher" className="text-indigo-700 underline">Создать класс</Link></p> : <p>Введи код приглашения — здесь появятся твои занятия и результаты.</p>}</div>}
    </div>
  </main>
}

function ClassRoom({ initial, userId, curator }: { initial: DBClass; userId: string; curator: boolean }) {
  const [cls, setClass] = useState(initial)
  const [progress, setProgress] = useState<ClassProgressEntry[]>([])
  const [date, setDate] = useState(initial.targetDate?.slice(0, 10) ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [opened, setOpened] = useState<string | null>(null)
  const [version, setVersion] = useState(0)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    let active = true
    setError(''); setLoaded(false)
    classesApi.get(initial.id).then(data => {
      if (active) { setClass(data.class); setProgress(data.progress ?? []); setDate(data.class.targetDate?.slice(0, 10) ?? ''); setLoaded(true) }
    }).catch(e => { if (active) setError(message(e)) })
    return () => { active = false }
  }, [initial.id, version])
  async function saveDate(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setNotice('')
    try {
      const result = await api.patch<{ targetDate: string | null }>(`/classes/${cls.id}/goal`, { targetDate: date || null })
      setClass(c => ({ ...c, targetDate: result.targetDate })); setNotice('Дата сохранена. Её можно изменить снова; задания остаются доступными.')
    } catch (e) { setError(message(e)) } finally { setBusy(false) }
  }
  const assignments = [...(cls.assignments ?? [])].sort((a, b) => a.title.localeCompare(b.title, 'ru'))
  const ownSubmissions = new Map((cls.assignments ?? []).map(a => [a.id, a.submissions?.[0]]))
  return <>
    <section className={card}><h2 className="text-xl font-bold">{cls.name}</h2><p className="text-slate-600 text-sm mt-2">{cls.description}</p>
      {curator ? <form onSubmit={saveDate} className="flex flex-wrap gap-3 items-end mt-4"><label className="text-sm">Ориентир по дате<input aria-label="Дата подготовки" type="date" className={`${field} mt-1`} value={date} onChange={e => setDate(e.target.value)} /></label><button className={button} disabled={busy}>Сохранить дату</button><p className="w-full text-xs text-slate-500">Дата пока ориентировочная. Можно перенести или очистить; сроки отдельных заданий не меняются.</p></form> : <p className="mt-4 text-sm font-medium text-indigo-700">Ориентир: {cls.targetDate ? new Date(cls.targetDate).toLocaleDateString('ru-RU', { timeZone: 'UTC' }) : 'куратор уточнит дату'}. Доступ к заданиям после этой даты сохраняется.</p>}
      {curator && <p className="mt-4 text-sm">Код приглашения: <strong className="font-mono">{cls.inviteCode}</strong> · <Link to="/classroom" className="text-indigo-700 underline">Вход ученицы в класс</Link></p>}
    </section>
    {notice && <p role="status" className="text-green-800">{notice}</p>}{error && <div role="alert" className="text-red-800">{error}<button className="ml-3 underline" onClick={() => setVersion(v => v + 1)}>Повторить</button></div>}
    {curator && loaded && <section className={card}><h2 className="font-bold text-lg mb-3">Результаты ученицы</h2>{!cls.members?.length ? <p className="text-sm text-slate-500">Пока никто не присоединился. Результаты появятся после сдачи работ.</p> : cls.members.map(m => { const p = progress.find(p => p.studentId === m.student.id); return <div key={m.id} className="flex flex-wrap gap-3 justify-between py-3 border-t border-slate-100"><strong>{m.student.name}</strong><span>Сдано {p?.submitted ?? 0} / {p?.total ?? assignments.length}</span><span>Средний результат: {p?.avgScore == null ? 'пока нет оценок' : `${p.avgScore}%`}</span></div> })}<p className="text-xs text-slate-500 mt-3">Процент отражает только выполненные задания. Это не уровень CEFR и не прогноз места на олимпиаде. Открой работу, чтобы увидеть конкретные ошибки.</p></section>}
    {opened ? <AssignmentView key={opened} id={opened} userId={userId} curator={curator} close={() => { setOpened(null); setVersion(v => v + 1) }} /> : <section className="space-y-3"><div><h2 className="text-xl font-bold">Маршрут подготовки</h2><p className="text-sm text-slate-600 mt-1">Сначала стартовая работа, затем уроки и повторение. Необязательно делать всё за один день.</p></div>{!loaded && !error && <p role="status">Загружаем маршрут…</p>}{loaded && !assignments.length && <p className={card}>Куратор ещё не добавил задания.</p>}{assignments.map((a, index) => <button key={a.id} onClick={() => setOpened(a.id)} className={`${card} w-full text-left hover:border-indigo-400 flex justify-between gap-3`}><span><span className="text-xs text-indigo-700 font-semibold">Шаг {index + 1} · {a.type === 'test' ? 'Проверка' : a.type === 'reading' ? 'Урок и практика' : 'Письменная работа'}</span><strong className="block mt-1">{a.title}</strong></span><span className="text-sm text-indigo-700 shrink-0">{curator ? 'Работы и разбор →' : ownSubmissions.get(a.id) ? 'Результат →' : 'Открыть →'}</span></button>)}</section>}
  </>
}

function AssignmentView({ id, userId, curator, close }: { id: string; userId: string; curator: boolean; close: () => void }) {
  const [assignment, setAssignment] = useState<DBAssignment | null>(null)
  const [submission, setSubmission] = useState<DBSubmission | null>(null)
  const [results, setResults] = useState<DBSubmission[]>([])
  const [answers, setAnswers] = useState<number[]>([])
  const [writing, setWriting] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [retry, setRetry] = useState(0)
  const [ready, setReady] = useState(false)
  const draftKey = `studyhub-classroom:${userId}:${id}`
  useEffect(() => {
    let active = true
    setError(''); setReady(false)
    const load = curator ? assignmentsApi.results(id).then(r => ({ assignment: r.assignment, submission: null, results: r.submissions })) : assignmentsApi.get(id).then(r => ({ ...r, results: [] }))
    load.then(r => {
      if (!active) return
      const content = r.assignment.content as Content
      let draft: { answers?: number[]; writing?: string } = {}
      try { draft = JSON.parse(localStorage.getItem(draftKey) ?? '{}') } catch { /* a missing draft does not block a saved result */ }
      setAssignment(r.assignment); setSubmission(r.submission ?? null); setResults(r.results)
      const questions = content.questions ?? content.quiz ?? []
      setAnswers(questions.map((q, i) => { const v = draft.answers?.[i]; return Number.isInteger(v) && v! >= 0 && v! < q.options.length ? v! : -1 }))
      setWriting(typeof draft.writing === 'string' ? draft.writing : ''); setReady(true)
    }).catch(e => { if (active) setError(message(e)) })
    return () => { active = false }
  }, [id, curator, draftKey, retry])
  useEffect(() => {
    if (ready && !curator && !submission) { try { localStorage.setItem(draftKey, JSON.stringify({ answers, writing })) } catch { /* saving the submitted work still works */ } }
  }, [answers, writing, ready, curator, submission, draftKey])
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!assignment) return
    setBusy(true); setError('')
    try {
      const content = assignment.content as Content
      const r = await assignmentsApi.submit(id, (content.questions ?? content.quiz ?? []).length ? answers : { text: writing })
      setSubmission(r.submission)
      try { localStorage.removeItem(draftKey) } catch { /* server submission is authoritative */ }
      setRetry(v => v + 1)
    } catch (e) { setError(message(e)) } finally { setBusy(false) }
  }
  const content = (assignment?.content ?? {}) as Content
  const questions = content.questions ?? content.quiz ?? []
  return <section className={`${card} space-y-5`}>
    <button onClick={close} className="text-indigo-700 underline text-sm">← К маршруту</button>
    {error && <p role="alert" className="text-red-700">{error} <button onClick={() => setRetry(v => v + 1)} className="underline">Загрузить работу снова</button></p>}
    {!ready ? !error && <p role="status">Загружаем работу…</p> : <>
      <div><h2 className="text-xl font-bold">{assignment?.title}</h2><p className="mt-2 text-sm text-slate-600">{assignment?.description}</p>{content.minutes && <p className="text-xs text-indigo-700 mt-2">Около {content.minutes} минут · можно заниматься в своём темпе</p>}</div>
      {(content.theory || content.text) && <LessonRenderer markdown={content.theory || content.text || ''} />}
      {content.rubric && <div className="bg-indigo-50 rounded-xl p-4 text-sm whitespace-pre-wrap"><strong>Как оценивается работа</strong><p className="mt-2">{content.rubric}</p></div>}
      {curator ? <><h3 className="font-bold">Ответы и объяснения для куратора</h3><AnswerReview questions={questions} />
        <h3 className="font-bold text-lg">Сданные работы ({results.length})</h3>{!results.length && <p className="text-slate-500 text-sm">Результатов пока нет — они появятся после сдачи.</p>}{results.map(s => <CuratorResult key={s.id} assignmentId={id} initial={s} questions={questions} />)}
      </> : submission ? <><div className="rounded-xl bg-emerald-50 p-4"><h3 className="font-bold">Работа сохранена{typeof submission.score === 'number' ? ` · ${submission.score}%` : ' · ждёт проверки куратора'}</h3><p className="text-sm mt-2">Первая попытка остаётся в журнале. Для повторения используй следующий шаг с новыми вопросами.</p></div><AnswerReview questions={questions} submission={submission} />{!questions.length && <p className="whitespace-pre-wrap bg-slate-50 p-4 rounded-xl">{String((submission.answers as { text?: string }).text ?? '')}</p>}<div className="border-l-4 border-indigo-400 pl-4"><strong>Комментарий куратора</strong><p className="mt-1 whitespace-pre-wrap">{submission.feedback || 'Пока нет комментария.'}</p></div></> : <form onSubmit={submit} className="space-y-6">
        <p className="text-xs text-slate-500">Черновик сохраняется на этом устройстве. После сдачи результат будет доступен в аккаунте. Разбор откроется после ответа на все вопросы.</p>
        {questions.length ? questions.map((q, i) => <fieldset key={q.id ?? i} className="rounded-xl border border-slate-200 p-4"><legend className="px-1 font-medium">{i + 1}. {q.text}</legend><div className="space-y-2 mt-2">{q.options.map((option, index) => <label key={index} className={`flex gap-3 items-start cursor-pointer rounded-xl border p-3 ${answers[i] === index ? 'bg-indigo-50 border-indigo-500' : 'border-slate-200'}`}><input type="radio" name={`question-${i}`} value={index} checked={answers[i] === index} onChange={() => setAnswers(a => a.map((v, j) => i === j ? index : v))} className="mt-1" /><span>{option}</span></label>)}</div></fieldset>) : <label className="block font-medium">Моя работа<textarea className={`${field} mt-2 font-normal`} rows={9} maxLength={10000} value={writing} onChange={e => setWriting(e.target.value)} /></label>}
        <button className={button} disabled={busy || (questions.length ? answers.some(v => v < 0) : !writing.trim())}>{busy ? 'Сохраняем…' : 'Сдать и посмотреть разбор'}</button>
      </form>}
    </>}
  </section>
}

function AnswerReview({ questions, submission }: { questions: Question[]; submission?: DBSubmission }) {
  const answers = Array.isArray(submission?.answers) ? submission.answers as unknown as number[] : []
  const topics = [...new Set(questions.map(q => q.topic).filter(Boolean))]
  return <div className="space-y-3">
    {!!submission && !!topics.length && <div className="flex flex-wrap gap-2" aria-label="Результаты по темам">{topics.map(topic => { const indexes = questions.flatMap((q, i) => q.topic === topic ? [i] : []); return <span key={topic} className="rounded-full bg-slate-100 px-3 py-1 text-xs">{topic}: {indexes.filter(i => answers[i] === questions[i].correctAnswer).length}/{indexes.length}</span> })}</div>}
    {questions.map((q, i) => <div key={q.id ?? i} className={`rounded-xl p-4 border ${submission && answers[i] !== q.correctAnswer ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}><h4 className="font-medium">{i + 1}. {q.text}</h4>{submission && <p className="text-sm mt-2">Твой ответ: {q.options[answers[i]] ?? 'нет ответа'} {answers[i] === q.correctAnswer ? '✓' : '— разберём'}</p>}<p className="text-sm mt-2 font-semibold">Верный ответ: {typeof q.correctAnswer === 'number' ? q.options[q.correctAnswer] : 'разбор загружается'}</p><p className="text-sm mt-2 whitespace-pre-wrap">{q.explanation || 'Куратор добавит пояснение.'}</p></div>)}
  </div>
}

function CuratorResult({ assignmentId, initial, questions }: { assignmentId: string; initial: DBSubmission; questions: Question[] }) {
  const [saved, setSaved] = useState(initial)
  const [score, setScore] = useState(initial.score == null ? '' : String(initial.score))
  const [feedback, setFeedback] = useState(initial.feedback ?? '')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setNotice(''); setError('')
    try { const result = await assignmentsApi.grade(assignmentId, initial.id, Number(score), feedback); setSaved(result.submission); setNotice('Оценка и комментарий сохранены. Ученица увидит их в своей работе.') }
    catch (e) { setError(message(e)) } finally { setBusy(false) }
  }
  return <article className="border border-indigo-200 rounded-xl p-4 space-y-4"><h4 className="font-bold">{initial.student?.name ?? 'Ученица'} · {saved.score == null ? 'на проверке' : `${saved.score}%`}</h4><p className="text-xs text-slate-500">{new Date(initial.submittedAt).toLocaleString('ru-RU')}</p><AnswerReview questions={questions} submission={initial} />{!questions.length && <p className="whitespace-pre-wrap">{String((initial.answers as { text?: string }).text ?? '')}</p>}
    <form onSubmit={save} className="space-y-3"><label className="block text-sm">Оценка, 0–100<input type="number" required min={0} max={100} step={1} value={score} onChange={e => setScore(e.target.value)} className={`${field} mt-1`} /></label><label className="block text-sm">Комментарий ученице<textarea maxLength={500} value={feedback} onChange={e => setFeedback(e.target.value)} className={`${field} mt-1`} placeholder="Что получилось → что исправить → следующий шаг" /></label><button className={button} disabled={busy || score === ''}>Сохранить комментарий и оценку</button>{notice && <p role="status" className="text-green-800 text-sm">{notice}</p>}{error && <p role="alert" className="text-red-700 text-sm">{error}</p>}</form>
  </article>
}
