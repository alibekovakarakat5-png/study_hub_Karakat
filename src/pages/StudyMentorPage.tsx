import { Link } from 'react-router-dom'
import StudyMentor from '@/components/StudyMentor'
import { useStore } from '@/store/useStore'

export default function StudyMentorPage() {
  const userId = useStore(s => s.user?.id)
  return <main className="min-h-screen bg-slate-950 text-white p-6"><div className="max-w-3xl mx-auto space-y-6">
    <Link to="/dashboard" className="text-blue-300">← Моя подготовка</Link>
    <h1 className="text-3xl font-bold">Skylla · IELTS и поступление</h1>
    <StudyMentor key={userId} />
  </div></main>
}
