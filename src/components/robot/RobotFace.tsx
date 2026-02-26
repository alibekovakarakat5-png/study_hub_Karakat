import type { RobotMood } from '@/store/useRobotStore'

interface RobotFaceProps {
  mood: RobotMood
  size?: number
}

// ── Shared face parts ─────────────────────────────────────────────────────────

function FaceBase() {
  return (
    <>
      {/* Outer face circle */}
      <circle cx="50" cy="50" r="48" fill="#1d4ed8" />
      {/* Inner screen area */}
      <rect x="16" y="22" width="68" height="56" rx="10" fill="#1e3a8a" />
      {/* Antenna */}
      <line x1="50" y1="2" x2="50" y2="18" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="3" r="4" fill="#60a5fa" />
    </>
  )
}

// ── RobotFace ─────────────────────────────────────────────────────────────────

export default function RobotFace({ mood, size = 64 }: RobotFaceProps) {
  const blinkStyle: React.CSSProperties = {
    animation: 'robot-blink 4s ease-in-out infinite',
    transformOrigin: 'center',
  }

  if (mood === 'idle') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="Робот — спокойный">
        <FaceBase />
        <g style={blinkStyle}>
          <ellipse cx="34" cy="48" rx="7" ry="7" fill="#93c5fd" />
          <ellipse cx="66" cy="48" rx="7" ry="7" fill="#93c5fd" />
          <circle cx="36" cy="48" r="3" fill="#1e3a8a" />
          <circle cx="68" cy="48" r="3" fill="#1e3a8a" />
        </g>
        <path d="M 36 64 Q 50 72 64 64" stroke="#60a5fa" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    )
  }

  if (mood === 'happy') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="Робот — радостный">
        <FaceBase />
        {/* ^_^ curved eyes */}
        <path d="M 26 44 Q 34 38 42 44" stroke="#93c5fd" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M 58 44 Q 66 38 74 44" stroke="#93c5fd" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        {/* Big smile */}
        <path d="M 30 62 Q 50 76 70 62" stroke="#4ade80" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        {/* Rosy cheeks */}
        <ellipse cx="22" cy="60" rx="7" ry="4" fill="#f87171" opacity="0.35" />
        <ellipse cx="78" cy="60" rx="7" ry="4" fill="#f87171" opacity="0.35" />
      </svg>
    )
  }

  if (mood === 'excited') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="Робот — восторженный">
        <FaceBase />
        {/* Star eyes */}
        <text x="34" y="54" fontSize="18" textAnchor="middle" fill="#fbbf24" fontFamily="sans-serif">★</text>
        <text x="66" y="54" fontSize="18" textAnchor="middle" fill="#fbbf24" fontFamily="sans-serif">★</text>
        {/* Big open smile */}
        <path d="M 28 62 Q 50 80 72 62" stroke="#4ade80" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <ellipse cx="50" cy="70" rx="12" ry="5" fill="#4ade80" opacity="0.25" />
        {/* Cheeks */}
        <ellipse cx="20" cy="62" rx="8" ry="5" fill="#f87171" opacity="0.4" />
        <ellipse cx="80" cy="62" rx="8" ry="5" fill="#f87171" opacity="0.4" />
      </svg>
    )
  }

  if (mood === 'thinking') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="Робот — думает">
        <FaceBase />
        {/* Normal left eye */}
        <ellipse cx="34" cy="48" rx="7" ry="7" fill="#93c5fd" />
        <circle cx="36" cy="48" r="3" fill="#1e3a8a" />
        {/* Squinted right eye */}
        <ellipse cx="66" cy="46" rx="7" ry="5" fill="#93c5fd" />
        <circle cx="68" cy="46" r="2.5" fill="#1e3a8a" />
        {/* Raised right eyebrow */}
        <path d="M 58 38 Q 66 34 74 38" stroke="#60a5fa" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Left eyebrow flat */}
        <path d="M 26 40 Q 34 38 42 40" stroke="#60a5fa" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Mouth shifted to side */}
        <path d="M 38 66 Q 50 64 60 68" stroke="#60a5fa" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Thinking dots */}
        <circle cx="74" cy="30" r="2.5" fill="#60a5fa" opacity="0.7" />
        <circle cx="80" cy="22" r="3.5" fill="#60a5fa" opacity="0.8" />
        <circle cx="87" cy="13" r="4.5" fill="#93c5fd" opacity="0.9" />
      </svg>
    )
  }

  if (mood === 'sleeping') {
    const zzz1: React.CSSProperties = { animation: 'robot-zzz-float 2s ease-in-out infinite', animationDelay: '0s' }
    const zzz2: React.CSSProperties = { animation: 'robot-zzz-float 2s ease-in-out infinite', animationDelay: '0.7s' }
    const zzz3: React.CSSProperties = { animation: 'robot-zzz-float 2s ease-in-out infinite', animationDelay: '1.4s' }

    return (
      <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="Робот — спит">
        <FaceBase />
        {/* Closed eyes */}
        <line x1="26" y1="48" x2="42" y2="48" stroke="#93c5fd" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="58" y1="48" x2="74" y2="48" stroke="#93c5fd" strokeWidth="3.5" strokeLinecap="round" />
        {/* Small mouth */}
        <path d="M 40 66 Q 50 68 60 66" stroke="#60a5fa" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* ZZZ particles */}
        <text x="68" y="40" fontSize="9"  fill="#93c5fd" style={zzz1} fontFamily="sans-serif" fontWeight="bold">z</text>
        <text x="74" y="30" fontSize="11" fill="#60a5fa" style={zzz2} fontFamily="sans-serif" fontWeight="bold">z</text>
        <text x="80" y="18" fontSize="13" fill="#bfdbfe" style={zzz3} fontFamily="sans-serif" fontWeight="bold">Z</text>
      </svg>
    )
  }

  // mood === 'encouraging'
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="Робот — подбадривает">
      <FaceBase />
      {/* Normal left eye */}
      <ellipse cx="34" cy="48" rx="7" ry="7" fill="#93c5fd" />
      <circle cx="36" cy="48" r="3" fill="#1e3a8a" />
      {/* Right eye wink */}
      <path d="M 58 48 Q 66 43 74 48" stroke="#93c5fd" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* Determined smile */}
      <path d="M 32 64 Q 50 74 68 64" stroke="#4ade80" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* Accent dots */}
      <circle cx="16" cy="50" r="4" fill="#fbbf24" opacity="0.7" />
      <circle cx="14" cy="43" r="3" fill="#fbbf24" opacity="0.5" />
    </svg>
  )
}
