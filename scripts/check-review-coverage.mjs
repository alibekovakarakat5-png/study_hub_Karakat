import fs from 'node:fs'
import { execFileSync } from 'node:child_process'
const arg = name => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : undefined }
const event = process.env.GITHUB_EVENT_PATH ? JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')) : {}
const base = arg('--base') ?? event.pull_request?.base?.sha ?? event.before
const head = arg('--head')
if (!base || /^0+$/.test(base)) throw new Error('Specify the previous release with --base <commit>.')
const git = (...args) => execFileSync('git', ['-c', `safe.directory=${process.cwd().replaceAll('\\', '/')}`, ...args], { encoding: 'utf8' }).trim()
const names = git('diff', '--name-only', base, ...(head ? [head] : []), '--').split('\n')
const product = names.filter(p => /^(src\/|server\/(src\/|prisma\/))/.test(p) && !p.includes('/__tests__/'))
if (!product.length) { console.log('No product changes require an owner-review update.'); process.exit(0) }
const catalogPath = 'server/src/lib/reviewCatalog.ts'
if (!names.includes(catalogPath) || !names.includes('review-release.json')) throw new Error('Product changes require updated owner-review scenarios AND review-release.json. Add concrete steps and usable fixtures before releasing.')
const read = p => head ? git('show', head + ':' + p) : fs.readFileSync(p, 'utf8')
const manifest = JSON.parse(read('review-release.json'))
if (!manifest.id || !manifest.summary?.trim() || !Array.isArray(manifest.scenarios) || !manifest.scenarios.length) throw new Error('Release review metadata is incomplete.')
const catalog = read(catalogPath)
for (const id of manifest.scenarios) {
  if (!/^[a-z0-9-]+$/.test(id) || !catalog.includes(`id: '${id}', title:`)) throw new Error('Release references an unknown review scenario: ' + id)
}
console.log(`Owner-review coverage: ${product.length} changed product files; scenarios ${manifest.scenarios.join(', ')}. Execute each scenario before reporting verification.`)
