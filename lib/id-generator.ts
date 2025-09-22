/**
 * Comprehensive ID Generation System
 * Generates structured, human-readable IDs for all entities
 */

export interface SchoolConfig {
  schoolCode: string;
  academicYear: string;
}

export interface BatchConfig {
  batchCode: string;
  academicYear: string;
}

export interface ClassConfig {
  batchCode: string;
  level: number;
  section: string;
}

export interface SubjectConfig {
  category: string;
  subject: string;
  level: number;
}

export interface BusConfig {
  route: number;
  capacity: 'LARGE' | 'MEDIUM' | 'SMALL';
}

export interface ExamConfig {
  examType: string;
  subjectCode: string;
  classCode: string;
  date: string;
}

export class IDGenerator {
  private static schoolCode: string = 'SCH'; // Default, should be set per school
  private static academicYear: string = '2024-25'; // Default, should be set per school

  /**
   * Initialize the ID generator with school-specific configuration
   */
  static initialize(config: SchoolConfig) {
    this.schoolCode = config.schoolCode;
    this.academicYear = config.academicYear;
  }

  /**
   * Generate Student ID
   * Format: {SCHOOL_CODE}{YEAR}{BATCH}{SEQUENCE}
   * Example: "ABC24A001", "ABC24B001"
   */
  static generateStudentId(batchCode: string, sequence: number): string {
    const year = this.academicYear.slice(-2); // 24 from 2024-25
    return `${this.schoolCode}${year}${batchCode}${sequence.toString().padStart(3, '0')}`;
  }

  /**
   * Generate Strong 12-Character Employee ID
   * Format: {ROLE_CODE}{YEAR}{RANDOM_STRONG}
   * Example: "ADM24A7K9M2X1", "TCH24B8L3N5Y2", "TRP24C9M4O6Z3"
   */
  static generateEmployeeId(role: 'ADMIN' | 'TEACHER' | 'TRANSPORT', sequence: number): string {
    const year = this.academicYear.slice(-2);
    const roleCode = role === 'ADMIN' ? 'ADM' : role === 'TEACHER' ? 'TCH' : 'TRP';
    
    // Generate strong random 7-character suffix
    const strongSuffix = this.generateStrongRandomSuffix(7);
    
    return `${roleCode}${year}${strongSuffix}`;
  }

  /**
   * Generate Strong Random Suffix
   * Uses a mix of letters and numbers with specific patterns for security
   */
  private static generateStrongRandomSuffix(length: number): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes confusing characters
    const vowels = 'AEIOU';
    const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
    const numbers = '23456789';
    
    let result = '';
    
    for (let i = 0; i < length; i++) {
      if (i % 3 === 0) {
        // Every 3rd character is a consonant for readability
        result += consonants[Math.floor(Math.random() * consonants.length)];
      } else if (i % 3 === 1) {
        // Every 3rd+1 character is a number
        result += numbers[Math.floor(Math.random() * numbers.length)];
      } else {
        // Every 3rd+2 character is a vowel or consonant
        const pool = Math.random() < 0.3 ? vowels : consonants;
        result += pool[Math.floor(Math.random() * pool.length)];
      }
    }
    
