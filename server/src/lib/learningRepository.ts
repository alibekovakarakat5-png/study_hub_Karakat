import { Prisma } from '@prisma/client'
import { prisma } from './prisma'

export const LEARNING_PREFIX = 'skylla-v1-'
export type LearningRecord = { id: string; revision: number; updatedAt: string; data: Record<string, unknown> }
export interface LearningRepository {
  get(userId: string, id: string): Promise<LearningRecord | null>
  list(userId: string, prefix: string, limit?: number): Promise<LearningRecord[]>
  put(userId: string, id: string, data: Record<string, unknown>, revision: number): Promise<LearningRecord | null>
  remove(userId: string, id: string): Promise<void>
  removePrefix(userId: string, prefix: string): Promise<void>
}
export function createProgressRepository(storagePrefix: string): LearningRepository {
function record(row: { moduleId: string; answers: Prisma.JsonValue; updatedAt: Date }): LearningRecord {
  const stored = row.answers as { revision: number; data: Record<string, unknown> }
  return { id: row.moduleId.slice(storagePrefix.length), revision: stored.revision, data: stored.data, updatedAt: row.updatedAt.toISOString() }
}
return {
  async get(userId, id) {
    const row = await prisma.moduleProgress.findUnique({ where: { userId_moduleId: { userId, moduleId: storagePrefix + id } } })
    return row ? record(row) : null
  },
  async list(userId, prefix, limit = 100) {
    return (await prisma.moduleProgress.findMany({ where: { userId, moduleId: { startsWith: storagePrefix + prefix } }, orderBy: [{ updatedAt: 'desc' }, { moduleId: 'desc' }], take: limit })).map(record)
  },
  async put(userId, id, data, revision) {
    const moduleId = storagePrefix + id
    const answers = { revision: revision + 1, data } as Prisma.InputJsonObject
    if (revision === 0) {
      try { return record(await prisma.moduleProgress.create({ data: { userId, moduleId, answers } })) }
      catch (err) { if ((err as { code?: string }).code === 'P2002') return null; throw err }
    }
    // Compare-and-set prevents another tab/device from silently overwriting newer work.
    return prisma.$transaction(async tx => {
      const updated = await tx.moduleProgress.updateMany({ where: { userId, moduleId, answers: { path: ['revision'], equals: revision } }, data: { answers } })
      if (!updated.count) return null
      const row = await tx.moduleProgress.findUniqueOrThrow({ where: { userId_moduleId: { userId, moduleId } } })
      return record(row)
    })
  },
  async remove(userId, id) { await prisma.moduleProgress.deleteMany({ where: { userId, moduleId: storagePrefix + id } }) },
  async removePrefix(userId, prefix) { await prisma.moduleProgress.deleteMany({ where: { userId, moduleId: { startsWith: storagePrefix + prefix } } }) },
}

}
export const learningRepository = createProgressRepository(LEARNING_PREFIX)
