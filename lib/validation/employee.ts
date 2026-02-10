import { z } from 'zod'

export const createEmployeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
  salary: z.union([z.number(), z.string()]).transform(val => {
    const num = typeof val === 'number' ? val : parseFloat(val)
    if (isNaN(num)) throw new Error('Salary must be a valid number')
    return num
  }),
  emergencyContact: z.string().optional().nullable(),
  emergencyPhone: z.string().optional().nullable(),
  qualifications: z.string().optional().nullable(),
  experience: z.string().optional().nullable(),
  bankAccount: z.string().optional().nullable(),
  ifscCode: z.string().optional().nullable(),
  panNumber: z.string().optional().nullable(),
  aadharNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const updateEmployeeSchema = createEmployeeSchema.partial().extend({
  id: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE']).optional(),
})

export const employeeQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional().default(''),
  field: z.enum(['name', 'employeeId', 'email', 'phone', 'position']).default('name'),
  department: z.string().optional().default('all'),
  status: z.string().optional().default('all'),
})

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>
export type EmployeeQueryParams = z.infer<typeof employeeQuerySchema>