    return result;
  }

  /**
   * Generate Class Code
   * Format: {BATCH_CODE}{LEVEL}{SECTION}
   * Example: "A5A", "B10B", "CNUR"
   */
  static generateClassCode(batchCode: string, level: number, section: string): string {
    if (level === 0) return `${batchCode}NUR`; // Nursery
    return `${batchCode}${level}${section}`;
  }

  /**
   * Generate Subject Code
   * Format: {CATEGORY}{SUBJECT}{LEVEL}
   * Example: "CMATH01", "LENG01", "PSCI01"
   */
  static generateSubjectCode(category: string, subject: string, level: number): string {
    const catCode = category.slice(0, 1).toUpperCase();
    const subCode = subject.slice(0, 3).toUpperCase();
    return `${catCode}${subCode}${level.toString().padStart(2, '0')}`;
  }

  /**
   * Generate Bus Number
   * Format: {SCHOOL_CODE}{ROUTE}{CAPACITY}{SEQUENCE}
   * Example: "ABCR01L001", "ABCR02M002"
   */
  static generateBusNumber(route: number, capacity: 'LARGE' | 'MEDIUM' | 'SMALL', sequence: number): string {
    const capCode = capacity === 'LARGE' ? 'L' : capacity === 'MEDIUM' ? 'M' : 'S';
    return `${this.schoolCode}R${route.toString().padStart(2, '0')}${capCode}${sequence.toString().padStart(3, '0')}`;
  }

  /**
   * Generate Roll Number
   * Format: {CLASS_CODE}{ADMISSION_YEAR}{SEQUENCE}
   * Example: "A5A24001", "B10B24015"
   */
  static generateRollNumber(classCode: string, admissionYear: string, sequence: number): string {
    const year = admissionYear.slice(-2);
    return `${classCode}${year}${sequence.toString().padStart(3, '0')}`;
  }

  /**
   * Generate Exam ID
   * Format: {EXAM_TYPE}{SUBJECT_CODE}{CLASS_CODE}{DATE}
   * Example: "MTCMATH01A5A20240315"
   */
  static generateExamId(examType: string, subjectCode: string, classCode: string, date: string): string {
    const typeCode = examType.slice(0, 2).toUpperCase();
    const dateCode = date.replace(/-/g, '');
    return `${typeCode}${subjectCode}${classCode}${dateCode}`;
  }

  /**
   * Generate Batch Code
   * Format: {YEAR}{SEQUENCE}
   * Example: "24A", "24B", "25A"
   */
  static generateBatchCode(academicYear: string, sequence: number): string {
    const year = academicYear.slice(-2);
    const batchLetter = String.fromCharCode(65 + (sequence - 1)); // A, B, C, etc.
    return `${year}${batchLetter}`;
  }

  /**
   * Generate Assignment ID
   * Format: {SUBJECT_CODE}{CLASS_CODE}{DATE}{SEQUENCE}
   * Example: "MATH01A5A20240315001"
   */
  static generateAssignmentId(subjectCode: string, classCode: string, date: string, sequence: number): string {
    const dateCode = date.replace(/-/g, '');
    return `${subjectCode}${classCode}${dateCode}${sequence.toString().padStart(3, '0')}`;
  }

  /**
   * Generate Fee Collection ID
   * Format: {SCHOOL_CODE}{YEAR}{MONTH}{SEQUENCE}
   * Example: "ABC2403001", "ABC2404001"
   */
  static generateFeeCollectionId(year: string, month: string, sequence: number): string {
    const yearCode = year.slice(-2);
    const monthCode = month.padStart(2, '0');
    return `${this.schoolCode}${yearCode}${monthCode}${sequence.toString().padStart(3, '0')}`;
  }

  /**
   * Generate Payroll ID
   * Format: {ROLE_CODE}{YEAR}{MONTH}{SEQUENCE}
   * Example: "ADM2403001", "TCH2403001"
   */
  static generatePayrollId(role: 'ADMIN' | 'TEACHER' | 'TRANSPORT', year: string, month: string, sequence: number): string {
    const roleCode = role === 'ADMIN' ? 'ADM' : role === 'TEACHER' ? 'TCH' : 'TRP';
    const yearCode = year.slice(-2);
    const monthCode = month.padStart(2, '0');
    return `${roleCode}${yearCode}${monthCode}${sequence.toString().padStart(3, '0')}`;
  }

  /**
   * Generate Maintenance Log ID
   * Format: {SCHOOL_CODE}{FACILITY_CODE}{DATE}{SEQUENCE}
   * Example: "ABCBUS20240315001"
   */
  static generateMaintenanceLogId(facilityCode: string, date: string, sequence: number): string {
    const dateCode = date.replace(/-/g, '');
    return `${this.schoolCode}${facilityCode}${dateCode}${sequence.toString().padStart(3, '0')}`;
  }

  /**
   * Generate Safety Alert ID
   * Format: {SCHOOL_CODE}{ALERT_TYPE}{DATE}{SEQUENCE}
   * Example: "ABCFD20240315001"
   */
  static generateSafetyAlertId(alertType: string, date: string, sequence: number): string {
    const dateCode = date.replace(/-/g, '');
    const typeCode = alertType.slice(0, 2).toUpperCase();
    return `${this.schoolCode}${typeCode}${dateCode}${sequence.toString().padStart(3, '0')}`;
  }

  /**
   * Parse Student ID to extract information
   */
  static parseStudentId(studentId: string): { schoolCode: string; year: string; batch: string; sequence: number } {
    const schoolCode = studentId.slice(0, 3);
    const year = studentId.slice(3, 5);
    const batch = studentId.slice(5, 6);
    const sequence = parseInt(studentId.slice(6));
    return { schoolCode, year, batch, sequence };
  }

  /**
   * Parse Employee ID to extract information
   */
  static parseEmployeeId(employeeId: string): { role: string; year: string; sequence: number } {
    const role = employeeId.slice(0, 3);
    const year = employeeId.slice(3, 5);
    const sequence = parseInt(employeeId.slice(5));
    return { role, year, sequence };
  }

  /**
   * Get next sequence number for a given prefix
   */
  static async getNextSequence(prefix: string, existingIds: string[]): Promise<number> {
    const matchingIds = existingIds.filter(id => id.startsWith(prefix));
    if (matchingIds.length === 0) return 1;
    
    const sequences = matchingIds.map(id => {
      const sequencePart = id.slice(prefix.length);
      return parseInt(sequencePart) || 0;
    });
    
    return Math.max(...sequences) + 1;
  }

  /**
   * Validate ID format
   */
  static validateId(id: string, type: 'student' | 'employee' | 'class' | 'subject' | 'bus'): boolean {
    switch (type) {
      case 'student':
        return /^[A-Z]{3}\d{2}[A-Z]\d{3}$/.test(id);
      case 'employee':
        return /^(ADM|TCH|TRP)\d{2}[A-Z0-9]{7}$/.test(id); // Updated for 12-char format
      case 'class':
        return /^[A-Z]\d{1,2}[A-Z]$|^[A-Z]NUR$/.test(id);
      case 'subject':
        return /^[A-Z][A-Z]{3}\d{2}$/.test(id);
      case 'bus':
        return /^[A-Z]{3}R\d{2}[LMS]\d{3}$/.test(id);
      default:
        return false;
    }
  }
}

