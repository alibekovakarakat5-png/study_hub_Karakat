export type UserRole = 'student' | 'parent' | 'admin' | 'teacher' | 'employer'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  grade: number // 9, 10, 11
  city: string
  targetUniversity?: string
  targetSpecialty?: string
  isPremium: boolean
  createdAt: string
  parentId?: string // for student linked to parent
  childId?: string // for parent linked to child
  streak: number
  totalStudyMinutes: number
  lastActiveDate: string
}

export interface DiagnosticResult {
  id: string
  userId: string
  date: string
  subjects: SubjectScore[]
  overallScore: number
  maxScore: number
  percentile: number
  predictedUniversities: UniversityPrediction[]
}

export interface SubjectScore {
  subject: Subject
  score: number
  maxScore: number
  percentage: number
  level: 'low' | 'medium' | 'high'
  weakTopics: string[]
  strongTopics: string[]
}

export type Subject =
  | 'math'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'history'
  | 'english'
  | 'kazakh'
  | 'russian'
  | 'informatics'
  | 'geography'
  | 'literature'

export const SUBJECT_NAMES: Record<Subject, string> = {
  math: 'Математика',
  physics: 'Физика',
  chemistry: 'Химия',
  biology: 'Биология',
  history: 'История Казахстана',
  english: 'Английский язык',
  kazakh: 'Казахский язык',
  russian: 'Русский язык',
  informatics: 'Информатика',
  geography: 'География',
  literature: 'Литература',
}

export const SUBJECT_COLORS: Record<Subject, string> = {
  math: '#2563eb',
  physics: '#7c3aed',
  chemistry: '#dc2626',
  biology: '#16a34a',
  history: '#d97706',
  english: '#0891b2',
  kazakh: '#0d9488',
  russian: '#6366f1',
  informatics: '#2563eb',
  geography: '#65a30d',
  literature: '#be185d',
}

export interface Question {
  id: string
  subject: Subject
  topic: string
  text: string
  options: string[]
  correctAnswer: number
  difficulty: 'easy' | 'medium' | 'hard'
  explanation: string
}

export interface University {
  id: string
  name: string
  city: string
  logo?: string
  minScore: number
  specialties: Specialty[]
  ranking: number
  description: string
}

export interface Specialty {
  id: string
  name: string
  code: string
  minScore: number
  subjects: Subject[]
  avgSalary: string
  demand: 'low' | 'medium' | 'high'
}

export interface UniversityPrediction {
  university: University
  specialty: Specialty
  probability: number // 0-100
  scoreGap: number // how many points needed
}

export interface StudyPlan {
  id: string
  userId: string
  targetUniversity: string
  targetSpecialty: string
  targetDate: string
  weeks: StudyWeek[]
  currentWeek: number
  overallProgress: number
}

export interface StudyWeek {
  weekNumber: number
  startDate: string
  endDate: string
  tasks: StudyTask[]
  completed: boolean
}

export interface StudyTask {
  id: string
  title: string
  subject: Subject
  topic: string
  type: 'lesson' | 'practice' | 'test' | 'review'
  duration: number // minutes
  completed: boolean
  score?: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: string
  category: 'streak' | 'score' | 'practice' | 'social'
}

export interface WeeklyReport {
  weekNumber: number
  startDate: string
  endDate: string
  studyMinutes: number
  tasksCompleted: number
  totalTasks: number
  subjectProgress: { subject: Subject; before: number; after: number }[]
  streak: number
  rank?: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

// ── Notifications ─────────────────────────────────────────────────────────

export type NotificationType = 'info' | 'success' | 'warning' | 'achievement'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
}

export interface PortfolioItem {
  id: string
  type: 'project' | 'certificate' | 'achievement' | 'skill'
  title: string
  description: string
  date: string
  proof?: string
  subject?: Subject
}

// ── Courses ──────────────────────────────────────────────────────────────────

export interface Course {
  id: string
  title: string
  description: string
  longDescription: string
  teacherId: string
  teacherName: string
  teacherAvatar?: string
  subject: Subject
  category: CourseCategory
  level: 'beginner' | 'intermediate' | 'advanced'
  price: number // 0 = free, in tenge
  rating: number
  reviewCount: number
  studentsCount: number
  lessons: number
  duration: string // e.g. "12 часов"
  thumbnail?: string
  tags: string[]
  createdAt: string
  featured: boolean
}

export type CourseCategory =
  | 'ent-prep'
  | 'programming'
  | 'languages'
  | 'science'
  | 'business'
  | 'design'
  | 'personal-growth'

export const CATEGORY_NAMES: Record<CourseCategory, string> = {
  'ent-prep': 'Подготовка к ЕНТ',
  'programming': 'Программирование',
  'languages': 'Языки',
  'science': 'Наука',
  'business': 'Бизнес',
  'design': 'Дизайн',
  'personal-growth': 'Саморазвитие',
}

// ── Public Profile ───────────────────────────────────────────────────────────

