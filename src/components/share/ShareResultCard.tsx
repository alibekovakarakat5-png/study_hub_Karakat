import { useRef, useState, useCallback } from 'react'
import html2canvas from 'html2canvas'
import { Download, Share2, Copy, Check, X } from 'lucide-react'
import { SUBJECT_NAMES, SUBJECT_COLORS } from '@/types'
import type { Subject } from '@/types'
import type { EntBlockResult } from '@/types/practiceEnt'
import { ENT_BLOCK_NAMES } from '@/types/practiceEnt'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface EntShareData {
  type: 'ent'
  variantTitle: string
  date: string
  totalCorrect: number
  totalQuestions: number
  percentage: number
  timeSpentMinutes: number
  blocks: EntBlockResult[]
  profileSubject1: Subject | null
  profileSubject2: Subject | null
}

export interface DailyChallengeShareData {
  type: 'daily'
  date: string
  correctCount: number
  totalQuestions: number
  percentage: number
  streak: number
}

export type ShareData = EntShareData | DailyChallengeShareData

// ── Helpers ────────────────────────────────────────────────────────────────────

function getBlockLabel(block: string, s1?: Subject | null, s2?: Subject | null): string {
  if (block === 'profile1' && s1) return SUBJECT_NAMES[s1]
  if (block === 'profile2' && s2) return SUBJECT_NAMES[s2]
  return ENT_BLOCK_NAMES[block as keyof typeof ENT_BLOCK_NAMES] ?? block
}

function gradeColor(pct: number): string {
  if (pct >= 70) return '#059669'
  if (pct >= 50) return '#d97706'
  return '#dc2626'
}

function gradeBg(pct: number): string {
  if (pct >= 70) return 'linear-gradient(135deg, #059669 0%, #0d9488 100%)'
  if (pct >= 50) return 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)'
  return 'linear-gradient(135deg, #dc2626 0%, #e11d48 100%)'
}

function gradeEmoji(pct: number): string {
  if (pct >= 90) return '🏆'
  if (pct >= 70) return '🎯'
  if (pct >= 50) return '💪'
  return '📚'
}

// ── ENT Card (rendered to canvas) ──────────────────────────────────────────────

function EntCardContent({ data }: { data: EntShareData }) {
  return (
    <div
      style={{
        width: 480,
        padding: 32,
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
        borderRadius: 24,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#fff',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700,
            }}
          >
            S
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, opacity: 0.9 }}>Study Hub</span>
        </div>
        <span style={{ fontSize: 12, opacity: 0.5 }}>
          {new Date(data.date).toLocaleDateString('ru-RU')}
        </span>
      </div>

      {/* Title */}
      <div style={{ fontSize: 14, opacity: 0.6, marginBottom: 4 }}>Пробный ЕНТ</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>{data.variantTitle}</div>

      {/* Big score */}
      <div
        style={{
          background: gradeBg(data.percentage),
          borderRadius: 16,
          padding: '20px 24px',
          textAlign: 'center' as const,
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 48, fontWeight: 800, lineHeight: 1 }}>
          {data.totalCorrect}/{data.totalQuestions}
        </div>
        <div style={{ fontSize: 16, opacity: 0.85, marginTop: 4 }}>
          {data.percentage}% правильных {gradeEmoji(data.percentage)}
        </div>
        <div style={{ fontSize: 12, opacity: 0.55, marginTop: 4 }}>
          Время: {data.timeSpentMinutes} мин
        </div>
      </div>

      {/* Block bars */}
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
        {data.blocks.map((block, i) => {
          const label = getBlockLabel(block.block, data.profileSubject1, data.profileSubject2)
          const color = block.subject
            ? SUBJECT_COLORS[block.subject]
            : (['#3b82f6', '#8b5cf6', '#d97706', '#059669', '#dc2626'][i] ?? '#6366f1')
          return (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ opacity: 0.7 }}>{label}</span>
                <span style={{ fontWeight: 600 }}>
                  {block.correctAnswers}/{block.totalQuestions}
                  <span style={{ opacity: 0.5, marginLeft: 4 }}>({block.percentage}%)</span>
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.15)' }}>
                <div
                  style={{
                    height: '100%',
                    borderRadius: 3,
                    width: `${block.percentage}%`,
                    background: color,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 20, textAlign: 'center' as const, fontSize: 11, opacity: 0.35 }}>
        studyhub.kz — Подготовка к ЕНТ с AI
      </div>
    </div>
  )
}

