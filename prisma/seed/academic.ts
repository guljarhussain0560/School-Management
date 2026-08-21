import { PrismaClient, AdmissionStatus } from '@prisma/client'

export async function seedAcademic(
  prisma: PrismaClient,
  context: { adminId: string; teacherId: string; schoolId: string }
) {
  const { adminId, teacherId, schoolId } = context

  // 1. Batches
  const batch2024 = await prisma.studentBatch.upsert({
    where: { id: 'batch-2024' },
    update: {},
    create: {
      id: 'batch-2024',
      batchCode: '24A',
      batchName: '2024-25',
      academicYear: '2024-25',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2025-03-31'),
      description: 'Academic year 2024-25 batch',
      status: 'ACTIVE',
      schoolId,
      createdBy: adminId,
    },
  })

  const batch2023 = await prisma.studentBatch.upsert({
    where: { id: 'batch-2023' },
    update: {},
    create: {
      id: 'batch-2023',
      batchCode: '23A',
      batchName: '2023-24',
      academicYear: '2023-24',
      startDate: new Date('2023-04-01'),
      endDate: new Date('2024-03-31'),
      description: 'Academic year 2023-24 batch',
      status: 'ACTIVE',
      schoolId,
      createdBy: adminId,
    },
  })

  // 2. Subjects
  const subjects = await Promise.all([
    prisma.subject.upsert({
      where: { id: 'subject-math' },
      update: {},
      create: {
        id: 'subject-math',
        subjectCode: 'CMATH01',
        subjectName: 'Mathematics',
        description: 'Core mathematics curriculum',
        schoolId,
        createdBy: adminId,
      },
    }),
    prisma.subject.upsert({
      where: { id: 'subject-english' },
      update: {},
      create: {
        id: 'subject-english',
        subjectCode: 'LENG01',
        subjectName: 'English',
        description: 'English language and literature',
        schoolId,
        createdBy: adminId,
      },
    }),
    prisma.subject.upsert({
      where: { id: 'subject-science' },
      update: {},
      create: {
        id: 'subject-science',
        subjectCode: 'PSCI01',
        subjectName: 'Science',
        description: 'General science curriculum',
        schoolId,
        createdBy: adminId,
      },
    }),
    prisma.subject.upsert({
      where: { id: 'subject-social' },
      update: {},
      create: {
        id: 'subject-social',
        subjectCode: 'SSOC01',
        subjectName: 'Social Studies',
        description: 'History, geography, and civics',
        schoolId,
        createdBy: adminId,
      },
    }),
  ])

  // 3. Grades & Classes
  const grade5 = await prisma.grade.upsert({
    where: { id: 'grade-5' },
    update: {},
    create: {
      id: 'grade-5',
      gradeCode: 'G05',
      gradeName: 'Grade 5',
      gradeLevel: 5,
      batchId: batch2024.id,
      schoolId,
      createdBy: adminId,
    },
  })

  const grade6 = await prisma.grade.upsert({
    where: { id: 'grade-6' },
    update: {},
    create: {
      id: 'grade-6',
      gradeCode: 'G06',
      gradeName: 'Grade 6',
      gradeLevel: 6,
      batchId: batch2023.id,
      schoolId,
      createdBy: adminId,
    },
  })

  const class5 = await prisma.class.upsert({
    where: { id: 'class-5' },
    update: {},
    create: {
      id: 'class-5',
      classCode: '24A5A',
      sectionName: 'A',
      gradeId: grade5.id,
      description: 'Fifth grade class',
      capacity: 30,
      batchId: batch2024.id,
      schoolId,
      createdBy: adminId,
    },
  })

  const class6 = await prisma.class.upsert({
    where: { id: 'class-6' },
    update: {},
    create: {
      id: 'class-6',
      classCode: '23A6A',
      sectionName: 'A',
      gradeId: grade6.id,
      description: 'Sixth grade class',
      capacity: 30,
      batchId: batch2023.id,
      schoolId,
      createdBy: adminId,
    },
  })

  // 4. Students
  const students = await Promise.all([
    prisma.student.upsert({
      where: { id: 'student-1' },
      update: {},
      create: {
        id: 'student-1',
        studentId: 'ABC24A001',
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
        age: 10,
        classId: class5.id,
        rollNumber: '24A5A24001',
        parentContact: '+1-234-567-8901',
        address: '456 Student Lane, Learning City',
        schoolId,
        createdBy: teacherId,
        batchId: batch2024.id,
        status: AdmissionStatus.PENDING,
      },
    }),
    prisma.student.upsert({
      where: { id: 'student-2' },
      update: {},
      create: {
        id: 'student-2',
        studentId: 'ABC23A001',
        name: 'Bob Smith',
        email: 'bob.smith@example.com',
        age: 11,
        classId: class6.id,
        rollNumber: '23A6A23001',
        parentContact: '+1-234-567-8902',
        address: '789 Learning Avenue, Learning City',
        schoolId,
        createdBy: teacherId,
        batchId: batch2023.id,
        status: AdmissionStatus.ACCEPTED,
      },
    }),
  ])

  // 5. Calendar & Exams
  await prisma.academicCalendar.upsert({
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
      schoolId,
      createdBy: adminId,
    },
  })

  const exam1 = await prisma.exam.upsert({
    where: { id: 'exam-1' },
    update: {},
    create: {
      id: 'exam-1',
      examName: 'Mathematics Mid-Term',
      examType: 'MID_TERM',
      subjectId: subjects[0].id,
      classId: class5.id,
      totalMarks: 100,
      passingMarks: 40,
      duration: 120,
      instructions: 'Answer all questions.',
      schoolId,
      createdBy: adminId,
    },
  })

  await prisma.examResult.upsert({
    where: { id: 'result-1' },
    update: {},
    create: {
      id: 'result-1',
      examId: exam1.id,
      studentId: students[0].id,
      marksObtained: 85,
      grade: 'A',
      remarks: 'Excellent performance',
      isPassed: true,
      schoolId,
      createdBy: adminId,
    },
  })

  return { batch2024, batch2023, subjects, classes: [class5, class6], students }
}