export interface PublicProfile {
  id: string
  name: string
  title: string // e.g. "Студент 11 класса" or "Стажёр в Kaspi"
  city: string
  bio: string
  avatar?: string
  skills: { name: string; level: number }[]
  education: { institution: string; degree: string; year: string }[]
  experience: { company: string; role: string; period: string; description: string }[]
  achievements: Achievement[]
  courses: { title: string; provider: string; date: string }[]
  diagnosticScore?: number
  streak: number
  totalStudyHours: number
  isOpenToWork: boolean
  contactEmail: string
  links: { label: string; url: string }[]
}

// ── Employer ─────────────────────────────────────────────────────────────────

export interface Candidate {
  id: string
  name: string
  title: string
  city: string
  skills: string[]
  score: number
  university?: string
  isOpenToWork: boolean
  matchPercentage: number
}

export interface JobPosting {
  id: string
  title: string
  company: string
  city: string
  type: 'internship' | 'part-time' | 'full-time'
  salary?: string
  skills: string[]
  description: string
  applicants: number
  createdAt: string
}

// ── Onboarding Quest ────────────────────────────────────────────────────────

export type OnboardingStep = 'welcome' | 'about' | 'interests' | 'goals' | 'dream' | 'result'

export interface OnboardingProfile {
  age: number
  grade: number
  city: string
  interests: string[]
  strengths: string[]
  dreamProfessions: string[]
  goals: string[] // e.g. 'ent', 'abroad', 'career', 'startup'
  personalityType?: string
  recommendedPaths: CareerPath[]
}

export interface CareerPath {
  id: string
  title: string
  description: string
  icon: string
  matchPercentage: number
  relatedProfessions: string[]
  requiredSkills: string[]
  avgSalary: string
  demand: 'low' | 'medium' | 'high' | 'very-high'
}

// ── Career Orientation ──────────────────────────────────────────────────────

export interface Profession {
  id: string
  title: string
  category: ProfessionCategory
  description: string
  avgSalary: string
  demand: 'low' | 'medium' | 'high' | 'very-high'
  requiredSkills: string[]
  education: string
  growthRate: string
  relatedSubjects: Subject[]
  icon: string
}

export type ProfessionCategory =
  | 'tech'
  | 'medicine'
  | 'business'
  | 'creative'
  | 'engineering'
  | 'education'
  | 'law'
  | 'science'

export const PROFESSION_CATEGORY_NAMES: Record<ProfessionCategory, string> = {
  tech: 'IT и технологии',
  medicine: 'Медицина',
  business: 'Бизнес и финансы',
  creative: 'Творчество и дизайн',
  engineering: 'Инженерия',
  education: 'Образование',
  law: 'Право',
  science: 'Наука',
}

export interface InterestTestResult {
  categories: { category: ProfessionCategory; score: number }[]
  topProfessions: Profession[]
  personalityTraits: string[]
}

// ── Career Tracker ──────────────────────────────────────────────────────────

export interface CareerGoal {
  id: string
  title: string
  targetRole: string
  targetCompany?: string
  deadline: string
  progress: number
  milestones: CareerMilestone[]
}

export interface CareerMilestone {
  id: string
  title: string
  completed: boolean
  type: 'skill' | 'course' | 'project' | 'interview' | 'application'
}

export interface ResumeData {
  fullName: string
  title: string
  email: string
  phone: string
  city: string
  summary: string
  education: { institution: string; degree: string; year: string; gpa?: string }[]
  experience: { company: string; role: string; period: string; bullets: string[] }[]
  skills: { name: string; level: number }[]
  languages: { name: string; level: string }[]
  projects: { name: string; description: string; tech: string[]; link?: string }[]
}

export interface InterviewQuestion {
  id: string
  category: 'behavioral' | 'technical' | 'situational' | 'hr'
  question: string
  tips: string[]
  sampleAnswer: string
}

// ── University Admission ────────────────────────────────────────────────────

export interface InternationalUniversity {
  id: string
  name: string
  country: string
  city: string
  ranking: number
  acceptanceRate: number
  tuition: string
  scholarships: boolean
  deadlines: { type: string; date: string }[]
  requirements: string[]
  programs: string[]
  logo?: string
}

export interface ApplicationChecklist {
  id: string
  universityId: string
  universityName: string
  items: ChecklistItem[]
  status: 'not-started' | 'in-progress' | 'submitted' | 'accepted' | 'rejected'
  deadline: string
}

export interface ChecklistItem {
  id: string
  title: string
  completed: boolean
  category: 'document' | 'test' | 'essay' | 'recommendation' | 'other'
  notes?: string
}

// ── Internships ─────────────────────────────────────────────────────────────

export interface Internship {
  id: string
  title: string
  company: string
  companyLogo?: string
  city: string
  type: 'remote' | 'office' | 'hybrid'
  duration: string
  isPaid: boolean
  salary?: string
  description: string
  requirements: string[]
  skills: string[]
  deadline: string
  applicants: number
  matchPercentage: number
}

export type InternshipApplicationStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected'

export interface InternshipApplication {
  id: string
  internshipId: string
  status: InternshipApplicationStatus
  appliedAt: string
  notes?: string
}
