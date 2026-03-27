import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { useStore } from '@/store/useStore'
import RobotWidget from '@/components/robot/RobotWidget'

// ── Lazy-loaded pages ────────────────────────────────────────────────────────
const Landing = lazy(() => import('@/pages/Landing'))
const Auth = lazy(() => import('@/pages/Auth'))
const Diagnostic = lazy(() => import('@/pages/Diagnostic'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Plan = lazy(() => import('@/pages/Plan'))
const Mentor = lazy(() => import('@/pages/Mentor'))
const Portfolio = lazy(() => import('@/pages/Portfolio'))
const ParentDashboard = lazy(() => import('@/pages/ParentDashboard'))
const Admin = lazy(() => import('@/pages/Admin'))
const Pricing = lazy(() => import('@/pages/Pricing'))
const Courses = lazy(() => import('@/pages/Courses'))
const TeacherDashboard = lazy(() => import('@/pages/TeacherDashboard'))
const EmployerDashboard = lazy(() => import('@/pages/EmployerDashboard'))
const PublicProfile = lazy(() => import('@/pages/PublicProfile'))
const Onboarding = lazy(() => import('@/pages/Onboarding'))
const CareerOrientation = lazy(() => import('@/pages/CareerOrientation'))
const CareerTracker = lazy(() => import('@/pages/CareerTracker'))
const Admission = lazy(() => import('@/pages/Admission'))
const Internships = lazy(() => import('@/pages/Internships'))
const Support = lazy(() => import('@/pages/Support'))
const Curator = lazy(() => import('@/pages/Curator'))
const PracticeEnt = lazy(() => import('@/pages/PracticeEnt'))
const DailyChallenge = lazy(() => import('@/pages/DailyChallenge'))
const Ielts = lazy(() => import('@/pages/Ielts'))
const Admissions = lazy(() => import('@/pages/Admissions'))
const CourseLesson = lazy(() => import('@/pages/CourseLesson'))
const MotivationLetter = lazy(() => import('@/pages/MotivationLetter'))
const AdmissionPlan = lazy(() => import('@/pages/AdmissionPlan'))
const AdminLogin = lazy(() => import('@/pages/AdminLogin'))
const UniversityAdvisor = lazy(() => import('@/pages/UniversityAdvisor'))
const ScholarshipFinder = lazy(() => import('@/pages/ScholarshipFinder'))
const EntTheory = lazy(() => import('@/pages/EntTheory'))
const TopicDrill = lazy(() => import('@/pages/TopicDrill'))
const HistoryKZCourse = lazy(() => import('@/pages/HistoryKZCourse'))
const MathEntCourse = lazy(() => import('@/pages/MathEntCourse'))
const StartupLab = lazy(() => import('@/pages/StartupLab'))
const EntLab = lazy(() => import('@/pages/EntLab'))
const IeltsLab = lazy(() => import('@/pages/IeltsLab'))
const AdmitLab = lazy(() => import('@/pages/AdmitLab'))
const StartupLabLanding = lazy(() => import('@/pages/StartupLabLanding'))
const CareerLab = lazy(() => import('@/pages/CareerLab'))
const CareerTest = lazy(() => import('@/pages/CareerTest'))
const Settings = lazy(() => import('@/pages/Settings'))
const WelcomeFlow = lazy(() => import('@/pages/WelcomeFlow'))
const StudyAbroad = lazy(() => import('@/pages/StudyAbroad'))
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/ResetPassword'))
const NotFound        = lazy(() => import('@/pages/NotFound'))
const ForSchools      = lazy(() => import('@/pages/ForSchools'))
const CenterDashboard = lazy(() => import('@/pages/CenterDashboard'))

// ── Loading fallback ─────────────────────────────────────────────────────────
function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-primary-200 border-t-primary-600" />
        <p className="text-sm text-gray-400 animate-pulse">Загрузка...</p>
      </div>
    </div>
  )
}

// ── Route guards ─────────────────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useStore()
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  return <>{children}</>
}

function ParentRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useStore()
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  if (user?.role !== 'parent') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useStore()
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function TeacherRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useStore()
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  if (user?.role !== 'teacher') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function EmployerRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useStore()
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  if (user?.role !== 'employer') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/welcome" element={<ProtectedRoute><WelcomeFlow /></ProtectedRoute>} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/diagnostic" element={<Diagnostic />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/plan" element={<ProtectedRoute><Plan /></ProtectedRoute>} />
          <Route path="/mentor" element={<ProtectedRoute><Mentor /></ProtectedRoute>} />
          <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
          <Route path="/parent" element={<ParentRoute><ParentDashboard /></ParentRoute>} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/teacher" element={<TeacherRoute><TeacherDashboard /></TeacherRoute>} />
          <Route path="/employer" element={<EmployerRoute><EmployerDashboard /></EmployerRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/career-orientation" element={<ProtectedRoute><CareerOrientation /></ProtectedRoute>} />
          <Route path="/career-tracker" element={<ProtectedRoute><CareerTracker /></ProtectedRoute>} />
          <Route path="/admission" element={<ProtectedRoute><Admission /></ProtectedRoute>} />
          <Route path="/internships" element={<ProtectedRoute><Internships /></ProtectedRoute>} />
          <Route path="/curator" element={<ProtectedRoute><Curator /></ProtectedRoute>} />
          <Route path="/practice-ent" element={<ProtectedRoute><PracticeEnt /></ProtectedRoute>} />
          <Route path="/daily-challenge" element={<ProtectedRoute><DailyChallenge /></ProtectedRoute>} />
          <Route path="/ielts" element={<ProtectedRoute><Ielts /></ProtectedRoute>} />
          <Route path="/admissions" element={<ProtectedRoute><Admissions /></ProtectedRoute>} />
          <Route path="/motivation-letter" element={<ProtectedRoute><MotivationLetter /></ProtectedRoute>} />
          <Route path="/admission-plan" element={<ProtectedRoute><AdmissionPlan /></ProtectedRoute>} />
          <Route path="/university-advisor" element={<ProtectedRoute><UniversityAdvisor /></ProtectedRoute>} />
          <Route path="/scholarship-finder" element={<ProtectedRoute><ScholarshipFinder /></ProtectedRoute>} />
          <Route path="/ent-theory" element={<ProtectedRoute><EntTheory /></ProtectedRoute>} />
          <Route path="/topic-drill" element={<ProtectedRoute><TopicDrill /></ProtectedRoute>} />
          <Route path="/courses/history-kz" element={<ProtectedRoute><HistoryKZCourse /></ProtectedRoute>} />
          <Route path="/courses/math-ent" element={<ProtectedRoute><MathEntCourse /></ProtectedRoute>} />
          <Route path="/startup-lab" element={<ProtectedRoute><StartupLab /></ProtectedRoute>} />
          {/* ── Lab landing pages (public, entry points) ── */}
          <Route path="/ent" element={<EntLab />} />
          <Route path="/ielts-lab" element={<IeltsLab />} />
          <Route path="/admit-lab" element={<AdmitLab />} />
          <Route path="/startup" element={<StartupLabLanding />} />
          <Route path="/career-lab" element={<CareerLab />} />
          <Route path="/career-test" element={<CareerTest />} />
          <Route path="/study-abroad" element={<StudyAbroad />} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId/lessons/:lessonId" element={<ProtectedRoute><CourseLesson /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<PublicProfile />} />
          <Route path="/support" element={<Support />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/for-schools" element={<ForSchools />} />
          <Route path="/center" element={<ProtectedRoute><CenterDashboard /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <RobotWidget />
    </BrowserRouter>
  )
}
