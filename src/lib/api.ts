// ── Token management ──────────────────────────────────────────────────────────

const TOKEN_KEY = 'studyhub-token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// ── Base request ──────────────────────────────────────────────────────────────

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken()

  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  // Parse JSON even for error responses (server returns { error: string })
  const data = await res.json().catch(() => ({ error: res.statusText }))

  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`)
  }

  return data as T
}

// ── Public API ────────────────────────────────────────────────────────────────

export const api = {
  get:  <T>(path: string)                   => request<T>('GET',    path),
  post: <T>(path: string, body?: unknown)   => request<T>('POST',   path, body),
  put:  <T>(path: string, body?: unknown)   => request<T>('PUT',    path, body),
  del:  <T>(path: string)                   => request<T>('DELETE', path),
}

// ── Content API helpers ────────────────────────────────────────────────────────

export type ContentType =
  | 'ielts_material'
  | 'mentor_qa'
  | 'vocab_word'
  | 'ent_question'
  | 'curator_topic'
  | 'university_entry'
  | 'scholarship_entry'

export interface ContentItem {
  id: string
  type: ContentType
  data: Record<string, unknown>
  active: boolean
  order: number
  createdAt: string
  updatedAt: string
}

// ── Admin: Users (Leads) ───────────────────────────────────────────────────────

export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'student' | 'parent' | 'teacher' | 'employer' | 'admin'
  grade: number | null
  city: string | null
  isPremium: boolean
  streak: number
  totalStudyMinutes: number
  targetUniversity: string | null
  targetSpecialty: string | null
  createdAt: string
  lastActiveDate: string | null
}

export interface AdminStats {
  totalUsers: number
  premiumUsers: number
  activeToday: number
  totalEntResults: number
  totalStudyPlans: number
  usersByRole: { role: string; count: number }[]
  usersByGrade: { grade: string; count: number }[]
  usersByCity: { city: string; count: number }[]
  topUniversities: { name: string; count: number }[]
  topSpecialties: { name: string; count: number }[]
  registrationsByDay: { date: string; count: number }[]
}

export const adminApi = {
  listUsers: () => api.get<{ users: AdminUser[] }>('/users'),
  getStats:  () => api.get<AdminStats>('/admin/stats'),
}

// ── Courses API ────────────────────────────────────────────────────────────────

export interface DBLesson {
  id: string
  title: string
  duration: number | null
  order: number
}

export interface DBModule {
  id: string
  title: string
  order: number
  lessons: DBLesson[]
}

export interface DBCourse {
  id: string
  title: string
  description: string
  subject: string
  level: 'beginner' | 'intermediate' | 'advanced'
  price: number
  coverColor: string
  isPublished: boolean
  modules: DBModule[]
  _count?: { enrollments: number }
  createdAt: string
  updatedAt: string
}

export const coursesApi = {
  list: () => api.get<{ courses: DBCourse[] }>('/courses'),
  get: (id: string) => api.get<{ course: DBCourse }>(`/courses/${id}`),
  enroll: (id: string) => api.post<{ enrolled: boolean; alreadyEnrolled?: boolean }>(`/courses/${id}/enroll`),
  progress: (id: string) => api.get<{ enrolled: boolean; completedLessonIds: string[] }>(`/courses/${id}/progress`),
  complete: (lessonId: string, quizScore?: number) =>
    api.post<{ ok: boolean }>(`/courses/lessons/${lessonId}/complete`, { quizScore }),
}

// ── Plans API ──────────────────────────────────────────────────────────────────

export interface PlanFeature {
  text:     string
  included: boolean
}

export interface DBPlan {
  id:          string
  name:        string
  description: string
  price:       number
  period:      'month' | 'year' | 'forever'
  features:    PlanFeature[]
  isActive:    boolean
  isPopular:   boolean
  badge:       string | null
  order:       number
  createdAt:   string
  updatedAt:   string
}

export const plansApi = {
  list:    ()                              => api.get<{ plans: DBPlan[] }>('/plans'),
  listAll: ()                              => api.get<{ plans: DBPlan[] }>('/plans/all'),
  create:  (body: Partial<DBPlan>)         => api.post<{ plan: DBPlan }>('/plans', body),
  update:  (id: string, b: Partial<DBPlan>) => api.put<{ plan: DBPlan }>(`/plans/${id}`, b),
  remove:  (id: string)                    => api.del<{ ok: boolean }>(`/plans/${id}`),
}

// ── Billing API ────────────────────────────────────────────────────────────────

export interface DBSubscription {
  id:        string
  userId:    string
  planId:    string
  status:    'active' | 'expired' | 'cancelled' | 'trial'
  startsAt:  string
  expiresAt: string
  notes:     string | null
  createdAt: string
  user:      { id: string; name: string; email: string }
  plan:      { id: string; name: string; period: string }
  payments?: DBPayment[]
}

export interface DBPayment {
  id:             string
  userId:         string
  subscriptionId: string | null
  amount:         number
  currency:       string
  method:         'kaspi' | 'transfer' | 'cash' | 'manual'
  status:         'pending' | 'success' | 'failed' | 'refunded'
  reference:      string | null
  notes:          string | null
  createdAt:      string
  user:           { id: string; name: string; email: string }
  subscription:   { plan: { name: string } } | null
}

export interface BillingStats {
  totalRevenue:        number
  monthRevenue:        number
  activeSubscriptions: number
  totalSubscriptions:  number
}

export const billingApi = {
  getSubscriptions: (params?: { status?: string; userId?: string }) => {
    const q = params ? new URLSearchParams(params as Record<string, string>).toString() : ''
    return api.get<{ subscriptions: DBSubscription[] }>(`/billing/subscriptions${q ? `?${q}` : ''}`)
  },
  createSubscription: (body: {
    userId: string; planId: string; status?: string
    startsAt?: string; expiresAt: string; notes?: string
  }) => api.post<{ subscription: DBSubscription }>('/billing/subscriptions', body),
  updateSubscription: (id: string, body: { status?: string; notes?: string; expiresAt?: string }) =>
    api.put<{ subscription: DBSubscription }>(`/billing/subscriptions/${id}`, body),

  getPayments: (params?: { status?: string; userId?: string }) => {
    const q = params ? new URLSearchParams(params as Record<string, string>).toString() : ''
    return api.get<{ payments: DBPayment[]; totalRevenue: number }>(`/billing/payments${q ? `?${q}` : ''}`)
  },
  createPayment: (body: {
    userId: string; subscriptionId?: string; amount: number
    method: string; status?: string; reference?: string; notes?: string
  }) => api.post<{ payment: DBPayment }>('/billing/payments', body),

  getStats:       () => api.get<BillingStats>('/billing/stats'),
  mySubscription: () => api.get<{ subscription: DBSubscription | null }>('/billing/my'),
}

export const contentApi = {
  /** Public: list active items (optionally filtered by type) */
  list: (type?: ContentType) =>
    api.get<{ items: ContentItem[] }>(`/content${type ? `?type=${type}` : ''}`),

  /** Admin: list all items including inactive */
  listAll: (type?: ContentType) =>
    api.get<{ items: ContentItem[] }>(`/content/all${type ? `?type=${type}` : ''}`),

  /** Admin: create new content item */
  create: (body: { type: ContentType; data: Record<string, unknown>; active?: boolean; order?: number }) =>
    api.post<{ item: ContentItem }>('/content', body),

  /** Admin: update content item */
  update: (id: string, body: Partial<{ type: ContentType; data: Record<string, unknown>; active: boolean; order: number }>) =>
    api.put<{ item: ContentItem }>(`/content/${id}`, body),

  /** Admin: delete content item */
  remove: (id: string) =>
    api.del<{ ok: boolean }>(`/content/${id}`),
}
