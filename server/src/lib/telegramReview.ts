import type { LearningRepository } from './learningRepository'
import type { Publication, PublicationStatus, PublicationStore } from './channelPublication'

// This adapter only writes to the synthetic persona's own progress records.
export function reviewPublicationStore(repo: LearningRepository, userId: string): PublicationStore {
  const key = (id: string) => 'publication-' + id
  return {
    async prepare(id, text, target) {
      const existing = await repo.get(userId, key(id))
      if (existing) {
        if (existing.data.text !== text || existing.data.target !== target) throw new Error('Черновик отличается.')
        return existing.data as unknown as Publication
      }
      const saved = await repo.put(userId, key(id), { id, text, target, status: 'draft' }, 0)
      if (!saved) throw new Error('Черновик уже создаётся. Обновите страницу.')
      return saved.data as unknown as Publication
    },
    async get(id) { return (await repo.get(userId, key(id)))?.data as unknown as Publication ?? null },
    async claim(id) {
      const row = await repo.get(userId, key(id))
      if (!row || !['draft', 'failed'].includes(String(row.data.status))) return false
      return !!await repo.put(userId, key(id), { ...row.data, status: 'publishing' }, row.revision)
    },
    async finish(id: string, status: PublicationStatus, messageId?: number, error?: string) {
      const row = await repo.get(userId, key(id))
      if (!row || row.data.status !== 'publishing') throw new Error('Publication claim lost')
      const saved = await repo.put(userId, key(id), { ...row.data, status, messageId: messageId ?? null, error: error ?? null }, row.revision)
      if (!saved) throw new Error('Publication receipt conflict')
    },
  }
}
