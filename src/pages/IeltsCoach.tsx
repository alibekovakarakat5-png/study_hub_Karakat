import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { learningApi } from '@/lib/learning'
import type { LearningState, LearningAttempt, LearningDraft, LearningRecord } from '@/lib/learning'
import MemoryPanel from '@/components/learning/MemoryPanel'
import PracticePanel from '@/components/learning/PracticePanel'
import ReviewPanel from '@/components/learning/ReviewPanel'
import StudyMentor from '@/components/StudyMentor'

export default function IeltsCoach() {
  const userId = useStore(s => s.user?.id)
  return <CoachLoader key={userId} />
}
function CoachLoader() {
  const [state, setState] = useState<LearningState | null>(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [params, setParams] = useSearchParams()
  const tabs = [['today', 'Сегодня'], ['memory', 'Память и перенос'], ['review', 'Ошибки и фразы'], ['chat', 'Диалог со Skylla']]
  const tab = tabs.some(([id]) => id === params.get('tab')) ? params.get('tab') : 'today'
  useEffect(() => { let active = true; learningApi.load().then(data => { if (active) setState(data) }).catch(e => { if (active) setError(e.message) }); return () => { active = false } }, [retry])
  const onAttempt = useCallback((record: LearningRecord<LearningAttempt>) => setState(s => s && ({ ...s, attempts: [record, ...s.attempts.filter(a => a.id !== record.id)].sort((a, b) => b.data.createdAt.localeCompare(a.data.createdAt)).slice(0, 100) })), [])
  const onDraft = useCallback((record: LearningRecord<LearningDraft>) => setState(s => s && ({ ...s, draft: record })), [])
  return <main className="min-h-screen bg-slate-950 text-slate-100"><div className="max-w-5xl mx-auto px-4 py-6 md:p-8 space-y-6">
    <header className="flex flex-wrap justify-between gap-4"><div><p className="text-blue-300">Study Hub · бесплатная учебная практика</p><h1 className="text-3xl font-bold mt-2">Мой английский со Skylla</h1><p className="text-slate-400 mt-2">Свои ошибки → понятное правило → практика → повтор</p></div><nav className="flex flex-wrap gap-4 text-blue-300 text-sm"><Link to="/dashboard">Моя подготовка</Link><Link to="/ielts">Материалы IELTS</Link><Link to="/settings">Аккаунт</Link></nav></header>
    {!state ? <div>{error ? <p role="alert" className="text-red-200">{error}</p> : <p>Загружаем учебную память…</p>}<button className="text-blue-300 underline mt-3" onClick={() => { setError(''); setRetry(n => n + 1) }}>Повторить загрузку</button></div> : <>
      <nav aria-label="Учебный кабинет" className="flex flex-wrap gap-2">{tabs.map(([id, label]) => <button key={id} aria-current={tab === id ? 'page' : undefined} className={`rounded-xl px-4 py-3 ${tab === id ? 'bg-blue-600' : 'bg-slate-800'}`} onClick={() => setParams({ tab: id })}>{label}</button>)}</nav>
      {/* Keep draft/profile forms mounted across tabs. Chat reloads after a profile change. */}
      <section hidden={tab !== 'today'}><PracticePanel state={state} onAttempt={onAttempt} onDraft={onDraft} /></section>
      <section hidden={tab !== 'memory'}><MemoryPanel memory={state.memory} onChange={memory => setState(s => s && ({ ...s, memory }))} /></section>
      <section hidden={tab !== 'review'}><ReviewPanel items={state.items} onChange={record => setState(s => s && ({ ...s, items: [record, ...s.items.filter(i => i.id !== record.id)] }))} onDelete={id => setState(s => s && ({ ...s, items: s.items.filter(i => i.id !== id) }))} /></section>
      <section hidden={tab !== 'chat'}><StudyMentor key={state.memory?.updatedAt ?? 'no-memory'} /></section>
    </>}
  </div></main>
}
