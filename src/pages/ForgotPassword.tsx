import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import { apiUrl } from '@/lib/api'

export default function ForgotPassword() {
  const [botUrl, setBotUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 12000)
    let active = true
    setLoading(true); setError(''); setBotUrl(null)
    void fetch(apiUrl('/api/auth/recovery-options'), { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error()
      const data = await response.json() as { available: boolean; botUrl: string | null }
      if (!data.available || !data.botUrl || !/^https:\/\/t\.me\/[a-zA-Z0-9_]+\?start=reset_password$/.test(data.botUrl)) throw new Error()
      if (active) setBotUrl(data.botUrl)
    }).catch(() => {
      if (active) setError('Бот восстановления сейчас недоступен. Попробуйте ещё раз немного позже.')
    }).finally(() => { clearTimeout(timeout); if (active) setLoading(false) })
    return () => { active = false; clearTimeout(timeout); controller.abort() }
  }, [attempt])

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-8">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl border border-slate-100">
        <Send className="w-10 h-10 text-sky-500 mx-auto mb-4" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-center text-slate-900">Восстановить пароль</h1>
        <p className="text-sm text-slate-600 mt-3">Восстановление работает через Telegram, который вы заранее привязали к своему аккаунту Study Hub.</p>
        <ol className="list-decimal pl-5 my-5 space-y-2 text-sm text-slate-700">
          <li>Откройте бота и нажмите «Начать» / Start. Если бот уже открыт, отправьте <code>/reset</code>.</li>
          <li>Бот пришлёт личную одноразовую ссылку. Она действует 15 минут.</li>
          <li>Откройте ссылку, задайте новый пароль и войдите на сайт с прежним email.</li>
        </ol>
        {loading && <p role="status" className="flex items-center justify-center gap-2 text-sm text-slate-500"><Loader2 className="w-4 h-4 animate-spin" />Проверяем доступность бота…</p>}
        {botUrl && <a href={botUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 px-4 py-3 text-white font-semibold"><Send className="w-4 h-4" />Открыть Telegram</a>}
        {error && <div role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900"><p>{error}</p><button type="button" onClick={() => setAttempt(a => a + 1)} className="mt-2 underline font-semibold">Проверить снова</button></div>}
        <details className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          <summary className="cursor-pointer font-medium text-slate-800">Telegram ещё не привязан?</summary>
          <p className="mt-2">Для привязки в Настройках нужен вход в аккаунт и текущий пароль. Если пароль забыт и Telegram не был привязан, обратитесь к владельцу платформы для проверки аккаунта. Восстановление по почте пока не подключено.</p>
        </details>
        <Link to="/auth" className="mt-6 flex items-center justify-center gap-1 text-sm font-medium text-primary-600"><ArrowLeft className="w-4 h-4" />Вернуться ко входу</Link>
      </div>
    </main>
  )
}
