import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserRole, DiagnosticResult, StudyPlan, ChatMessage, StudyWeek, StudyTask, Achievement, Notification } from '@/types'
import { generateId } from '@/lib/utils'
import { universities } from '@/data/universities'

// ── Pre-configured accounts ─────────────────────────────────────────────────

interface RegisteredAccount {
  email: string
  password: string
  role: UserRole
  user: User
}

const REGISTERED_ACCOUNTS: RegisteredAccount[] = [
  {
    email: 'alibekovakarakat5@gmail.com',
    password: 'karakat120505',
    role: 'admin',
    user: {
      id: 'admin-001',
      name: 'Каракат Алибекова',
      email: 'alibekovakarakat5@gmail.com',
      role: 'admin',
      grade: 11,
      city: 'Алматы',
      isPremium: true,
      createdAt: '2025-01-15T00:00:00.000Z',
      streak: 45,
      totalStudyMinutes: 12600,
      lastActiveDate: new Date().toISOString(),
    },
  },
  {
    email: 'alibekovakarakat5@gmail.com',
    password: 'karakat120505',
    role: 'parent',
    user: {
      id: 'parent-001',
      name: 'Каракат Алибекова',
      email: 'alibekovakarakat5@gmail.com',
      role: 'parent',
      grade: 11,
      city: 'Алматы',
      isPremium: true,
      createdAt: '2025-01-15T00:00:00.000Z',
      streak: 0,
      totalStudyMinutes: 0,
      lastActiveDate: new Date().toISOString(),
    },
  },
  {
    email: 'alibekovakarakat5@gmail.com',
    password: 'karakat120505',
    role: 'student',
    user: {
      id: 'student-001',
      name: 'Каракат Алибекова',
      email: 'alibekovakarakat5@gmail.com',
      role: 'student',
      grade: 11,
      city: 'Алматы',
      targetUniversity: 'Назарбаев Университет',
      targetSpecialty: 'Computer Science',
      isPremium: true,
      createdAt: '2025-01-15T00:00:00.000Z',
      streak: 12,
      totalStudyMinutes: 2340,
      lastActiveDate: new Date().toISOString(),
    },
  },
  {
    email: 'alibekovakarakat5@gmail.com',
    password: 'karakat120505',
    role: 'teacher',
    user: {
      id: 'teacher-001',
      name: 'Каракат Алибекова',
      email: 'alibekovakarakat5@gmail.com',
      role: 'teacher',
      grade: 11,
      city: 'Алматы',
      isPremium: true,
      createdAt: '2025-01-15T00:00:00.000Z',
      streak: 0,
      totalStudyMinutes: 0,
      lastActiveDate: new Date().toISOString(),
    },
  },
  {
    email: 'alibekovakarakat5@gmail.com',
    password: 'karakat120505',
    role: 'employer',
    user: {
      id: 'employer-001',
      name: 'Каракат Алибекова',
      email: 'alibekovakarakat5@gmail.com',
      role: 'employer',
      grade: 11,
      city: 'Алматы',
      isPremium: true,
      createdAt: '2025-01-15T00:00:00.000Z',
      streak: 0,
      totalStudyMinutes: 0,
      lastActiveDate: new Date().toISOString(),
    },
  },
]

// ── Mock platform stats for admin ───────────────────────────────────────────

export interface PlatformStats {
  totalUsers: number
  activeToday: number
  premiumUsers: number
  totalRevenue: string
  avgScore: number
  testsCompleted: number
  plansCreated: number
  retentionRate: number
  registrationsByDay: { date: string; count: number }[]
  usersByCity: { city: string; count: number }[]
  revenueByMonth: { month: string; amount: number }[]
  topUniversities: { name: string; applicants: number }[]
}

