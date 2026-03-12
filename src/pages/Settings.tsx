import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, User, Lock, Check, AlertCircle, Send, Copy, ExternalLink } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { api } from '@/lib/api'

type Status = { type: 'success' | 'error'; msg: string } | null

interface TelegramLinkData {
  code: string
  botUrl: string
  expiresAt: string
}

export default function Settings() {
  const { user, updateUser } = useStore()

  // ── Telegram link ────────────────────────────────────────────────────────────
  const [tgData, setTgData]       = useState<TelegramLinkData | null>(null)
  const [tgLoading, setTgLoading] = useState(false)
  const [tgStatus, setTgStatus]   = useState<Status>(null)
  const [copied, setCopied]       = useState(false)

  async function generateTgCode() {
    setTgLoading(true)
    setTgStatus(null)
    try {
      const res = await api.post<TelegramLinkData>('/users/me/telegram-link', {})
      setTgData(res)
    } catch (err) {
      setTgStatus({ type: 'error', msg: (err as Error).message })
    } finally {
      setTgLoading(false)
    }
  }

  async function unlinkTelegram() {
    try {
      await api.del('/users/me/telegram-link')
      setTgData(null)
      setTgStatus({ type: 'success', msg: 'Telegram отвязан' })
    } catch (err) {
      setTgStatus({ type: 'error', msg: (err as Error).message })
    }
  }

  function copyCode() {
    if (!tgData) return
    navigator.clipboard.writeText(`/link ${tgData.code}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Profile form ────────────────────────────────────────────────────────────
  const [name, setName]   = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [city, setCity]   = useState(user?.city ?? '')
  const [grade, setGrade] = useState(String(user?.grade ?? ''))
  const [profileStatus, setProfileStatus] = useState<Status>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  // ── Password form ───────────────────────────────────────────────────────────
  const [curPwd, setCurPwd]       = useState('')
  const [newPwd, setNewPwd]       = useState('')
  const [confirmPwd, setConfirm]  = useState('')
  const [pwdStatus, setPwdStatus] = useState<Status>(null)
  const [pwdLoading, setPwdLoading] = useState(false)

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setProfileStatus({ type: 'error', msg: 'Имя обязательно' }); return }
    if (!email.trim()) { setProfileStatus({ type: 'error', msg: 'Email обязателен' }); return }

    setProfileLoading(true)
    setProfileStatus(null)
    try {
      const updates: Record<string, unknown> = { name: name.trim(), email: email.trim(), city }
      if (user?.role === 'student' && grade) updates.grade = Number(grade)

      const res = await api.put<{ user: Record<string, unknown> }>('/users/me', updates)
      updateUser(res.user as Parameters<typeof updateUser>[0])
      setProfileStatus({ type: 'success', msg: 'Профиль сохранён' })
    } catch (err) {
      setProfileStatus({ type: 'error', msg: (err as Error).message })
    } finally {
      setProfileLoading(false)
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPwd !== confirmPwd) { setPwdStatus({ type: 'error', msg: 'Пароли не совпадают' }); return }
    if (newPwd.length < 6) { setPwdStatus({ type: 'error', msg: 'Минимум 6 символов' }); return }

    setPwdLoading(true)
    setPwdStatus(null)
    try {
      await api.post('/users/me/password', { currentPassword: curPwd, newPassword: newPwd })
      setPwdStatus({ type: 'success', msg: 'Пароль изменён' })
      setCurPwd(''); setNewPwd(''); setConfirm('')
    } catch (err) {
      setPwdStatus({ type: 'error', msg: (err as Error).message })
    } finally {
      setPwdLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <Link to="/dashboard" className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <h1 className="font-bold text-slate-800 text-lg">Настройки</h1>
      </header>

      <div className="mx-auto max-w-lg px-4 py-8 space-y-6">

        {/* Profile section */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="font-semibold text-slate-800">Профиль</h2>
          </div>

          <form onSubmit={saveProfile} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Имя</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Твоё имя"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Город</label>
              <input
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Алматы"
              />
            </div>

            {user?.role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Класс</label>
                <select
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Не указан</option>
                  <option value="9">9 класс</option>
                  <option value="10">10 класс</option>
                  <option value="11">11 класс</option>
                </select>
              </div>
            )}

            {profileStatus && (
              <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm ${
                profileStatus.type === 'success'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}>
                {profileStatus.type === 'success'
                  ? <Check className="w-4 h-4 flex-shrink-0" />
                  : <AlertCircle className="w-4 h-4 flex-shrink-0" />
                }
                {profileStatus.msg}
              </div>
            )}

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full rounded-xl bg-blue-600 text-white font-semibold py-2.5 text-sm hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {profileLoading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </form>
        </section>

        {/* Password section */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
              <Lock className="w-4 h-4 text-violet-600" />
            </div>
            <h2 className="font-semibold text-slate-800">Безопасность</h2>
          </div>

          <form onSubmit={changePassword} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Текущий пароль</label>
              <input
                type="password"
                value={curPwd}
                onChange={e => setCurPwd(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Новый пароль</label>
              <input
                type="password"
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="Минимум 6 символов"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Подтвердить пароль</label>
              <input
                type="password"
                value={confirmPwd}
                onChange={e => setConfirm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            {pwdStatus && (
              <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm ${
                pwdStatus.type === 'success'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}>
                {pwdStatus.type === 'success'
                  ? <Check className="w-4 h-4 flex-shrink-0" />
                  : <AlertCircle className="w-4 h-4 flex-shrink-0" />
                }
                {pwdStatus.msg}
              </div>
            )}

            <button
              type="submit"
              disabled={pwdLoading}
              className="w-full rounded-xl bg-violet-600 text-white font-semibold py-2.5 text-sm hover:bg-violet-700 disabled:opacity-60 transition-colors"
            >
              {pwdLoading ? 'Сохранение...' : 'Изменить пароль'}
            </button>
          </form>
        </section>

        {/* Telegram section */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
              <Send className="w-4 h-4 text-sky-500" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Telegram бот</h2>
              <p className="text-xs text-slate-500">Ежедневные вопросы и прогресс прямо в мессенджере</p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {tgStatus && (
              <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm ${
                tgStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {tgStatus.type === 'success'
                  ? <Check className="w-4 h-4 flex-shrink-0" />
                  : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                {tgStatus.msg}
              </div>
            )}

            {!tgData ? (
              <>
                <p className="text-sm text-slate-600">
                  Привяжи Telegram — и бот будет присылать тренировочный вопрос каждый день, показывать твой прогресс и напоминать о занятиях.
                </p>
                <button
                  type="button"
                  onClick={generateTgCode}
                  disabled={tgLoading}
                  className="w-full rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-semibold py-2.5 text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {tgLoading ? 'Генерирую код...' : 'Подключить Telegram'}
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-600 font-medium">Шаги для привязки:</p>

                {/* Step 1 */}
                <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-3">
                  <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">Открой бота в Telegram</p>
                    <a
                      href={tgData.botUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-1.5 text-sky-600 font-semibold text-sm hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Открыть @StudyHubKZBot
                    </a>
                  </div>
                </div>

                {/* Step 2 — code */}
                <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-3">
                  <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 mb-2">Отправь боту эту команду:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-slate-800 text-green-400 rounded-lg px-3 py-2 text-sm font-mono">
                        /link {tgData.code}
                      </code>
                      <button
                        type="button"
                        onClick={copyCode}
                        className="shrink-0 p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
                        title="Скопировать"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">Код действителен 15 минут</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => { setTgData(null); setTgStatus(null) }}
                  className="text-xs text-slate-400 hover:text-slate-600 underline"
                >
                  Отмена
                </button>
              </div>
            )}

            {/* Unlink button */}
            {!tgData && (
              <button
                type="button"
                onClick={unlinkTelegram}
                className="w-full text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                Отвязать Telegram
              </button>
            )}
          </div>
        </section>

        {/* Support */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5">
            <p className="text-sm text-slate-500 text-center">
              Нужна помощь?{' '}
              <Link to="/support" className="text-blue-600 font-medium hover:underline">
                Написать в поддержку
              </Link>
            </p>
          </div>
        </section>

      </div>
    </div>
  )
}
