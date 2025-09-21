import { prisma } from './prisma'

/**
 * Generates a unique employee ID starting with "EMP" followed by 6 digits
 * @returns Promise<string> - A unique employee ID like "EMP123456"
 */
export async function generateUniqueEmployeeId(): Promise<string> {
  let attempts = 0
  const maxAttempts = 100 // Prevent infinite loops
  
  while (attempts < maxAttempts) {
    // Generate a random 6-digit number
    const randomDigits = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
    const employeeId = `EMP${randomDigits}`
    
    // Check if this employee ID already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { employeeId }
    })
    
    // If it doesn't exist, return it
    if (!existingEmployee) {
      return employeeId
    }
    
    attempts++
  }
  
  // If we couldn't generate a unique ID after max attempts, throw an error
  throw new Error('Unable to generate unique employee ID after maximum attempts')
}

/**
 * Validates if an employee ID follows the correct format (EMP + 6 digits)
 * @param employeeId - The employee ID to validate
 * @returns boolean - True if valid format, false otherwise
 */
export function validateEmployeeIdFormat(employeeId: string): boolean {
  const regex = /^EMP\d{6}$/
  return regex.test(employeeId)
}

/**
 * Extracts the numeric part from an employee ID
 * @param employeeId - The employee ID (e.g., "EMP123456")
 * @returns number - The numeric part (e.g., 123456)
 */
export function extractEmployeeIdNumber(employeeId: string): number {
  const match = employeeId.match(/^EMP(\d{6})$/)
  if (!match) {
    throw new Error('Invalid employee ID format')
  }
  return parseInt(match[1], 10)
}

/**
 * Gets the next sequential employee ID (for reference, not used in generation)
 * @returns Promise<string> - The next sequential employee ID
 */
export async function getNextSequentialEmployeeId(): Promise<string> {
  // Get the highest numeric employee ID
  const employees = await prisma.employee.findMany({
    where: {
      employeeId: {
        startsWith: 'EMP'
      }
    },
    select: {
      employeeId: true
    }
  })
  
  let maxNumber = 0
  
  employees.forEach(employee => {
    try {
      const number = extractEmployeeIdNumber(employee.employeeId)
      if (number > maxNumber) {
        maxNumber = number
      }
    } catch (error) {
      // Skip invalid employee IDs
    }
  })
  
  const nextNumber = (maxNumber + 1).toString().padStart(6, '0')
  return `EMP${nextNumber}`
}
