import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const staffMembers = [
    { name: '管理 太郎', pin: '0000', email: 'info@backdoor-g.com', role: 'admin' },
    { name: 'スタッフ 1', pin: '1111', email: 'staff1@example.com', role: 'staff' },
    { name: 'スタッフ 2', pin: '2222', email: 'staff2@example.com', role: 'staff' },
  ]

  console.log('Seeding staff members...')

  for (const staff of staffMembers) {
    const s = await prisma.staff.upsert({
      where: { name: staff.name },
      update: {},
      create: staff,
    })
    console.log(`Created staff: ${s.name}`)
  }

  console.log('Seeding completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
