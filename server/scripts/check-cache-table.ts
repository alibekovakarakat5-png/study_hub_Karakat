import { prisma } from '../src/lib/prisma'

;(async () => {
  try {
    const r = await prisma.$queryRawUnsafe(`SELECT to_regclass('public."AILessonCache"')::text as tbl`)
    console.log('Table:', r)
    if ((r as { tbl: string | null }[])[0]?.tbl) {
      const count = await prisma.$queryRawUnsafe('SELECT COUNT(*)::int as n FROM "AILessonCache"')
      console.log('Rows:', count)
    }
  } catch (e) {
    console.error('Error:', e instanceof Error ? e.message : e)
  }
  await prisma.$disconnect()
})()
