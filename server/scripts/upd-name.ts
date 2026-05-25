import { prisma } from '../src/lib/prisma'

;(async () => {
  const r = await prisma.user.update({
    where: { email: 'aksharayev@gmail.com' },
    data: { email: 'alibekovakarakat5@gmail.com', name: 'Каракат Алибекова' },
  })
  console.log('✓ Updated:', r.name, '|', r.email, '|', r.role)
  await prisma.$disconnect()
})().catch((e) => { console.error(e.message); process.exit(1) })
