// Run only in an explicitly authorized backend environment. Defaults to inspection.
// No known default password, email-based privilege grant, or public recovery endpoint.
import 'dotenv/config'
import { randomBytes } from 'crypto'
import { writeFile } from 'fs/promises'
import { resolve } from 'path'
import { prisma } from '../src/lib/prisma'
import { reviewStore } from '../src/lib/reviewStore'

const args = process.argv.slice(2)
const value = (key: string) => args[args.indexOf(key) + 1]
async function main() {
  if (!args.includes('--email')) throw new Error('Required: --email. Default action is read-only inspection.')
  const email = value('--email').trim().toLowerCase()
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, role: true } })
  if (!user) { console.log(JSON.stringify({ found: false })); return }
  if (!args.includes('--issue-recovery')) { console.log(JSON.stringify({ found: true, ...user, ownerAccess: (await reviewStore.get(user.id, 'access'))?.data.enabled === true })); return }
  if (!args.includes('--expected-id') || value('--expected-id') !== user.id || user.role !== 'admin') throw new Error('The exact inspected ID and an existing admin role are required. This command cannot promote or create accounts.')
  if (!args.includes('--output') || !args.includes('--site')) throw new Error('Required: --output <private local file> and --site <frontend origin>')
  const site = new URL(value('--site'))
  if (site.protocol !== 'https:' && site.hostname !== '127.0.0.1' && site.hostname !== 'localhost') throw new Error('HTTPS required')
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
  const target = resolve(value('--output'))
  // Exclusive write: never replace an existing file or put a bearer link in console logs.
  await writeFile(target, JSON.stringify({ url: `${site.origin}/reset-password#token=${token}`, expiresAt: expiresAt.toISOString() }, null, 2), { flag: 'wx', mode: 0o600 })
  await prisma.$transaction(async tx => {
    await tx.user.update({ where: { id: user.id }, data: { resetToken: token, resetTokenExp: expiresAt } })
    if (args.includes('--grant-review-access')) {
      await tx.moduleProgress.upsert({ where: { userId_moduleId: { userId: user.id, moduleId: 'owner-review-v1-access' } }, create: { userId: user.id, moduleId: 'owner-review-v1-access', answers: { revision: 1, data: { enabled: true, grantedAt: new Date().toISOString(), method: 'operator-recovery' } } }, update: { answers: { revision: Date.now(), data: { enabled: true, grantedAt: new Date().toISOString(), method: 'operator-recovery' } } } })
    }
  })
  console.log(JSON.stringify({ recoveryIssued: true, privateFile: target, expiresAt: expiresAt.toISOString(), passwordChanged: false }))
}
main().catch(() => { console.error('Owner operation failed. Check arguments and authorized environment; no credentials are printed.'); process.exitCode = 1 }).finally(() => prisma.$disconnect())
