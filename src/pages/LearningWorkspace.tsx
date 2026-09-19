import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { useStore } from '@/store/useStore'
import { lessons, practiceSource, readingPassage, readingQuestions } from '@/data/learningPath'

type RecordData = { moduleId: string; answers: Record<string, unknown>; completed: boolean }
type Records = Record<string, RecordData>
const prefix = 'learning-v1-'
const field = 'block w-full rounded-xl border border-slate-600 bg-slate-900 p-3 text-white'
const button = 'rounded-xl bg-blue-600 px-4 py-2.5 text-white disabled:opacity-40'
const card = 'rounded-2xl border border-slate-700 bg-slate-900/70 p-5 space-y-4'
const str = (v: unknown) => typeof v === 'string' ? v : ''

export default function LearningWorkspace({ initialTab = 'today' }: { initialTab?: string }) {
  const userId = useStore(s => s.user?.id)
  return <WorkspaceLoader key={`${userId}:${initialTab}`} initialTab={initialTab} />
}

function WorkspaceLoader({ initialTab }: { initialTab: string }) {
  const [records, setRecords] = useState<Records | null>(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    api.get<{ progresses: RecordData[] }>('/module-progress').then(data => {
      if (!Array.isArray(data.progresses)) throw new Error('Неверный формат учебного прогресса.')
      const entries = data.progresses.filter(r => typeof r.moduleId === 'string' && r.moduleId.startsWith(prefix) && r.answers && typeof r.answers === 'object' && !Array.isArray(r.answers))
      if (active) setRecords(Object.fromEntries(entries.map(r => [r.moduleId.slice(prefix.length), r])))
    }).catch(err => { if (active) setError(err instanceof Error ? err.message : 'Не удалось загрузить прогресс.') })
    return () => { active = false }
  }, [attempt])
  if (!records) return <main className="min-h-screen bg-slate-950 text-white p-8"><h1 className="text-2xl mb-4">Моя подготовка</h1>{error ? <div role="alert"><p>{error}</p><button className={button} onClick={() => { setError(''); setAttempt(a => a + 1) }}>Повторить загрузку</button></div> : <p>Загружаем сохранённые работы…</p>}<Link className="block mt-5 text-blue-300" to="/ielts">Открыть материалы IELTS</Link></main>
  return <Workspace initialRecords={records} initialTab={initialTab} />
}

