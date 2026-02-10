import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Award,
  BookOpen,
  Code,
  Download,
  ExternalLink,
  Flame,
  FolderOpen,
  GraduationCap,
  Share2,
  Star,
  Trophy,
  Clock,
  Target,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { SUBJECT_NAMES, SUBJECT_COLORS } from '@/types'
import type { Subject } from '@/types'
import { cn, formatDate, minutesToHumanReadable } from '@/lib/utils'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

export default function Portfolio() {
  const navigate = useNavigate()
  const { user, diagnosticResult, studyPlan, achievements } = useStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'achievements' | 'activity'>('overview')

  if (!user) {
    navigate('/auth')
    return null
  }

  const unlockedAchievements = achievements.filter(a => a.unlockedAt)
  const totalTasks = studyPlan?.weeks.flatMap(w => w.tasks).length || 0
  const completedTasks = studyPlan?.weeks.flatMap(w => w.tasks).filter(t => t.completed).length || 0

  const skills: { subject: Subject; level: number; label: string }[] = diagnosticResult
    ? diagnosticResult.subjects.map(s => ({
        subject: s.subject,
        level: s.percentage,
        label: SUBJECT_NAMES[s.subject],
      }))
    : []

  const tabs = [
    { id: 'overview' as const, label: 'Обзор', icon: FolderOpen },
    { id: 'skills' as const, label: 'Навыки', icon: Code },
    { id: 'achievements' as const, label: 'Достижения', icon: Trophy },
    { id: 'activity' as const, label: 'Активность', icon: Clock },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="gradient-hero text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад к дашборду
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center text-3xl font-bold shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-white/70 mt-1">
                {user.grade} класс · {user.city}
              </p>
              {user.targetUniversity && (
                <p className="text-primary-200 mt-1 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Цель: {user.targetUniversity} — {user.targetSpecialty}
                </p>
              )}
              <div className="flex gap-4 mt-3">
                <span className="flex items-center gap-1 text-sm bg-white/10 px-3 py-1 rounded-full">
                  <Flame className="w-4 h-4 text-orange-400" />
                  {user.streak} дней подряд
                </span>
                <span className="flex items-center gap-1 text-sm bg-white/10 px-3 py-1 rounded-full">
                  <Clock className="w-4 h-4 text-blue-300" />
                  {minutesToHumanReadable(user.totalStudyMinutes)} учёбы
                </span>
                <span className="flex items-center gap-1 text-sm bg-white/10 px-3 py-1 rounded-full">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  {unlockedAchievements.length} достижений
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors text-sm">
                <Share2 className="w-4 h-4" />
                Поделиться
              </button>
              <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors text-sm">
                <Download className="w-4 h-4" />
                Скачать PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-1 bg-white rounded-xl shadow-sm p-1 -mt-5 relative z-10">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all flex-1 justify-center',
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <motion.div {...fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary-600" />
                </div>
                <h3 className="font-semibold text-slate-800">Диагностика</h3>
              </div>
              {diagnosticResult ? (
                <div>
                  <div className="text-3xl font-bold text-slate-900">
                    {diagnosticResult.overallScore}/{diagnosticResult.maxScore}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {Math.round((diagnosticResult.overallScore / diagnosticResult.maxScore) * 100)}% правильных ответов
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Пройдена {formatDate(diagnosticResult.date)}
                  </p>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">Диагностика не пройдена</p>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-accent-600" />
                </div>
                <h3 className="font-semibold text-slate-800">Учебный план</h3>
              </div>
              {studyPlan ? (
                <div>
                  <div className="text-3xl font-bold text-slate-900">
                    {studyPlan.overallProgress}%
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                    <div
                      className="bg-accent-500 h-2 rounded-full transition-all"
                      style={{ width: `${studyPlan.overallProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    {completedTasks} из {totalTasks} заданий выполнено
                  </p>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">План не создан</p>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-semibold text-slate-800">Достижения</h3>
              </div>
              <div className="text-3xl font-bold text-slate-900">
                {unlockedAchievements.length}/{achievements.length}
              </div>
              <div className="flex gap-1 mt-3">
                {achievements.slice(0, 6).map(a => (
                  <span
                    key={a.id}
                    className={cn(
                      'text-xl',
                      !a.unlockedAt && 'opacity-30 grayscale'
                    )}
                  >
                    {a.icon}
                  </span>
                ))}
              </div>
            </div>

            {/* Target University */}
            {user.targetUniversity && (
              <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Цель поступления</p>
                    <h3 className="text-xl font-bold mt-1">{user.targetUniversity}</h3>
                    <p className="text-white/80 mt-1">{user.targetSpecialty}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold">
                      {diagnosticResult
                        ? Math.round((diagnosticResult.overallScore / diagnosticResult.maxScore) * 100)
                        : 0}%
                    </div>
                    <p className="text-white/70 text-sm">текущая готовность</p>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="md:col-span-2 lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4">Сертификаты и проекты</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {diagnosticResult && (
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                      <Star className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800">Диагностический тест Study Hub</h4>
                      <p className="text-sm text-slate-500">
                        Результат: {diagnosticResult.overallScore}/{diagnosticResult.maxScore} ·{' '}
                        {formatDate(diagnosticResult.date)}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 ml-auto" />
                  </div>
                )}
                {unlockedAchievements.map(a => (
                  <div key={a.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-xl">
                      {a.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800">{a.title}</h4>
                      <p className="text-sm text-slate-500">
                        {a.description} · {a.unlockedAt ? formatDate(a.unlockedAt) : ''}
                      </p>
                    </div>
                  </div>
                ))}
                {!diagnosticResult && unlockedAchievements.length === 0 && (
                  <p className="text-slate-500 col-span-2 text-center py-8">
                    Пока ничего нет. Пройди диагностику и начни учиться, чтобы заполнить портфолио!
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'skills' && (
          <motion.div {...fadeInUp}>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Карта навыков</h3>
              {skills.length > 0 ? (
                <div className="space-y-4">
                  {skills
                    .sort((a, b) => b.level - a.level)
                    .map(skill => (
                      <div key={skill.subject} className="flex items-center gap-4">
                        <span className="text-sm font-medium text-slate-700 w-40 shrink-0">
                          {skill.label}
                        </span>
                        <div className="flex-1 bg-slate-100 rounded-full h-4 relative overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.level}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: SUBJECT_COLORS[skill.subject] }}
                          />
                        </div>
                        <span
                          className={cn(
                            'text-sm font-bold w-12 text-right',
                            skill.level >= 75 ? 'text-green-600' : skill.level >= 50 ? 'text-amber-600' : 'text-red-600'
                          )}
                        >
                          {skill.level}%
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Code className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>Пройди диагностический тест, чтобы увидеть свои навыки</p>
                  <button
                    onClick={() => navigate('/diagnostic')}
                    className="mt-4 px-6 py-2 gradient-primary text-white rounded-lg text-sm font-medium"
                  >
                    Пройти диагностику
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div {...fadeInUp}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map(achievement => (
                <motion.div
                  key={achievement.id}
                  whileHover={{ scale: 1.02 }}
                  className={cn(
                    'bg-white rounded-2xl p-6 shadow-sm text-center transition-all',
                    achievement.unlockedAt
                      ? 'ring-2 ring-amber-200 shadow-amber-100'
                      : 'opacity-50'
                  )}
                >
                  <span className="text-4xl block mb-3">
                    {achievement.icon}
                  </span>
                  <h4 className="font-semibold text-slate-800">{achievement.title}</h4>
                  <p className="text-sm text-slate-500 mt-1">{achievement.description}</p>
                  {achievement.unlockedAt && (
                    <p className="text-xs text-amber-600 mt-2 font-medium">
                      Получено {formatDate(achievement.unlockedAt)}
                    </p>
                  )}
                  {!achievement.unlockedAt && (
                    <p className="text-xs text-slate-400 mt-2">Заблокировано</p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'activity' && (
          <motion.div {...fadeInUp}>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">История активности</h3>
              <div className="space-y-4">
                {diagnosticResult && (
                  <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-primary-500" />
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">Пройдена диагностика</p>
                      <p className="text-sm text-slate-500">
                        Результат: {Math.round((diagnosticResult.overallScore / diagnosticResult.maxScore) * 100)}%
                      </p>
                    </div>
                    <span className="text-sm text-slate-400">{formatDate(diagnosticResult.date)}</span>
                  </div>
                )}
                {studyPlan && (
                  <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-accent-500" />
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">Создан учебный план</p>
                      <p className="text-sm text-slate-500">
                        {studyPlan.targetUniversity} — {studyPlan.targetSpecialty}
                      </p>
                    </div>
                    <span className="text-sm text-slate-400">Недавно</span>
                  </div>
                )}
                {unlockedAchievements.map(a => (
                  <div key={a.id} className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">Получено достижение: {a.title}</p>
                      <p className="text-sm text-slate-500">{a.description}</p>
                    </div>
                    <span className="text-sm text-slate-400">
                      {a.unlockedAt ? formatDate(a.unlockedAt) : ''}
                    </span>
                  </div>
                ))}
                {!diagnosticResult && !studyPlan && unlockedAchievements.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>Активности пока нет. Начни учиться!</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
