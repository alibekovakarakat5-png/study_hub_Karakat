import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { FRONTEND_SHA, loadReview, ownerRequest, statusLabel, outcomeLabel } from '@/lib/review'
import type { Feedback, ReviewState, Run } from '@/lib/review'
import type { LearningRecord } from '@/lib/learning'
import { downloadLearningFile } from '@/lib/learning'

const button = 'self-start rounded-xl bg-blue-600 px-4 py-2.5 text-white disabled:opacity-40'
const field = 'w-full rounded-xl border border-slate-300 p-3 text-slate-900 bg-white'
function activateReview(owner: string, id: string) {
  localStorage.setItem('review-active-run:' + owner, id)
  window.dispatchEvent(new Event('review-run-changed'))
}
function FeedbackCard({ item, runs, reload }: { item: LearningRecord<Feedback>; runs: LearningRecord<Run>[]; reload: () => Promise<void> }) {
  const [note, setNote] = useState('')
  const [fixedSha, setFixedSha] = useState(item.data.fixedSha ?? '')
  const [proofRunId, setProof] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function update(status: Feedback['status']) {
    setBusy(true); setError('')
    try { await ownerRequest('PATCH', '/review/feedback/' + item.data.id, { revision: item.revision, status, note, ...(status === 'ready' ? { fixedSha } : {}), ...(status === 'accepted' ? { proofRunId } : {}) }); await reload(); setNote('') }
    catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
    <p className="text-sm text-blue-700">{statusLabel[item.data.status]} · {item.data.persona} · {item.data.path}</p>
    <p className="whitespace-pre-wrap break-words font-medium">{item.data.text}</p>
    <p className="text-xs text-slate-500">Шаг: {item.data.stepId} · версия: {item.data.frontendSha.slice(0, 8)}</p>
    <details><summary className="cursor-pointer">Обработка замечания</summary><div className="space-y-3 mt-3">
      <label className="block">Что сделано или нужно уточнить<textarea className={field} value={note} maxLength={4000} onChange={e => setNote(e.target.value)} /></label>
      <label className="block">Версия исправления<input className={field} value={fixedSha} placeholder="SHA опубликованного исправления" onChange={e => setFixedSha(e.target.value)} /></label>
      <div className="flex flex-wrap gap-2"><button className={button} disabled={busy} onClick={() => void update('in-progress')}>В работу</button><button className={button} disabled={busy || !note || !fixedSha} onClick={() => void update('ready')}>Готово к повторной проверке</button><button className="p-2 underline" disabled={busy} onClick={() => void update('new')}>Открыть снова</button></div>
      {item.data.status === 'ready' && <><label className="block">Повторная проверка<select className={field} value={proofRunId} onChange={e => setProof(e.target.value)}><option value="">Выберите проверку исправленной версии</option>{runs.filter(r => r.data.scenarioId === item.data.scenarioId && r.data.id !== item.data.runId).map(r => <option key={r.id} value={r.data.id}>{new Date(r.data.createdAt).toLocaleString()} · {r.data.frontendSha.slice(0, 8)}</option>)}</select></label><button className={button} disabled={busy || !proofRunId} onClick={() => void update('accepted')}>Принять после повторной проверки</button><p className="text-xs text-slate-500">Нужен успешный шаг на версии исправления сайта и сервера.</p></>}
      {item.data.history.map((h, i) => <p key={i} className="text-sm break-words">{new Date(h.at).toLocaleString()} · {h.status}: {h.note}</p>)}
    </div></details>{error && <p role="alert" className="text-red-700">{error}</p>}
  </article>
}
export default function OwnerReview() {
  const user = useStore(s => s.user)
  const [data, setData] = useState<ReviewState | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [key, setKey] = useState<{ key: string; expiresAt: number } | null>(null)
  const [notice, setNotice] = useState('')
  async function reload() { const state = await loadReview(); setData(state); setError('') }
  useEffect(() => { let active = true; loadReview().then(value => { if (active) setData(value) }).catch(e => { if (active) setError(e.message) }); return () => { active = false } }, [user?.id])
  async function action(fn: () => Promise<void>) { setBusy(true); setError(''); try { await fn() } catch (e) { setError((e as Error).message) } finally { setBusy(false) } }
  async function start(scenarioId: string) {
    const id = crypto.randomUUID()
    await ownerRequest('POST', '/review/runs', { id, scenarioId, frontendSha: FRONTEND_SHA })
    activateReview(user!.id, id); await reload(); setNotice('Проверка открыта в боковой панели. Запустите тестовую роль для первого шага.')
  }
  return <main className="min-h-screen bg-slate-50 text-slate-900"><div className="max-w-6xl mx-auto px-4 py-8 space-y-7">
    <header className="flex flex-wrap justify-between gap-4"><div><Link to="/admin" className="text-blue-700">← Админка</Link><h1 className="text-3xl font-bold mt-2">Кабинет проверки Study Hub</h1><p className="text-slate-600 mt-2">Что изменилось → проверка за нужную роль → замечания → повторная проверка.</p></div><button className={button} disabled={busy} onClick={() => void action(reload)}>Обновить состояние</button></header>
    {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{error}</div>}
    {notice && <p role="status" className="text-blue-800">{notice}</p>}
    {!data && !error && <p role="status">Загружаем проверки…</p>}
    {data && <>
      <section className="rounded-2xl bg-slate-900 text-white p-5 space-y-2"><h2 className="font-semibold">Текущая версия · {data.build.environment === 'production' ? 'Рабочий сайт' : 'Локальная среда'}</h2><p>Сайт: {FRONTEND_SHA.slice(0, 8)} · сервер: {data.build.sha.slice(0, 8)}</p><p className="text-sm text-slate-300">Хранилище доступно · ИИ: {data.services.ai === 'not-configured' ? 'не настроен' : 'ключ настроен, ответ отдельно проверяется'} · Почта: {data.services.email === 'not-configured' ? 'не настроена' : 'настроена, доставка отдельно проверяется'}</p><p className="text-xs text-slate-400">Проверено: {new Date(data.checkedAt).toLocaleString()}</p>{(FRONTEND_SHA === 'unknown' || data.build.sha === 'unknown' || FRONTEND_SHA !== data.build.sha) && <p className="text-amber-200">Версия неизвестна или сайт и сервер отличаются. Не считайте такую проверку подтверждением конкретного выпуска.</p>}</section>
      <section className="space-y-3"><h2 className="text-xl font-semibold">Нужно проверить</h2><p className="text-slate-600">Сценарии привязываются к версии в момент запуска. Результаты прошлых выпусков остаются в истории.</p><div className="grid md:grid-cols-2 gap-4">{data.catalog.map(c => <article key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3"><h3 className="text-lg font-semibold">{c.title}</h3><p>{c.purpose}</p><p className="text-sm text-slate-500">{c.limitation}</p><button className={button} disabled={busy} onClick={() => void action(() => start(c.id))}>Начать проверку · {c.steps.length} шагов</button></article>)}</div></section>
      <section className="space-y-3"><h2 className="text-xl font-semibold">Замечания · {data.feedback.filter(f => f.data.status !== 'accepted').length} открыто</h2>{!data.feedback.length && <p>Замечаний пока нет. Оставьте первое в боковой панели сценария.</p>}{data.feedback.map(item => <FeedbackCard key={item.id} item={item} runs={data.runs} reload={reload} />)}</section>
      <section className="space-y-3"><h2 className="text-xl font-semibold">История проверок</h2>{data.runs.map(run => <article key={run.id} className="rounded-xl border border-slate-200 p-4 bg-white"><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-medium">{run.data.scenario.title}</h3><p className="text-sm text-slate-500">{new Date(run.data.createdAt).toLocaleString()} · {run.data.frontendSha.slice(0, 8)} · {Object.values(run.data.steps).filter(s => s.outcome === 'passed').length}/{run.data.scenario.steps.length} работает</p></div><button className={button} onClick={() => activateReview(user!.id, run.data.id)}>Продолжить</button></div><details className="mt-3"><summary>Результаты шагов</summary>{run.data.scenario.steps.map(s => <p key={s.id} className="mt-2 break-words">{s.title}: {run.data.steps[s.id] ? outcomeLabel[run.data.steps[s.id].outcome] : 'Не проверено'} {run.data.steps[s.id]?.comment}</p>)}</details></article>)}</section>
      <section className="space-y-3"><h2 className="text-xl font-semibold">Тестовые сессии</h2><p className="text-sm text-slate-600">До 30 минут; без пароля и прав владельца. Можно завершить оставленную в другой вкладке сессию.</p>{data.sessions.filter(s => !s.data.endedAt && s.data.expiresAt > Date.now()).map(s => <div key={s.id} className="flex flex-wrap gap-3"><span>{s.data.persona} · до {new Date(s.data.expiresAt).toLocaleTimeString()}</span><button className="text-blue-700 underline" disabled={busy} onClick={() => void action(async () => { await ownerRequest('DELETE', '/review/sessions/' + s.id.slice(8)); await reload() })}>Завершить сессию</button></div>)}</section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3"><h2 className="text-xl font-semibold">Передать замечания помощнику</h2><p>Можно скачать приватный отчёт или выпустить ключ чтения очереди на 7 дней. Ключ не даёт менять данные. Подключение и автоматический запуск обработки настраиваются отдельно.</p><div className="flex flex-wrap gap-3"><button className={button} disabled={busy} onClick={() => void action(async () => downloadLearningFile('studyhub-review.json', await ownerRequest('GET', '/review/export')))}>Скачать отчёт</button><button className={button} disabled={busy} onClick={() => void action(async () => setKey(await ownerRequest('POST', '/review/reader-key')))}>Создать ключ чтения</button><button className="text-red-700 underline" disabled={busy} onClick={() => void action(async () => { await ownerRequest('DELETE', '/review/reader-key'); setKey(null); setNotice('Ключ чтения отозван.') })}>Отозвать ключ</button></div>{key && <div className="space-y-2"><p>Сохраните ключ в настройке подключения, не в публичной задаче. До {new Date(key.expiresAt).toLocaleString()}.</p><input aria-label="Ключ чтения очереди" readOnly type="password" value={key.key} className={field} /><button className="text-blue-700 underline" onClick={() => void action(async () => { await navigator.clipboard.writeText(key.key); setNotice('Ключ скопирован.') })}>Скопировать ключ</button></div>}</section>
      {data.truncated && <p role="status">Показаны последние записи. В выгрузке доступны до 500 проверок и 500 замечаний с признаком ограничения.</p>}
    </>}
  </div></main>
}
