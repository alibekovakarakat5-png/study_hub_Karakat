import { useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { aiChatApi } from '@/lib/api'

type Message = { role: 'user' | 'assistant'; content: string }

/** Session-only history: never shares a student's conversation with another account. */
export default function StudyMentor() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const inFlight = useRef(false)
  async function send() {
    const question = input.trim()
    if (!question || inFlight.current) return
    inFlight.current = true
    setBusy(true)
    setError('')
    try {
      const result = await aiChatApi.send(question, messages.slice(-10).map(m => ({ ...m, content: m.content.slice(0, 6000) })))
      if (!result.reply?.trim()) throw new Error('Помощник вернул пустой ответ. Попробуйте ещё раз.')
      setMessages(prev => [...prev, { role: 'user', content: question }, { role: 'assistant', content: result.reply }])
      setInput('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось связаться с помощником.')
    } finally {
      inFlight.current = false
      setBusy(false)
    }
  }
  return <div className="space-y-4 text-white">
    <p className="text-sm text-slate-300">Skylla — ИИ-помощник, не человек-куратор. Куратор проекта — Каракат. Диалог хранится только до ухода со страницы. Сообщения отправляются ИИ-провайдеру; не вводите личные документы и пароли.</p>
    <div className="max-h-[420px] overflow-y-auto space-y-4" aria-live="polite" aria-busy={busy}>
      {!messages.length && <p>Расскажи о цели, текущем уровне и доступном времени. Например: «Составь план IELTS на неделю, 5 часов, приоритет Speaking».</p>}
      {messages.map((m, i) => <div key={i} className={`rounded-xl p-4 ${m.role === 'user' ? 'bg-blue-700' : 'bg-slate-800'}`}>
        <p className="text-xs text-slate-300 mb-2">{m.role === 'user' ? 'Вы' : 'Skylla'}</p>
        <div className="space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:underline"><ReactMarkdown>{m.content}</ReactMarkdown></div>
      </div>)}
      {busy && <p>Помощник готовит ответ…</p>}
    </div>
    {error && <p role="alert" className="rounded-xl bg-red-950 p-3 text-red-200">{error} Вопрос сохранён в поле — можно повторить отправку. Учебные задания доступны и без ИИ.</p>}
    <form onSubmit={e => { e.preventDefault(); void send() }} className="space-y-2">
      <label htmlFor="mentor-question" className="block text-sm">Вопрос помощнику</label>
      <textarea id="mentor-question" value={input} disabled={busy} onChange={e => setInput(e.target.value)} maxLength={2000} rows={3} className="w-full rounded-xl bg-slate-900 border border-slate-600 p-3" />
      <button disabled={busy || !input.trim()} className="rounded-xl bg-blue-600 px-5 py-3 disabled:opacity-50">{busy ? 'Отправляется…' : 'Отправить'}</button>
      <p className="text-xs text-slate-400">Помощник не создаёт напоминания и не сохраняет план автоматически. Его оценки не являются официальными результатами IELTS.</p>
    </form>
  </div>
}
