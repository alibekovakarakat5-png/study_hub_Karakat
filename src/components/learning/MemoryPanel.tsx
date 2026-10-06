import { useState } from 'react'
import { api } from '@/lib/api'
import { blankProfile, downloadLearningFile, learningApi, parseLearningImport, transferPrompt } from '@/lib/learning'
import type { LearningProfile, LearningRecord } from '@/lib/learning'

const field = 'w-full rounded-xl border border-slate-600 bg-slate-950 p-3 text-white'
const button = 'rounded-xl bg-blue-600 px-4 py-2.5 disabled:opacity-40'
export default function MemoryPanel({ memory, onChange }: { memory: LearningRecord<LearningProfile> | null; onChange: (record: LearningRecord<LearningProfile> | null) => void }) {
  const [profile, setProfile] = useState<LearningProfile>(() => memory ? { ...blankProfile(), ...memory.data } : blankProfile())
  const [raw, setRaw] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [deleting, setDeleting] = useState(false)
  const update = <K extends keyof LearningProfile>(key: K, value: LearningProfile[K]) => { setProfile(p => ({ ...p, [key]: value })); setConfirmed(false); setNotice('') }
  const preview = (value: string) => {
    try { setProfile(parseLearningImport(value)); setConfirmed(false); setError(''); setNotice('Предпросмотр готов. Проверьте сводку и следующий шаг. Пока ничего не сохранено.') }
    catch (e) { setError((e as Error).message) }
  }
  return <div className="space-y-6">
    <div className="rounded-2xl bg-blue-950/50 p-5 space-y-3">
      <h2 className="text-xl font-semibold">Продолжить с того места, где остановились</h2>
      <p>Перенесите учебную сводку из ChatGPT, заметок или от преподавателя. Импорт — сведения с ваших слов, не подтверждение уровня или IELTS band.</p>
      <p className="text-sm text-slate-300">Study Hub не подключается к памяти вашего аккаунта ChatGPT. Вы выбираете, что перенести. Этот модуль не передаёт ваши записи школам и центрам.</p>
      <details><summary className="cursor-pointer text-blue-300">Запрос для получения учебной сводки в ChatGPT</summary><textarea className={`${field} mt-3`} rows={8} readOnly value={transferPrompt} aria-label="Запрос для ChatGPT" /><button type="button" className="mt-3 text-blue-300 underline" onClick={async () => { try { await navigator.clipboard.writeText(transferPrompt); setNotice('Запрос скопирован.') } catch { setError('Выделите запрос и скопируйте вручную.') } }}>Скопировать запрос</button></details>
      <label className="block">Учебная сводка или JSON-профиль<textarea aria-label="Учебная сводка или JSON-профиль" className={field} rows={6} maxLength={60000} value={raw} onChange={e => setRaw(e.target.value)} placeholder="Только учебная часть: темы, ошибки с примерами, где остановились…" /></label>
      <div className="flex flex-wrap gap-3 items-center"><button className={button} type="button" disabled={!raw.trim() || busy} onClick={() => preview(raw)}>Проверить перед переносом</button><label className="text-sm">Или файл .txt / .md / .json<input className="block mt-2 max-w-full" type="file" accept=".txt,.md,.json" disabled={busy} onChange={async e => { const file = e.target.files?.[0]; if (!file) return; if (file.size > 128000) { setError('Файл больше 128 КБ. Подготовьте краткую учебную сводку.'); return } try { const value = await file.text(); setRaw(value); preview(value) } catch { setError('Не удалось прочитать файл.') } e.target.value = '' }} /></label></div>
    </div>
    <form className="rounded-2xl border border-slate-700 p-5 space-y-4" onSubmit={async e => {
      e.preventDefault(); if (!confirmed || busy) return; setBusy(true); setError(''); setNotice('')
      try { const { record } = await learningApi.memory(profile, memory?.revision ?? 0); onChange(record); setRaw(''); setNotice('Учебный профиль сохранён. Откройте «Сегодня» или продолжите с Skylla.'); setConfirmed(false) }
      catch (err) { setError((err as Error).message) } finally { setBusy(false) }
    }}>
      <h2 className="text-xl font-semibold">Моя учебная память</h2>
      <p className="text-sm text-slate-400">Уберите лишние личные подробности. Можно заполнить с нуля. Сохранение заменяет профиль, но сохраняет работы.</p>
      <div className="grid md:grid-cols-2 gap-4"><label>Источник<select className={field} value={profile.source} onChange={e => update('source', e.target.value as LearningProfile['source'])}><option value="chatgpt">ChatGPT</option><option value="teacher">Преподаватель</option><option value="self">Мои заметки</option><option value="other">Другой источник</option></select></label><label>Дата источника, если известна<input className={field} value={profile.sourceDate} maxLength={40} onChange={e => update('sourceDate', e.target.value)} placeholder="Можно оставить пустым" /></label></div>
      <label className="block">Цель<input className={field} maxLength={400} value={profile.goal} onChange={e => update('goal', e.target.value)} /></label>
      <label className="block">Учебная сводка<textarea aria-label="Учебная сводка" className={field} rows={8} maxLength={18000} value={profile.summary} onChange={e => update('summary', e.target.value)} /></label>
      <div className="grid md:grid-cols-3 gap-4">{([['strengths', 'Что получается'], ['completedTopics', 'Уже изученные темы'], ['focusAreas', 'Что ещё закреплять']] as const).map(([key, label]) => <label key={key}>{label}<textarea aria-label={label} className={field} rows={5} value={profile[key].join('\n')} onChange={e => update(key, e.target.value.split('\n'))} placeholder="По одной записи на строку" /><span className="text-xs text-slate-400">До {key === 'completedTopics' ? 30 : 20} строк по 180 символов</span></label>)}</div>
      <label className="block">Где остановились и что делать дальше<textarea aria-label="Где остановились и что делать дальше" className={field} rows={3} maxLength={600} value={profile.nextStep} onChange={e => update('nextStep', e.target.value)} placeholder="Например: Day 8 — Verb Patterns после повторения" /></label>
      <div className="grid md:grid-cols-2 gap-4"><label>Темы, о которых интересно говорить<input className={field} maxLength={400} value={profile.interests} onChange={e => update('interests', e.target.value)} /></label><label>Минут на занятие<input type="number" min={5} max={120} required className={field} value={profile.dailyMinutes} onChange={e => update('dailyMinutes', Number(e.target.value))} /></label></div>
      <label className="flex gap-3 items-start"><input type="checkbox" className="mt-1" checked={profile.aiConsent} onChange={e => update('aiConsent', e.target.checked)} /><span>Разрешаю Skylla использовать учебную память, недавние работы и диалог. При обращении к ИИ этот контекст отправляется провайдеру Groq. Без разрешения доступны уроки, сохранение и повторение.</span></label>
      <label className="flex gap-3 items-start"><input type="checkbox" className="mt-1" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} /><span>Я проверил(а) сводку и хочу сохранить именно эти учебные сведения.</span></label>
      <button className={button} disabled={busy || !confirmed}>{busy ? 'Сохраняется…' : 'Сохранить учебный профиль'}</button>
    </form>
    <div className="flex flex-wrap gap-4 text-sm"><button disabled={!memory || busy} className="text-blue-300 underline disabled:opacity-40" onClick={() => { if (memory) downloadLearningFile('studyhub-learning-profile.json', { format: 'studyhub-learning-profile', version: 1, profile: { ...memory.data, aiConsent: false } }) }}>Скачать сохранённый профиль</button><button className="text-blue-300 underline" disabled={busy} onClick={async () => { setBusy(true); try { const archive = await api.get<{ truncated: boolean }>('/learning/export'); downloadLearningFile('studyhub-learning-archive.json', archive); setNotice(archive.truncated ? 'Скачаны последние 1000 записей; это часть истории.' : 'Архив скачан. Это резервная копия; для переноса профиля используйте отдельный файл профиля.') } catch (e) { setError((e as Error).message) } finally { setBusy(false) } }}>Скачать архив работ и диалогов</button><button disabled={!memory || busy} className="text-rose-300 underline disabled:opacity-40" onClick={() => setDeleting(true)}>Удалить учебный профиль</button></div>
    {deleting && <div className="rounded-xl border border-rose-800 p-4 space-y-3"><p>Удалить импорт и профиль? Работы и диалог останутся в их разделах. Доступ к ИИ будет выключен до нового разрешения.</p><button className="text-rose-300 underline mr-5" disabled={busy} onClick={async () => { setBusy(true); setError(''); try { await api.del('/learning/memory'); onChange(null); setProfile(blankProfile()); setConfirmed(false); setDeleting(false); setNotice('Профиль удалён.') } catch (e) { setError((e as Error).message) } finally { setBusy(false) } }}>Да, удалить профиль</button><button onClick={() => setDeleting(false)}>Отмена</button></div>}
    {notice && <p role="status" className="text-emerald-300">{notice}</p>}{error && <p role="alert" className="rounded-xl bg-red-950 p-3 text-red-200">{error}</p>}
  </div>
}