/**
 * Predefined subject categories and codes
 */
export const SUBJECT_CATEGORIES = {
  CORE: 'C',      // Core subjects (Math, Science, English)
  LANGUAGE: 'L',  // Languages (Hindi, Sanskrit, French)
  PHYSICAL: 'P',  // Physical subjects (PE, Sports)
  ARTS: 'A',      // Arts (Music, Drawing, Dance)
  COMPUTER: 'I',  // Computer/IT subjects
  SOCIAL: 'S',    // Social studies (History, Geography, Civics)
  COMMERCE: 'M',  // Commerce subjects (Economics, Business)
  SCIENCE: 'N',   // Natural sciences (Biology, Chemistry, Physics)
} as const;

/**
 * Predefined facility codes for maintenance
 */
export const FACILITY_CODES = {
  BUS: 'BUS',
  CLASSROOM: 'CLS',
  LABORATORY: 'LAB',
  LIBRARY: 'LIB',
  AUDITORIUM: 'AUD',
  PLAYGROUND: 'PLG',
  CAFETERIA: 'CAF',
  OFFICE: 'OFF',
  WASHROOM: 'WAS',
  GATE: 'GAT',
} as const;

/**
 * Predefined alert type codes
 */
export const ALERT_TYPE_CODES = {
  FIRE_DRILL: 'FD',
  ACCIDENT: 'AC',
  DELAY: 'DL',
  MAINTENANCE: 'MT',
  OTHER: 'OT',
} as const;
