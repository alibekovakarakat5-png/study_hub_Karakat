import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@studyhub.kz'
  const password = 'StudyHub2025!'

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log(`Admin already exists: ${email}`)
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email,
      passwordHash,
      role: 'admin',
      isPremium: true,
    },
  })

  console.log('✅ Admin created:')
  console.log(`   Email:    ${admin.email}`)
  console.log(`   Password: ${password}`)
  console.log(`   Role:     ${admin.role}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
