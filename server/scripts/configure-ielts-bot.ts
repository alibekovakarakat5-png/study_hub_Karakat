// Run only after creating a separate IELTS bot and applying the database migration.
// Without --apply this performs read-only identity/channel checks.
import dotenv from 'dotenv'
import { createTelegramRequest } from '../src/lib/telegramTransport'
import { ieltsWebhookSecret } from '../src/lib/ieltsBotConfig'
dotenv.config({ path: process.env.IELTS_ENV_FILE || '.env.ielts.local' })
async function main() {
  const token = process.env.IELTS_TELEGRAM_BOT_TOKEN, secret = ieltsWebhookSecret(token, process.env.IELTS_TELEGRAM_WEBHOOK_SECRET), address = process.env.IELTS_TELEGRAM_WEBHOOK_URL
  if (!token || !secret || !address) throw new Error('Fill IELTS token, webhook secret and URL in the private environment file.')
  if (token === process.env.TELEGRAM_BOT_TOKEN || token === process.env.POSTFLOW_TELEGRAM_BOT_TOKEN) throw new Error('IELTS requires its own token.')
  if (!/^[A-Za-z0-9_-]{32,256}$/.test(secret)) throw new Error('Use a separate random webhook secret of 32–256 allowed characters.')
  const url = new URL(address)
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/api/ielts-bot/webhook') throw new Error('Use the HTTPS IELTS webhook URL without credentials, query or fragment.')
  const request = createTelegramRequest(() => token)
  const bot = await request<{ id: number; username: string }>('getMe')
  if (!Number.isSafeInteger(bot.id) || bot.username?.toLowerCase() !== 'skyllaielts_bot') throw new Error('Expected @SkyllaIELTS_bot. Check the private IELTS token; no settings were changed.')
  const channelId = process.env.IELTS_TELEGRAM_REQUIRED_CHANNEL || '@skyllaAI'
  const channel = await request<{ id: number; username?: string; type: string }>('getChat', { chat_id: channelId })
  if (channel.type !== 'channel' || channel.username?.toLowerCase() !== 'skyllaai') throw new Error('The configured channel does not match @skyllaAI. Review the channel URL and configuration together.')
  const membership = await request<{ status: string }>('getChatMember', { chat_id: channel.id, user_id: bot.id })
  if (!['administrator', 'creator'].includes(membership.status)) throw new Error('Make the IELTS bot a channel administrator so it can check subscriptions.')
  console.log(`Verified bot @${bot.username}; channel @${channel.username}; role ${membership.status}.`)
  if (!process.argv.includes('--apply')) { console.log('Read-only check. No webhook or commands changed. Use --apply after deployment and migration checks.'); return }
  await request('setWebhook', { url: address, secret_token: secret, allowed_updates: ['message', 'callback_query'], drop_pending_updates: false })
  await request('setMyCommands', { commands: [
    { command: 'start', description: 'Начать практику' }, { command: 'today', description: 'Продолжить задание' },
    { command: 'mistakes', description: 'Повторить ошибку' }, { command: 'progress', description: 'Мои результаты' },
    { command: 'goal', description: 'Изменить цель' }, { command: 'help', description: 'Что умеет бот' },
    { command: 'privacy', description: 'Какие данные сохраняются' },
  ] })
  console.log('Webhook and menu configured. Verify the complete workflow using a separate test learner; this is not delivery acceptance.')
}
void main().catch(error => { console.error(error instanceof Error ? error.message : 'IELTS bot setup failed'); process.exitCode = 1 })
