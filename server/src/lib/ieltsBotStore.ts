import { Prisma } from '@prisma/client'
import { prisma } from './prisma'
import { emptyIeltsState, type IeltsReply, type IeltsState } from './ieltsBot'

export interface IeltsBotStore {
  apply(accountId: string, updateId: number, change: (state: IeltsState) => { state: IeltsState; reply: IeltsReply }): Promise<IeltsReply>
  claim(accountId: string, updateId: number): Promise<boolean>
  finish(accountId: string, updateId: number, status: 'sent' | 'failed' | 'unknown', messageId?: number): Promise<void>
  read(accountId: string): Promise<IeltsState>
}
class RetryIeltsWrite extends Error {}
export function createIeltsBotStore(db = prisma): IeltsBotStore {
  return {
    async apply(accountId, updateId, change) {
      for (let n = 0; n < 5; n++) {
        try {
          return await db.$transaction(async tx => {
            const key = { accountId_updateId: { accountId, updateId: BigInt(updateId) } }
            const old = await tx.ieltsBotUpdate.findUnique({ where: key })
            if (old) return old.reply as unknown as IeltsReply
            const account = await tx.ieltsBotAccount.upsert({ where: { id: accountId }, update: {}, create: { id: accountId, state: emptyIeltsState() as unknown as Prisma.InputJsonValue } })
            const next = change(account.state as unknown as IeltsState)
            const changed = await tx.ieltsBotAccount.updateMany({ where: { id: accountId, revision: account.revision }, data: { state: next.state as unknown as Prisma.InputJsonValue, revision: { increment: 1 } } })
            if (changed.count !== 1) throw new RetryIeltsWrite()
            await tx.ieltsBotUpdate.create({ data: { accountId, updateId: BigInt(updateId), reply: next.reply as unknown as Prisma.InputJsonValue } })
            return next.reply
          })
        } catch (error) {
          if (!(error instanceof RetryIeltsWrite) && !['P2002', 'P2034'].includes((error as { code?: string }).code ?? '')) throw error
        }
      }
      throw new Error('IELTS progress is busy; retry the update')
    },
    async claim(accountId, updateId) {
      const result = await db.ieltsBotUpdate.updateMany({ where: { accountId, updateId: BigInt(updateId), status: 'prepared' }, data: { status: 'sending' } })
      return result.count === 1
    },
    async finish(accountId, updateId, status, messageId) {
      const result = await db.ieltsBotUpdate.updateMany({ where: { accountId, updateId: BigInt(updateId), status: 'sending' }, data: { status, messageId: messageId ?? null } })
      if (result.count !== 1) throw new Error('IELTS delivery receipt was not saved')
    },
    async read(accountId) { const row = await db.ieltsBotAccount.findUnique({ where: { id: accountId } }); return row ? row.state as unknown as IeltsState : emptyIeltsState() },
  }
}
