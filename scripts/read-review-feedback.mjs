// Read-only handoff: place the key in STUDYHUB_REVIEW_KEY, never in CLI arguments.
import { mkdir, writeFile } from 'node:fs/promises'
const origin = process.env.STUDYHUB_REVIEW_API
const key = process.env.STUDYHUB_REVIEW_KEY
if (!origin || !key) throw new Error('Configure STUDYHUB_REVIEW_API and STUDYHUB_REVIEW_KEY locally. Do not paste keys into public issues.')
const url = new URL('/api/review-feed', origin)
if (url.protocol !== 'https:' && url.hostname !== '127.0.0.1' && url.hostname !== 'localhost') throw new Error('HTTPS required')
const response = await fetch(url, { headers: { Authorization: `Bearer ${key}` }, redirect: 'error', signal: AbortSignal.timeout(30000) })
if (!response.ok) throw new Error(`Cannot read review queue: HTTP ${response.status}`)
const report = await response.json()
await mkdir('.studyhub-local', { recursive: true })
await writeFile('.studyhub-local/review-feedback.json', JSON.stringify(report, null, 2), { mode: 0o600 })
console.log(JSON.stringify({ saved: '.studyhub-local/review-feedback.json', feedbackCount: report.feedback.length, truncated: report.truncated }))
