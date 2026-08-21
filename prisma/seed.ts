import { PrismaClient } from '@prisma/client'
import { seedUsers } from './seed/users'
import { seedAcademic } from './seed/academic'
import { seedTransport } from './seed/transport'
import { seedFinancial } from './seed/financial'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting modular database seed...')

  const { admin, school, teacher, transport } = await seedUsers(prisma)
  console.log('✅ Users and School seeded successfully')

  const academic = await seedAcademic(prisma, {
    adminId: admin.id,
    teacherId: teacher.id,
    schoolId: school.id,
  })
  console.log('✅ Academic domain seeded successfully')

  const studentIds = academic.students.map((s) => s.id)

  await seedTransport(prisma, {
    adminId: admin.id,
    transportId: transport.id,
    schoolId: school.id,
    studentIds,
  })
  console.log('✅ Transport domain seeded successfully')

  await seedFinancial(prisma, {
    adminId: admin.id,
    schoolId: school.id,
    studentIds,
  })
  console.log('✅ Financial domain seeded successfully')

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
