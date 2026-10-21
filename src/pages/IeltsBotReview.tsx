import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useStore } from '@/store/useStore'
type Reply = { text: string; buttons?: { text: string; data?: string; url?: string }[][] }
type State = { target: string | null; cursor: number; completedMissions?: number[]; correct: number; answered: number; reviewed: number; mistakes: string[]; active: { answers: number[]; ids: string[] } | null; writing?: { draft: string; revision: number; submissions: unknown[] }; grammar?: { correct: number; answered: number; pending: string[] } }
const button = 'rounded-xl bg-blue-700 px-4 py-3 text-white disabled:opacity-50'
export default function IeltsBotReview() { const id = useStore(s => s.user?.id); return <Workspace key={id} /> }
function Workspace() {
  const [state, setState] = useState<State | null>(null), [replies, setReplies] = useState<Reply[]>([])
  const [membership, setMembership] = useState('member'), [delivery, setDelivery] = useState('success')
  const [ai, setAi] = useState('success'), [draft, setDraft] = useState('I think money can be a useful gift because students needs books and equipment. However, a personal gift can show care and help young people develop their interests.')
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('')
  const [last, setLast] = useState<{ updateId: number; command: string } | null>(null)
  useEffect(() => { let live = true; api.get<{ state: State }>('/ielts-bot-review').then(r => { if (live) setState(r.state) }).catch(e => { if (live) setError(e.message) }); return () => { live = false } }, [])
  async function send(command: string, repeat = false) {
    const update = repeat && last ? last : { command, updateId: Date.now() * 100 + Math.floor(Math.random() * 100) }
    setBusy(true); setError(''); setLast(update)
    try {
      const result = await api.post<{ state: State; replies: Reply[]; sends: number }>('/ielts-bot-review/update', { ...update, membership, delivery, ai })
      setState(result.state); setReplies(old => [...old, ...result.replies].slice(-12)); setNotice(`Новых отправок в тестовый Telegram: ${result.sends}.`)
    } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }
  return <main className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-8"><div className="max-w-3xl mx-auto space-y-5 pb-44">
    <h1 className="text-2xl font-bold">Проверка IELTS-бота</h1><p>Здесь работает тот же обработчик, что и в Telegram. Подписка и доставка синтетические; настоящие сообщения не отправляются. Токен бота не нужен. Проверка реальной подписки и Telegram выполняется отдельно после подключения.</p>
    {error && <p role="alert" className="bg-red-50 p-3 text-red-800">{error}</p>}{notice && <p role="status">{notice}</p>}
    <div className="grid sm:grid-cols-2 gap-3"><label>Подписка<select aria-label="Подписка" className="block w-full border p-3 rounded-lg" value={membership} onChange={e => setMembership(e.target.value)}><option value="member">Подписан</option><option value="absent">Не подписан</option><option value="unavailable">Telegram недоступен</option></select></label><label>Доставка<select aria-label="Доставка" className="block w-full border p-3 rounded-lg" value={delivery} onChange={e => setDelivery(e.target.value)}><option value="success">Успех</option><option value="timeout">Тайм-аут</option></select></label></div>
    <label className="block">Проверка ИИ<select aria-label="Проверка ИИ" className="block w-full border p-3 rounded-lg" value={ai} onChange={e => setAi(e.target.value)}><option value="success">Синтетический разбор</option><option value="unavailable">Провайдер недоступен</option></select></label>
    <p>В этом кабинете Groq не вызывается: разбор заранее задан для проверки сохранения, согласия и повторной сдачи. Качество реального ИИ проверяется отдельно.</p>
    <div className="flex flex-wrap gap-2">{['/start', '/reading', '/writing', '/hint', '/draft', '/feedback', '/grammar', '/today', '/mistakes', '/progress', '/goal', '/help', '/privacy'].map(command => <button key={command} className={button} disabled={busy} onClick={() => void send(command)}>{command}</button>)}<button className="border rounded-xl p-3" disabled={busy || !last} onClick={() => last && void send(last.command, true)}>Повторить тот же update</button></div>
    <section className="space-y-2"><label className="block">Тестовое эссе<textarea aria-label="Тестовое эссе" className="block w-full border rounded-xl p-3" rows={5} maxLength={3500} value={draft} onChange={e => setDraft(e.target.value)} /></label><button className={button} disabled={busy || !draft.trim()} onClick={() => void send(draft)}>Отправить текст боту</button><p>Сначала выберите тему в /writing. Отправка текста сохраняет черновик; проверка запускается отдельной кнопкой в ответе бота.</p></section>
    {state && <section className="rounded-xl border bg-white p-4"><h2 className="font-semibold">Сохранённый прогресс</h2><p>Цель: {state.target ?? 'не выбрана'} · занятия: {state.completedMissions?.length ?? state.cursor}/7 · первые ответы: {state.correct}/{state.answered} · ошибок: {state.mistakes.length} · успешных повторений: {state.reviewed}</p><p>{state.active ? `Незавершённая попытка: ${state.active.answers.length}/${state.active.ids.length}. /today продолжит её.` : 'Незавершённой попытки нет.'}</p><p>Writing: версия {state.writing?.revision ?? 0} · разборов: {state.writing?.submissions.length ?? 0} · грамматика: {state.grammar?.correct ?? 0}/{state.grammar?.answered ?? 0}</p></section>}
    <section className="space-y-3" aria-label="Ответы бота"><h2 className="font-semibold">Диалог этой вкладки</h2><p>После обновления страницы история сообщений здесь очищается. Сохранённый прогресс остаётся; /today и /progress восстанавливают нужный ответ.</p>{replies.map((reply, index) => <article key={index} className="rounded-xl border bg-white p-4 space-y-3"><p className="whitespace-pre-wrap">{reply.text}</p><div className="flex flex-wrap gap-2">{reply.buttons?.flat().map((b, i) => b.url ? <a className="text-blue-800 underline p-2" key={i} href={b.url} target="_blank" rel="noopener noreferrer">{b.text}</a> : <button className={button} key={i} disabled={busy} onClick={() => void send(b.data!)}>{b.text}</button>)}</div></article>)}</section>
  </div></main>
}
