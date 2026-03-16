import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap,
  Users,
  Mail,
  Lock,
  User,
  MapPin,
  BookOpen,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Shield,
  Briefcase,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { UserRole } from '@/types'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

type AuthMode = 'login' | 'register'
type Role = UserRole

const CITIES = [
  'Алматы',
  'Астана',
  'Шымкент',
  'Караганда',
  'Актобе',
  'Тараз',
  'Павлодар',
  'Усть-Каменогорск',
  'Семей',
  'Атырау',
  'Костанай',
  'Кызылорда',
  'Уральск',
  'Петропавловск',
  'Актау',
  'Темиртау',
  'Туркестан',
  'Кокшетау',
  'Талдыкорган',
  'Экибастуз',
]

const GRADES = [9, 10, 11]

export default function Auth() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fromSource = searchParams.get('from') // ent | ielts | admit | startup | career
  const { t } = useTranslation()
  const { login, register, isAuthenticated, user, onboardingCompleted } = useStore()

  const [mode, setMode] = useState<AuthMode>('login')
  const [role, setRole] = useState<Role>('student')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [justRegistered, setJustRegistered] = useState(false)

  // Login fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Register fields
  const [name, setName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [grade, setGrade] = useState(11)
  const [city, setCity] = useState('Алматы')
  const [childEmail, setChildEmail] = useState('')

  // Context onboarding: redirect based on landing entry point
  const SOURCE_REDIRECT: Record<string, string> = {
    ent:     '/diagnostic',
    ielts:   '/ielts',
    admit:   '/admissions',
    startup: '/startup-lab',
    career:  '/career-tracker',
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true })
      } else if (user.role === 'parent') {
        navigate('/parent', { replace: true })
      } else if (user.role === 'teacher') {
        navigate('/teacher', { replace: true })
      } else if (user.role === 'employer') {
        navigate('/employer', { replace: true })
      } else if (justRegistered && user.role === 'student') {
        // New student → welcome flow, then destination
        const dest = fromSource && SOURCE_REDIRECT[fromSource]
          ? SOURCE_REDIRECT[fromSource]
          : '/dashboard'
        navigate(`/welcome?to=${encodeURIComponent(dest)}`, { replace: true })
      } else if (fromSource && SOURCE_REDIRECT[fromSource]) {
        navigate(SOURCE_REDIRECT[fromSource], { replace: true })
      } else {
        navigate(onboardingCompleted ? '/dashboard' : '/onboarding', { replace: true })
      }
    }
  }, [isAuthenticated, user, onboardingCompleted, navigate, fromSource, justRegistered])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Заполните все поля')
      return
    }

    setIsLoading(true)
    try {
      await login(email, password, role)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неверный email или пароль')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError('Заполните все обязательные поля')
      return
    }

    if (regPassword.length < 6) {
      setError('Пароль должен содержать минимум 6 символов')
      return
    }

    if (role === 'parent' && !childEmail.trim()) {
      setError('Введите email ребёнка')
      return
    }

    if (role === 'admin') {
      setError('Регистрация админов недоступна')
      return
    }

    if (role === 'employer') {
      setError('Для работодателей доступен только вход по приглашению')
      return
    }

    setIsLoading(true)
    try {
      await register({
        name,
        email: regEmail,
        password: regPassword,
        role,
        grade: role === 'student' ? grade : undefined,
        city: role === 'student' ? city : undefined,
        childEmail: role === 'parent' ? childEmail : undefined,
      })
      setJustRegistered(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при регистрации. Попробуйте ещё раз.')
    } finally {
      setIsLoading(false)
    }
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    setError('')
  }

  const inputClasses =
    'w-full rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm px-4 py-3 pl-11 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100'

  const selectClasses =
    'w-full rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm px-4 py-3 pl-11 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 appearance-none cursor-pointer'

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      {/* Gradient background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary-50 via-white to-primary-100" />
      <div className="fixed inset-0 -z-10 opacity-40">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary-200 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary-300 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-100 blur-3xl" />
      </div>

      {/* Floating decorative elements */}
      <motion.div
        className="fixed left-[10%] top-[15%] h-3 w-3 rounded-full bg-primary-400/30"
        animate={{ y: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="fixed right-[15%] top-[25%] h-2 w-2 rounded-full bg-primary-500/20"
        animate={{ y: [0, 15, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
      <motion.div
        className="fixed left-[20%] bottom-[20%] h-4 w-4 rounded-full bg-primary-300/25"
        animate={{ y: [0, -15, 0], opacity: [0.25, 0.6, 0.25] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary-200/50">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient">Study Hub</h1>
          <p className="mt-1.5 text-sm text-gray-500">
            {mode === 'login' ? t('auth.login_subtitle') : t('auth.register_subtitle')}
          </p>
          <div className="mt-3 flex justify-center">
            <LanguageSwitcher />
          </div>
        </motion.div>

        {/* Card */}
        <div className="glass rounded-2xl p-6 shadow-xl shadow-gray-200/40">
          {/* Role toggle */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-1 rounded-xl bg-gray-100/80 p-1">
              {([
                { key: 'student' as Role, labelKey: 'auth.role_student', icon: GraduationCap },
                { key: 'parent' as Role, labelKey: 'auth.role_parent', icon: Users },
                { key: 'teacher' as Role, labelKey: 'auth.role_teacher', icon: BookOpen },
                { key: 'employer' as Role, labelKey: 'auth.role_employer', icon: Briefcase },
              ]).map(({ key, labelKey, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setRole(key); setError(''); if (key === 'employer') setMode('login') }}
                  className={`relative flex min-w-[30%] flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-all duration-200 ${
                    role === key
                      ? 'text-primary-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {role === key && (
                    <motion.div
                      layoutId="roleTab"
                      className="absolute inset-0 rounded-lg bg-white shadow-sm"
                      transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" />
                    {t(labelKey)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Auth mode toggle (hide for employer — login only) */}
          {role !== 'employer' && (
            <div className="mb-6">
              <div className="flex rounded-xl bg-gray-100/80 p-1">
                {([
                  { key: 'login' as AuthMode, labelKey: 'auth.login_tab' },
                  { key: 'register' as AuthMode, labelKey: 'auth.register_tab' },
                ]).map(({ key, labelKey }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => switchMode(key)}
                    className={`relative flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                      mode === key
                        ? 'text-primary-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {mode === key && (
                      <motion.div
                        layoutId="authTab"
                        className="absolute inset-0 rounded-lg bg-white shadow-sm"
                        transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{t(labelKey)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="mb-4 overflow-hidden rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder={t('auth.email')}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={inputClasses}
                    autoComplete="email"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.password')}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={`${inputClasses} pr-11`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl gradient-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-200/50 transition-all duration-200 hover:shadow-xl hover:shadow-primary-300/40 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <motion.div
                      className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <>
                      {t('auth.login_btn')}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </motion.button>

                {/* Switch to register */}
                <p className="text-center text-sm text-gray-500">
                  {t('auth.no_account')}{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="font-medium text-primary-600 transition-colors hover:text-primary-700"
                  >
                    {t('auth.register_btn')}
                  </button>
                </p>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                {/* Name */}
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('auth.name')}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className={inputClasses}
                    autoComplete="name"
                  />
                </div>

                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder={t('auth.email')}
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    className={inputClasses}
                    autoComplete="email"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.password')}
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    className={`${inputClasses} pr-11`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Role-specific fields */}
                <AnimatePresence mode="wait">
                  {role === 'student' && (
                    <motion.div
                      key="student-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4 overflow-hidden"
                    >
                      {/* Grade */}
                      <div className="relative">
                        <BookOpen className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <select
                          value={grade}
                          onChange={e => setGrade(Number(e.target.value))}
                          className={selectClasses}
                        >
                          {GRADES.map(g => (
                            <option key={g} value={g}>
                              {g} {t('auth.grade_suffix')}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2">
                          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {/* City */}
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <select
                          value={city}
                          onChange={e => setCity(e.target.value)}
                          className={selectClasses}
                        >
                          {CITIES.map(c => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2">
                          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {role === 'parent' && (
                    <motion.div
                      key="parent-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      {/* Child email */}
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          placeholder={t('auth.child_email')}
                          value={childEmail}
                          onChange={e => setChildEmail(e.target.value)}
                          className={inputClasses}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl gradient-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-200/50 transition-all duration-200 hover:shadow-xl hover:shadow-primary-300/40 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <motion.div
                      className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <>
                      {t('auth.register_btn')}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </motion.button>

                {/* Switch to login */}
                <p className="text-center text-sm text-gray-500">
                  {t('auth.have_account')}{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-medium text-primary-600 transition-colors hover:text-primary-700"
                  >
                    {t('auth.login_btn')}
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-xs text-gray-400"
        >
          Продолжая, вы соглашаетесь с условиями использования
        </motion.p>
      </motion.div>
    </div>
  )
}
