import { z } from 'zod'
import { TelegramDeliveryError } from './telegramTransport'
import { ieltsMembershipReply, ieltsReadOnlyCommand, isIeltsChannelMember, transitionIelts } from './ieltsBot'
import type { IeltsBotStore } from './ieltsBotStore'
import type { IeltsReply } from './ieltsBot'
import { evaluateIeltsWriting } from './ieltsWritingAI'
import { validateWritingFeedback, type WritingEvaluator, type WritingFeedback } from './ieltsWriting'
import { finishWriting } from './ieltsWritingFlow'

const person = z.object({ id: z.number().int().positive().safe(), is_bot: z.boolean().optional() })
const message = z.object({ chat: z.object({ id: z.number().int().safe(), type: z.string() }), from: person.optional(), text: z.string().max(4096).optional() })
export const ieltsUpdateSchema = z.object({
  update_id: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER - 1), message: message.optional(),
  callback_query: z.object({ id: z.string().min(1).max(256), from: person, data: z.string().max(64).optional(), message: message.optional() }).optional(),
})
export type IeltsUpdate = z.infer<typeof ieltsUpdateSchema>
export type IeltsRequest = <T>(method: string, body?: Record<string, unknown>) => Promise<T>
export function createIeltsBotHandler(store: IeltsBotStore, request: IeltsRequest, config: { channelId: string; channelUrl: string; accountPrefix: string }, evaluate: WritingEvaluator = evaluateIeltsWriting) {
  return async (update: IeltsUpdate) => {
    const callback = update.callback_query, msg = callback?.message ?? update.message, person = callback?.from ?? msg?.from
    if (!msg || !person || person.is_bot || msg.chat.type !== 'private' || msg.chat.id !== person.id) return
    const accountId = config.accountPrefix + person.id, raw = (msg.text ?? '').trim()
    const command = callback?.data ?? (raw.startsWith('/') ? raw.split(/\s+/)[0].replace(/@\w+$/, '') : raw)
    let membership: 'member' | 'absent' | 'unavailable' = 'member'
    if (!ieltsReadOnlyCommand(command)) {
      try {
        const member = await request<{ status?: string; is_member?: boolean }>('getChatMember', { chat_id: config.channelId, user_id: person.id })
        membership = isIeltsChannelMember(member) ? 'member' : 'absent'
      } catch { membership = 'unavailable' }
    }
    const reply = await store.apply(accountId, update.update_id, state => membership === 'member' ? transitionIelts(state, command) : { state, reply: ieltsMembershipReply(config.channelUrl, membership === 'unavailable') })
    if (callback) { try { await request('answerCallbackQuery', { callback_query_id: callback.id }) } catch { /* Acknowledgment does not change saved learning progress. */ } }
    async function deliver(reply: IeltsReply, updateId: number) {
    if (!await store.claim(accountId, updateId)) return false
    let status: 'sent' | 'failed' | 'unknown' = 'unknown', messageId: number | undefined
    try {
      const receipt = await request<{ message_id: number }>('sendMessage', {
        chat_id: person!.id, text: reply.text,
        ...(reply.buttons ? { reply_markup: { inline_keyboard: reply.buttons.map(row => row.map(b => ({ text: b.text, ...(b.url ? { url: b.url } : { callback_data: b.data }) }))) } } : {}),
      })
      if (!Number.isSafeInteger(receipt?.message_id) || receipt.message_id <= 0) throw new TelegramDeliveryError('unknown')
      messageId = receipt.message_id; status = 'sent'
    } catch (error) { status = error instanceof TelegramDeliveryError && error.outcome !== 'unknown' ? 'failed' : 'unknown' }
    // A crash after claim leaves 'sending'. Never blindly resend that update.
    // Progress was committed first; /today reconstructs the next question.
    await store.finish(accountId, updateId, status, messageId)
    return true
    }
    if (!await deliver(reply, update.update_id) || !reply.work) return
    // Never call the provider in a retried database transaction. The durable claim
    // makes a duplicate webhook skip the external request as well as the reply.
    let feedback: WritingFeedback | null = null
    try { feedback = validateWritingFeedback(await evaluate(reply.work), reply.work.text) } catch { /* Keep draft, expose a retry; never manufacture a mark. */ }
    const resultId = -update.update_id - 1
    const result = await store.apply(accountId, resultId, state => finishWriting(state, reply.work!, feedback))
    await deliver(result, resultId)
  }
}
