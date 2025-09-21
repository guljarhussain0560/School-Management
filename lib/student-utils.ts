import { prisma } from './prisma'

/**
 * Generates a unique student ID starting with "STU" followed by 8 digits
 * @returns Promise<string> - A unique student ID like "STU12345678"
 */
export async function generateUniqueStudentId(): Promise<string> {
  let attempts = 0
  const maxAttempts = 100 // Prevent infinite loops
  
  while (attempts < maxAttempts) {
    // Generate a random 8-digit number
    const randomDigits = Math.floor(Math.random() * 100000000).toString().padStart(8, '0')
    const studentId = `STU${randomDigits}`
    
    // Check if this student ID already exists
    const existingStudent = await prisma.student.findUnique({
      where: { studentId }
    })
    
    // If it doesn't exist, return it
    if (!existingStudent) {
      return studentId
    }
    
    attempts++
  }
  
  // If we couldn't generate a unique ID after max attempts, throw an error
  throw new Error('Unable to generate unique student ID after maximum attempts')
}

/**
 * Validates if a student ID follows the correct format (STU + 8 digits)
 * @param studentId - The student ID to validate
 * @returns boolean - True if valid format, false otherwise
 */
export function validateStudentIdFormat(studentId: string): boolean {
  const regex = /^STU\d{8}$/
  return regex.test(studentId)
}

/**
 * Extracts the numeric part from a student ID
 * @param studentId - The student ID (e.g., "STU12345678")
 * @returns number - The numeric part (e.g., 12345678)
 */
export function extractStudentIdNumber(studentId: string): number {
  const match = studentId.match(/^STU(\d{8})$/)
  if (!match) {
    throw new Error('Invalid student ID format')
  }
  return parseInt(match[1], 10)
}

/**
 * Gets the next sequential student ID (for reference, not used in generation)
 * @returns Promise<string> - The next sequential student ID
 */
export async function getNextSequentialStudentId(): Promise<string> {
  // Get the highest numeric student ID
  const students = await prisma.student.findMany({
    where: {
      studentId: {
        startsWith: 'STU'
      }
    },
    select: {
      studentId: true
    }
  })
  
  let maxNumber = 0
  
  students.forEach(student => {
    try {
      const number = extractStudentIdNumber(student.studentId)
      if (number > maxNumber) {
        maxNumber = number
      }
    } catch (error) {
      // Skip invalid student IDs
    }
  })
  
  const nextNumber = (maxNumber + 1).toString().padStart(8, '0')
  return `STU${nextNumber}`
}
