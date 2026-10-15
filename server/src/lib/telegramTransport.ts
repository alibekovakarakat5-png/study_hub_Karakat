export class TelegramDeliveryError extends Error {
  constructor(public readonly outcome: 'rejected' | 'unknown' | 'not-configured', public readonly code?: number) {
    super(outcome === 'rejected' ? `Telegram rejected request (${code ?? 'unknown'})` : `Telegram delivery ${outcome}`)
  }
}

// Never expose response descriptions, request URLs or tokens in exceptions.
export function createTelegramRequest(token: () => string | undefined, request: typeof fetch = (...args) => fetch(...args)) {
  return async function telegramRequest<T>(method: string, body: Record<string, unknown> = {}): Promise<T> {
    const secret = token()
    if (!secret) throw new TelegramDeliveryError('not-configured')
    try {
      const response = await request(`https://api.telegram.org/bot${secret}/${method}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(8000),
      })
      const data = await response.json() as { ok?: boolean; result?: T; error_code?: number }
      if (data.ok === false && response.status < 500) throw new TelegramDeliveryError('rejected', data.error_code ?? response.status)
      if (!response.ok || data.ok !== true || data.result === undefined) throw new TelegramDeliveryError('unknown')
      return data.result
    } catch (error) {
      if (error instanceof TelegramDeliveryError) throw error
      throw new TelegramDeliveryError('unknown')
    }
  }
}
export const telegramRequest = createTelegramRequest(() => process.env.TELEGRAM_BOT_TOKEN)
export const telegramAdminChat = () => process.env.TELEGRAM_ADMIN_CHAT_ID ?? process.env.TELEGRAM_ADMIN_CHAT ?? process.env.TELEGRAM_CHAT_ID
