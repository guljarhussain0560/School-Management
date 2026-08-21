import { z } from 'zod'

export const collectFeeSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  amount: z.coerce.number().positive('Fee amount must be greater than zero'),
  paymentMode: z.enum(['CASH', 'UPI', 'BANK_TRANSFER']),
  notes: z.string().optional().nullable(),
})

export const createFeeStructureSchema = z.object({
  name: z.string().min(1, 'Fee structure name is required'),
  description: z.string().optional().nullable(),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  frequency: z.enum(['MONTHLY', 'QUARTERLY', 'SEMESTERLY', 'ANNUAL', 'ONE_TIME']).default('MONTHLY'),
  category: z.enum([
    'TUITION',
    'TRANSPORT',
    'LIBRARY',
    'LABORATORY',
    'SPORTS',
    'EXAMINATION',
    'DEVELOPMENT',
    'MISCELLANEOUS',
  ]).default('TUITION'),
  isMandatory: z.boolean().default(true),
  isActive: z.boolean().default(true),
  applicableFrom: z.string().optional().nullable(),
  applicableTo: z.string().optional().nullable(),
  classId: z.string().optional().nullable(),
  batchId: z.string().optional().nullable(),
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
  employeeName: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  basicSalary: z.coerce.number().positive('Basic salary must be positive'),
  allowances: z.coerce.number().min(0).default(0),
  deductions: z.coerce.number().min(0).default(0),
  netSalary: z.coerce.number().optional().nullable(),
  amount: z.coerce.number().optional().nullable(),
  month: z.union([z.string(), z.number()]),
  year: z.union([z.string(), z.number()]),
  status: z.string().optional().default('Pending'),
})

export type CollectFeeInput = z.infer<typeof collectFeeSchema>
export type CreateFeeStructureInput = z.infer<typeof createFeeStructureSchema>
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type CreatePayrollInput = z.infer<typeof createPayrollSchema>
