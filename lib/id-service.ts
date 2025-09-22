/**
 * Backend ID Generation Service
 * Handles ID generation with database integration
 */

import { IDGenerator } from './id-generator';
import { prisma } from './prisma';

export class IDService {
  /**
   * Generate Student ID with database sequence
   */
  static async generateStudentId(batchCode: string, schoolId: string): Promise<string> {
    // Get existing student IDs for this batch
    const existingStudents = await prisma.student.findMany({
      where: { 
        schoolId,
        batch: { batchCode }
      },
      select: { studentId: true }
    });

    const existingIds = existingStudents.map(s => s.studentId);
    const sequence = await IDGenerator.getNextSequence(
      `${IDGenerator['schoolCode']}${IDGenerator['academicYear'].slice(-2)}${batchCode}`,
      existingIds
    );

    return IDGenerator.generateStudentId(batchCode, sequence);
  }

  /**
   * Generate Employee ID with database sequence
   */
  static async generateEmployeeId(role: 'ADMIN' | 'TEACHER' | 'TRANSPORT', schoolId: string): Promise<string> {
    // Get existing employee IDs for this role
    const existingEmployees = await prisma.employee.findMany({
      where: { 
        schoolId,
        // Filter by role based on department or position
      },
      select: { employeeId: true }
    });

    const existingIds = existingEmployees.map(e => e.employeeId);
    
    // Generate a unique ID with retry mechanism for strong random IDs
    let attempts = 0;
    let newId: string;
    
    do {
      newId = IDGenerator.generateEmployeeId(role, attempts);
      attempts++;
      
      // Prevent infinite loop
      if (attempts > 100) {
        throw new Error('Unable to generate unique employee ID after 100 attempts');
      }
    } while (existingIds.includes(newId));

    return newId;
  }

  /**
   * Generate Class Code
   */
  static async generateClassCode(batchCode: string, level: number, section: string, schoolId: string): Promise<string> {
    const classCode = IDGenerator.generateClassCode(batchCode, level, section);
    
    // Check if class code already exists
    const existing = await prisma.class.findFirst({
      where: { classCode, schoolId }
    });

    if (existing) {
      throw new Error(`Class code ${classCode} already exists`);
    }

    return classCode;
  }

  /**
   * Generate Subject Code
   */
  static async generateSubjectCode(category: string, subject: string, level: number): Promise<string> {
    const subjectCode = IDGenerator.generateSubjectCode(category, subject, level);
    
    // Check if subject code already exists
    const existing = await prisma.subject.findFirst({
      where: { subjectCode }
    });

    if (existing) {
      throw new Error(`Subject code ${subjectCode} already exists`);
    }

    return subjectCode;
  }

  /**
   * Generate Bus Number
   */
  static async generateBusNumber(route: number, capacity: 'LARGE' | 'MEDIUM' | 'SMALL', schoolId: string): Promise<string> {
    // Get existing bus numbers
    const existingBuses = await prisma.bus.findMany({
      where: { schoolId },
      select: { busNumber: true }
    });

    const existingIds = existingBuses.map(b => b.busNumber);
    const sequence = await IDGenerator.getNextSequence(
      `${IDGenerator['schoolCode']}R${route.toString().padStart(2, '0')}${capacity === 'LARGE' ? 'L' : capacity === 'MEDIUM' ? 'M' : 'S'}`,
      existingIds
    );

    return IDGenerator.generateBusNumber(route, capacity, sequence);
  }

  /**
   * Generate Roll Number
   */
  static async generateRollNumber(classCode: string, admissionYear: string, schoolId: string): Promise<string> {
    // Get existing roll numbers for this class
    const existingStudents = await prisma.student.findMany({
      where: { 
        schoolId,
        class: { classCode }
      },
      select: { rollNumber: true }
    });

    const existingIds = existingStudents.map(s => s.rollNumber);
    const sequence = await IDGenerator.getNextSequence(
      `${classCode}${admissionYear.slice(-2)}`,
      existingIds
    );

    return IDGenerator.generateRollNumber(classCode, admissionYear, sequence);
  }

  /**
   * Generate Batch Code
   */
  static async generateBatchCode(academicYear: string, schoolId: string): Promise<string> {
    // Get existing batch codes for this academic year
    const existingBatches = await prisma.studentBatch.findMany({
      where: { 
        schoolId,
        academicYear
      },
      select: { batchCode: true }
    });

    const existingIds = existingBatches.map(b => b.batchCode);
    const sequence = await IDGenerator.getNextSequence(
      academicYear.slice(-2),
      existingIds
    );

    return IDGenerator.generateBatchCode(academicYear, sequence);
  }

