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
        <Route path="/courses" element={<Courses />} />
        <Route path="/profile/:id" element={<PublicProfile />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
