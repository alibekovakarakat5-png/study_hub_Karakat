import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  FileText,
  FileType,
  BookOpen,
  CheckCircle2,
  XCircle,
  Loader2,
  Trash2,
  Download,
  Wand2,
  ArrowRight,
  RotateCcw,
  GraduationCap,
  BarChart3,
  Clock,
  FileUp,
  Layers,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react'
import { uploadApi, type UploadedFile } from '@/lib/api'
import { cn } from '@/lib/utils'

// ── Animations ───────────────────────────────────────────────────────────────

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
} satisfies import('framer-motion').Variants

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.3 },
  },
} satisfies import('framer-motion').Variants

// ── Constants ────────────────────────────────────────────────────────────────

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

const ACCEPTED_EXTENSIONS = '.pdf,.docx,.txt'

const MAX_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB

const SUBJECTS = [
  { value: 'ent',     label: 'ЕНТ (общий)' },
  { value: 'math',    label: 'Математика' },
  { value: 'physics', label: 'Физика' },
  { value: 'history', label: 'История Казахстана' },
  { value: 'english', label: 'Английский язык' },
  { value: 'ielts',   label: 'IELTS' },
  { value: 'biology', label: 'Биология' },
  { value: 'chemistry', label: 'Химия' },
  { value: 'geography', label: 'География' },
  { value: 'informatics', label: 'Информатика' },
  { value: 'other',   label: 'Другое' },
] as const

const LEVELS = [
  { value: 'beginner',     label: 'Начинающий' },
  { value: 'intermediate', label: 'Средний' },
  { value: 'advanced',     label: 'Продвинутый' },
] as const

type Phase = 'upload' | 'processing' | 'configure' | 'generating' | 'done'

interface GenerationResult {
  courseId: string
  title: string
  modulesCount: number
  lessonsCount: number
}

interface Toast {
  id: number
  type: 'success' | 'error'
  message: string
}

