import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import Landing from '@/pages/Landing'
import Auth from '@/pages/Auth'
import Diagnostic from '@/pages/Diagnostic'
import Dashboard from '@/pages/Dashboard'
import Plan from '@/pages/Plan'
import Mentor from '@/pages/Mentor'
import Portfolio from '@/pages/Portfolio'
import ParentDashboard from '@/pages/ParentDashboard'
import Admin from '@/pages/Admin'
import Pricing from '@/pages/Pricing'
import Courses from '@/pages/Courses'
import TeacherDashboard from '@/pages/TeacherDashboard'
import EmployerDashboard from '@/pages/EmployerDashboard'
import PublicProfile from '@/pages/PublicProfile'
import Onboarding from '@/pages/Onboarding'
import CareerOrientation from '@/pages/CareerOrientation'
import CareerTracker from '@/pages/CareerTracker'
import Admission from '@/pages/Admission'
import Internships from '@/pages/Internships'
import Support from '@/pages/Support'
import Curator from '@/pages/Curator'
import PracticeEnt from '@/pages/PracticeEnt'
import DailyChallenge from '@/pages/DailyChallenge'
import Ielts from '@/pages/Ielts'
import Admissions from '@/pages/Admissions'
import CourseLesson from '@/pages/CourseLesson'
import MotivationLetter from '@/pages/MotivationLetter'
import AdmissionPlan from '@/pages/AdmissionPlan'
import AdminLogin from '@/pages/AdminLogin'
import UniversityAdvisor from '@/pages/UniversityAdvisor'
import ScholarshipFinder from '@/pages/ScholarshipFinder'
import EntTheory from '@/pages/EntTheory'
import TopicDrill from '@/pages/TopicDrill'
import HistoryKZCourse from '@/pages/HistoryKZCourse'
import StartupLab from '@/pages/StartupLab'
import EntLab from '@/pages/EntLab'
import IeltsLab from '@/pages/IeltsLab'
import AdmitLab from '@/pages/AdmitLab'
import StartupLabLanding from '@/pages/StartupLabLanding'
import CareerLab from '@/pages/CareerLab'
import CareerTest from '@/pages/CareerTest'
import Settings from '@/pages/Settings'
import RobotWidget from '@/components/robot/RobotWidget'

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
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
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
        <Route path="/startup-lab" element={<ProtectedRoute><StartupLab /></ProtectedRoute>} />
        {/* ── Lab landing pages (public, entry points) ── */}
        <Route path="/ent" element={<EntLab />} />
        <Route path="/ielts-lab" element={<IeltsLab />} />
        <Route path="/admit-lab" element={<AdmitLab />} />
        <Route path="/startup" element={<StartupLabLanding />} />
        <Route path="/career-lab" element={<CareerLab />} />
        <Route path="/career-test" element={<CareerTest />} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:courseId/lessons/:lessonId" element={<ProtectedRoute><CourseLesson /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<PublicProfile />} />
        <Route path="/support" element={<Support />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <RobotWidget />
    </BrowserRouter>
  )
}
