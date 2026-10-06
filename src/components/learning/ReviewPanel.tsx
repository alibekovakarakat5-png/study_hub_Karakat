import { useRef, useState } from 'react'
import { api } from '@/lib/api'
import { learningApi } from '@/lib/learning'
import type { LearningItem, LearningRecord } from '@/lib/learning'

const field = 'w-full rounded-xl border border-slate-600 bg-slate-950 p-3'
const button = 'rounded-xl bg-blue-600 px-4 py-2 disabled:opacity-40'
export default function ReviewPanel({ items, onChange, onDelete }: { items: LearningRecord<LearningItem>[]; onChange: (r: LearningRecord<LearningItem>) => void; onDelete: (id: string) => void }) {
  const [item, setItem] = useState({ kind: 'error' as 'error' | 'phrase', topic: '', original: '', correction: '', explanation: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const request = useRef<{ value: string; id: string } | null>(null)
  const sorted = [...items].sort((a, b) => a.data.nextReviewAt.localeCompare(b.data.nextReviewAt))
  return <div className="space-y-5"><div><h2 className="text-xl font-semibold">Карта ошибок и активных фраз</h2><p>Сохраните конкретную ошибку или сочетание слов. На повторении сначала вспомните исправление, затем создайте новый пример. Отметка «вспомнил» — ваша самооценка, не экзаменационная проверка.</p></div>
    <form className="rounded-2xl border border-slate-700 p-5 space-y-3" onSubmit={async e => { e.preventDefault(); if (busy) return; setBusy(true); setError(''); const value = JSON.stringify(item); if (request.current?.value !== value) request.current = { value, id: crypto.randomUUID() }; try { const { record } = await learningApi.item(item, request.current.id); onChange(record); setItem({ kind: 'error', topic: '', original: '', correction: '', explanation: '' }); request.current = null } catch (e) { setError((e as Error).message) } finally { setBusy(false) } }}>
      <label className="block">Тип<select className={field} value={item.kind} onChange={e => setItem(i => ({ ...i, kind: e.target.value as typeof item.kind }))}><option value="error">Ошибка</option><option value="phrase">Фраза / collocation</option></select></label>
      {([['topic', 'Тема', 100], ['original', 'Мой вариант / подсказка для вспоминания', 500], ['correction', 'Исправление / фраза целиком', 500], ['explanation', 'Почему так / контекст', 1000]] as const).map(([key, label, max]) => <label className="block" key={key}>{label}<input className={field} required={key === 'topic' || key === 'correction'} maxLength={max} value={item[key]} onChange={e => setItem(i => ({ ...i, [key]: e.target.value }))} /></label>)}
      <button className={button} disabled={busy}>Добавить в повторение</button>
    </form>{error && <p role="alert" className="text-red-200">{error}</p>}
    {!items.length && <p>Журнал пока пуст. Добавьте первую фразу из своей работы или разбора.</p>}
    {sorted.map(record => <ReviewCard key={`${record.id}:${record.revision}`} record={record} onChange={onChange} onDelete={onDelete} />)}
  </div>
}
function ReviewCard({ record, onChange, onDelete }: { record: LearningRecord<LearningItem>; onChange: (r: LearningRecord<LearningItem>) => void; onDelete: (id: string) => void }) {
  const [revealed, setRevealed] = useState(false)
  const [example, setExample] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const data = record.data
  const due = new Date(data.nextReviewAt).getTime() <= Date.now()
  async function review(recalled: boolean) { setBusy(true); setError(''); try { const result = await learningApi.review(record.id.slice('item-'.length), record.revision, recalled, example); onChange(result.record) } catch (e) { setError((e as Error).message) } finally { setBusy(false) } }
  return <article className="rounded-2xl border border-slate-700 p-5 space-y-3"><p className="text-sm text-blue-300">{due ? 'Пора повторить' : `Повторить ${new Date(data.nextReviewAt).toLocaleDateString()}`} · {data.kind === 'error' ? 'Ошибка' : 'Фраза'}</p><h3 className="font-semibold">{data.topic}</h3><p className="whitespace-pre-wrap">{data.original || 'Вспомните фразу по теме без подсказки.'}</p><button className="text-blue-300 underline" onClick={() => setRevealed(true)}>Показать исправление / фразу</button>
    {revealed && <><p className="text-emerald-300">{data.correction}</p><p>{data.explanation}</p><label className="block">Теперь новый пример из вашей жизни<textarea aria-label="Теперь новый пример из вашей жизни" className={field} rows={3} maxLength={1000} value={example} onChange={e => setExample(e.target.value)} /></label><div className="flex flex-wrap gap-3"><button className={button} disabled={busy || example.trim().length < 10} onClick={() => void review(true)}>Вспомнил(а) без подсказки</button><button className={button} disabled={busy || example.trim().length < 10} onClick={() => void review(false)}>Нужна ещё практика</button></div></>}
    {!!data.history.length && <details><summary>Мои прошлые примеры</summary>{data.history.map((h, i) => <p className="mt-2 whitespace-pre-wrap" key={i}>{new Date(h.at).toLocaleDateString()} · {h.example}</p>)}</details>}
    <button className="text-sm text-rose-300 underline" disabled={busy} onClick={() => setDeleting(true)}>Удалить запись</button>{deleting && <div><p>Удалить эту запись и её примеры?</p><button className="text-rose-300 underline mr-5" disabled={busy} onClick={async () => { setBusy(true); try { await api.del(`/learning/items/${record.id.slice(5)}`); onDelete(record.id) } catch (e) { setError((e as Error).message); setBusy(false) } }}>Да, удалить</button><button onClick={() => setDeleting(false)}>Отмена</button></div>}{error && <p role="alert" className="text-red-200">{error}</p>}
  </article>
}
