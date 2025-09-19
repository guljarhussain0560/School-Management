import { PrismaClient, UserRole, RouteStatus, MaintenanceStatus, AlertType, AlertPriority, AlertStatus, AdmissionStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@school.com' },
    update: {},
    create: {
      email: 'admin@school.com',
      name: 'School Administrator',
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
  })

  console.log('✅ Admin user created:', admin.email)

  // Create sample school
  const school = await prisma.school.upsert({
    where: { registrationNumber: 'SCH001' },
    update: {},
    create: {
      name: 'Sample School',
      registrationNumber: 'SCH001',
      address: '123 Education Street, Learning City',
      phone: '+1-234-567-8900',
      email: 'info@sample-school.com',
      adminId: admin.id,
    },
  })

  console.log('✅ School created:', school.name)

  // Update admin user with schoolId
  await prisma.user.update({
    where: { id: admin.id },
    data: { schoolId: school.id }
  })

  console.log('✅ Admin user updated with schoolId')

  // Create sample teacher
  const teacherPassword = await bcrypt.hash('teacher123', 12)
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@school.com' },
    update: {},
    create: {
      email: 'teacher@school.com',
      name: 'John Teacher',
      password: teacherPassword,
      role: UserRole.TEACHER,
      isActive: true,
      schoolId: school.id,
      createdBy: admin.id,
    },
  })

  console.log('✅ Teacher created:', teacher.email)

  // Create sample transport user
  const transportPassword = await bcrypt.hash('transport123', 12)
  const transport = await prisma.user.upsert({
    where: { email: 'transport@school.com' },
    update: {},
    create: {
      email: 'transport@school.com',
      name: 'Mike Transport',
      password: transportPassword,
      role: UserRole.TRANSPORT,
      isActive: true,
      schoolId: school.id,
      createdBy: admin.id,
    },
  })

  console.log('✅ Transport user created:', transport.email)

  // Create sample students
  const students = await Promise.all([
    prisma.student.upsert({
      where: { id: 'student-1' },
      update: {},
      create: {
        id: 'student-1',
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
        age: 10,
        grade: '5',
        rollNumber: 'STU001',
        parentContact: '+1-234-567-8901',
        address: '456 Student Lane, Learning City',
        schoolId: school.id,
        createdBy: teacher.id,
        status: AdmissionStatus.PENDING,
      },
    }),
    prisma.student.upsert({
      where: { id: 'student-2' },
      update: {},
      create: {
        id: 'student-2',
        name: 'Bob Smith',
        email: 'bob.smith@example.com',
        age: 11,
        grade: '6',
        rollNumber: 'STU002',
        parentContact: '+1-234-567-8902',
        address: '789 Learning Avenue, Learning City',
        schoolId: school.id,
        createdBy: teacher.id,
        status: AdmissionStatus.ACCEPTED,
      },
    }),
  ])

  console.log('✅ Students created:', students.length)

  // Create sample bus routes
  const busRoutes = await Promise.all([
    prisma.busRoute.upsert({
      where: { id: 'route-a' },
      update: {},
      create: {
        id: 'route-a',
        routeName: 'Route A',
        busNumber: 'BUS-001',
        status: RouteStatus.ON_TIME,
        managedBy: transport.id,
        schoolId: school.id,
      },
    }),
    prisma.busRoute.upsert({
      where: { id: 'route-b' },
      update: {},
      create: {
        id: 'route-b',
        routeName: 'Route B',
        busNumber: 'BUS-002',
        status: RouteStatus.DELAYED,
        delayReason: 'Traffic',
        managedBy: transport.id,
        schoolId: school.id,
      },
    }),
    prisma.busRoute.upsert({
      where: { id: 'route-c' },
      update: {},
      create: {
        id: 'route-c',
        routeName: 'Route C',
        busNumber: 'BUS-003',
        status: RouteStatus.ON_TIME,
        managedBy: transport.id,
        schoolId: school.id,
      },
    }),
  ])

  console.log('✅ Bus routes created:', busRoutes.length)

  // Create sample maintenance items
  const maintenanceItems = await Promise.all([
    prisma.maintenanceItem.upsert({
      where: { id: 'maintenance-1' },
      update: {},
      create: {
        id: 'maintenance-1',
        name: 'Library Air Conditioning',
        description: 'Central air conditioning system for the library',
        status: MaintenanceStatus.OK,
        lastChecked: new Date('2024-01-15'),
        schoolId: school.id,
      },
    }),
    prisma.maintenanceItem.upsert({
      where: { id: 'maintenance-2' },
      update: {},
      create: {
        id: 'maintenance-2',
        name: 'Playground Equipment',
        description: 'Outdoor playground equipment and safety structures',
        status: MaintenanceStatus.NEEDS_REPAIR,
        lastChecked: new Date('2024-01-10'),
        schoolId: school.id,
      },
    }),
    prisma.maintenanceItem.upsert({
      where: { id: 'maintenance-3' },
      update: {},
      create: {
        id: 'maintenance-3',
        name: 'Computer Lab',
        description: 'Computer lab equipment and network infrastructure',
        status: MaintenanceStatus.IN_PROGRESS,
        lastChecked: new Date('2024-01-12'),
        schoolId: school.id,
      },
    }),
  ])

  console.log('✅ Maintenance items created:', maintenanceItems.length)

  // Create sample safety alerts
  const safetyAlerts = await Promise.all([
    prisma.safetyAlert.upsert({
      where: { id: 'alert-1' },
      update: {},
      create: {
        id: 'alert-1',
        type: AlertType.DELAY,
        priority: AlertPriority.MEDIUM,
        description: 'Bus #02 delayed due to traffic',
        status: AlertStatus.ACTIVE,
        createdBy: transport.id,
        schoolId: school.id,
      },
    }),
  ])

  console.log('✅ Safety alerts created:', safetyAlerts.length)

  // Assign students to bus routes
  await prisma.student.update({
    where: { id: 'student-1' },
    data: { busRouteId: 'route-a' },
  })

  await prisma.student.update({
    where: { id: 'student-2' },
    data: { busRouteId: 'route-b' },
  })

  console.log('✅ Students assigned to bus routes')

  // Create sample fee collections
  const feeCollections = await Promise.all([
    prisma.feeCollection.create({
      data: {
        studentId: 'student-1',
        amount: 5000,
        paymentMode: 'CASH',
        collectedBy: admin.id,
        schoolId: school.id,
        notes: 'Monthly fee payment',
        date: new Date('2024-01-15'),
      },
    }),
    prisma.feeCollection.create({
      data: {
        studentId: 'student-2',
        amount: 4500,
        paymentMode: 'UPI',
        collectedBy: admin.id,
        schoolId: school.id,
        notes: 'Monthly fee payment',
        date: new Date('2024-01-16'),
      },
    }),
    prisma.feeCollection.create({
      data: {
        studentId: 'student-1',
        amount: 5000,
        paymentMode: 'BANK_TRANSFER',
        collectedBy: admin.id,
        schoolId: school.id,
        notes: 'February fee payment',
        date: new Date('2024-02-15'),
      },
    }),
  ])

  console.log('✅ Fee collections created:', feeCollections.length)

  // Create sample payroll records
  const payrollRecords = await Promise.all([
    prisma.payroll.create({
      data: {
        department: 'Teaching',
        amount: 55000,
        month: 1,
        year: 2024,
        status: 'APPROVED',
        uploadedBy: admin.id,
      },
    }),
    prisma.payroll.create({
      data: {
        department: 'Administration',
        amount: 45000,
        month: 1,
        year: 2024,
        status: 'PENDING',
        uploadedBy: admin.id,
      },
    }),
  ])

  console.log('✅ Payroll records created:', payrollRecords.length)

  // Create sample budget expenses
  const budgetExpenses = await Promise.all([
    prisma.budgetExpense.create({
      data: {
        department: 'Academic',
        amount: 15000,
        description: 'Textbooks and stationery',
        status: 'APPROVED',
        createdBy: admin.id,
      },
    }),
    prisma.budgetExpense.create({
      data: {
        department: 'Maintenance',
        amount: 8000,
        description: 'Repair work for classroom furniture',
        status: 'PENDING',
        createdBy: admin.id,
      },
    }),
  ])

  console.log('✅ Budget expenses created:', budgetExpenses.length)

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
