import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { api } from '@/lib/api'
import { learningApi } from '@/lib/learning'
import type { LearningRecord, LearningTurn } from '@/lib/learning'

export default function StudyMentor() {
  const [turns, setTurns] = useState<LearningRecord<LearningTurn>[] | null>(null)
  const [consent, setConsent] = useState(false)
  const [nextStep, setNextStep] = useState('')
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'light' | 'standard'>('standard')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const pending = useRef<{ text: string; mode: string; id: string } | null>(null)
  const lock = useRef(false)
  useEffect(() => {
    let active = true
    learningApi.load().then(data => { if (active) { setTurns(data.turns); setConsent(data.memory?.data.aiConsent === true); setNextStep(data.memory?.data.nextStep ?? '') } }).catch(e => { if (active) setError(e.message) })
    return () => { active = false }
  }, [reload])
  async function send() {
    const message = input.trim()
    if (!message || lock.current || !consent) return
    lock.current = true; setBusy(true); setError('')
    if (pending.current?.text !== message || pending.current.mode !== mode) pending.current = { text: message, mode, id: crypto.randomUUID() }
    try {
      const { record } = await learningApi.chat(message, pending.current.id, mode)
      setTurns(prev => [...(prev ?? []).filter(t => t.id !== record.id), record].slice(-40)); setInput(''); pending.current = null
    } catch (e) { setError((e as Error).message) } finally { setBusy(false); lock.current = false }
  }
  if (!turns) return <div>{error ? <p role="alert">{error}</p> : <p>Загружаем ваш диалог…</p>}<button className="text-blue-300 underline" onClick={() => { setError(''); setReload(n => n + 1) }}>Повторить загрузку</button></div>
  return <div className="space-y-4 text-white">
    <p className="text-sm text-slate-300">Skylla — ИИ-репетитор. Диалог сохраняется в аккаунте; показаны последние 40 ответов. Новый ответ учитывает учебный профиль, недавние работы и последние пять пар сообщений.</p>
    <Link className="text-blue-300 underline" to="/ielts-coach?tab=memory">Перенести обучение / изменить учебную память</Link>
    {!consent && <p className="rounded-xl bg-amber-950 p-3">Сохраните профиль и разрешите использование учебного контекста на вкладке «Память». Упражнения доступны без ИИ.</p>}
    {nextStep && <div className="rounded-xl bg-slate-800 p-3"><p>Сохранённый следующий шаг: {nextStep}</p><button className="mt-2 text-blue-300 underline" disabled={busy} onClick={() => setInput('Продолжим с сохранённого следующего шага. Сначала дай короткое повторение без ответов, затем упражнение. Не начинай курс заново.')}>Подготовить продолжение</button></div>}
    <label className="block text-sm">Нагрузка<select className="ml-3 rounded-lg bg-slate-800 p-2" value={mode} disabled={busy} onChange={e => setMode(e.target.value as typeof mode)}><option value="standard">Обычное занятие</option><option value="light">Лёгкий день · одно небольшое задание</option></select></label>
    <div className="max-h-[560px] overflow-y-auto space-y-4" aria-live="polite" aria-busy={busy}>
      {!turns.length && <p>Начните с собственного текста или попросите продолжить сохранённый урок.</p>}
      {turns.map(t => <div key={t.id} className="space-y-3"><div className="rounded-xl bg-blue-900 p-4"><p className="text-xs text-slate-300 mb-2">Вы · {new Date(t.data.createdAt).toLocaleString()}</p><p className="whitespace-pre-wrap break-words">{t.data.message}</p></div><div className="rounded-xl bg-slate-800 p-4"><p className="text-xs text-slate-300 mb-2">Skylla</p><div className="space-y-3 break-words [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"><ReactMarkdown>{t.data.reply}</ReactMarkdown></div></div></div>)}
      {busy && <p role="status">Готовим и сохраняем ответ…</p>}
    </div>
    <form onSubmit={e => { e.preventDefault(); void send() }} className="space-y-3"><label className="block">Ваш ответ или вопрос<textarea aria-label="Ваш ответ или вопрос" rows={5} maxLength={12000} className="w-full rounded-xl border border-slate-600 bg-slate-950 p-3" value={input} disabled={busy} onChange={e => setInput(e.target.value)} /></label><button className="rounded-xl bg-blue-600 px-5 py-3 disabled:opacity-40" disabled={busy || !input.trim() || !consent}>Отправить и сохранить</button><p className="text-xs text-slate-400">До 30 обращений к ИИ в час вместе с разборами работ. Ошибки и фразы добавляются в журнал вами. Это тренировочная обратная связь, не официальный IELTS band.</p></form>
    {error && <p role="alert" className="rounded-xl bg-red-950 p-3 text-red-200">{error}</p>}
    <button className="text-sm text-rose-300 underline" disabled={busy || !turns.length} onClick={() => setDeleting(true)}>Удалить сохранённый диалог</button>
    {deleting && <div className="rounded-xl border border-rose-800 p-3"><p>Удалить историю диалога из Study Hub? Профиль и работы останутся.</p><button className="mr-5 text-rose-300 underline" disabled={busy} onClick={async () => { setBusy(true); try { await api.del('/learning/chat'); setTurns([]); setDeleting(false); setError('') } catch (e) { setError((e as Error).message) } finally { setBusy(false) } }}>Да, удалить</button><button onClick={() => setDeleting(false)}>Отмена</button></div>}
  </div>
}
