export * from './employee'
export * from './academic'
export * from './operations'
export * from './auth'
export * from './financial'

import { ZodSchema, ZodError } from 'zod'

/**
 * Validates data against a Zod schema, returning either typed parsed data or formatted errors
 */
export function validateData<T>(schema: ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  const errors = (result.error as ZodError).issues.map(
    issue => `${issue.path.join('.') || 'field'}: ${issue.message}`
  )
  return { success: false, errors }
}