// ── File type icon helper ────────────────────────────────────────────────────

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'pdf':  return <FileText className="w-8 h-8 text-red-500" />
    case 'docx': return <FileType className="w-8 h-8 text-blue-500" />
    case 'txt':  return <FileText className="w-8 h-8 text-gray-500" />
    default:     return <FileUp className="w-8 h-8 text-gray-400" />
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: UploadedFile['status'] }) {
  const config = {
    pending:    { bg: 'bg-yellow-100 text-yellow-700', icon: Clock,        label: 'Ожидание' },
    processing: { bg: 'bg-blue-100 text-blue-700',     icon: Loader2,      label: 'Обработка' },
    done:       { bg: 'bg-green-100 text-green-700',   icon: CheckCircle2, label: 'Готов' },
    error:      { bg: 'bg-red-100 text-red-700',       icon: XCircle,      label: 'Ошибка' },
  }[status]

  const Icon = config.icon

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', config.bg)}>
      <Icon className={cn('w-3 h-3', status === 'processing' && 'animate-spin')} />
      {config.label}
    </span>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

interface BookUploaderProps {
  studentMode?: boolean
}

export default function BookUploader({ studentMode = false }: BookUploaderProps) {
  // ── State ──────────────────────────────────────────────────────────────────

  const [phase, setPhase] = useState<Phase>('upload')
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Configure phase
  const [subject, setSubject] = useState('ent')
  const [level, setLevel] = useState('intermediate')
  const [title, setTitle] = useState('')

  // Generation result
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [generating, setGenerating] = useState(false)

  // Upload history
  const [history, setHistory] = useState<UploadedFile[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastIdRef = useRef(0)

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Polling ref
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Toast helpers ──────────────────────────────────────────────────────────

  const showToast = useCallback((type: Toast['type'], message: string) => {
    const id = ++toastIdRef.current
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  // ── Load history ───────────────────────────────────────────────────────────

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true)
    try {
      const data = await uploadApi.list()
      setHistory(data.files)
    } catch {
      // silently fail — history is optional
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  // ── Cleanup polling on unmount ─────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  // ── File validation ────────────────────────────────────────────────────────

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
      return 'Неподдерживаемый формат. Допустимые: PDF, DOCX, TXT'
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `Файл слишком большой. Максимум: ${formatFileSize(MAX_SIZE_BYTES)}`
    }
    return null
  }

  // ── File selection ─────────────────────────────────────────────────────────

  const handleFileSelect = (file: File) => {
    const error = validateFile(file)
    if (error) {
      showToast('error', error)
      return
    }
    setSelectedFile(file)
  }

  // ── Drag & drop handlers ──────────────────────────────────────────────────

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
    // Reset input so the same file can be selected again
    e.target.value = ''
  }

  // ── Upload ─────────────────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadProgress(0)

    // Simulate progress while uploading
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 15
      })
    }, 300)

    try {
      const data = await uploadApi.upload(selectedFile)
      clearInterval(progressInterval)
      setUploadProgress(100)
      setUploadedFile(data.file)
      setTitle(selectedFile.name.replace(/\.(pdf|docx|txt)$/i, ''))
      showToast('success', 'Файл успешно загружен')

      // If status is 'processing', start polling
      if (data.file.status === 'processing' || data.file.status === 'pending') {
        setPhase('processing')
        startPolling(data.file.id)
      } else {
        setPhase('configure')
      }

      // Refresh history
      loadHistory()
    } catch (err) {
      clearInterval(progressInterval)
      showToast('error', err instanceof Error ? err.message : 'Ошибка загрузки файла')
    } finally {
      setUploading(false)
    }
  }

  // ── Poll for processing status ─────────────────────────────────────────────

  const startPolling = (fileId: string) => {
    if (pollRef.current) clearInterval(pollRef.current)

    pollRef.current = setInterval(async () => {
      try {
        const data = await uploadApi.status(fileId)
        setUploadedFile(data.file)

        if (data.file.status === 'done') {
          if (pollRef.current) clearInterval(pollRef.current)
          pollRef.current = null
          setPhase('configure')
          showToast('success', 'Файл обработан и готов к генерации курса')
        } else if (data.file.status === 'error') {
          if (pollRef.current) clearInterval(pollRef.current)
          pollRef.current = null
          showToast('error', data.file.errorMsg ?? 'Ошибка обработки файла')
        }
      } catch {
        // continue polling
      }
    }, 2000)
  }

  // ── Generate course ────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    if (!uploadedFile) return

    setGenerating(true)
    setPhase('generating')

    try {
      const data = await uploadApi.generate(uploadedFile.id, {
        subject,
        level,
        title: title || undefined,
      })
      setResult(data)
      setPhase('done')
      showToast('success', `Курс "${data.title}" успешно создан!`)
      loadHistory()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Ошибка генерации курса')
      setPhase('configure')
    } finally {
      setGenerating(false)
    }
  }

  // ── Reset ──────────────────────────────────────────────────────────────────

  const handleReset = () => {
    setPhase('upload')
    setSelectedFile(null)
    setUploadedFile(null)
    setUploading(false)
    setUploadProgress(0)
    setSubject('ent')
    setLevel('intermediate')
    setTitle('')
    setResult(null)
    setGenerating(false)
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  // ── History actions ────────────────────────────────────────────────────────

  const handleDeleteUpload = async (id: string) => {
    try {
      await uploadApi.remove(id)
      setHistory(prev => prev.filter(f => f.id !== id))
      showToast('success', 'Файл удален')
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Ошибка удаления')
    }
  }

  const handleGenerateFromHistory = (file: UploadedFile) => {
    setUploadedFile(file)
    setTitle(file.filename.replace(/\.(pdf|docx|txt)$/i, ''))
    setPhase('configure')
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="space-y-6"
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {studentMode ? 'Загрузить материал' : 'Загрузка книг и генерация курсов'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {studentMode
              ? 'Загрузите учебник или конспект для создания персонального курса'
              : 'Загрузите документ (PDF, DOCX, TXT) и создайте структурированный курс с помощью AI'
            }
          </p>
        </div>
        {phase !== 'upload' && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Начать заново
          </button>
        )}
      </div>

      {/* ── Phase indicator ─────────────────────────────────────────────────── */}
      {!studentMode && (
        <div className="flex items-center gap-2">
          {(['upload', 'processing', 'configure', 'generating', 'done'] as Phase[]).map((p, i) => {
            const labels: Record<Phase, string> = {
              upload: 'Загрузка',
              processing: 'Обработка',
              configure: 'Настройка',
              generating: 'Генерация',
              done: 'Готово',
            }
            const phaseOrder: Phase[] = ['upload', 'processing', 'configure', 'generating', 'done']
            const currentIdx = phaseOrder.indexOf(phase)
            const thisIdx = phaseOrder.indexOf(p)
            const isActive = thisIdx === currentIdx
            const isCompleted = thisIdx < currentIdx

            return (
              <div key={p} className="flex items-center gap-2">
                {i > 0 && (
                  <div className={cn(
                    'w-8 h-0.5 transition-colors',
                    isCompleted ? 'bg-indigo-500' : 'bg-gray-200'
                  )} />
                )}
                <div className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                  isActive && 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500/20',
                  isCompleted && 'bg-indigo-500 text-white',
                  !isActive && !isCompleted && 'bg-gray-100 text-gray-400',
                )}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <span className="w-3.5 h-3.5 flex items-center justify-center text-[10px]">
                      {i + 1}
                    </span>
                  )}
                  {labels[p]}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Phase: Upload ───────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {phase === 'upload' && (
          <motion.div key="upload" variants={scaleIn} initial="hidden" animate="visible" exit="exit">
            {/* Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !selectedFile && fileInputRef.current?.click()}
              className={cn(
                'relative rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 cursor-pointer group',
                dragOver
                  ? 'border-indigo-400 bg-indigo-50/70 scale-[1.01]'
                  : selectedFile
                    ? 'border-green-300 bg-green-50/50'
                    : 'border-gray-300 bg-gray-50/50 hover:border-indigo-300 hover:bg-indigo-50/30',
              )}
            >
              {/* Gradient border effect on hover */}
              <div className={cn(
                'absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 pointer-events-none',
                'bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10',
                dragOver ? 'opacity-100' : 'group-hover:opacity-100',
              )} />

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS}
                onChange={handleInputChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    {getFileIcon(selectedFile.name)}
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedFile(null)
                      }}
                      className="ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Upload progress bar */}
                  {uploading && (
                    <div className="w-full max-w-md mx-auto">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                          initial={{ width: '0%' }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Загрузка... {Math.round(uploadProgress)}%
                      </p>
                    </div>
                  )}

                  {!uploading && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleUpload()
                      }}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      <Upload className="w-4 h-4" />
                      Загрузить файл
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative z-10 space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-8 h-8 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-700">
                      Перетащите файл сюда
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      или <span className="text-indigo-600 font-medium">выберите файл</span> на компьютере
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-red-400" />
                      PDF
                    </span>
                    <span className="flex items-center gap-1">
                      <FileType className="w-3.5 h-3.5 text-blue-400" />
                      DOCX
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-gray-400" />
                      TXT
                    </span>
                    <span className="text-gray-300">|</span>
                    <span>Макс. 50 МБ</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Phase: Processing ──────────────────────────────────────────────── */}
        {phase === 'processing' && (
          <motion.div
            key="processing"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="rounded-2xl border border-blue-200 bg-blue-50/50 p-10 text-center"
          >
            <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Обработка файла</h3>
            <p className="text-sm text-gray-500 mt-1">
              Извлекаем текст и анализируем содержимое...
            </p>
            {uploadedFile && (
              <div className="mt-4 flex items-center justify-center gap-3 text-sm text-gray-600">
                {getFileIcon(uploadedFile.filename)}
                <span>{uploadedFile.filename}</span>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Phase: Configure ───────────────────────────────────────────────── */}
        {phase === 'configure' && uploadedFile && (
          <motion.div
            key="configure"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            {/* File info card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Информация о файле
              </h3>
              <div className="flex items-start gap-4">
                <div className="shrink-0 p-3 rounded-xl bg-gray-50">
                  {getFileIcon(uploadedFile.filename)}
                </div>
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Имя файла</p>
                    <p className="text-sm font-medium text-gray-900 truncate" title={uploadedFile.filename}>
                      {uploadedFile.filename}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Размер</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatFileSize(uploadedFile.sizeBytes)}
                    </p>
                  </div>
                  {uploadedFile.metadata?.wordCount != null && (
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Количество слов</p>
                      <p className="text-sm font-medium text-gray-900">
                        {uploadedFile.metadata.wordCount.toLocaleString('ru-RU')}
                      </p>
                    </div>
                  )}
                  {uploadedFile.metadata?.pageCount != null && (
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Страниц</p>
                      <p className="text-sm font-medium text-gray-900">
                        {uploadedFile.metadata.pageCount}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Configuration form */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Настройки курса
              </h3>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Название курса
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Введите название или оставьте пустым для автогенерации"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              {/* Subject & Level row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Предмет
                  </label>
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white"
                  >
                    {SUBJECTS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Уровень
                  </label>
                  <select
                    value={level}
                    onChange={e => setLevel(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white"
                  >
                    {LEVELS.map(l => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Generate button */}
              <div className="pt-2">
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className={cn(
                    'inline-flex items-center gap-2 px-6 py-3 font-medium rounded-xl transition-all shadow-sm text-white',
                    generating
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md',
                  )}
                >
                  <Wand2 className="w-4 h-4" />
                  Сгенерировать курс
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Phase: Generating ──────────────────────────────────────────────── */}
        {phase === 'generating' && (
          <motion.div
            key="generating"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-10 text-center"
          >
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-4">
              <Wand2 className="w-8 h-8 text-indigo-600 animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">AI генерирует курс</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              Анализируем содержимое и создаем структурированный курс с модулями и уроками...
            </p>
            <div className="mt-6 flex justify-center">
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full bg-indigo-400"
                    animate={{
                      y: [0, -8, 0],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Phase: Done ────────────────────────────────────────────────────── */}
        {phase === 'done' && result && (
          <motion.div
            key="done"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-8"
          >
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Курс успешно создан!</h3>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-6">
              <div className="bg-white/80 rounded-xl p-4 text-center">
                <BookOpen className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-900">{result.modulesCount}</p>
                <p className="text-xs text-gray-500">Модулей</p>
              </div>
              <div className="bg-white/80 rounded-xl p-4 text-center">
                <Layers className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-900">{result.lessonsCount}</p>
                <p className="text-xs text-gray-500">Уроков</p>
              </div>
              <div className="bg-white/80 rounded-xl p-4 text-center">
                <GraduationCap className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                <p className="text-sm font-bold text-gray-900 truncate" title={result.title}>{result.title}</p>
                <p className="text-xs text-gray-500">Название</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3">
              <a
                href={`/courses/${result.courseId}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Перейти к курсу
              </a>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-gray-700 font-medium rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Загрузить ещё
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Upload History ──────────────────────────────────────────────────── */}
      {!studentMode && (
        <motion.div variants={fadeIn} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-400" />
              История загрузок
            </h3>
            <button
              onClick={loadHistory}
              disabled={historyLoading}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {historyLoading ? 'Загрузка...' : 'Обновить'}
            </button>
          </div>

          {historyLoading && history.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-sm">Загрузка истории...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-xl">
              <FileUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Нет загруженных файлов</p>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-4 py-3 font-medium text-gray-500">Файл</th>
                      <th className="px-4 py-3 font-medium text-gray-500">Дата</th>
                      <th className="px-4 py-3 font-medium text-gray-500">Размер</th>
                      <th className="px-4 py-3 font-medium text-gray-500">Статус</th>
                      <th className="px-4 py-3 font-medium text-gray-500 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {history.map(file => (
                      <tr key={file.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            {getFileIcon(file.filename)}
                            <div>
                              <p className="font-medium text-gray-900 truncate max-w-[200px]" title={file.filename}>
                                {file.filename}
                              </p>
                              {file.metadata?.wordCount != null && (
                                <p className="text-xs text-gray-400">
                                  {file.metadata.wordCount.toLocaleString('ru-RU')} слов
                                  {file.metadata.pageCount ? ` / ${file.metadata.pageCount} стр.` : ''}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {formatDate(file.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {formatFileSize(file.sizeBytes)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={file.status} />
                          {file.errorMsg && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {file.errorMsg}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {file.status === 'done' && !file.courseId && (
                              <button
                                onClick={() => handleGenerateFromHistory(file)}
                                className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Сгенерировать курс"
                              >
                                <Wand2 className="w-4 h-4" />
                              </button>
                            )}
                            {file.courseId && (
                              <a
                                href={`/courses/${file.courseId}`}
                                className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                title="Перейти к курсу"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            <a
                              href={`/api/uploads/${file.id}/download`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Скачать"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => handleDeleteUpload(file.id)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Удалить"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Toasts ──────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={cn(
                'flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium',
                toast.type === 'success' && 'bg-green-600 text-white',
                toast.type === 'error' && 'bg-red-600 text-white',
              )}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 shrink-0" />
              )}
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
