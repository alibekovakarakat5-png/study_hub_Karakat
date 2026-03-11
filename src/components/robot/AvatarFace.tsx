import type { RobotMood } from '@/store/useRobotStore'

// ── DiceBear avatar styles ─────────────────────────────────────────────────────
// Each style generates a unique avatar from a seed (character name).
// API: https://api.dicebear.com/9.x/{style}/svg?seed={name}

export interface AvatarStyle {
  id: string
  label: string
  description: string
  icon: string
}

export const AVATAR_STYLES: AvatarStyle[] = [
  { id: 'bottts',        label: 'Sci-Fi Робот',   description: 'Роботы и киборги',       icon: '🤖' },
  { id: 'adventurer',    label: 'Аниме',           description: 'Аниме / фэнтези стиль',  icon: '⚔️' },
  { id: 'avataaars',     label: 'Мультяшный',      description: 'Bitmoji стиль',           icon: '🧑' },
  { id: 'pixel-art',     label: 'Пиксель Арт',     description: 'Ретро игровой стиль',    icon: '🎮' },
  { id: 'fun-emoji',     label: 'Эмодзи',          description: 'Яркий эмодзи стиль',     icon: '😎' },
  { id: 'big-smile',     label: 'Cute Cartoon',    description: 'Милый мультяшный стиль', icon: '🌟' },
  { id: 'lorelei',       label: 'Аниме 2',         description: 'Красивый аниме портрет', icon: '🌸' },
  { id: 'micah',         label: 'Супергерой',      description: 'Комикс / супергерой',    icon: '🦸' },
]

export function getDiceBearUrl(characterName: string, style: string): string {
  const seed = encodeURIComponent(characterName.trim() || 'StudyBot')
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}&backgroundColor=1e3a8a,5b21b6,0f172a,134e4a,7c2d12&size=128`
}

// ── Mood → CSS animation class ────────────────────────────────────────────────

const MOOD_ANIM: Record<RobotMood, string> = {
  idle:        '',
  happy:       'avatar-bounce',
  excited:     'avatar-spin-bounce',
  thinking:    'avatar-tilt',
  sleeping:    'avatar-sleep',
  encouraging: 'avatar-pulse',
}

const MOOD_RING: Record<RobotMood, string> = {
  idle:        '#60a5fa',
  happy:       '#4ade80',
  excited:     '#facc15',
  thinking:    '#818cf8',
  sleeping:    '#94a3b8',
  encouraging: '#f97316',
}

// ── Component ─────────────────────────────────────────────────────────────────

interface AvatarFaceProps {
  characterName: string   // e.g. "Iron Man", "Naruto"
  avatarStyle: string     // e.g. "bottts", "adventurer"
  mood: RobotMood
  size?: number
}

export default function AvatarFace({ characterName, avatarStyle, mood, size = 64 }: AvatarFaceProps) {
  const animClass = MOOD_ANIM[mood]
  const ringColor = MOOD_RING[mood]
  const url = getDiceBearUrl(characterName, avatarStyle)

  return (
    <div
      className={`avatar-face ${animClass}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `3px solid ${ringColor}`,
        boxShadow: `0 0 ${mood === 'excited' ? 20 : 12}px ${ringColor}66`,
        overflow: 'hidden',
        position: 'relative',
        transition: 'border-color 0.4s, box-shadow 0.4s',
        background: '#1e3a8a',
        flexShrink: 0,
      }}
    >
      <img
        src={url}
        alt={characterName || 'avatar'}
        width={size}
        height={size}
        style={{ display: 'block', width: '100%', height: '100%' }}
        loading="lazy"
      />
      {mood === 'sleeping' && (
        <span style={{
          position: 'absolute', top: -4, right: -4,
          fontSize: size * 0.28, lineHeight: 1,
          animation: 'robot-zzz-float 2s ease-in-out infinite',
        }}>💤</span>
      )}
      {mood === 'excited' && (
        <span style={{
          position: 'absolute', top: -6, right: -6,
          fontSize: size * 0.26, lineHeight: 1,
        }}>⭐</span>
      )}
    </div>
  )
}
