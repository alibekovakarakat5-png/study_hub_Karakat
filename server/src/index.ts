import 'dotenv/config'
import { validateEnv } from './lib/env'

// Validate environment before anything else
const env = validateEnv()

import app from './app'
import { tg, startPolling } from './lib/telegram'
import { startCronJobs } from './lib/cron'

app.listen(env.PORT, () => {
  console.log(`✅ StudyHub API running on http://localhost:${env.PORT}`)
  console.log(`   Health: http://localhost:${env.PORT}/api/health`)
  console.log(`   Environment: ${env.NODE_ENV}`)
  tg.serverStart()
  startCronJobs()
  // In dev mode (no webhook), use polling to receive Telegram messages
  if (env.NODE_ENV !== 'production') startPolling()
})
