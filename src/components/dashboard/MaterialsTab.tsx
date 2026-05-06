// ── Materials tab — center uploads its own teaching materials ───────────────
//
// Director uploads a PDF/DOCX or pastes raw text. The server runs Groq over
// it and produces a list of lessons (theory + 5 quiz questions each) which
// are saved to the Content table scoped to this org. The center can review
// and delete bad ones; everything is invisible to other orgs.

import { useEffect, useState } from 'react'
import {
  Upload, Sparkles, FileText, Trash2, RefreshCw,
  Loader2, AlertCircle, CheckCircle2, X,
} from 'lucide-react'
import { contentApi, uploadApi } from '@/lib/api'
import type { ContentItem } from '@/lib/api'

interface MaterialsTabProps {
  orgId: string
}

interface LessonPreview {
  id: string
  title: string
  duration: number
  theoryLength: number
  quizCount: number
  moduleTitle: string
  topics: string[]
  raw: ContentItem
}

// Topic taxonomy for chip labels. Inline (small) so the bundle has no
// cross-cutting import to the server-side TS file.
const TOPIC_LABELS: Record<string, string> = {
  'linear-equations': 'Линейные уравнения', 'quadratic-equations': 'Квадратные уравнения',
  'inequalities': 'Неравенства', 'functions-graphs': 'Функции и графики',
  'trigonometry': 'Тригонометрия', 'powers-logarithms': 'Степени и логарифмы',
  'derivatives-integrals': 'Производные и интегралы', 'geometry-planimetry': 'Планиметрия',
  'geometry-stereometry': 'Стереометрия', 'probability': 'Вероятность',
  'kinematics': 'Кинематика', 'dynamics': 'Динамика', 'energy-momentum': 'Энергия и импульс',
  'thermodynamics': 'Термодинамика', 'electricity': 'Электричество', 'magnetism': 'Магнетизм',
  'optics': 'Оптика', 'atomic-physics': 'Атомная физика',
  'atomic-structure': 'Строение атома', 'periodic-law': 'Периодический закон',
  'chemical-bonding': 'Химическая связь', 'reactions-equations': 'Химические реакции',
  'solutions': 'Растворы', 'organic-chemistry': 'Органическая химия',
  'metals-nonmetals': 'Металлы и неметаллы',
  'cell-biology': 'Клеточная биология', 'genetics': 'Генетика', 'evolution': 'Эволюция',
  'human-anatomy': 'Анатомия человека', 'botany': 'Ботаника', 'zoology': 'Зоология',
  'ecology': 'Экология', 'reproduction': 'Размножение',
  'ancient-kz': 'Древний Казахстан', 'medieval-states': 'Средневековые государства',
  'kazakh-khanate': 'Казахское ханство', 'jungar-invasion': 'Джунгарское нашествие',
  'russian-colonisation': 'Присоединение к России', 'national-uprisings': 'Национальные восстания',
  'soviet-kz': 'Советский Казахстан', 'modern-kz': 'Современный Казахстан',
  'grammar-tenses': 'Времена', 'grammar-articles': 'Артикли',
  'grammar-conditionals': 'Условные', 'reading-skills': 'Чтение',
  'vocabulary-academic': 'Академическая лексика',
  'physical-geography': 'Физ. география', 'economic-geography': 'Эконом. география',
  'world-regions': 'Регионы мира', 'kz-geography': 'География КЗ',
  'algorithms': 'Алгоритмы', 'programming-basics': 'Программирование',
  'data-structures': 'Структуры данных', 'number-systems': 'Системы счисления',
  'logic-gates': 'Логика',
}

const SUBJECTS = [
  { value: 'math',        label: 'Математика' },
  { value: 'physics',     label: 'Физика' },
  { value: 'chemistry',   label: 'Химия' },
  { value: 'biology',     label: 'Биология' },
  { value: 'history',     label: 'История' },
  { value: 'english',     label: 'Английский' },
  { value: 'kazakh',      label: 'Казахский' },
  { value: 'russian',     label: 'Русский' },
  { value: 'geography',   label: 'География' },
  { value: 'informatics', label: 'Информатика' },
  { value: 'general',     label: 'Общий' },
]

