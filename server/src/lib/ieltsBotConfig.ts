import { createHmac } from 'crypto'

// Domain-separated webhook credential: never send the bot token as the webhook secret.
// An explicit secret remains supported; otherwise both setup and runtime derive
// the same credential without transferring a second secret through command output.
export function ieltsWebhookSecret(token: string | undefined, explicit?: string) {
  return explicit || (token ? createHmac('sha256', token).update('studyhub/ielts/webhook/v1').digest('hex') : undefined)
}
