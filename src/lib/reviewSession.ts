// Test authentication is isolated to this tab; the owner's normal login is untouched.
export const reviewSessionKey = 'studyhub-review-session'
export type TestSession = { ownerId: string; sessionId: string; runId: string; persona: string; expiresAt: number }
export function currentTestSession(): TestSession | null {
  try { return JSON.parse(sessionStorage.getItem(reviewSessionKey) ?? 'null') } catch { return null }
}
export const authStorage = () => currentTestSession() ? sessionStorage : localStorage
export function enterTestSession(session: TestSession, token: string, user: unknown, path: string) {
  for (const key of Object.keys(sessionStorage)) if (key.startsWith('studyhub') || key.startsWith('review-test:')) sessionStorage.removeItem(key)
  sessionStorage.setItem(reviewSessionKey, JSON.stringify(session))
  sessionStorage.setItem('studyhub-token', token)
  sessionStorage.setItem('studyhub-storage', JSON.stringify({ state: { user, isAuthenticated: true, onboardingCompleted: true }, version: 0 }))
  location.assign(path)
}
export function leaveTestSession() {
  for (const key of Object.keys(sessionStorage)) if (key.startsWith('studyhub') || key.startsWith('review-test:')) sessionStorage.removeItem(key)
  location.assign('/owner-review')
}