function toPreview(item: ContentItem): LessonPreview {
  const d = item.data as {
    title?: string; duration?: number; theory?: string
    quiz?: unknown[]; moduleTitle?: string; topics?: string[]
  }
  return {
    id: item.id,
    title: d.title ?? '(без названия)',
    duration: d.duration ?? 25,
    theoryLength: typeof d.theory === 'string' ? d.theory.length : 0,
    quizCount: Array.isArray(d.quiz) ? d.quiz.length : 0,
    moduleTitle: d.moduleTitle ?? 'Материал',
    topics: Array.isArray(d.topics) ? d.topics : [],
    raw: item,
  }
}

export default function MaterialsTab({ orgId }: MaterialsTabProps) {
  const [lessons, setLessons]       = useState<LessonPreview[]>([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  // Form state
  const [file, setFile]             = useState<File | null>(null)
  const [pasteText, setPasteText]   = useState('')
  const [subject, setSubject]       = useState('general')
  const [materialName, setMaterialName] = useState('')
  const [stage, setStage]           = useState<'idle' | 'uploading' | 'extracting' | 'generating' | 'done'>('idle')
  const [stageDetail, setStageDetail] = useState('')
  const [lastBatch, setLastBatch]   = useState<LessonPreview[]>([])

  async function reload(): Promise<void> {
    setLoading(true)
    setError('')
    try {
      // listAll filters by orgId server-side (auth token includes user, server scopes)
      const res = await contentApi.listAll('ent_lesson')
      // Show only lessons that belong to THIS org (server already filters,
      // but a teacher who's also an admin would see global too — keep tight).
      const onlyMine = res.items.filter(it => it.orgId === orgId)
      setLessons(onlyMine.map(toPreview))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить материалы')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void reload() }, [orgId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Generate flow ─────────────────────────────────────────────────────────

  async function handleGenerate(): Promise<void> {
    setError('')
    setLastBatch([])
    if (!file && pasteText.trim().length < 100) {
      setError('Загрузите файл или вставьте текст (минимум 100 символов)')
      return
    }

    let uploadId: string | undefined
    try {
      if (file) {
        setStage('uploading')
        setStageDetail(`Загрузка ${file.name}…`)
        const upRes = await uploadApi.upload(file)
        uploadId = upRes.file.id
      }

      setStage('generating')
      setStageDetail('Skylla AI читает текст и формирует уроки. Большие тексты обрабатываются частями — может занять 1–3 минуты…')

      const result = await contentApi.fromText({
        uploadId,
        text: file ? undefined : pasteText.trim(),
        subject,
        materialName: materialName.trim() || (file?.name ?? 'Материал'),
      })

      setLastBatch(result.items.map(toPreview))
      setStage('done')
      const stats = result.stats as { lessons: number; totalQuiz: number; chunksTotal?: number; chunksOk?: number; chunksFailed?: number }
      const chunkInfo = stats.chunksTotal && stats.chunksTotal > 1
        ? ` · обработано частей: ${stats.chunksOk}/${stats.chunksTotal}${stats.chunksFailed ? ` (ошибок: ${stats.chunksFailed})` : ''}`
        : ''
      setStageDetail(`Создано уроков: ${stats.lessons}, вопросов: ${stats.totalQuiz}${chunkInfo}`)
      // Refresh the full list
      await reload()
      // Reset form (but keep last batch banner)
      setFile(null)
      setPasteText('')
      setMaterialName('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка генерации')
      setStage('idle')
      setStageDetail('')
    }
  }

  async function handleDelete(id: string): Promise<void> {
    if (!confirm('Удалить этот урок? Действие необратимо.')) return
    try {
      await contentApi.remove(id)
      setLessons(prev => prev.filter(l => l.id !== id))
      setLastBatch(prev => prev.filter(l => l.id !== id))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Не удалось удалить')
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const isWorking = stage !== 'idle' && stage !== 'done'

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Свои материалы вашего центра</h2>
            <p className="text-sm text-slate-600 mt-1">
              Загрузите PDF/Word учебника или вставьте текст — Skylla превратит его в уроки с теорией и тестами.
              Эти материалы видят только ваши ученики; другие центры не получат к ним доступ.
            </p>
          </div>
        </div>
      </div>

      {/* Upload form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold text-slate-900">Добавить материал</h3>

        {/* Subject + Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Предмет</label>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              disabled={isWorking}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Название материала</label>
            <input
              type="text"
              value={materialName}
              onChange={e => setMaterialName(e.target.value)}
              disabled={isWorking}
              placeholder="например: Глава 5 — Тригонометрия"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* File + Text alternatives */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* File upload */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 hover:border-indigo-400 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">PDF / DOCX / TXT</span>
            </div>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
              disabled={isWorking}
              className="block w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
            />
            {file && (
              <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                <span className="truncate">{file.name}</span>
                <span className="ml-auto whitespace-nowrap">{(file.size / 1024).toFixed(1)} KB</span>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-slate-400 hover:text-red-600"
                  aria-label="Убрать файл"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Or paste text */}
          <div className="border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Или вставьте текст</span>
            </div>
            <textarea
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              disabled={isWorking || !!file}
              placeholder="Вставьте сюда содержимое учебника или статью…"
              rows={4}
              className="w-full border border-slate-300 rounded-lg p-2 text-xs"
            />
            <div className="text-xs text-slate-400 mt-1">
              {pasteText.length} симв. {file && '· (отключено когда выбран файл)'}
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isWorking || (!file && pasteText.trim().length < 100)}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
          >
            {isWorking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isWorking ? 'Обработка…' : 'Сгенерировать уроки'}
          </button>

          {stageDetail && (
            <span className="text-sm text-slate-500">{stageDetail}</span>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {stage === 'done' && lastBatch.length > 0 && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Сгенерировано {lastBatch.length} {lastBatch.length === 1 ? 'урок' : 'уроков'}. Появились ниже.
          </div>
        )}
      </div>

      {/* Lessons list */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">
            Все материалы центра ({lessons.length})
          </h3>
          <button
            type="button"
            onClick={reload}
            disabled={loading}
            className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Обновить
          </button>
        </div>

        {loading && lessons.length === 0 ? (
          <div className="text-sm text-slate-400 py-8 text-center">Загрузка…</div>
        ) : lessons.length === 0 ? (
          <div className="text-sm text-slate-400 py-8 text-center">
            Пока нет материалов. Загрузите первый учебник или вставьте текст выше.
          </div>
        ) : (
          <div className="space-y-2">
            {lessons.map(l => (
              <LessonRow
                key={l.id}
                lesson={l}
                isNew={lastBatch.some(b => b.id === l.id)}
                onDelete={() => handleDelete(l.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Single lesson row with expandable preview ──────────────────────────────

function LessonRow({ lesson, isNew, onDelete }: { lesson: LessonPreview; isNew: boolean; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const data = lesson.raw.data as {
    theory?: string
    quiz?: Array<{ q: string; options: string[]; correct: number; explanation: string }>
  }

  return (
    <div className={`border rounded-xl ${isNew ? 'border-green-300 bg-green-50/40' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-start gap-3 p-3">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-slate-900 text-sm flex items-center gap-2">
            {lesson.title}
            {isNew && (
              <span className="text-[10px] uppercase tracking-wider text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                новое
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {lesson.moduleTitle} · {lesson.duration} мин · {lesson.theoryLength} симв. теории · {lesson.quizCount} вопросов
          </div>
          {lesson.topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {lesson.topics.map((id) => (
                <span
                  key={id}
                  className="text-[10px] uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 rounded px-1.5 py-0.5"
                  title={id}
                >
                  {TOPIC_LABELS[id] ?? id}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 shrink-0"
        >
          {expanded ? 'Свернуть' : 'Просмотр'}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="text-slate-400 hover:text-red-600 transition-colors p-1 shrink-0"
          title="Удалить"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 p-3 space-y-3">
          {data.theory && (
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1">Теория</div>
              <div className="text-xs text-slate-700 whitespace-pre-line bg-slate-50 rounded-lg p-3 max-h-72 overflow-y-auto">
                {data.theory}
              </div>
            </div>
          )}
          {Array.isArray(data.quiz) && data.quiz.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-1">Тесты ({data.quiz.length})</div>
              <ol className="space-y-2 text-xs text-slate-700">
                {data.quiz.map((q, i) => (
                  <li key={i} className="bg-slate-50 rounded-lg p-2.5">
                    <div className="font-medium">{i + 1}. {q.q}</div>
                    <ul className="mt-1 space-y-0.5">
                      {q.options.map((opt, j) => (
                        <li
                          key={j}
                          className={j === q.correct ? 'text-green-700 font-medium' : 'text-slate-500'}
                        >
                          {String.fromCharCode(65 + j)}) {opt}
                          {j === q.correct && ' ✓'}
                        </li>
                      ))}
                    </ul>
                    {q.explanation && (
                      <div className="text-[11px] text-slate-500 italic mt-1">{q.explanation}</div>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
