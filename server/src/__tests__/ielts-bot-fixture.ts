import { emptyIeltsState, type IeltsState, type IeltsReply } from '../lib/ieltsBot'
import type { IeltsBotStore } from '../lib/ieltsBotStore'
export function memoryIeltsBotStore(): IeltsBotStore {
  const accounts = new Map<string, IeltsState>(), updates = new Map<string, { reply: IeltsReply; status: string }>()
  return {
    async apply(account, id, change) {
      const key = account + ':' + id, old = updates.get(key)
      if (old) return structuredClone(old.reply)
      const next = change(structuredClone(accounts.get(account) ?? emptyIeltsState()))
      accounts.set(account, structuredClone(next.state)); updates.set(key, { reply: structuredClone(next.reply), status: 'prepared' }); return next.reply
    },
    async claim(account, id) { const row = updates.get(account + ':' + id); if (!row || row.status !== 'prepared') return false; row.status = 'sending'; return true },
    async finish(account, id, status) { const row = updates.get(account + ':' + id); if (!row || row.status !== 'sending') throw Error('Claim missing'); row.status = status },
    async read(account) { return structuredClone(accounts.get(account) ?? emptyIeltsState()) },
  }
}
