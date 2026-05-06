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
  | 'admission_entry'
  | 'program_entry'
  | 'university_profile'
  // ── New DB-driven content types ──
  | 'ielts_section'
  | 'ielts_band_descriptor'
  | 'ielts_cue_card'
  | 'diagnostic_question'
  | 'ent_exam_variant'
  | 'ent_profile_bank'
  | 'curator_content'
  | 'ent_theory_topic'
  | 'career_test_question'
  | 'cambridge_passage'
  | 'cambridge_question_bank'
  // ── Rich IELTS practice content ──
  | 'ielts_reading_passage'
  | 'ielts_writing_task'
  | 'ielts_speaking_part1'
  | 'ielts_speaking_part2'
  | 'ielts_speaking_part3'
  | 'ielts_listening_section'
  | 'ielts_vocab_set'
  // ── ENT subject course lessons ──
  | 'ent_lesson'

export interface ContentItem {
  id: string
  type: ContentType
  data: Record<string, unknown>
  active: boolean
  order: number
  /**
   * Organization scope. `null` (or absent) = global/platform content visible
   * to everyone. When set, only members of that org (and admins) see it.
   */
  orgId?: string | null
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

  // KaspiPay
  kaspiCreate: (planId: string) =>
    api.post<KaspiPaymentResponse>('/billing/kaspi/create', { planId }),
  kaspiStatus: (orderId: string) =>
    api.get<KaspiPaymentStatus>(`/billing/kaspi/status/${orderId}`),
  kaspiSimulate: (orderId: string) =>
    api.post<{ ok: boolean }>('/billing/kaspi/simulate', { orderId }),
}

export interface KaspiPaymentResponse {
  orderId: string
  payLink: string
  qrData: string
  amount: number
  planName: string
  subscriptionId: string
}

export interface KaspiPaymentStatus {
  status: 'pending' | 'success' | 'failed' | 'refunded'
  amount: number
  planName: string | null
  createdAt: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}

export const contentApi = {
  /** Public: list active items (optionally filtered by type) */
  list: (type?: ContentType, opts?: { page?: number; limit?: number }) => {
    const params = new URLSearchParams()
    if (type) params.set('type', type)
    if (opts?.page) params.set('page', String(opts.page))
    if (opts?.limit) params.set('limit', String(opts.limit))
    const q = params.toString()
    return api.get<PaginatedResponse<ContentItem>>(`/content${q ? `?${q}` : ''}`)
  },

  /** Public: list ALL active items (auto-paginates) */
  listAll: (type?: ContentType) => {
    const params = new URLSearchParams()
    if (type) params.set('type', type)
    params.set('limit', '100')
    const q = params.toString()
    return api.get<PaginatedResponse<ContentItem>>(`/content/all${q ? `?${q}` : ''}`)
  },

  /** Admin/teacher: create new content item.
   *  Teachers in an org are auto-scoped to that org; passing orgId is ignored.
   *  Admins can pass orgId to scope, or omit/null for global. */
  create: (body: { type: ContentType; data: Record<string, unknown>; active?: boolean; order?: number; orgId?: string | null }) =>
    api.post<{ item: ContentItem }>('/content', body),

  /** Admin/teacher: update content item. Teachers can only update their org's items. */
  update: (id: string, body: Partial<{ type: ContentType; data: Record<string, unknown>; active: boolean; order: number; orgId: string | null }>) =>
    api.put<{ item: ContentItem }>(`/content/${id}`, body),

  /** Admin: delete content item */
  remove: (id: string) =>
    api.del<{ ok: boolean }>(`/content/${id}`),

  /** Generate lessons from raw text or uploaded file (auto-scoped to caller's org). */
  fromText: (body: {
    uploadId?: string
    text?: string
    subject?: string
    materialName?: string
  }) => api.post<{
    items: ContentItem[]
    stats: { lessons: number; totalQuiz: number }
  }>('/content/from-text', body),
}

// ── Study Plans API ──────────────────────────────────────────────────────────

export interface DBStudyPlan {
  id: string
  userId: string
  goalType: string
  totalModules: number
  completedModules: number
  weeks: unknown[]
  isActive: boolean
  createdAt: string
}

