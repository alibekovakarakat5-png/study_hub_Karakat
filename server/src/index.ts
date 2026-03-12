import 'dotenv/config'
import app from './app'
import { tg } from './lib/telegram'
import { startCronJobs } from './lib/cron'

const PORT = Number(process.env.PORT ?? 3001)

app.listen(PORT, () => {
  console.log(`✅ StudyHub API running on http://localhost:${PORT}`)
  console.log(`   Health: http://localhost:${PORT}/api/health`)
  tg.serverStart()
  startCronJobs()
})
