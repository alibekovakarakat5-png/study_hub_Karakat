import { Suspense, lazy, useRef, useEffect, useState, Component } from 'react'
import type { Application } from '@splinetool/runtime'
import type { RobotMood } from '@/store/useRobotStore'
import RobotFace from './RobotFace'
import type { ReactNode } from 'react'

// ── Lazy-load Spline (heavy — ~500 KB) ────────────────────────────────────────
const Spline = lazy(() => import('@splinetool/react-spline'))

// ── Map our mood → Spline variable value ─────────────────────────────────────
// In your Spline scene: create a String variable called "mood".
// Add state-machine transitions that react to this variable.
const MOOD_TO_SPLINE: Record<RobotMood, string> = {
  idle:        'idle',
  happy:       'happy',
  excited:     'excited',
  thinking:    'thinking',
  sleeping:    'sleeping',
  encouraging: 'encouraging',
}

// ── Simple error boundary so Spline crash → 2D fallback ──────────────────────
interface EBState { crashed: boolean }
class SplineErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, EBState> {
  state: EBState = { crashed: false }
  static getDerivedStateFromError() { return { crashed: true } }
  render() { return this.state.crashed ? this.props.fallback : this.props.children }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  mood: RobotMood
  size?: number
  sceneUrl: string
}

export default function Robot3DFace({ mood, size = 72, sceneUrl }: Props) {
  const splineRef = useRef<Application | null>(null)
  const [ready, setReady] = useState(false)

  // Push mood changes into the Spline scene via variable
  useEffect(() => {
    if (!splineRef.current || !ready) return
    try {
      splineRef.current.setVariable('mood', MOOD_TO_SPLINE[mood])
    } catch {
      // Scene may not use a "mood" variable — no-op
    }
  }, [mood, ready])

  const handleLoad = (spline: Application) => {
    splineRef.current = spline
    setReady(true)
    try {
      spline.setVariable('mood', MOOD_TO_SPLINE[mood])
    } catch { /* no-op */ }
  }

  const fallback2D = <RobotFace mood={mood} size={size} />

  return (
    <SplineErrorBoundary fallback={fallback2D}>
      <Suspense fallback={fallback2D}>
        <div
          style={{ width: size, height: size, overflow: 'hidden', borderRadius: '50%' }}
          aria-label={`3D robot — ${mood}`}
        >
          <Spline
            scene={sceneUrl}
            onLoad={handleLoad}
            style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
          />
        </div>
      </Suspense>
    </SplineErrorBoundary>
  )
}
