import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function seedUsers(prisma: PrismaClient) {
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const teacherPassword = await bcrypt.hash('teacher123', 12)
  const transportPassword = await bcrypt.hash('transport123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@school.com' },
    update: {},
    create: {
      userId: 'ADM24C9M4O6Z3',
      email: 'admin@school.com',
      name: 'School Administrator',
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
  })

  const school = await prisma.school.upsert({
    where: { registrationNumber: 'SCH001' },
    update: {},
    create: {
      schoolId: 'SCH1234567890',
      schoolCode: 'ABC',
      name: 'Sample School',
      registrationNumber: 'SCH001',
      address: '123 Education Street, Learning City',
      phone: '+1-234-567-8900',
      email: 'info@sample-school.com',
      adminId: admin.id,
    },
  })

  await prisma.user.update({
    where: { id: admin.id },
    data: { schoolId: school.id },
  })

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@school.com' },
    update: {},
    create: {
      userId: 'TCH24A7K9M2X1',
      email: 'teacher@school.com',
      name: 'John Teacher',
      password: teacherPassword,
      role: UserRole.TEACHER,
      isActive: true,
      schoolId: school.id,
      createdBy: admin.id,
    },
  })

  const transport = await prisma.user.upsert({
    where: { email: 'transport@school.com' },
    update: {},
    create: {
      userId: 'TRP24B8L3N5Y2',
      email: 'transport@school.com',
      name: 'Mike Transport',
      password: transportPassword,
      role: UserRole.TRANSPORT,
      isActive: true,
      schoolId: school.id,
      createdBy: admin.id,
    },
  })

  return { admin, school, teacher, transport }
}