export const studyPlanApi = {
  create: (body: { goalType: string; totalModules: number; weeks: unknown[] }) =>
    api.post<{ plan: DBStudyPlan }>('/study-plans', body),
  getActive: () =>
    api.get<{ plan: DBStudyPlan | null }>('/study-plans/active'),
  updateProgress: (id: string, completedModules: number) =>
    api.put<{ plan: DBStudyPlan }>(`/study-plans/${id}/progress`, { completedModules }),
  updateWeeks: (id: string, weeks: unknown[], completedModules: number) =>
    api.put<{ plan: DBStudyPlan }>(`/study-plans/${id}/weeks`, { weeks, completedModules }),
}

// ── Upload API ────────────────────────────────────────────────────────────────

export interface UploadedFile {
  id: string
  filename: string
  storagePath: string
  mimeType: string
  sizeBytes: number
  uploadedBy: string
  status: 'pending' | 'processing' | 'done' | 'error'
  courseId: string | null
  errorMsg: string | null
  metadata: { pageCount?: number; wordCount?: number; textPreview?: string } | null
  createdAt: string
  updatedAt: string
}

export const uploadApi = {
  /** Upload a file (multipart/form-data) */
  upload: async (file: File): Promise<{ file: UploadedFile }> => {
    const form = new FormData()
    form.append('file', file)
    const token = getToken()
    const res = await fetch('/api/uploads', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
    return data
  },

  /** List uploads */
  list: () => api.get<{ files: UploadedFile[] }>('/uploads'),

  /** Get upload status */
  status: (id: string) => api.get<{ file: UploadedFile }>(`/uploads/${id}`),

  /** Get extracted text */
  text: (id: string) => api.get<{ text: string; wordCount: number; pageCount?: number }>(`/uploads/${id}/text`),

  /** Delete upload */
  remove: (id: string) => api.del<{ ok: boolean }>(`/uploads/${id}`),

  /** Generate course from upload */
  generate: (uploadId: string, opts?: { subject?: string; level?: string; title?: string }) =>
    api.post<{ courseId: string; title: string; modulesCount: number; lessonsCount: number }>(
      '/courses/generate',
      { uploadId, ...opts }
    ),

  /** Generate course from raw text */
  generateFromText: (text: string, opts?: { subject?: string; level?: string; title?: string }) =>
    api.post<{ courseId: string; title: string; modulesCount: number; lessonsCount: number }>(
      '/courses/generate',
      { text, ...opts }
    ),
}

// ── Study Abroad API ──────────────────────────────────────────────────────────

export interface StudyAbroadCountry {
  id: string
  countryCode: string
  nameRu: string
  nameEn: string
  nameKk: string
  flagEmoji: string
  region: string
  requirements: {
    visa: string
    documents: string[]
    language: string
    other?: string
  }
  universities: {
    name: string
    qs?: number
    city: string
    tuitionUSD: number | string
    programs: string[]
  }[]
  scholarships: {
    name: string
    coverage: string
    deadline: string
    url?: string
  }[]
  timeline: { month: string; action: string }[]
  costs: {
    tuitionUSD: string
    livingUSD: string
    insuranceUSD: string
  }
  languageReqs: {
    primary: string
    tests: string[]
    courses?: string
  }
  mentorWhatsApp: string
  isActive: boolean
  order: number
}

export const studyAbroadApi = {
  list: () => api.get<{ countries: StudyAbroadCountry[] }>('/study-abroad'),
  get: (code: string) => api.get<{ country: StudyAbroadCountry }>(`/study-abroad/${code}`),
}

// ── Classroom Types ────────────────────────────────────────────────────────────

export interface AITestQuestion {
  id: string
  text: string
  options: string[]      // exactly 4
  correctAnswer: number  // 0-indexed
  explanation: string
}

export interface AITestVariant {
  variantIndex: number
  questions: AITestQuestion[]
}

export interface DBClassMember {
  id: string
  joinedAt: string
  student: { id: string; name: string; email: string; grade: number | null }
}

export interface DBAssignmentSummary {
  id: string
  title: string
  type: 'test' | 'homework' | 'reading'
  dueDate: string | null
  createdAt: string
  _count?: { submissions: number }
  submissions?: DBSubmission[]  // student's own submission(s) when fetched from student context
}

export interface DBClass {
  id: string
  name: string
  subject: string
  description: string | null
  inviteCode: string
  teacherId: string
  teacher?: { id: string; name: string; email?: string }
  members?: DBClassMember[]
  assignments?: DBAssignmentSummary[]
  _count?: { members: number; assignments: number }
  createdAt: string
}

export interface DBAssignment {
  id: string
  title: string
  description: string | null
  classId: string
  teacherId: string
  type: 'test' | 'homework' | 'reading'
  content: Record<string, unknown>
  dueDate: string | null
  createdAt: string
  class?: { id: string; name: string; members?: { studentId: string }[] }
}

export interface DBSubmission {
  id: string
  assignmentId: string
  studentId: string
  answers: Record<string, unknown>
  score: number | null
  feedback: string | null
  submittedAt: string
  student?: { id: string; name: string; email: string }
}

export interface AssignmentStats {
  totalMembers: number
  submitted: number
  avgScore: number | null
}

// ── Classes API ────────────────────────────────────────────────────────────────

export const classesApi = {
  list:         ()                          => api.get<{ classes: DBClass[] }>('/classes'),
  get:          (id: string)               => api.get<{ class: DBClass }>(`/classes/${id}`),
  create:       (body: { name: string; subject: string; description?: string }) =>
                  api.post<{ class: DBClass }>('/classes', body),
  join:         (inviteCode: string)       => api.post<{ ok: true; class: DBClass }>('/classes/join', { inviteCode }),
  delete:       (id: string)               => api.del<{ ok: boolean }>(`/classes/${id}`),
  removeMember: (classId: string, studentId: string) =>
                  api.del<{ ok: boolean }>(`/classes/${classId}/members/${studentId}`),
}

// ── Assignments API ────────────────────────────────────────────────────────────

export const assignmentsApi = {
  create: (body: {
    classId: string; title: string; type: string;
    content: unknown; description?: string; dueDate?: string;
  }) => api.post<{ assignment: DBAssignment }>('/assignments', body),

  get:          (id: string)  => api.get<{ assignment: DBAssignment }>(`/assignments/${id}`),
  delete:       (id: string)  => api.del<{ ok: boolean }>(`/assignments/${id}`),
  submit:       (id: string, answers: unknown) =>
                  api.post<{ submission: DBSubmission }>(`/assignments/${id}/submit`, { answers }),
  mySubmission: (id: string)  => api.get<{ submission: DBSubmission | null }>(`/assignments/${id}/my-submission`),
  results:      (id: string)  => api.get<{
                  assignment: DBAssignment
                  submissions: DBSubmission[]
                  stats: AssignmentStats
                }>(`/assignments/${id}/results`),
  grade: (assignmentId: string, submissionId: string, score: number, feedback?: string) =>
    api.put<{ submission: DBSubmission }>(
      `/assignments/${assignmentId}/grade/${submissionId}`,
      { score, feedback }
    ),
}

// ── AI Test API ────────────────────────────────────────────────────────────────

export const aiTestApi = {
  generate: (body: {
    topic: string
    subject: string
    difficulty: 'easy' | 'medium' | 'hard'
    questionCount: number
  }) => api.post<{ variants: AITestVariant[] }>('/ai/generate-test', body),
}

// ── AI Chat API (Skylla student mentor) ────────────────────────────────────────

export const aiChatApi = {
  send: (message: string) =>
    api.post<{ reply: string; ms: number }>('/ai/chat', { message }),
}

// ── Organization / B2B Types ───────────────────────────────────────────────────

export interface DBOrganization {
  id: string
  name: string
  type: string           // 'tutoring_center' | 'school' | 'corporate'
  city?: string | null
  address?: string | null
  bin?: string | null
  logoUrl?: string | null
  brandColor?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  website?: string | null
  inviteCode: string
  ownerId: string
  myRole?: string        // set when fetched via /mine
  _count?: { members: number }
  createdAt: string
  updatedAt?: string
}

export interface OrgUpdatePayload {
  name?: string
  type?: 'tutoring_center' | 'school' | 'corporate'
  city?: string
  address?: string
  bin?: string
  logoUrl?: string
  brandColor?: string
  contactEmail?: string
  contactPhone?: string
  website?: string
}

export interface OrgTeacherStats {
  id: string
  name: string
  email: string
  orgRole: string
  classCount: number
  studentCount: number
  assignmentCount: number
  avgScore: number | null
  lastActivityDays: number  // days since last class/assignment created
}

export interface OrgStudentStats {
  id: string
  name: string
  email: string
  teacherName: string
  className: string
  submissionCount: number
  totalAssignments: number
  avgScore: number | null
}

export interface OrgDashboard {
  org: DBOrganization
  stats: {
    totalTeachers: number
    totalStudents: number
    totalAssignments: number
    avgScore: number | null
  }
  teachers: OrgTeacherStats[]
  students: OrgStudentStats[]
}

// ── Organizations API ──────────────────────────────────────────────────────────

export const orgsApi = {
  create: (body: { name: string; type: string; city?: string }) =>
    api.post<{ org: DBOrganization }>('/orgs', body),

  mine: () => api.get<{ orgs: (DBOrganization & { myRole: string })[] }>('/orgs/mine'),

  join: (code: string) =>
    api.post<{ ok: true; org: DBOrganization }>('/orgs/join', { inviteCode: code }),

  dashboard: (id: string) => api.get<OrgDashboard>(`/orgs/${id}/dashboard`),

  update: (id: string, body: OrgUpdatePayload) =>
    api.put<{ org: DBOrganization }>(`/orgs/${id}`, body),

  removeMember: (orgId: string, userId: string) =>
    api.del<{ ok: boolean }>(`/orgs/${orgId}/members/${userId}`),

  importTeachers: (orgId: string, csv: string) =>
    api.post<{ created: number; createdNames: string[]; errors: { row: number; message: string }[] }>(
      `/orgs/${orgId}/import/teachers`, { csv }
    ),

  importStudents: (orgId: string, csv: string) =>
    api.post<{ created: number; createdNames: string[]; errors: { row: number; message: string }[] }>(
      `/orgs/${orgId}/import/students`, { csv }
    ),
}

// ── Schedule API ──────────────────────────────────────────────────────────────

export interface ClassScheduleItem {
  id: string
  classId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  room?: string | null
  className?: string
  subject?: string
}

export const scheduleApi = {
  getForClass: (classId: string) =>
    api.get<{ schedules: ClassScheduleItem[] }>(`/classes/${classId}/schedule`),

  add: (classId: string, body: { dayOfWeek: number; startTime: string; endTime: string; room?: string }) =>
    api.post<{ schedule: ClassScheduleItem }>(`/classes/${classId}/schedule`, body),

  remove: (classId: string, scheduleId: string) =>
    api.del<{ ok: boolean }>(`/classes/${classId}/schedule/${scheduleId}`),

  myTimetable: () =>
    api.get<{ timetable: ClassScheduleItem[] }>('/classes/my-schedule'),
}

// ── Reports API ───────────────────────────────────────────────────────────────

export const reportsApi = {
  weeklyUrl:  (orgId: string, week: string) => `/api/orgs/${orgId}/reports/weekly?week=${week}`,
  monthlyUrl: (orgId: string, month: string) => `/api/orgs/${orgId}/reports/monthly?month=${month}`,
  studentUrl: (orgId: string, studentId: string) => `/api/orgs/${orgId}/reports/student/${studentId}`,
}

// ── Smart Assignment API ──────────────────────────────────────────────────────

export interface StudentWeaknessAnalysis {
  studentId: string
  studentName: string
  weakTopics: string[]
  weakSubjects: string[]
  lowScoreAssignments: { title: string; score: number | null }[]
  diagnosticCount: number
}

export interface ClassAnalysis {
  classId: string
  className: string
  subject: string
  students: StudentWeaknessAnalysis[]
  availableSubjects: string[]
}

export interface PersonalisedQuestion {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  explanation?: string
  topic: string
  subject: string
  source: 'org' | 'global' | 'bank'
}

export interface StudentPreviewResponse {
  student: { id: string; name: string }
  questions: PersonalisedQuestion[]
  meta: {
    questionsGenerated: number
    requested: number
    diagnosticsAnalyzed: number
    weakTopicsRaw: string[]
    weakTopicIds: string[]
    orgContentUsed: number
    globalContentUsed: number
    fallbackBankUsed: number
  }
}

export const smartAssignmentApi = {
  analyze: (classId: string) =>
    api.get<ClassAnalysis>(`/smart-assignment/analysis/${classId}`),

  generate: (body: { classId: string; subject: string; questionCount?: number; title?: string }) =>
    api.post<{ assignment: DBAssignment; meta: { questionsGenerated: number; weakTopicsUsed: string[]; studentsAnalyzed: number } }>(
      '/smart-assignment/generate', body
    ),

  /** Per-student preview — returns questions tailored to ONE student's
   *  diagnostic weak topics, prioritising the center's own content. Does
   *  NOT persist anything; teacher reviews before publishing. */
  previewForStudent: (body: { classId: string; studentId: string; subject: string; questionCount?: number }) =>
    api.post<StudentPreviewResponse>('/smart-assignment/preview-for-student', body),
}

// ── Parent Link API ───────────────────────────────────────────────────────────

export const parentLinkApi = {
  generate: () =>
    api.post<{ code: string; instruction: string; botUrl: string }>('/users/me/parent-link', {}),
}
