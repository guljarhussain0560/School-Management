import { PrismaClient } from '@prisma/client'

export async function seedFinancial(
  prisma: PrismaClient,
  context: { adminId: string; schoolId: string; studentIds: string[] }
) {
  const { adminId, schoolId, studentIds } = context

  // 1. Fee Collections
  const feeCollections = await Promise.all([
    prisma.feeCollection.create({
      data: {
        feeId: 'ABC2401001',
        studentId: studentIds[0] || 'student-1',
        amount: 5000,
        paymentMode: 'CASH',
        collectedBy: adminId,
        schoolId,
        notes: 'Monthly fee payment',
        date: new Date('2024-01-15'),
      },
    }),
    prisma.feeCollection.create({
      data: {
        feeId: 'ABC2401002',
        studentId: studentIds[1] || 'student-2',
        amount: 4500,
        paymentMode: 'UPI',
        collectedBy: adminId,
        schoolId,
        notes: 'Monthly fee payment',
        date: new Date('2024-01-16'),
      },
    }),
  ])

  // 2. Payroll
  const payrollRecords = await Promise.all([
    prisma.payroll.create({
      data: {
        payrollId: 'TCH2401001',
        department: 'Teaching',
        amount: 55000,
        month: 1,
        year: 2024,
        status: 'APPROVED',
        uploadedBy: adminId,
      },
    }),
    prisma.payroll.create({
      data: {
        payrollId: 'ADM2401001',
        department: 'Administration',
        amount: 45000,
        month: 1,
        year: 2024,
        status: 'PENDING',
        uploadedBy: adminId,
      },
    }),
  ])

  // 3. Budget Expenses
  const budgetExpenses = await Promise.all([
    prisma.budgetExpense.create({
      data: {
        department: 'Academic',
        amount: 15000,
        description: 'Textbooks and stationery',
        status: 'APPROVED',
        createdBy: adminId,
      },
    }),
    prisma.budgetExpense.create({
      data: {
        department: 'Maintenance',
        amount: 8000,
        description: 'Repair work for classroom furniture',
        status: 'PENDING',
        createdBy: adminId,
      },
    }),
  ])

  return { feeCollections, payrollRecords, budgetExpenses }
}
