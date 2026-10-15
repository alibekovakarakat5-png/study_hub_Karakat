import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useStore } from '@/store/useStore'

type Post = { id: string; text: string; target: string; status: string; messageId?: number }
type State = { policy: { reason: string }; ent: string; ielts: { text: string; reply_markup: { inline_keyboard: { text: string; url?: string }[][] } }; publications: Post[] }
const plain = (text: string) => text.replace(/<\/?(?:b|i)>/g, '')
const status: Record<string, string> = { draft: 'Черновик', publishing: 'Отправка начата; подтверждение ещё не сохранено', published: 'Доставка подтверждена', failed: 'Доставка отклонена', unknown: 'Доставка неизвестна' }

export default function TelegramReview() {
  const userId = useStore(s => s.user?.id)
  return <ReviewWorkspace key={userId} />
}
function ReviewWorkspace() {
  const [data, setData] = useState<State | null>(null)
  const [text, setText] = useState('Тестовая практика: напиши три предложения о своих учебных привычках.')
  const [outcome, setOutcome] = useState('success')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [draftId, setDraftId] = useState(() => crypto.randomUUID())
  const reload = async () => setData(await api.get<State>('/telegram-review'))
  useEffect(() => { let active = true; api.get<State>('/telegram-review').then(value => { if (active) setData(value) }).catch(e => { if (active) setError(e.message) }); return () => { active = false } }, [])
  async function action(work: () => Promise<void>) {
    setBusy(true); setError(''); setNotice('')
    try { await work(); await reload() } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }
  const button = 'rounded-xl bg-blue-700 px-4 py-3 text-white disabled:opacity-50'
  return <main className="min-h-screen bg-slate-50 text-slate-900 px-4 py-8"><div className="mx-auto max-w-4xl space-y-6 pb-44">
    <header><h1 className="text-2xl font-bold">Проверка Telegram</h1><p className="mt-2">Изолированный тестовый канал. Настоящие сообщения не отправляются. Черновики и статусы сохраняются только в этой проверке.</p></header>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
    {notice && <p role="status" className="rounded-xl bg-blue-50 p-4 text-blue-900">{notice}</p>}
    {!data ? <button className={button} disabled={busy} onClick={() => void action(reload)}>Загрузить проверку</button> : <>
      <section className="rounded-xl bg-white border p-5 space-y-3"><h2 className="font-semibold text-xl">Ответы ученику</h2><p className="whitespace-pre-wrap">{plain(data.ielts.text)}</p><div className="flex flex-wrap gap-3">{data.ielts.reply_markup.inline_keyboard.flat().filter(item => item.url).map(item => <a key={item.text} className="text-blue-800 underline" href={item.url} target="_blank" rel="noopener noreferrer">{item.text}</a>)}</div><p className="whitespace-pre-wrap border-t pt-4">{plain(data.ent)}</p></section>
      <section className="rounded-xl bg-white border p-5 space-y-3"><h2 className="font-semibold text-xl">Публикация под вашим контролем</h2><p>{data.policy.reason}</p><p>В действующем боте /g_publish готовит ручной черновик. Отправка требует отдельного подтверждения текста и целевого канала. AI-идея сама не публикуется.</p>
        <label className="block">Текст тестового поста<textarea className="block w-full mt-2 border rounded-lg p-3" rows={4} value={text} maxLength={3000} onChange={e => { setText(e.target.value); setDraftId(crypto.randomUUID()) }} /></label>
        <button className={button} disabled={busy || !text.trim()} onClick={() => void action(async () => { const result = await api.post<{ notice: string }>('/telegram-review/drafts', { id: draftId, text }); setDraftId(crypto.randomUUID()); setNotice(result.notice) })}>Создать черновик</button>
        <label className="block">Ответ тестового Telegram<select className="block w-full mt-2 border rounded-lg p-3" value={outcome} onChange={e => setOutcome(e.target.value)}><option value="success">Успех — сообщение №101</option><option value="rejected">Отказ Telegram — 403</option><option value="timeout">Тайм-аут — результат неизвестен</option></select></label>
      </section>
      <section className="space-y-3"><h2 className="font-semibold text-xl">История этой проверки</h2>{!data.publications.length && <p>Публикаций пока нет.</p>}{data.publications.map(post => <article key={post.id} className="rounded-xl bg-white border p-5 space-y-3">
        <p className="text-sm">Тестовый канал · {status[post.status] ?? post.status}{post.messageId ? ` · сообщение №${post.messageId}` : ''}</p><p className="whitespace-pre-wrap break-words">{post.text}</p>
        <button className={button} disabled={busy} onClick={() => void action(async () => { const result = await api.post<{ notice: string; requests: number }>('/telegram-review/publish', { id: post.id, outcome }); setNotice(`${result.notice} Новых запросов к тестовому Telegram: ${result.requests}.`) })}>{post.status === 'draft' ? 'Подтвердить тестовую публикацию' : 'Проверить повторную отправку'}</button>
      </article>)}</section>
    </>}
  </div></main>
}
