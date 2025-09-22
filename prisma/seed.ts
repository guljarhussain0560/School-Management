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
      userId: 'ADM24C9M4O6Z3', // Generated 12-character admin ID
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
      schoolId: 'SCH1234567890',
      schoolCode: 'ABC', // Generated school code
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
      userId: 'TCH24A7K9M2X1', // Generated 12-character teacher ID
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
      userId: 'TRP24B8L3N5Y2', // Generated 12-character transport ID
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

  // Create sample student batches
  const batch2024 = await prisma.studentBatch.upsert({
    where: { id: 'batch-2024' },
    update: {},
    create: {
      id: 'batch-2024',
      batchCode: '24A', // Generated batch code
      batchName: '2024-25',
      academicYear: '2024-25',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2025-03-31'),
      description: 'Academic year 2024-25 batch',
      status: 'ACTIVE',
      schoolId: school.id,
      createdBy: admin.id,
    },
  });

  const batch2023 = await prisma.studentBatch.upsert({
    where: { id: 'batch-2023' },
    update: {},
    create: {
      id: 'batch-2023',
      batchCode: '23A', // Generated batch code
      batchName: '2023-24',
      academicYear: '2023-24',
      startDate: new Date('2023-04-01'),
      endDate: new Date('2024-03-31'),
      description: 'Academic year 2023-24 batch',
      status: 'ACTIVE',
      schoolId: school.id,
      createdBy: admin.id,
    },
  });

  // Create sample subjects
  const subjects = await Promise.all([
    prisma.subject.upsert({
      where: { id: 'subject-math' },
      update: {},
      create: {
        id: 'subject-math',
        subjectCode: 'CMATH01', // Generated subject code
        subjectName: 'Mathematics',
        description: 'Core mathematics curriculum',
        schoolId: school.id,
        createdBy: admin.id,
      },
    }),
    prisma.subject.upsert({
      where: { id: 'subject-english' },
      update: {},
      create: {
        id: 'subject-english',
        subjectCode: 'LENG01', // Generated subject code
        subjectName: 'English',
        description: 'English language and literature',
        schoolId: school.id,
        createdBy: admin.id,
      },
    }),
    prisma.subject.upsert({
      where: { id: 'subject-science' },
      update: {},
      create: {
        id: 'subject-science',
        subjectCode: 'PSCI01', // Generated subject code
        subjectName: 'Science',
        description: 'General science curriculum',
        schoolId: school.id,
        createdBy: admin.id,
      },
    }),
    prisma.subject.upsert({
      where: { id: 'subject-social' },
      update: {},
      create: {
        id: 'subject-social',
        subjectCode: 'SSOC01', // Generated subject code
        subjectName: 'Social Studies',
        description: 'History, geography, and civics',
        schoolId: school.id,
        createdBy: admin.id,
      },
    }),
  ]);

  // Create sample classes
  const classes = await Promise.all([
    prisma.class.upsert({
      where: { id: 'class-5' },
      update: {},
      create: {
        id: 'class-5',
        classCode: '24A5A', // Generated class code (batch + level + section)
        className: 'Class 5',
        description: 'Fifth grade class',
        capacity: 30,
        batchId: batch2024.id,
        schoolId: school.id,
        createdBy: admin.id,
      },
    }),
    prisma.class.upsert({
      where: { id: 'class-6' },
      update: {},
      create: {
        id: 'class-6',
        classCode: '23A6A', // Generated class code (batch + level + section)
        className: 'Class 6',
        description: 'Sixth grade class',
        capacity: 30,
        batchId: batch2023.id,
        schoolId: school.id,
        createdBy: admin.id,
      },
    }),
  ]);

  // Create subject-grade assignments
  await Promise.all([
    // Class 5 subjects
    prisma.subjectGrade.upsert({
      where: { id: 'sg-math-5' },
      update: {},
      create: {
        id: 'sg-math-5',
        subjectId: subjects[0].id, // Math
        classId: classes[0].id, // Class 5
        schoolId: school.id,
      },
    }),
    prisma.subjectGrade.upsert({
      where: { id: 'sg-english-5' },
      update: {},
      create: {
        id: 'sg-english-5',
        subjectId: subjects[1].id, // English
        classId: classes[0].id, // Class 5
        schoolId: school.id,
      },
    }),
    prisma.subjectGrade.upsert({
      where: { id: 'sg-science-5' },
      update: {},
      create: {
        id: 'sg-science-5',
        subjectId: subjects[2].id, // Science
        classId: classes[0].id, // Class 5
        schoolId: school.id,
      },
    }),
    // Class 6 subjects
    prisma.subjectGrade.upsert({
      where: { id: 'sg-math-6' },
      update: {},
      create: {
        id: 'sg-math-6',
        subjectId: subjects[0].id, // Math
        classId: classes[1].id, // Class 6
        schoolId: school.id,
      },
    }),
    prisma.subjectGrade.upsert({
      where: { id: 'sg-english-6' },
      update: {},
      create: {
        id: 'sg-english-6',
        subjectId: subjects[1].id, // English
        classId: classes[1].id, // Class 6
        schoolId: school.id,
      },
    }),
    prisma.subjectGrade.upsert({
      where: { id: 'sg-social-6' },
      update: {},
      create: {
        id: 'sg-social-6',
        subjectId: subjects[3].id, // Social Studies
        classId: classes[1].id, // Class 6
        schoolId: school.id,
      },
    }),
  ]);

  // Create sample students
  const students = await Promise.all([
    prisma.student.upsert({
      where: { id: 'student-1' },
      update: {},
      create: {
        id: 'student-1',
        studentId: 'ABC24A001', // Generated student ID
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
        age: 10,
        classId: classes[0].id, // Class 5
        rollNumber: '24A5A24001', // Generated roll number
        parentContact: '+1-234-567-8901',
        address: '456 Student Lane, Learning City',
        schoolId: school.id,
        createdBy: teacher.id,
        batchId: batch2024.id,
        status: AdmissionStatus.PENDING,
      },
    }),
    prisma.student.upsert({
      where: { id: 'student-2' },
      update: {},
      create: {
        id: 'student-2',
        studentId: 'ABC23A001', // Generated student ID
        name: 'Bob Smith',
        email: 'bob.smith@example.com',
        age: 11,
        classId: classes[1].id, // Class 6
        rollNumber: '23A6A23001', // Generated roll number
        parentContact: '+1-234-567-8902',
        address: '789 Learning Avenue, Learning City',
        schoolId: school.id,
        createdBy: teacher.id,
        batchId: batch2023.id,
        status: AdmissionStatus.ACCEPTED,
      },
    }),
  ])

  console.log('✅ Students created:', students.length)

  // Create sample buses first
  const buses = await Promise.all([
    prisma.bus.upsert({
      where: { busNumber: 'ABCR01L001' },
      update: {},
      create: {
        id: 'bus-001',
        busNumber: 'ABCR01L001', // Generated bus number
        busName: 'School Bus 1',
        capacity: 50,
        driverName: 'John Driver',
        driverPhone: '+1234567890',
        conductorName: 'Jane Conductor',
        conductorPhone: '+1234567891',
        status: 'ACTIVE',
        schoolId: school.id,
      },
    }),
    prisma.bus.upsert({
      where: { busNumber: 'ABCR02M001' },
      update: {},
      create: {
        id: 'bus-002',
        busNumber: 'ABCR02M001', // Generated bus number
        busName: 'School Bus 2',
        capacity: 45,
        driverName: 'Mike Driver',
        driverPhone: '+1234567892',
        conductorName: 'Sarah Conductor',
        conductorPhone: '+1234567893',
        status: 'ACTIVE',
        schoolId: school.id,
      },
    }),
    prisma.bus.upsert({
      where: { busNumber: 'ABCR03S001' },
      update: {},
      create: {
        id: 'bus-003',
        busNumber: 'ABCR03S001', // Generated bus number
        busName: 'School Bus 3',
        capacity: 40,
        driverName: 'David Driver',
        driverPhone: '+1234567894',
        conductorName: 'Lisa Conductor',
        conductorPhone: '+1234567895',
        status: 'ACTIVE',
        schoolId: school.id,
      },
    }),
  ])

  console.log('✅ Buses created:', buses.length)

  // Create sample bus routes
  const busRoutes = await Promise.all([
    prisma.busRoute.upsert({
      where: { id: 'route-a' },
      update: {},
      create: {
        id: 'route-a',
        routeName: 'Route A',
        busId: buses[0].id,
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
        busId: buses[1].id,
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
        busId: buses[2].id,
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
        alertId: 'ABCFD20240315001', // Generated alert ID
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
        feeId: 'ABC2401001', // Generated fee ID
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
        feeId: 'ABC2401002', // Generated fee ID
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
        feeId: 'ABC2402001', // Generated fee ID
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
        payrollId: 'TCH2401001', // Generated payroll ID
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
        payrollId: 'ADM2401001', // Generated payroll ID
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

  // Create sample academic calendar events
  await Promise.all([
    prisma.academicCalendar.upsert({
      where: { id: 'calendar-1' },
      update: {},
      create: {
        id: 'calendar-1',
        title: 'School Holiday - Independence Day',
        description: 'National holiday - school closed',
        eventType: 'HOLIDAY',
        startDate: new Date('2024-08-15'),
        endDate: new Date('2024-08-15'),
        isAllDay: true,
        schoolId: school.id,
        createdBy: admin.id,
      },
    }),
    prisma.academicCalendar.upsert({
      where: { id: 'calendar-2' },
      update: {},
      create: {
        id: 'calendar-2',
        title: 'Parent-Teacher Meeting',
        description: 'Monthly parent-teacher conference',
        eventType: 'MEETING',
        startDate: new Date('2024-02-15T10:00:00'),
        endDate: new Date('2024-02-15T16:00:00'),
        location: 'School Auditorium',
        schoolId: school.id,
        createdBy: admin.id,
      },
    }),
    prisma.academicCalendar.upsert({
      where: { id: 'calendar-3' },
      update: {},
      create: {
        id: 'calendar-3',
        title: 'Annual Sports Day',
        description: 'School sports competition and activities',
        eventType: 'EVENT',
        startDate: new Date('2024-03-20'),
        endDate: new Date('2024-03-20'),
        isAllDay: true,
        location: 'School Ground',
        schoolId: school.id,
        createdBy: admin.id,
      },
    }),
  ]);

  // Create sample exams
  const exams = await Promise.all([
    prisma.exam.upsert({
      where: { id: 'exam-1' },
      update: {},
      create: {
        id: 'exam-1',
        examName: 'Mathematics Mid-Term',
        examType: 'MID_TERM',
        subjectId: subjects[0].id, // Math
        classId: classes[0].id, // Class 5
        totalMarks: 100,
        passingMarks: 40,
        duration: 120,
        instructions: 'Answer all questions. Show your work clearly.',
        schoolId: school.id,
        createdBy: admin.id,
      },
    }),
    prisma.exam.upsert({
      where: { id: 'exam-2' },
      update: {},
      create: {
        id: 'exam-2',
        examName: 'English Quiz',
        examType: 'QUIZ',
        subjectId: subjects[1].id, // English
        classId: classes[0].id, // Class 5
        totalMarks: 50,
        passingMarks: 20,
        duration: 60,
        instructions: 'Read questions carefully before answering.',
        schoolId: school.id,
        createdBy: admin.id,
      },
    }),
  ]);

  // Create sample exam results
  await Promise.all([
    prisma.examResult.upsert({
      where: { id: 'result-1' },
      update: {},
      create: {
        id: 'result-1',
        examId: exams[0].id,
        studentId: students[0].id,
        marksObtained: 85,
        grade: 'A',
        remarks: 'Excellent performance',
        isPassed: true,
        schoolId: school.id,
        createdBy: admin.id,
      },
    }),
    prisma.examResult.upsert({
      where: { id: 'result-2' },
      update: {},
      create: {
        id: 'result-2',
        examId: exams[1].id,
        studentId: students[0].id,
        marksObtained: 42,
        grade: 'B+',
        remarks: 'Good work',
        isPassed: true,
        schoolId: school.id,
        createdBy: admin.id,
      },
    }),
  ]);

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
