import { z } from 'zod'

export const registerSchoolSchema = z.object({
  name: z.string().min(2, 'Admin name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  schoolName: z.string().min(2, 'School name must be at least 2 characters'),
  schoolRegNo: z.string().min(1, 'School registration number is required'),
  phone: z.string().min(5, 'Valid phone number is required'),
  entityType: z.enum(['school', 'college', 'institute']).default('school'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type RegisterSchoolInput = z.infer<typeof registerSchoolSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