  /**
   * Generate Assignment ID
   */
  static async generateAssignmentId(subjectCode: string, classCode: string, date: string): Promise<string> {
    const dateCode = date.replace(/-/g, '');
    const prefix = `${subjectCode}${classCode}${dateCode}`;
    
    // Get existing assignment IDs for this prefix
    const existingAssignments = await prisma.assignment.findMany({
      where: {
        subject: { subjectCode },
        class: { classCode },
        createdAt: {
          gte: new Date(date),
          lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
        }
      },
      select: { assignmentId: true }
    });

    const existingIds = existingAssignments.map(a => a.assignmentId);
    const sequence = await IDGenerator.getNextSequence(prefix, existingIds);

    return IDGenerator.generateAssignmentId(subjectCode, classCode, date, sequence);
  }

  /**
   * Generate Fee Collection ID
   */
  static async generateFeeCollectionId(year: string, month: string, schoolId: string): Promise<string> {
    const prefix = `${IDGenerator['schoolCode']}${year.slice(-2)}${month.padStart(2, '0')}`;
    
    // Get existing fee collection IDs for this month
    const existingFees = await prisma.feeCollection.findMany({
      where: { 
        schoolId,
        date: {
          gte: new Date(parseInt(year), parseInt(month) - 1, 1),
          lt: new Date(parseInt(year), parseInt(month), 1)
        }
      },
      select: { feeId: true }
    });

    const existingIds = existingFees.map(f => f.feeId);
    const sequence = await IDGenerator.getNextSequence(prefix, existingIds);

    return IDGenerator.generateFeeCollectionId(year, month, sequence);
  }

  /**
   * Generate Payroll ID
   */
  static async generatePayrollId(role: 'ADMIN' | 'TEACHER' | 'TRANSPORT', year: string, month: string, schoolId: string): Promise<string> {
    const roleCode = role === 'ADMIN' ? 'ADM' : role === 'TEACHER' ? 'TCH' : 'TRP';
    const prefix = `${roleCode}${year.slice(-2)}${month.padStart(2, '0')}`;
    
    // Get existing payroll IDs for this month and role
    const existingPayrolls = await prisma.payroll.findMany({
      where: { 
        schoolId,
        month: parseInt(month),
        year: parseInt(year),
        // Filter by role based on employee role
      },
      select: { payrollId: true }
    });

    const existingIds = existingPayrolls.map(p => p.payrollId);
    const sequence = await IDGenerator.getNextSequence(prefix, existingIds);

    return IDGenerator.generatePayrollId(role, year, month, sequence);
  }

  /**
   * Generate Maintenance Log ID
   */
  static async generateMaintenanceLogId(facilityCode: string, date: string, schoolId: string): Promise<string> {
    const dateCode = date.replace(/-/g, '');
    const prefix = `${IDGenerator['schoolCode']}${facilityCode}${dateCode}`;
    
    // Get existing maintenance log IDs for this facility and date
    const existingLogs = await prisma.maintenanceLog.findMany({
      where: { 
        schoolId,
        facility: facilityCode,
        createdAt: {
          gte: new Date(date),
          lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
        }
      },
      select: { logId: true }
    });

    const existingIds = existingLogs.map(l => l.logId);
    const sequence = await IDGenerator.getNextSequence(prefix, existingIds);

    return IDGenerator.generateMaintenanceLogId(facilityCode, date, sequence);
  }

  /**
   * Generate Safety Alert ID
   */
  static async generateSafetyAlertId(alertType: string, date: string, schoolId: string): Promise<string> {
    const dateCode = date.replace(/-/g, '');
    const typeCode = alertType.slice(0, 2).toUpperCase();
    const prefix = `${IDGenerator['schoolCode']}${typeCode}${dateCode}`;
    
    // Get existing safety alert IDs for this type and date
    const existingAlerts = await prisma.safetyAlert.findMany({
      where: { 
        schoolId,
        type: alertType as any,
        createdAt: {
          gte: new Date(date),
          lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
        }
      },
      select: { alertId: true }
    });

    const existingIds = existingAlerts.map(a => a.alertId);
    const sequence = await IDGenerator.getNextSequence(prefix, existingIds);

    return IDGenerator.generateSafetyAlertId(alertType, date, sequence);
  }

  /**
   * Initialize ID generator with school configuration
   */
  static async initializeSchool(schoolId: string) {
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { schoolCode: true, name: true }
    });

    if (!school) {
      throw new Error('School not found');
    }

    // Get current academic year from active batches
    const activeBatch = await prisma.studentBatch.findFirst({
      where: { 
        schoolId,
        status: 'ACTIVE'
      },
      select: { academicYear: true },
      orderBy: { createdAt: 'desc' }
    });

    const academicYear = activeBatch?.academicYear || '2024-25';

    IDGenerator.initialize({
      schoolCode: school.schoolCode,
      academicYear
    });
  }

  /**
   * Validate and parse existing IDs
   */
  static validateAndParseId(id: string, type: 'student' | 'employee' | 'class' | 'subject' | 'bus'): any {
    if (!IDGenerator.validateId(id, type)) {
      throw new Error(`Invalid ${type} ID format: ${id}`);
    }

    switch (type) {
      case 'student':
        return IDGenerator.parseStudentId(id);
      case 'employee':
        return IDGenerator.parseEmployeeId(id);
      default:
        return { id };
    }
  }
}
