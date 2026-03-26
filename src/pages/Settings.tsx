import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, User, Lock, Check, AlertCircle, Send, Copy, ExternalLink, Gift, Users } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { api } from '@/lib/api'
import { useTranslation } from 'react-i18next'

type Status = { type: 'success' | 'error'; msg: string } | null

interface TelegramLinkData {
  code: string
  botUrl: string
  expiresAt: string
}

interface ReferralData {
  code: string
  referralCount: number
}

export default function Settings() {
  const { t } = useTranslation()
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
      setTgStatus({ type: 'success', msg: t('settings.telegram_unlinked') })
      updateUser({ telegramLinked: false })
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

  // ── Referral ────────────────────────────────────────────────────────────────
  const [referral, setReferral]           = useState<ReferralData | null>(null)
  const [refCopied, setRefCopied]         = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('studyhub-token')
    if (!token) return
    fetch('/api/referral/my', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => { if (res.ok) return res.json(); throw new Error('fail') })
      .then(data => setReferral(data))
      .catch(() => {/* silent */})
  }, [])

  function copyReferralLink() {
    if (!referral) return
    const link = `${window.location.origin}/auth?ref=${referral.code}`
    navigator.clipboard.writeText(link)
    setRefCopied(true)
    setTimeout(() => setRefCopied(false), 2000)
  }

  function shareWhatsApp() {
    if (!referral) return
    const link = `${window.location.origin}/auth?ref=${referral.code}`
    const message = t('settings.referral_wa_message', { link })
    window.open('https://wa.me/?text=' + encodeURIComponent(message), '_blank')
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
    if (!name.trim()) { setProfileStatus({ type: 'error', msg: t('settings.error_name_required') }); return }
    if (!email.trim()) { setProfileStatus({ type: 'error', msg: t('settings.error_email_required') }); return }

    setProfileLoading(true)
    setProfileStatus(null)
    try {
      const updates: Record<string, unknown> = { name: name.trim(), email: email.trim(), city }
      if (user?.role === 'student' && grade) updates.grade = Number(grade)

      const res = await api.put<{ user: Record<string, unknown> }>('/users/me', updates)
      updateUser(res.user as Parameters<typeof updateUser>[0])
      setProfileStatus({ type: 'success', msg: t('settings.profile_saved') })
    } catch (err) {
      setProfileStatus({ type: 'error', msg: (err as Error).message })
    } finally {
      setProfileLoading(false)
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPwd !== confirmPwd) { setPwdStatus({ type: 'error', msg: t('settings.error_passwords_mismatch') }); return }
    if (newPwd.length < 6) { setPwdStatus({ type: 'error', msg: t('settings.error_password_min') }); return }

    setPwdLoading(true)
    setPwdStatus(null)
    try {
      await api.post('/users/me/password', { currentPassword: curPwd, newPassword: newPwd })
      setPwdStatus({ type: 'success', msg: t('settings.password_changed') })
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
        <h1 className="font-bold text-slate-800 text-lg">{t('settings.title')}</h1>
      </header>

      <div className="mx-auto max-w-lg px-4 py-8 space-y-6">

        {/* Profile section */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="font-semibold text-slate-800">{t('settings.profile_title')}</h2>
          </div>

          <form onSubmit={saveProfile} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings.label_name')}</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('settings.placeholder_name')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings.label_email')}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings.label_city')}</label>
              <input
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('settings.placeholder_city')}
              />
            </div>

            {user?.role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings.label_grade')}</label>
                <select
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">{t('settings.grade_not_set')}</option>
                  <option value="9">{t('settings.grade_9')}</option>
                  <option value="10">{t('settings.grade_10')}</option>
                  <option value="11">{t('settings.grade_11')}</option>
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
              {profileLoading ? t('settings.saving') : t('settings.save')}
            </button>
          </form>
        </section>

        {/* Password section */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
              <Lock className="w-4 h-4 text-violet-600" />
            </div>
            <h2 className="font-semibold text-slate-800">{t('settings.security_title')}</h2>
          </div>

          <form onSubmit={changePassword} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings.current_password')}</label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings.new_password')}</label>
              <input
                type="password"
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder={t('settings.password_min_hint')}
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('settings.confirm_password')}</label>
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
              {pwdLoading ? t('settings.saving') : t('settings.change_password')}
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
              <h2 className="font-semibold text-slate-800">{t('settings.telegram_title')}</h2>
              <p className="text-xs text-slate-500">{t('settings.telegram_subtitle')}</p>
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
                  {t('settings.telegram_description')}
                </p>
                <button
                  type="button"
                  onClick={generateTgCode}
                  disabled={tgLoading}
                  className="w-full rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-semibold py-2.5 text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {tgLoading ? t('settings.telegram_generating') : t('settings.telegram_connect')}
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-600 font-medium">{t('settings.telegram_steps_title')}</p>

                {/* Step 1 */}
                <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-3">
                  <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">{t('settings.telegram_step1')}</p>
                    <a
                      href={tgData.botUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-1.5 text-sky-600 font-semibold text-sm hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {t('settings.telegram_open_bot')}
                    </a>
                  </div>
                </div>

                {/* Step 2 — code */}
                <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-3">
                  <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 mb-2">{t('settings.telegram_step2')}</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-slate-800 text-green-400 rounded-lg px-3 py-2 text-sm font-mono">
                        /link {tgData.code}
                      </code>
                      <button
                        type="button"
                        onClick={copyCode}
                        className="shrink-0 p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
                        title={t('settings.telegram_copy_tooltip')}
                      >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">{t('settings.telegram_code_expires')}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => { setTgData(null); setTgStatus(null) }}
                  className="text-xs text-slate-400 hover:text-slate-600 underline"
                >
                  {t('common.cancel')}
                </button>
              </div>
            )}

            {/* Unlink button — only if Telegram is actually linked */}
            {!tgData && user?.telegramLinked && (
              <button
                type="button"
                onClick={unlinkTelegram}
                className="w-full text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                {t('settings.telegram_unlink')}
              </button>
            )}
          </div>
        </section>

        {/* Referral section */}
        {referral && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <Gift className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-800">{t('settings.referral_title')}</h2>
                <p className="text-xs text-slate-500">{t('settings.referral_subtitle')}</p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Referral code */}
              <div className="flex items-center justify-center gap-3">
                <code className="text-2xl font-bold tracking-widest text-slate-800 bg-slate-50 rounded-xl px-6 py-3 border border-slate-200 select-all">
                  {referral.code}
                </code>
              </div>

              {/* Copy link */}
              <button
                type="button"
                onClick={copyReferralLink}
                className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 text-sm transition-colors flex items-center justify-center gap-2"
              >
                {refCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {refCopied ? t('settings.referral_copied') : t('settings.referral_copy_link')}
              </button>

              {/* Share via WhatsApp */}
              <button
                type="button"
                onClick={shareWhatsApp}
                className="w-full rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 text-sm transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                {t('settings.referral_share_whatsapp')}
              </button>

              {/* Friend count badge */}
              <div className="flex items-center justify-center gap-2 bg-slate-50 rounded-xl px-4 py-2.5">
                <Users className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">
                  {t('settings.referral_friends_count', { count: referral.referralCount })}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Support */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5">
            <p className="text-sm text-slate-500 text-center">
              {t('settings.need_help')}{' '}
              <Link to="/support" className="text-blue-600 font-medium hover:underline">
                {t('settings.contact_support')}
              </Link>
            </p>
          </div>
        </section>

      </div>
    </div>
  )
}
