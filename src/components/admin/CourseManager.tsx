import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Plus,
  Edit3,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getToken } from '@/lib/api'
import CourseBuilderComponent from '@/components/admin/CourseBuilder'
import type { CourseData } from '@/components/admin/CourseBuilder'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
} satisfies import('framer-motion').Variants

export default function CourseManager() {
  const [courses, setCourses] = useState<CourseData[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCourse, setEditingCourse] = useState<CourseData | null | 'new'>()
  const [isSaving, setIsSaving] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const authHeader = () => ({ Authorization: `Bearer ${getToken() ?? ''}` })

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/courses', { headers: authHeader() })
      const data = await res.json()
      setCourses((data.courses ?? []) as CourseData[])
    } catch { /* offline */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchCourses() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (course: CourseData) => {
    setIsSaving(true)
    try {
      const isNew = !course.id
      const url    = isNew ? '/api/courses' : `/api/courses/${course.id}`
      const method = isNew ? 'POST' : 'PUT'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(course),
      })
      const data = await res.json()
      if (data.course) {
        if (isNew) setEditingCourse(data.course as CourseData)
        await fetchCourses()
      }
    } catch { /* offline */ }
    finally { setIsSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id)
      return
    }
    setDeleteConfirmId(null)
    await fetch(`/api/courses/${id}`, { method: 'DELETE', headers: authHeader() })
    await fetchCourses()
  }

  // Builder view
  if (editingCourse) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-50">
        <CourseBuilderComponent
          initialCourse={editingCourse === 'new' ? undefined : editingCourse}
          onSave={handleSave}
          onBack={() => { setEditingCourse(undefined); fetchCourses() }}
          isSaving={isSaving}
        />
      </div>
    )
  }

  // Course list view
  const SUBJECT_LABELS: Record<string, string> = {
    ielts: 'IELTS', ent: 'ЕНТ', math: 'Математика',
    physics: 'Физика', history: 'История', english: 'Английский',
  }
  const LEVEL_LABELS: Record<string, string> = {
    beginner: 'Начальный', intermediate: 'Средний', advanced: 'Продвинутый',
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Курсы</h3>
          <p className="text-sm text-slate-500">{courses.length} курсов создано</p>
        </div>
        <button
          type="button"
          onClick={() => setEditingCourse('new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Создать курс
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium mb-1">Курсов пока нет</p>
          <p className="text-slate-400 text-sm mb-4">Создай первый курс и начни обучать студентов</p>
          <button type="button" onClick={() => setEditingCourse('new')}
            className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors">
            + Создать первый курс
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map(course => {
            const totalLessons = (course.modules ?? []).reduce(
              (s, m) => s + (m.lessons?.length ?? 0), 0
            )
            return (
              <div key={course.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Cover */}
                <div className="h-2 w-full" style={{ backgroundColor: course.coverColor ?? '#2563eb' }} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 truncate">{course.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {SUBJECT_LABELS[course.subject] ?? course.subject} · {LEVEL_LABELS[course.level] ?? course.level}
                      </p>
                    </div>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium shrink-0',
                      course.isPublished ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    )}>
                      {course.isPublished ? 'Опубл.' : 'Черновик'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">{course.description || 'Без описания'}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                    <span>{course.modules?.length ?? 0} модулей</span>
                    <span>·</span>
                    <span>{totalLessons} уроков</span>
                    <span>·</span>
                    <span>{course.price === 0 ? 'Бесплатно' : `${course.price.toLocaleString('ru-RU')} ₸`}</span>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setEditingCourse(course)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary-50 text-primary-700 text-xs font-semibold hover:bg-primary-100 transition-colors">
                      <Edit3 className="w-3.5 h-3.5" /> Редактировать
                    </button>
                    {deleteConfirmId === course.id ? (
                      <div className="flex gap-1">
                        <button type="button" onClick={() => handleDelete(course.id)}
                          className="px-2 py-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 text-xs font-semibold transition-colors">
                          Удалить
                        </button>
                        <button type="button" onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-2 rounded-lg text-slate-500 bg-slate-100 hover:bg-slate-200 text-xs font-semibold transition-colors">
                          Отмена
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => handleDelete(course.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
