import { prisma } from './prisma'
import type { Publication, PublicationStore, PublicationStatus } from './channelPublication'

const map = (row: { id: string; body: string; telegramChatId: string | null; status: string; telegramMessageId: number | null; deliveryError: string | null }): Publication => ({
  id: row.id, text: row.body, target: row.telegramChatId!, status: row.status as PublicationStatus,
  messageId: row.telegramMessageId ?? undefined, error: row.deliveryError ?? undefined,
})
export function createChannelPublicationStore(db = prisma): PublicationStore { return {
  async prepare(id, text, target) {
    const row = await db.contentIdea.upsert({ where: { id }, update: {}, create: {
      id, type: 'manual_post', platform: 'telegram', title: 'Ручная публикация', body: text, telegramChatId: target,
    } })
    if (row.type !== 'manual_post' || row.body !== text || row.telegramChatId !== target) throw new Error('Черновик с этим номером уже отличается. Создайте новое сообщение.')
    return map(row)
  },
  async get(id) {
    const row = await db.contentIdea.findFirst({ where: { id, type: 'manual_post' } })
    return row ? map(row) : null
  },
  async claim(id) {
    const result = await db.contentIdea.updateMany({ where: { id, type: 'manual_post', status: { in: ['draft', 'failed'] } }, data: { status: 'publishing', deliveryError: null } })
    return result.count === 1
  },
  async finish(id, status, messageId, error) {
    const result = await db.contentIdea.updateMany({ where: { id, type: 'manual_post', status: 'publishing' }, data: { status, telegramMessageId: messageId ?? null, deliveryError: error ?? null } })
    if (result.count !== 1) throw new Error('Publication claim lost')
  },
} }
export const channelPublicationStore = createChannelPublicationStore()