export const PLATFORM_STATS: PlatformStats = {
  totalUsers: 15842,
  activeToday: 3291,
  premiumUsers: 2106,
  totalRevenue: '10 523 940 ₸',
  avgScore: 67.4,
  testsCompleted: 48210,
  plansCreated: 9847,
  retentionRate: 72.3,
  registrationsByDay: [
    { date: '04.02', count: 142 },
    { date: '05.02', count: 189 },
    { date: '06.02', count: 156 },
    { date: '07.02', count: 201 },
    { date: '08.02', count: 234 },
    { date: '09.02', count: 178 },
    { date: '10.02', count: 267 },
  ],
  usersByCity: [
    { city: 'Алматы', count: 5420 },
    { city: 'Астана', count: 4130 },
    { city: 'Шымкент', count: 1890 },
    { city: 'Караганда', count: 1340 },
    { city: 'Актобе', count: 980 },
    { city: 'Другие', count: 2082 },
  ],
  revenueByMonth: [
    { month: 'Сен', amount: 620000 },
    { month: 'Окт', amount: 890000 },
    { month: 'Ноя', amount: 1240000 },
    { month: 'Дек', amount: 1580000 },
    { month: 'Янв', amount: 2340000 },
    { month: 'Фев', amount: 3853940 },
  ],
  topUniversities: [
    { name: 'Назарбаев Университет', applicants: 3240 },
    { name: 'КазНУ им. аль-Фараби', applicants: 2890 },
    { name: 'КБТУ', applicants: 1950 },
    { name: 'КазНТУ Сатпаева', applicants: 1720 },
    { name: 'ЕНУ Гумилёва', applicants: 1560 },
    { name: 'KIMEP', applicants: 1230 },
  ],
}

// ── Store ────────────────────────────────────────────────────────────────────

interface AppState {
  // Auth
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string, role: UserRole) => boolean
  register: (data: { name: string; email: string; password: string; role: UserRole; grade?: number; city?: string; childEmail?: string }) => boolean
  logout: () => void
  updateUser: (updates: Partial<User>) => void

  // Diagnostic
  diagnosticResult: DiagnosticResult | null
  setDiagnosticResult: (result: DiagnosticResult) => void
  hasTakenDiagnostic: boolean

  // Study Plan
  studyPlan: StudyPlan | null
  generateStudyPlan: (targetUniId: string, targetSpecId: string) => void
  toggleTask: (weekNumber: number, taskId: string) => void

  // Chat
  chatMessages: ChatMessage[]
  addChatMessage: (message: ChatMessage) => void
  clearChat: () => void

  // Achievements
  achievements: Achievement[]
  unlockAchievement: (id: string) => void

  // Notifications
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void

  // Diagnostic History
  diagnosticHistory: DiagnosticResult[]

  // Parent
  childData: {
    user: User
    diagnosticResult: DiagnosticResult | null
    studyPlan: StudyPlan | null
    weeklyReport: {
      studyMinutes: number
      tasksCompleted: number
      streak: number
      prevDiagnosticScore?: number
      subjectTrends?: { subject: string; prevScore: number; currentScore: number }[]
    }
  } | null

  // UI
  sidebarOpen: boolean
  toggleSidebar: () => void
}

