import 'dotenv/config'
import { validateEnv } from './lib/env'

// Validate environment before anything else
const env = validateEnv()

import app from './app'
import { tg, startPolling } from './lib/telegram'
import { startCronJobs } from './lib/cron'

// Падения вне Express (кроны, telegram-поллинг, оборванные промисы) — алерт
// админу в Telegram. Не чаще раза в минуту, чтобы цикл падений не заспамил чат.
let lastCrashAlert = 0
function crashAlert(kind: string, err: unknown) {
  const e = err instanceof Error ? err : new Error(String(err))
  console.error(`[${kind}]`, e)
  if (Date.now() - lastCrashAlert > 60_000) {
    lastCrashAlert = Date.now()
    tg.error(`${kind}: ${e.message}`, e.stack)
  }
}
// После uncaughtException процесс в неопределённом состоянии — даём 2 секунды
// на отправку алерта и выходим; Railway перезапустит контейнер.
process.on('uncaughtException', (err) => {
  crashAlert('uncaughtException', err)
  setTimeout(() => process.exit(1), 2000)
})
process.on('unhandledRejection', (err) => crashAlert('unhandledRejection', err))

app.listen(env.PORT, () => {
  console.log(`✅ StudyHub API running on http://localhost:${env.PORT}`)
  console.log(`   Health: http://localhost:${env.PORT}/api/health`)
  console.log(`   Environment: ${env.NODE_ENV}`)
  tg.serverStart()
  startCronJobs()
  // In dev mode (no webhook), use polling to receive Telegram messages
  if (env.NODE_ENV !== 'production') startPolling()
})
