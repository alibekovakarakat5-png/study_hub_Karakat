import { apiUrl } from './api'
import type { LearningRecord } from './learning'
import { currentTestSession, enterTestSession } from './reviewSession'

export const FRONTEND_SHA = import.meta.env.VITE_BUILD_SHA ?? 'unknown'
export type ReviewStep = { id: string; title: string; action: string; expected: string; persona: string; path?: string }
export type Scenario = { id: string; title: string; purpose: string; path: string; limitation: string; steps: ReviewStep[] }
export type StepResult = { outcome: 'passed' | 'failed' | 'unclear' | 'skipped'; comment: string; path: string; at: string }
export type Run = { id: string; scenarioId: string; scenario: Scenario; frontendSha: string; backend: { sha: string; environment: string }; steps: Record<string, StepResult>; createdAt: string }
export type Feedback = { id: string; runId: string; stepId: string; text: string; scenarioId: string; persona: string; frontendSha: string; backend: Run['backend']; path: string; screenshotId?: string; section?: string; capturedAt?: string; viewport?: { width: number; height: number }; outcome?: 'failed' | 'unclear'; status: 'new' | 'in-progress' | 'ready' | 'accepted'; fixedSha?: string; history: { note: string; at: string; status: string }[] }
export type ReviewState = { catalog: Scenario[]; personas: { id: string; name: string; role: string; path: string; scope: string }[]; runs: LearningRecord<Run>[]; feedback: LearningRecord<Feedback>[]; sessions: LearningRecord<{ userId: string; persona: string; runId: string; expiresAt: number; endedAt?: string }>[]; build: Run['backend']; services: { storage: string; ai: string; email: string }; checkedAt: string; truncated: boolean }
export async function ownerRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  // The owner credential is used only on the owner's private review endpoints.
  if (!/^\/review(?:\/|$)/.test(path)) throw new Error('Недопустимый служебный адрес.')
  const token = localStorage.getItem('studyhub-token')
  if (!token) throw new Error('Войдите в аккаунт владельца.')
  const response = await fetch(apiUrl('/api' + path), { method, headers: { 'Content-Type': 'application/json', 'X-StudyHub-Build': FRONTEND_SHA, Authorization: `Bearer ${token}` }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(30000) })
  const data = await response.json().catch(() => { throw new Error('Сервер вернул неожиданный ответ.') })
  if (!response.ok) throw new Error(data.error ?? `HTTP ${response.status}`)
  return data
}
export const loadReview = () => ownerRequest<ReviewState>('GET', '/review')
export async function launchPersona(persona: string, runId: string, targetPath?: string) {
  const old = currentTestSession()
  if (old) await ownerRequest('DELETE', '/review/sessions/' + old.sessionId)
  const id = crypto.randomUUID()
  const value = await ownerRequest<{ token: string; user: unknown; session: LearningRecord<{ expiresAt: number }>; path: string }>('POST', '/review/sessions', { id, persona, runId })
  const owner = JSON.parse(localStorage.getItem('studyhub-storage') ?? '{}').state?.user?.id
  enterTestSession({ ownerId: owner, sessionId: id, runId, persona, expiresAt: value.session.data.expiresAt }, value.token, value.user, targetPath ?? value.path)
}
export const statusLabel = { new: 'Новое', 'in-progress': 'В работе', ready: 'Проверить исправление', accepted: 'Принято' }
export const outcomeLabel = { passed: 'Работает', failed: 'Не работает', unclear: 'Непонятно', skipped: 'Пропущено' }