const DEMO_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-test', title: 'Первый шаг', description: 'Пройди диагностический тест', icon: '🎯', category: 'score' },
  { id: 'streak-3', title: '3 дня подряд', description: 'Занимайся 3 дня подряд', icon: '🔥', category: 'streak' },
  { id: 'streak-7', title: 'Неделя силы', description: 'Занимайся 7 дней подряд', icon: '💪', category: 'streak' },
  { id: 'streak-30', title: 'Месяц дисциплины', description: '30 дней без перерыва', icon: '🏆', category: 'streak' },
  { id: 'score-80', title: 'Отличник', description: 'Набери 80%+ на тесте', icon: '⭐', category: 'score' },
  { id: 'tasks-10', title: 'Трудяга', description: 'Выполни 10 заданий', icon: '📚', category: 'practice' },
  { id: 'tasks-50', title: 'Марафонец', description: 'Выполни 50 заданий', icon: '🏃', category: 'practice' },
  { id: 'plan-created', title: 'Стратег', description: 'Создай учебный план', icon: '🗺️', category: 'practice' },
]

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      isAuthenticated: false,

      login: (email, password, role) => {
        // Check pre-configured accounts first
        const account = REGISTERED_ACCOUNTS.find(
          a => a.email.toLowerCase() === email.toLowerCase() && a.password === password && a.role === role
        )

        if (account) {
          const user = { ...account.user, lastActiveDate: new Date().toISOString() }
          set({ user, isAuthenticated: true })

          // If logging in as parent, set up child data
          if (role === 'parent') {
            const childAccount = REGISTERED_ACCOUNTS.find(a => a.email === email && a.role === 'student')
            if (childAccount) {
              set({
                childData: {
                  user: childAccount.user,
                  diagnosticResult: {
                    id: 'diag-child-001',
                    userId: childAccount.user.id,
                    date: '2026-02-01T00:00:00.000Z',
                    subjects: [
                      { subject: 'math', score: 4, maxScore: 5, percentage: 80, level: 'high', weakTopics: ['Логарифмы'], strongTopics: ['Алгебра', 'Геометрия', 'Функции'] },
                      { subject: 'physics', score: 3, maxScore: 4, percentage: 75, level: 'high', weakTopics: ['Оптика'], strongTopics: ['Механика', 'Электричество'] },
                      { subject: 'informatics', score: 3, maxScore: 3, percentage: 100, level: 'high', weakTopics: [], strongTopics: ['Алгоритмы', 'Системы счисления', 'Программирование'] },
                      { subject: 'english', score: 2, maxScore: 3, percentage: 67, level: 'medium', weakTopics: ['Vocabulary'], strongTopics: ['Grammar'] },
                    ],
                    overallScore: 12,
                    maxScore: 15,
                    percentile: 78,
                    predictedUniversities: [],
                  },
                  studyPlan: null,
                  weeklyReport: {
                    studyMinutes: 2340,
                    tasksCompleted: 47,
                    streak: 12,
                    prevDiagnosticScore: 65,
                    subjectTrends: [
                      { subject: 'Математика', prevScore: 65, currentScore: 80 },
                      { subject: 'Физика', prevScore: 60, currentScore: 75 },
                      { subject: 'Информатика', prevScore: 90, currentScore: 100 },
                      { subject: 'Английский', prevScore: 55, currentScore: 67 },
                    ],
                  },
                },
              })
            }
          }
          return true
        }

        // Fallback: allow any email/password (demo mode)
        const user: User = {
          id: generateId(),
          name: role === 'parent' ? 'Родитель' : role === 'admin' ? 'Админ' : role === 'teacher' ? 'Преподаватель' : role === 'employer' ? 'Работодатель' : 'Ученик',
          email,
          role,
          grade: 11,
          city: 'Алматы',
          isPremium: false,
          createdAt: new Date().toISOString(),
          streak: 0,
          totalStudyMinutes: 0,
          lastActiveDate: new Date().toISOString(),
        }
        set({ user, isAuthenticated: true })
        return true
      },

      register: (data) => {
        const user: User = {
          id: generateId(),
          name: data.name,
          email: data.email,
          role: data.role,
          grade: data.grade || 11,
          city: data.city || 'Алматы',
          isPremium: false,
          createdAt: new Date().toISOString(),
          streak: 0,
          totalStudyMinutes: 0,
          lastActiveDate: new Date().toISOString(),
        }
        set({ user, isAuthenticated: true })

        if (data.role === 'parent') {
          const childUser: User = {
            id: generateId(),
            name: 'Ученик',
            email: data.childEmail || '',
            role: 'student',
            grade: 11,
            city: data.city || 'Алматы',
            isPremium: false,
            createdAt: new Date().toISOString(),
            parentId: user.id,
            streak: 5,
            totalStudyMinutes: 840,
            lastActiveDate: new Date().toISOString(),
          }

          const mockDiagnostic: DiagnosticResult = {
            id: generateId(),
            userId: childUser.id,
            date: new Date().toISOString(),
            subjects: [
              { subject: 'math', score: 18, maxScore: 25, percentage: 72, level: 'medium', weakTopics: ['Логарифмы', 'Тригонометрия'], strongTopics: ['Алгебра'] },
              { subject: 'physics', score: 15, maxScore: 20, percentage: 75, level: 'high', weakTopics: ['Оптика'], strongTopics: ['Механика', 'Электричество'] },
              { subject: 'informatics', score: 14, maxScore: 15, percentage: 93, level: 'high', weakTopics: [], strongTopics: ['Алгоритмы', 'Программирование'] },
            ],
            overallScore: 47,
            maxScore: 60,
            percentile: 68,
            predictedUniversities: [],
          }

          set({
            childData: {
              user: childUser,
              diagnosticResult: mockDiagnostic,
              studyPlan: null,
              weeklyReport: { studyMinutes: 840, tasksCompleted: 23, streak: 5 },
            },
          })
        }

        return true
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          diagnosticResult: null,
          diagnosticHistory: [],
          studyPlan: null,
          chatMessages: [],
          hasTakenDiagnostic: false,
          childData: null,
          notifications: [],
        })
      },

      updateUser: (updates) => {
        const { user } = get()
        if (user) {
          set({ user: { ...user, ...updates } })
        }
      },

      // Diagnostic
      diagnosticResult: null,
      hasTakenDiagnostic: false,
      diagnosticHistory: [],

      setDiagnosticResult: (result) => {
        const { diagnosticResult: prevResult, diagnosticHistory } = get()
        // Save to history
        const updatedHistory = prevResult
          ? [...diagnosticHistory, prevResult]
          : diagnosticHistory
        set({
          diagnosticResult: result,
          hasTakenDiagnostic: true,
          diagnosticHistory: updatedHistory,
        })
        const { achievements } = get()
        const firstTest = achievements.find(a => a.id === 'first-test')
        if (firstTest && !firstTest.unlockedAt) {
          get().unlockAchievement('first-test')
        }
        if (result.overallScore / result.maxScore >= 0.8) {
          get().unlockAchievement('score-80')
        }
        // Generate notification
        const pct = Math.round((result.overallScore / result.maxScore) * 100)
        if (prevResult) {
          const prevPct = Math.round((prevResult.overallScore / prevResult.maxScore) * 100)
          const diff = pct - prevPct
          get().addNotification({
            type: diff > 0 ? 'success' : 'info',
            title: 'Повторная диагностика завершена',
            message: diff > 0
              ? `Ваш результат улучшился на ${diff}%! Было ${prevPct}%, стало ${pct}%.`
              : diff === 0
                ? `Ваш результат не изменился — ${pct}%. Продолжайте заниматься!`
                : `Результат снизился на ${Math.abs(diff)}%. Не сдавайтесь, повторите слабые темы!`,
          })
        } else {
          get().addNotification({
            type: 'success',
            title: 'Диагностика завершена!',
            message: `Ваш результат: ${pct}%. Теперь создайте учебный план!`,
          })
        }
      },

      // Study Plan
      studyPlan: null,

      generateStudyPlan: (targetUniId, targetSpecId) => {
        const { user, diagnosticResult } = get()
        if (!user) return

        const uni = universities.find(u => u.id === targetUniId)
        const spec = uni?.specialties.find(s => s.id === targetSpecId)
        if (!uni || !spec) return

        const weeks: StudyWeek[] = []
        const subjects = spec.subjects
        const now = new Date()

        for (let w = 0; w < 16; w++) {
          const weekStart = new Date(now)
          weekStart.setDate(weekStart.getDate() + w * 7)
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekEnd.getDate() + 6)

          const tasks: StudyTask[] = []

          for (const subject of subjects) {
            const subjectResult = diagnosticResult?.subjects.find(s => s.subject === subject)
            const weakTopics = subjectResult?.weakTopics || ['Общие темы']
            const topic = weakTopics[w % weakTopics.length] || 'Повторение'

            tasks.push({
              id: generateId(),
              title: `${topic} — Теория`,
              subject,
              topic,
              type: 'lesson',
              duration: 30,
              completed: w < 1 && Math.random() > 0.5,
            })
            tasks.push({
              id: generateId(),
              title: `${topic} — Практика`,
              subject,
              topic,
              type: 'practice',
              duration: 45,
              completed: false,
            })

            if (w % 2 === 1) {
              tasks.push({
                id: generateId(),
                title: `Промежуточный тест: ${topic}`,
                subject,
                topic,
                type: 'test',
                duration: 30,
                completed: false,
              })
            }
          }

          weeks.push({
            weekNumber: w + 1,
            startDate: weekStart.toISOString(),
            endDate: weekEnd.toISOString(),
            tasks,
            completed: false,
          })
        }

        const plan: StudyPlan = {
          id: generateId(),
          userId: user.id,
          targetUniversity: uni.name,
          targetSpecialty: spec.name,
          targetDate: new Date(now.getFullYear(), 5, 1).toISOString(),
          weeks,
          currentWeek: 1,
          overallProgress: 0,
        }

        set({ studyPlan: plan })
        get().unlockAchievement('plan-created')
        get().updateUser({ targetUniversity: uni.name, targetSpecialty: spec.name })
      },

      toggleTask: (weekNumber, taskId) => {
        const { studyPlan } = get()
        if (!studyPlan) return

        const updatedWeeks = studyPlan.weeks.map(week => {
          if (week.weekNumber !== weekNumber) return week
          const updatedTasks = week.tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          )
          return {
            ...week,
            tasks: updatedTasks,
            completed: updatedTasks.every(t => t.completed),
          }
        })

        const totalTasks = updatedWeeks.flatMap(w => w.tasks).length
        const completedTasks = updatedWeeks.flatMap(w => w.tasks).filter(t => t.completed).length
        const overallProgress = Math.round((completedTasks / totalTasks) * 100)

        set({
          studyPlan: {
            ...studyPlan,
            weeks: updatedWeeks,
            overallProgress,
          },
        })

        if (completedTasks >= 10) get().unlockAchievement('tasks-10')
        if (completedTasks >= 50) get().unlockAchievement('tasks-50')
      },

      // Chat
      chatMessages: [],
      addChatMessage: (message) => {
        set(state => ({ chatMessages: [...state.chatMessages, message] }))
      },
      clearChat: () => set({ chatMessages: [] }),

      // Achievements
      achievements: DEMO_ACHIEVEMENTS,
      unlockAchievement: (id) => {
        set(state => ({
          achievements: state.achievements.map(a =>
            a.id === id && !a.unlockedAt ? { ...a, unlockedAt: new Date().toISOString() } : a
          ),
        }))
      },

      // Notifications
      notifications: [
        {
          id: 'welcome-1',
          type: 'info' as const,
          title: 'Добро пожаловать в Study Hub!',
          message: 'Пройдите диагностический тест, чтобы начать подготовку к ЕНТ.',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'streak-reminder',
          type: 'warning' as const,
          title: 'Не забудьте позаниматься сегодня!',
          message: 'Ваша серия — 12 дней. Не потеряйте прогресс!',
          read: false,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 'new-course-1',
          type: 'info' as const,
          title: 'Новый курс: Data Science на Python',
          message: 'Даурен Ахметов выпустил новый курс. Рейтинг 4.9!',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],

      addNotification: (notification) => {
        set(state => ({
          notifications: [
            {
              ...notification,
              id: generateId(),
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...state.notifications,
          ],
        }))
      },

      markNotificationRead: (id) => {
        set(state => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
        }))
      },

      markAllNotificationsRead: () => {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
        }))
      },

      // Parent
      childData: null,

      // UI
      sidebarOpen: false,
      toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: 'studyhub-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        diagnosticResult: state.diagnosticResult,
        hasTakenDiagnostic: state.hasTakenDiagnostic,
        diagnosticHistory: state.diagnosticHistory,
        studyPlan: state.studyPlan,
        achievements: state.achievements,
        notifications: state.notifications,
        childData: state.childData,
      }),
    }
  )
)