// ── Daily Challenge Card ───────────────────────────────────────────────────────

function DailyChallengeCardContent({ data }: { data: DailyChallengeShareData }) {
  return (
    <div
      style={{
        width: 400,
        padding: 32,
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
        borderRadius: 24,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#fff',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700,
            }}
          >
            S
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, opacity: 0.9 }}>Study Hub</span>
        </div>
        <span style={{ fontSize: 12, opacity: 0.5 }}>
          {new Date(data.date).toLocaleDateString('ru-RU')}
        </span>
      </div>

      <div style={{ fontSize: 14, opacity: 0.6, marginBottom: 4 }}>Ежедневный челлендж</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
        {gradeEmoji(data.percentage)} Челлендж завершён!
      </div>

      {/* Score */}
      <div
        style={{
          background: gradeBg(data.percentage),
          borderRadius: 16,
          padding: '24px',
          textAlign: 'center' as const,
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1 }}>
          {data.percentage}%
        </div>
        <div style={{ fontSize: 16, opacity: 0.85, marginTop: 6 }}>
          {data.correctCount} из {data.totalQuestions} правильных
        </div>
      </div>

      {/* Streak */}
      {data.streak > 0 && (
        <div style={{
          textAlign: 'center' as const,
          fontSize: 14,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 12,
          padding: '10px 16px',
          marginBottom: 16,
        }}>
          🔥 Серия: <b>{data.streak} дней</b> подряд
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center' as const, fontSize: 11, opacity: 0.35 }}>
        studyhub.kz — Подготовка к ЕНТ с AI
      </div>
    </div>
  )
}

// ── Share Modal ────────────────────────────────────────────────────────────────

export default function ShareResultCard({ data, onClose }: { data: ShareData; onClose: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)

  const generateImage = useCallback(async (): Promise<Blob | null> => {
    if (!cardRef.current) return null
    setGenerating(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true,
      })
      return new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
    } finally {
      setGenerating(false)
    }
  }, [])

  const handleDownload = useCallback(async () => {
    const blob = await generateImage()
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `studyhub-result-${Date.now()}.png`
    a.click()
    URL.revokeObjectURL(url)
  }, [generateImage])

  const handleShare = useCallback(async () => {
    const blob = await generateImage()
    if (!blob) return

    const file = new File([blob], 'studyhub-result.png', { type: 'image/png' })

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: 'Мой результат — Study Hub',
          text: data.type === 'ent'
            ? `Пробный ЕНТ: ${data.percentage}% правильных!`
            : `Ежедневный челлендж: ${(data as DailyChallengeShareData).percentage}%!`,
          files: [file],
        })
        return
      } catch {
        // User cancelled or share failed — fall through to copy
      }
    }

    // Fallback: copy image to clipboard
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Last fallback: just download
      handleDownload()
    }
  }, [generateImage, data, handleDownload])

  const handleCopyText = useCallback(() => {
    const text = data.type === 'ent'
      ? `🎯 Пробный ЕНТ: ${data.totalCorrect}/${data.totalQuestions} (${data.percentage}%)\n📚 ${data.variantTitle}\n⏱ ${data.timeSpentMinutes} мин\n\nГотовлюсь к ЕНТ на studyhub.kz`
      : `⚡ Ежедневный челлендж: ${data.correctCount}/${data.totalQuestions} (${data.percentage}%)\n🔥 Серия: ${data.streak} дней\n\nГотовлюсь к ЕНТ на studyhub.kz`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [data])

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="mb-3 text-center text-lg font-bold text-gray-900">Поделиться результатом</h3>

        {/* Rendered card */}
        <div className="flex justify-center mb-4">
          <div ref={cardRef} style={{ display: 'inline-block' }}>
            {data.type === 'ent' ? (
              <EntCardContent data={data} />
            ) : (
              <DailyChallengeCardContent data={data} />
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            disabled={generating}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            <Share2 className="h-4 w-4" />
            {generating ? 'Создаём...' : 'Поделиться'}
          </button>
          <button
            onClick={handleDownload}
            disabled={generating}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={handleCopyText}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
