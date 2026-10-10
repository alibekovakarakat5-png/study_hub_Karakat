import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { loadReview, ownerRequest, launchPersona, outcomeLabel } from '@/lib/review'
import type { ReviewState, Run, StepResult } from '@/lib/review'
import type { LearningRecord } from '@/lib/learning'
import { currentTestSession, leaveTestSession } from '@/lib/reviewSession'
import AdmissionsReviewRail from './AdmissionsReviewRail'

export default function ReviewRail() {
  const location = useLocation()
  const session = currentTestSession()
  let ownerId = ''
  try { const u = JSON.parse(localStorage.getItem('studyhub-storage') ?? '{}').state?.user; if (u?.role === 'admin') ownerId = u.id } catch { /* no owner */ }
  const [state, setState] = useState<ReviewState | null>(null)
  const [activeId, setActive] = useState(session?.runId ?? localStorage.getItem('review-active-run:' + ownerId) ?? '')
  const [open, setOpen] = useState(true)
  const [stepIndex, setStepIndex] = useState(() => readStep(ownerId, activeId))
  function setStep(index: number) {
    localStorage.setItem('review-step:' + ownerId + ':' + activeId, String(index))
    setStepIndex(index)
  }
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const sending = useRef(false)
  const feedbackId = useRef<{ value: string; id: string } | null>(null)
  const run = state?.runs.find(r => r.data.id === activeId)
  const step = run?.data.scenario.steps[stepIndex]
  const draftKey = 'review-note:' + ownerId + ':' + activeId + ':' + step?.id
  useEffect(() => {
    const changed = () => {
      const id = currentTestSession()?.runId ?? localStorage.getItem('review-active-run:' + ownerId) ?? ''
      setActive(id); setOpen(true); setStepIndex(readStep(ownerId, id))
    }
    window.addEventListener('review-run-changed', changed)
    return () => window.removeEventListener('review-run-changed', changed)
  }, [ownerId])
  useEffect(() => {
    if (!ownerId || !activeId) return
    let active = true
    loadReview().then(s => { if (active) { setState(s); setError('') } }).catch(e => { if (active) setError(e.message) })
    return () => { active = false }
  }, [ownerId, activeId])
  useEffect(() => { setText(localStorage.getItem(draftKey) ?? ''); feedbackId.current = null; setNotice('') }, [draftKey])
  async function action(fn: () => Promise<void>) {
    if (sending.current) return
    sending.current = true; setBusy(true); setError(''); setNotice('')
    try { await fn() } catch (e) { setError((e as Error).message) } finally { sending.current = false; setBusy(false) }
  }
  async function sendFeedback() {
    if (!run || !step) return
    const value = JSON.stringify({ run: activeId, step: step.id, text, path:location.pathname, sessionId:session?.sessionId })
    if (feedbackId.current?.value !== value) feedbackId.current = { value, id: crypto.randomUUID() }
    await ownerRequest('POST', '/review/feedback', { id: feedbackId.current.id, runId: activeId, stepId: step.id, text, path: location.pathname, sessionId:session?.sessionId })
    localStorage.removeItem(draftKey); setText(''); setNotice('Замечание сохранено в приватной очереди.');
  }
  async function save(outcome: StepResult['outcome']) {
    if (!run || !step) return
    const { record } = await ownerRequest<{ record: LearningRecord<Run> }>('PUT', `/review/runs/${activeId}/steps/${step.id}`, { revision: run.revision, outcome, comment: text, path: location.pathname })
    setState(s => s ? { ...s, runs: s.runs.map(r => r.id === record.id ? record : r) } : s)
    setNotice('Результат шага сохранён.');
  }
  if (!ownerId || !activeId) return null
  if (state && run?.data.scenarioId === 'admissions-review-v1') return <AdmissionsReviewRail key={ownerId + activeId} ownerId={ownerId} run={run} state={state} reload={async () => setState(await loadReview())} />
  return <>
    {open && <style>{'@media(min-width:1100px){body{padding-right:380px}}'}</style>}
    {!open && <button className="fixed bottom-4 right-4 z-[100] rounded-xl bg-blue-700 text-white px-4 py-3 shadow-lg" onClick={() => setOpen(true)}>{session ? 'Тестовая роль · Проверка' : 'Открыть проверку'}</button>}
    {open && <aside aria-label="Панель проверки" className="fixed z-[100] right-0 top-0 h-dvh w-full sm:w-[380px] overflow-y-auto border-l border-slate-700 bg-slate-950 text-slate-100 p-5 shadow-xl space-y-5">
      <header className="flex justify-between gap-2"><h2 className="font-bold">Проверка Study Hub</h2><button aria-label="Свернуть панель проверки" className="px-3 py-2 rounded bg-slate-800" onClick={() => setOpen(false)}>Свернуть</button></header>
      <p className="rounded-lg bg-amber-950 p-3 text-amber-200 text-sm">{state?.build.environment === 'production' ? 'Рабочий сайт · ' : 'Локальная проверка · '}{session ? state?.personas.find(p => p.id === session.persona)?.name ?? session.persona : 'Аккаунт владельца'}</p>
      {session && <button className="w-full rounded-xl bg-white text-slate-900 px-4 py-3" disabled={busy} onClick={() => void action(async () => { await ownerRequest('DELETE', '/review/sessions/' + session.sessionId); leaveTestSession() })}>Завершить и вернуться владельцем</button>}
      {session && session.expiresAt <= Date.now() && <p role="alert">Тестовая сессия истекла. Вернитесь владельцем и запустите новую.</p>}
      {error && <div role="alert" className="rounded-lg bg-red-950 p-3 space-y-2"><p>{error}</p><button className="underline" disabled={busy} onClick={() => void action(async () => setState(await loadReview()))}>Обновить данные</button>{session && <button className="block underline" onClick={leaveTestSession}>Вернуться без соединения</button>}</div>}
      {!state && !error && <p role="status">Загрузка сценария…</p>}
      {state && !run && <p>Эта проверка не найдена в последних записях. Откройте кабинет владельца.</p>}
      {run && step && <>
        <h3 className="text-lg font-semibold">{run.data.scenario.title}</h3>
        <p className="text-sm text-slate-400">Версия: {run.data.frontendSha.slice(0, 8)} · {Object.keys(run.data.steps).length}/{run.data.scenario.steps.length} шагов отмечено</p>
        <label className="block text-sm">Шаг<select aria-label="Шаг проверки" className="w-full mt-1 rounded-xl bg-slate-800 border border-slate-600 p-3" value={stepIndex} disabled={busy} onChange={e => setStep(Number(e.target.value))}>{run.data.scenario.steps.map((s, i) => <option key={s.id} value={i}>{i + 1}. {s.title}</option>)}</select></label>
        <div><p className="text-sm text-blue-300">Действие</p><p>{step.action}</p></div><div><p className="text-sm text-emerald-300">Ожидаемый результат</p><p>{step.expected}</p></div>
        <button className="w-full rounded-xl bg-blue-600 px-3 py-3 disabled:opacity-40" disabled={busy} onClick={() => void action(() => launchPersona(step.persona, activeId))}>Запустить: {state?.personas.find(p => p.id === step.persona)?.name}</button>
        <p className="text-xs text-slate-400">{state?.personas.find(p => p.id === step.persona)?.scope}. Сохраните работу перед переключением.</p>
        <label className="block">Моё замечание<textarea aria-label="Моё замечание" className="w-full rounded-xl bg-slate-800 border border-slate-600 p-3 mt-2" rows={4} maxLength={4000} value={text} disabled={busy} placeholder="Что произошло? Что ожидали увидеть?" onChange={e => { setText(e.target.value); localStorage.setItem(draftKey, e.target.value) }} /></label>
        <div className="grid grid-cols-2 gap-2">{(Object.keys(outcomeLabel) as StepResult['outcome'][]).map(outcome => <button key={outcome} className="rounded-xl border border-slate-500 px-2 py-3 disabled:opacity-40" disabled={busy || (['failed', 'unclear'].includes(outcome) && !text.trim())} onClick={() => void action(() => save(outcome))}>{outcomeLabel[outcome]}</button>)}</div>
        <button className="w-full rounded-xl bg-blue-600 p-3 disabled:opacity-40" disabled={busy || !text.trim()} onClick={() => void action(sendFeedback)}>Отправить замечание в очередь</button>
        {run.data.steps[step.id] && <p className="text-sm text-slate-300">Сохранено: {outcomeLabel[run.data.steps[step.id].outcome]}</p>}
        {notice && <p role="status" className="text-emerald-300">{notice}</p>}
        <p className="text-xs text-slate-400">Не вставляйте пароли или личные данные учеников. К замечанию добавляются только страница, шаг, роль и версия.</p>
        <button className="underline text-blue-300" disabled={busy || stepIndex === run.data.scenario.steps.length - 1} onClick={() => setStep(stepIndex + 1)}>Следующий шаг →</button>
      </>}
      {!session && <button className="text-slate-400 underline" onClick={() => { localStorage.removeItem('review-active-run:' + ownerId); setActive('') }}>Убрать панель, сохранив проверку</button>}
    </aside>}
  </>
}

function readStep(ownerId: string, runId: string) {
  const index = Number(localStorage.getItem('review-step:' + ownerId + ':' + runId))
  return Number.isInteger(index) && index >= 0 && index < 100 ? index : 0
}
