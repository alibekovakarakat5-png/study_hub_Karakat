import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FRONTEND_SHA, launchPersona, ownerRequest } from '@/lib/review'
import type { ReviewState, Run } from '@/lib/review'
import type { LearningRecord } from '@/lib/learning'
import { currentTestSession, leaveTestSession } from '@/lib/reviewSession'
import { prepareScreenshot, readEvidenceDraft, writeEvidenceDraft } from '@/lib/reviewDraft'
import type { EvidenceDraft } from '@/lib/reviewDraft'

const button = 'rounded-xl bg-blue-700 text-white px-4 py-3 disabled:opacity-40'
const field = 'block w-full rounded-lg border border-slate-600 bg-slate-900 text-white p-3 mt-1'
export default function AdmissionsReviewRail({ ownerId, run, state, reload }: { ownerId: string; run: LearningRecord<Run>; state: ReviewState; reload: () => Promise<void> }) {
  const location = useLocation(); const navigate = useNavigate(); const session = currentTestSession()
  const [open, setOpen] = useState(location.pathname === '/owner-review')
  const [draft, setDraft] = useState<EvidenceDraft | null>(null)
  const [ready, setReady] = useState(false); const [busy, setBusy] = useState(false)
  const [error, setError] = useState(''); const [notice, setNotice] = useState('')
  const lock = useRef(false); const saving = useRef(Promise.resolve()); const savedOk = useRef(true)
  const key = ownerId + ':' + run.data.id
  const currentStep = run.data.scenario.steps.find(s => s.path === location.pathname && s.persona === session?.persona)
  useEffect(() => {
    let active = true
    readEvidenceDraft(key).then(value => { if (active) { setDraft(value); setReady(true) } }).catch(e => { if (active) setError(e.message) })
    return () => { active = false }
  }, [key])
  function persist(value: EvidenceDraft | null) {
    setDraft(value)
    saving.current = saving.current.catch(() => {}).then(() => writeEvidenceDraft(key, value)).then(() => { savedOk.current = true }).catch(e => { savedOk.current = false; setError(e.message) })
  }
  async function act(fn: () => Promise<void>) {
    if (lock.current) return
    lock.current = true; setBusy(true); setError(''); setNotice('')
    try { await fn() } catch (e) { setError((e as Error).message) } finally { lock.current = false; setBusy(false) }
  }
  function begin() {
    // Lazy routes can leave the previous screen visible briefly after the URL changes.
    // Do not capture that stale screen as a new page's evidence.
    if (window.location.pathname !== location.pathname || lock.current) return
    setOpen(true)
    if (draft || !ready || !currentStep || !session) return
    const selected = [...document.querySelectorAll('main [aria-selected="true"], main [aria-current="page"]')].map(e => e.textContent?.trim()).filter(Boolean).join(' · ').slice(0,200)
    persist({ id: crypto.randomUUID(), runId: run.data.id, stepId: currentStep.id, path: location.pathname, sessionId: session.sessionId, section: selected, capturedAt: new Date().toISOString(), viewport: { width: innerWidth, height: innerHeight }, text: '', outcome: 'failed', frontendSha: FRONTEND_SHA })
  }
  function change(patch: Partial<EvidenceDraft>) {
    if (draft) persist({ ...draft, ...patch, id: crypto.randomUUID(), ...(patch.section !== undefined && draft.screenshot ? { screenshot: { ...draft.screenshot, id: crypto.randomUUID() } } : {}) })
  }
  async function attach(file: File) {
    if (!draft) return
    const dataUrl = await prepareScreenshot(file)
    change({ screenshot: { id: crypto.randomUUID(), dataUrl } })
  }
  async function submit() {
    if (!draft || !draft.text.trim()) return
    await saving.current
    if (!savedOk.current) throw new Error('Не удалось сохранить черновик. Повторите сохранение перед отправкой.')
    if (draft.frontendSha !== FRONTEND_SHA) throw new Error('Черновик относится к другой версии сайта. Скопируйте текст и изображение; начните проверку новой версии.')
    const screenshot = draft.screenshot
    const context = { runId:draft.runId, stepId:draft.stepId, path:draft.path, sessionId:draft.sessionId, section:draft.section, capturedAt:draft.capturedAt, viewport:draft.viewport }
    const payload = { ...context, id:draft.id, text:draft.text, outcome:draft.outcome }
    if (screenshot) {
      await ownerRequest('POST', '/review/attachments', { ...context, id: screenshot.id, dataUrl: screenshot.dataUrl })
    }
    await ownerRequest('POST', '/review/feedback', { ...payload, ...(screenshot ? { screenshotId: screenshot.id } : {}) })
    // Remove only after server acknowledgement. A lost response retries with the same ID.
    await writeEvidenceDraft(key, null)
    setDraft(null); setNotice('Сохранено замечание №' + draft.id.slice(0,8) + (screenshot ? ' с изображением.' : '.'))
    try { await reload() } catch { setNotice('Замечание сохранено. Очередь временно не удалось обновить.') }
  }
  async function go(step: Run['scenario']['steps'][number]) {
    await saving.current
    if (!savedOk.current) throw new Error('Черновик не сохранён; сначала скопируйте замечание.')
    // Opening the rail to navigate must not pin an untouched form to the previous page.
    if (draft && !draft.text.trim() && !draft.screenshot) {
      await writeEvidenceDraft(key, null)
      setDraft(null)
    }
    if (session?.persona === step.persona && session.runId === run.data.id && session.expiresAt > Date.now()) navigate(step.path ?? '/admission')
    else await launchPersona(step.persona, run.data.id, step.path)
    setOpen(false)
  }
  return <>
    {!open && <button data-review-path={location.pathname} className="fixed bottom-4 right-4 z-[100] rounded-xl bg-blue-700 text-white px-4 py-3 shadow-lg" disabled={!ready || busy} onClick={begin}>{draft ? 'Продолжить замечание' : 'Оставить замечание'}</button>}
    {open && <aside aria-label="Проверка поступления" className="fixed z-[100] right-0 top-0 h-dvh w-full sm:w-[400px] overflow-y-auto border-l border-slate-700 bg-slate-950 text-slate-100 p-5 shadow-xl space-y-4">
      <header className="flex justify-between items-center gap-3"><h2 className="font-semibold">Проверка поступления</h2><button className="p-3 underline" onClick={() => setOpen(false)}>Свернуть</button></header>
      <p className="text-sm text-slate-300">{state.build.environment === 'production' ? 'Рабочий сайт' : 'Локальная проверка'} · {session ? state.personas.find(p => p.id === session.persona)?.name : 'Владелец'}</p>
      <p className="text-xs text-slate-400">Версия {run.data.frontendSha.slice(0,8)} · замечаний: {state.feedback.filter(f => f.data.runId === run.data.id).length}</p>
      {error && <p role="alert" className="bg-red-950 p-3 rounded-xl">{error}</p>}
      {notice && <p role="status" className="bg-emerald-950 p-3 rounded-xl">{notice}</p>}
      {!ready && !error && <p>Восстанавливаем черновик…</p>}
      {draft && <form className="space-y-3" onSubmit={e => { e.preventDefault(); void act(submit) }} onPaste={e => { const file = [...e.clipboardData.files].find(f => f.type.startsWith('image/')); if (file && !busy) { e.preventDefault(); void act(() => attach(file)) } }}>
        <p className="text-sm break-words">Замечание к <strong>{draft.path}</strong>{draft.path !== location.pathname && ' — вы уже перешли на другую страницу; привязка сохранена.'}</p>
        <label className="block text-sm">Открытая вкладка или блок<input className={field} value={draft.section} maxLength={200} disabled={busy} onChange={e => change({ section: e.target.value })} placeholder="Например: Италия → требования" /></label>
        <label className="block">Моё замечание<textarea className={field} value={draft.text} rows={4} maxLength={4000} disabled={busy} onChange={e => change({ text: e.target.value })} placeholder="Что произошло и что вы ожидали?" /></label>
        <label className="block text-sm">Тип замечания<select className={field} value={draft.outcome} disabled={busy} onChange={e => change({ outcome: e.target.value as EvidenceDraft['outcome'] })}><option value="failed">Не работает / ошибка</option><option value="unclear">Непонятно / предложение</option></select></label>
        <label className="block text-sm">Скриншот: PNG или JPEG<input className="block w-full text-sm py-3" type="file" accept="image/png,image/jpeg" disabled={busy} onChange={e => { const file = e.target.files?.[0]; e.target.value=''; if (file) void act(() => attach(file)) }} /></label>
        <p className="text-xs text-slate-400">Можно вставить скриншот из буфера. Перед отправкой проверьте изображение; не прикладывайте пароли и реальные документы.</p>
        {draft.screenshot && <div><img className="w-full rounded border border-slate-600" src={draft.screenshot.dataUrl} alt="Предпросмотр скриншота замечания" /><button type="button" className="underline p-2" disabled={busy} onClick={() => change({ screenshot: undefined })}>Убрать изображение</button></div>}
        <button className={button + ' w-full'} disabled={busy || !draft.text.trim()}>{busy ? 'Сохраняем…' : 'Сохранить замечание'}</button>
        <button type="button" className="text-sm underline p-2" disabled={busy} onClick={() => { if (window.confirm('Удалить этот черновик замечания?')) void act(async () => { await saving.current; await writeEvidenceDraft(key, null); setDraft(null) }) }}>Удалить черновик</button>
      </form>}
      {!draft && currentStep && <><p className="font-medium">{currentStep.title}</p><p className="text-sm">{currentStep.action}</p><p className="text-sm text-slate-300">Ожидается: {currentStep.expected}</p><button className={button} disabled={busy || !ready} onClick={begin}>Добавить замечание</button><button className="block underline p-2" disabled={busy} onClick={() => void act(async () => { await ownerRequest('PUT', `/review/runs/${run.data.id}/steps/${currentStep.id}`, { revision: run.revision, outcome:'passed', comment:'', path:location.pathname, sessionId:session?.sessionId }); await reload(); setNotice('Страница отмечена как проверенная.') })}>Страница работает</button></>}
      <details open={!session}><summary className="py-3">Все страницы и тестовые роли</summary><nav className="space-y-1" aria-label="Страницы проверки поступления">{run.data.scenario.steps.filter(s => s.path !== '/owner-review').map(step => <button key={step.id} className="block w-full text-left rounded p-3 hover:bg-slate-800 disabled:opacity-40" disabled={busy || !ready} onClick={() => void act(() => go(step))}>{step.title}{run.data.steps[step.id]?.outcome === 'passed' ? ' · проверено' : ''}</button>)}</nav></details>
      {session && <button className="w-full rounded-xl bg-white text-slate-900 p-3" disabled={busy} onClick={() => void act(async () => { await saving.current; if (!savedOk.current) throw new Error('Черновик не сохранён на устройстве.'); await ownerRequest('DELETE', '/review/sessions/' + session.sessionId); leaveTestSession() })}>Вернуться владельцем</button>}
      {!session && <button className="underline p-2" onClick={() => { localStorage.removeItem('review-active-run:' + ownerId); window.dispatchEvent(new Event('review-run-changed')) }}>Закрыть проверку</button>}
      <p className="text-xs text-slate-400">Тестовые данные. Отправка замечания добавляет его в приватную очередь; помощник читает её после подключения, по запросу или отдельной автоматизации.</p>
    </aside>}
  </>
}
