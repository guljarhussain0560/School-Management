import { z } from 'zod'

export const collectFeeSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  amount: z.coerce.number().positive('Fee amount must be greater than zero'),
  paymentMode: z.enum(['CASH', 'ONLINE', 'CHEQUE', 'BANK_TRANSFER', 'CARD', 'UPI']),
  notes: z.string().optional().nullable(),
})

export const createFeeStructureSchema = z.object({
  grade: z.string().min(1, 'Grade is required'),
  tuitionFee: z.coerce.number().min(0, 'Tuition fee cannot be negative'),
  admissionFee: z.coerce.number().min(0).default(0),
  transportFee: z.coerce.number().min(0).default(0),
  libraryFee: z.coerce.number().min(0).default(0),
  activityFee: z.coerce.number().min(0).default(0),
  academicYear: z.string().min(1, 'Academic year is required'),
})

export const createExpenseSchema = z.object({
  department: z.string().min(1, 'Department is required'),
  amount: z.coerce.number().positive('Expense amount must be greater than zero'),
  description: z.string().min(3, 'Description must be at least 3 characters'),
  category: z.string().optional().default('General'),
  date: z.string().optional(),
})

export const createPayrollSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  basicSalary: z.coerce.number().positive('Basic salary must be positive'),
  allowances: z.coerce.number().min(0).default(0),
  deductions: z.coerce.number().min(0).default(0),
  month: z.string().min(1, 'Month is required'),
  year: z.string().min(1, 'Year is required'),
  status: z.enum(['Pending', 'Processed', 'Paid']).default('Pending'),
})

export type CollectFeeInput = z.infer<typeof collectFeeSchema>
export type CreateFeeStructureInput = z.infer<typeof createFeeStructureSchema>
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type CreatePayrollInput = z.infer<typeof createPayrollSchema>