function Workspace({ initialRecords, initialTab }: { initialRecords: Records; initialTab: string }) {
  const [records, setRecords] = useState(initialRecords)
  const [tab, setTab] = useState(initialTab)
  const [selected, setSelected] = useState(lessons.find(l => !initialRecords[l.id]?.completed)?.id ?? lessons[0].id)
  const [busy, setBusy] = useState(false)
  const lock = useRef(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  async function save(id: string, answers: Record<string, unknown>, completed = false) {
    if (lock.current) return false
    lock.current = true
    setBusy(true); setError(''); setNotice('')
    try {
      const data = await api.put<{ progress: RecordData }>(`/module-progress/${prefix}${id}`, { answers, completed })
      if (!data.progress?.answers || data.progress.moduleId !== prefix + id) throw new Error('Сервер не подтвердил сохранение.')
      setRecords(prev => ({ ...prev, [id]: data.progress }))
      setNotice('Сохранено в вашем аккаунте.')
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить. Повторите попытку.')
      return false
    } finally { setBusy(false); lock.current = false }
  }
  const done = lessons.filter(l => records[l.id]?.completed).length
  const next = lessons.find(l => !records[l.id]?.completed)
  const tabs = [['today', 'Сегодня'], ['diagnostic', 'Диагностика'], ['practice', 'Практика'], ['applications', 'Поступление']]
  return <main className="min-h-screen bg-slate-950 text-slate-100">
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <header className="flex flex-wrap justify-between gap-4"><div><p className="text-blue-300">StudyHub · личный учебный маршрут</p><h1 className="text-3xl font-bold mt-1">IELTS и поступление</h1></div><nav className="flex flex-wrap items-center gap-4 text-sm text-blue-300"><Link to="/ielts">Библиотека IELTS</Link><Link to="/mentor">Спросить Skylla</Link><Link to="/ent-dashboard">Другие разделы</Link><Link to="/settings">Аккаунт</Link></nav></header>
      <nav aria-label="Разделы подготовки" className="flex flex-wrap gap-2">{tabs.map(([key, title]) => <button key={key} aria-current={tab === key ? 'page' : undefined} onClick={() => setTab(key)} className={`rounded-xl px-5 py-3 ${tab === key ? 'bg-blue-600' : 'bg-slate-800'}`}>{title}</button>)}</nav>
      <p className="text-sm text-slate-400">Завершено {done} из {lessons.length} занятий стартового цикла. Это не прогноз IELTS band. Черновики сохраняются кнопкой; перед уходом со страницы сохраните работу.</p>
      {notice && <p role="status" className="text-emerald-300">{notice}</p>}{error && <p role="alert" className="bg-red-950 rounded-xl p-3 text-red-200">{error} Изменения не подтверждены сервером — попробуйте сохранить ещё раз.</p>}
      {/* Keep panels mounted so switching tabs does not discard unfinished work. */}
      <section hidden={tab !== 'today'} className="space-y-5">
        <div className={card}><h2 className="text-xl font-semibold">Следующий конкретный шаг</h2>{next ? <><p>{next.title} · {next.minutes} минут</p><button className={button} onClick={() => { setSelected(next.id); setTab('practice') }}>Начать занятие</button></> : <p>Стартовый цикл завершён. Повторите слабые задания и сохраните новый пробник в диагностике.</p>}<p className="text-sm text-slate-400">Куратор проекта — Каракат. Здесь пока нет назначения личного преподавателя или автоматической проверки человеком.</p></div>
        <Profile initial={records.profile?.answers ?? {}} busy={busy} save={save} />
      </section>
      <section hidden={tab !== 'diagnostic'} className="space-y-5"><Diagnostic initial={records.diagnostic?.answers ?? {}} busy={busy} save={save} /><div className={card}><h2 className="text-xl font-semibold">Остальные навыки</h2><p>Для Listening нужен тест с аудио и ключами. Для Speaking — запись речи и обратная связь, для Writing — проверка текста по критериям. Мини-тест Reading этого не заменяет.</p><a className="text-blue-300 underline" href={practiceSource} target="_blank" rel="noreferrer">Официальные образцы IELTS</a><p>Результаты полного пробника занесите в «Сегодня». Работы и разбор ошибок сохраняйте в «Практике».</p></div></section>
      <section hidden={tab !== 'practice'} className="grid md:grid-cols-[260px_1fr] gap-5"><nav aria-label="Занятия" className="space-y-2">{lessons.map((l, i) => <button key={l.id} onClick={() => setSelected(l.id)} className={`block w-full text-left rounded-xl p-3 ${selected === l.id ? 'bg-blue-700' : 'bg-slate-800'}`}>{records[l.id]?.completed ? '✓' : i + 1} · {l.title}<span className="block text-xs mt-1">{l.minutes} минут</span></button>)}</nav><div>{lessons.map(l => <div key={l.id} hidden={selected !== l.id}><Lesson lesson={l} initial={records[l.id]?.answers ?? {}} completed={records[l.id]?.completed ?? false} busy={busy} save={save} /></div>)}</div></section>
      <section hidden={tab !== 'applications'}><Applications records={records} busy={busy} save={save} /></section>
    </div>
  </main>
}

type Save = (id: string, answers: Record<string, unknown>, completed?: boolean) => Promise<boolean>
function Profile({ initial, busy, save }: { initial: Record<string, unknown>; busy: boolean; save: Save }) {
  const [values, setValues] = useState<Record<string, string>>(Object.fromEntries(Object.entries(initial).map(([k,v]) => [k, str(v)])))
  const fields = [ ['target', 'Целевой IELTS band', 'number'], ['examDate', 'Планируемая дата экзамена', 'date'], ['hours', 'Часов подготовки в неделю', 'number'], ['testDate', 'Дата последнего пробника / экзамена', 'date'], ['listening', 'Listening', 'number'], ['reading', 'Reading', 'number'], ['writing', 'Writing', 'number'], ['speaking', 'Speaking', 'number'] ]
  return <form className={card} onSubmit={e => { e.preventDefault(); void save('profile', values) }}><h2 className="text-xl font-semibold">Цель и исходная точка</h2><p className="text-sm text-slate-400">Пусто = пока неизвестно. Вводите баллы только из реального экзамена или оценённого пробника, не по результату мини-теста.</p><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{fields.map(([key,label,type]) => <label key={key} className="text-sm space-y-2"><span>{label}</span><input className={field} type={type} min={0} max={key === 'hours' ? 80 : 9} step={key === 'hours' ? 1 : 0.5} value={values[key] ?? ''} onChange={e => setValues(prev => ({ ...prev, [key]: e.target.value }))} /></label>)}</div><label className="block space-y-2">Источник результата и слабые места<textarea maxLength={2000} className={field} value={values.notes ?? ''} onChange={e => setValues(prev => ({ ...prev, notes: e.target.value }))} placeholder="Например: экзамен — 5.5; в Speaking было сложно развивать ответ. Новые пробники ещё нужно оценить по секциям." /></label><button disabled={busy} className={button}>Сохранить цель и результаты</button></form>
}

function Lesson({ lesson, initial, completed, busy, save }: { lesson: typeof lessons[number]; initial: Record<string, unknown>; completed: boolean; busy: boolean; save: Save }) {
  const [text, setText] = useState(str(initial.text))
  return <article className={card}><h2 className="text-xl font-semibold">{lesson.title}</h2><h3 className="font-semibold text-blue-300">Короткий урок</h3><p>{lesson.theory}</p><h3 className="font-semibold text-blue-300">Задание</h3><p>{lesson.task}</p><p className="text-slate-300">{lesson.evidence}</p><div className="flex flex-wrap gap-4 text-blue-300 underline"><Link to={`/ielts?tab=${lesson.skill}`}>Материалы по навыку</Link>{lesson.skill === 'listening' && <a href={practiceSource} target="_blank" rel="noreferrer">Официальный тест с аудио</a>}</div><label className="block space-y-2"><span>Моя работа / разбор ошибок</span><textarea className={field} rows={9} maxLength={15000} value={text} onChange={e => setText(e.target.value)} /></label><p className="text-xs text-slate-400">Слов: {text.trim() ? text.trim().split(/\s+/).length : 0}. Статус: {completed ? 'завершено вами, не проверено преподавателем' : 'в работе'}.</p><div className="flex flex-wrap gap-3"><button disabled={busy} className={button} onClick={() => void save(lesson.id, { text }, completed)}>Сохранить черновик</button><button disabled={busy || text.trim().length < 30} className={button} onClick={() => void save(lesson.id, { text }, true)}>Завершить занятие</button>{completed && <button className="text-blue-300" disabled={busy} onClick={() => void save(lesson.id, { text }, false)}>Вернуть в работу</button>}</div><p className="text-xs text-slate-400">Для завершения оставьте содержательную запись (минимум 30 символов). Это отметка выполнения, не автоматическая оценка качества.</p></article>
}

function Diagnostic({ initial, busy, save }: { initial: Record<string, unknown>; busy: boolean; save: Save }) {
  const [answers, setAnswers] = useState<string[]>(Array.isArray(initial.choices) && initial.choices.length === readingQuestions.length ? initial.choices.map(str) : readingQuestions.map(() => ''))
  const [checked, setChecked] = useState(initial.checked === true)
  const count = answers.filter((a,i) => a === readingQuestions[i].answer).length
  return <div className={card}><h2 className="text-xl font-semibold">Reading · мини-диагностика</h2><p className="text-slate-300">Авторский текст и 6 вопросов на True / False / Not Given. Проверяет только этот тип заданий, не весь Reading и не общий уровень английского.</p><blockquote className="rounded-xl bg-slate-800 p-4 leading-7" lang="en">{readingPassage}</blockquote>{readingQuestions.map((q,i) => <fieldset key={q.text} className="space-y-2"><legend>{i + 1}. {q.text}</legend><div className="flex flex-wrap gap-4">{['True','False','Not Given'].map(option => <label key={option} className="flex gap-2"><input type="radio" name={`reading-${i}`} value={option} checked={answers[i] === option} onChange={() => { setChecked(false); setAnswers(prev => prev.map((a,j) => i === j ? option : a)) }} />{option}</label>)}</div>{checked && <p className={answers[i] === q.answer ? 'text-emerald-300' : 'text-amber-300'}>{q.answer}. {q.why}</p>}</fieldset>)}<button disabled={busy || answers.some(a => !a)} className={button} onClick={async () => { if (await save('diagnostic', { choices: answers, checked: true, correct: count, total: readingQuestions.length, takenAt: new Date().toISOString() }, true)) setChecked(true) }}>Проверить и сохранить</button>{checked && <p role="status">{count} / {readingQuestions.length}. {count < readingQuestions.length ? 'Следующий шаг: разберите ошибки в занятии «Reading: факт или предположение».' : 'Следующий шаг: полный Reading по официальному образцу с таймером.'} Это не IELTS band.</p>}</div>
}

function Applications({ records, busy, save }: { records: Records; busy: boolean; save: Save }) {
  const [name, setName] = useState('')
  const [program, setProgram] = useState('')
  const [deadline, setDeadline] = useState('')
  const [source, setSource] = useState('')
  const applications = Object.entries(records).filter(([id]) => id.startsWith('application-')).sort((a,b) => (str(a[1].answers.deadline) || '9999').localeCompare(str(b[1].answers.deadline) || '9999'))
  const checks = ['Требования и финансирование проверены', 'Документы об образовании готовы', 'Языковой результат готов', 'Эссе и рекомендации готовы', 'Заявка отправлена']
  return <div className="space-y-5"><div className={card}><h2 className="text-xl font-semibold">Мои программы поступления</h2><p>Начни с конкретной программы: проверь право поступления после колледжа, финансирование, языковые требования и дедлайн на сайте университета. SAT нужен не везде — сначала проверь требования.</p><p className="text-sm text-slate-400">Здесь нет демонстрационных заявок и обещаний гранта. Ссылки и даты вводишь ты; платформа не проверяет их актуальность и пока не отправляет напоминания.</p></div><form className={card} onSubmit={async e => { e.preventDefault(); if (await save(`application-${crypto.randomUUID()}`, { name: name.trim(), program: program.trim(), deadline, source, checks: [] })) { setName(''); setProgram(''); setDeadline(''); setSource('') } }}><h3 className="font-semibold">Добавить программу</h3><div className="grid sm:grid-cols-2 gap-4"><label>Университет<input required maxLength={200} className={field} value={name} onChange={e => setName(e.target.value)} /></label><label>Программа / степень<input required maxLength={200} className={field} value={program} onChange={e => setProgram(e.target.value)} /></label><label>Дедлайн (если проверен)<input type="date" className={field} value={deadline} onChange={e => setDeadline(e.target.value)} /></label><label>Официальная страница<input type="url" pattern="https?://.*" required maxLength={2000} placeholder="https://…" className={field} value={source} onChange={e => setSource(e.target.value)} /></label></div><button disabled={busy || !name.trim() || !program.trim()} className={button}>Добавить в мой план</button></form>{!applications.length && <p>Пока ни одной программы. Добавь первую после проверки официальных требований.</p>}{applications.map(([id,r]) => <Application key={id} id={id} data={r.answers} checks={checks} busy={busy} save={save} />)}</div>
}

function Application({ id, data, checks, busy, save }: { id: string; data: Record<string, unknown>; checks: string[]; busy: boolean; save: Save }) {
  const [deadline, setDeadline] = useState(str(data.deadline))
  const [notes, setNotes] = useState(str(data.notes))
  const [source, setSource] = useState(str(data.source))
  const [checked, setChecked] = useState<string[]>(Array.isArray(data.checks) ? data.checks.filter((v): v is string => typeof v === 'string') : [])
  return <form className={card} onSubmit={e => { e.preventDefault(); void save(id, { ...data, deadline, notes, source, checks: checked }) }}><h3 className="text-xl font-semibold">{str(data.name)} · {str(data.program)}</h3>{/^https?:\/\//.test(str(data.source)) && <a className="text-blue-300 underline" href={str(data.source)} target="_blank" rel="noreferrer">Сохранённый источник требований</a>}<div className="grid sm:grid-cols-2 gap-3"><label>Дедлайн<input type="date" className={field} value={deadline} onChange={e => setDeadline(e.target.value)} /></label><label>Источник<input type="url" pattern="https?://.*" required className={field} value={source} onChange={e => setSource(e.target.value)} /></label></div>{checks.map(c => <label key={c} className="flex items-start gap-2"><input type="checkbox" checked={checked.includes(c)} onChange={e => setChecked(prev => e.target.checked ? [...prev,c] : prev.filter(v => v !== c))} />{c}</label>)}<label className="block">Требования, финансирование, дата проверки и следующий шаг<textarea maxLength={5000} rows={4} className={field} value={notes} onChange={e => setNotes(e.target.value)} /></label><button disabled={busy} className={button}>Сохранить программу</button></form>
}
