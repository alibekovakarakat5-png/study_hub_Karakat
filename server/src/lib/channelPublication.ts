import { TelegramDeliveryError } from './telegramTransport'

export type PublicationStatus = 'draft' | 'publishing' | 'published' | 'failed' | 'unknown'
export interface Publication {
  id: string; text: string; target: string; status: PublicationStatus; messageId?: number; error?: string
}
export interface PublicationStore {
  prepare(id: string, text: string, target: string): Promise<Publication>
  get(id: string): Promise<Publication | null>
  claim(id: string): Promise<boolean>
  finish(id: string, status: PublicationStatus, messageId?: number, error?: string): Promise<void>
}
export type ChannelSend = (target: string, text: string) => Promise<{ message_id: number }>

// The claim is durable and atomic. Unknown outcomes are never retried automatically:
// Telegram may have accepted the message before the connection/receipt was lost.
export async function publishManualPost(store: PublicationStore, id: string, send: ChannelSend): Promise<Publication> {
  const post = await store.get(id)
  if (!post) throw new Error('Ручной черновик не найден. AI-идея не является ручной публикацией.')
  if (!await store.claim(id)) return (await store.get(id))!
  let messageId: number | undefined
  let status: PublicationStatus = 'unknown'
  let error: string | undefined
  try {
    const receipt = await send(post.target, post.text)
    if (!Number.isSafeInteger(receipt?.message_id) || receipt.message_id <= 0) throw new TelegramDeliveryError('unknown')
    messageId = receipt.message_id
    status = 'published'
  } catch (e) {
    status = e instanceof TelegramDeliveryError && e.outcome !== 'unknown' ? 'failed' : 'unknown'
    error = e instanceof TelegramDeliveryError ? e.message : 'Telegram delivery unknown'
  }
  try { await store.finish(id, status, messageId, error) }
  catch {
    // Keep the durable claim locked even if saving the receipt failed.
    return { ...post, status: 'unknown', error: 'Не удалось сохранить подтверждение. Проверьте канал перед любыми повторными действиями.' }
  }
  return { ...post, status, messageId, error }
}
export function publicationNotice(post: Publication) {
  if (post.status === 'published') return `✅ Telegram подтвердил публикацию. Сообщение №${post.messageId}.`
  if (post.status === 'failed') return '❌ Публикация отклонена или бот не настроен. После исправления причины можно повторить подтверждение этого черновика.'
  if (post.status === 'draft') return 'Черновик готов. Проверьте текст, канал и факты перед подтверждением.'
  return '⚠️ Доставка не подтверждена или ещё выполняется. Повторная отправка заблокирована. Сначала проверьте канал; сообщение уже могло появиться.'
}
