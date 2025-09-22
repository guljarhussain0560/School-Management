/**
 * School ID Generation Algorithm
 * Format: SCH + 9 characters (mix of digits and letters)
 * Total: 12 characters
 * 
 * Algorithm:
 * 1. Start with "SCH"
 * 2. Add 2 digits from registration number (last 2 digits)
 * 3. Add 2 letters from school name (first 2 consonants, uppercase)
 * 4. Add 2 digits from current year (last 2 digits)
 * 5. Add 3 random alphanumeric characters
 */

export function generateSchoolId(schoolName: string, registrationNumber: string): string {
  // Start with "SCH"
  let schoolId = "SCH";
  
  // Add 2 digits from registration number (last 2 digits)
  const regDigits = registrationNumber.replace(/\D/g, ''); // Extract only digits
  const lastTwoDigits = regDigits.slice(-2).padStart(2, '0');
  schoolId += lastTwoDigits;
  
  // Add 2 letters from school name (first 2 consonants, uppercase)
  const consonants = schoolName.replace(/[^a-zA-Z]/g, '').replace(/[aeiouAEIOU]/g, '');
  const firstTwoConsonants = consonants.slice(0, 2).toUpperCase().padEnd(2, 'X');
  schoolId += firstTwoConsonants;
  
  // Add 2 digits from current year (last 2 digits)
  const currentYear = new Date().getFullYear().toString().slice(-2);
  schoolId += currentYear;
  
  // Add 3 random alphanumeric characters
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (let i = 0; i < 3; i++) {
    schoolId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return schoolId;
}

/**
 * Validate school ID format
 */
export function validateSchoolId(schoolId: string): boolean {
  const pattern = /^SCH\d{2}[A-Z]{2}\d{2}[A-Z0-9]{3}$/;
  return pattern.test(schoolId);
}

/**
 * Extract information from school ID
 */
export function parseSchoolId(schoolId: string) {
  if (!validateSchoolId(schoolId)) {
    throw new Error('Invalid school ID format');
  }
  
  return {
    prefix: schoolId.slice(0, 3), // SCH
    regDigits: schoolId.slice(3, 5), // Last 2 digits from registration
    consonants: schoolId.slice(5, 7), // First 2 consonants from name
    year: schoolId.slice(7, 9), // Year digits
    random: schoolId.slice(9, 12) // Random characters
  };
}

// Example usage:
// const schoolId = generateSchoolId("ABC International School", "REG123456789");
// Result: SCH89AB24X7A (example)
