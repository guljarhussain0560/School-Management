import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const schoolId = session.user.schoolId!;
    const { students } = await request.json();

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { error: 'Students array is required' },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    // Validate all students first
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const rowNumber = i + 1;

      // Validate required fields
      const requiredFields = ['name', 'classId', 'parentName', 'parentPhone'];
      for (const field of requiredFields) {
        if (!student[field]) {
          errors.push(`Row ${rowNumber}: ${field} is required`);
          continue;
        }
      }

      // Validate email format if provided
      if (student.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
        errors.push(`Row ${rowNumber}: Invalid email format`);
        continue;
      }

      // Validate parent email format if provided
      if (student.parentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.parentEmail)) {
        errors.push(`Row ${rowNumber}: Invalid parent email format`);
        continue;
      }

      // Check if class exists
      const classExists = await prisma.class.findFirst({
        where: { id: student.classId, schoolId }
      });

      if (!classExists) {
        errors.push(`Row ${rowNumber}: Class not found`);
        continue;
      }

      // Check if batch exists (if provided)
      if (student.batchId) {
        const batchExists = await prisma.studentBatch.findFirst({
          where: { id: student.batchId, schoolId }
        });

        if (!batchExists) {
          errors.push(`Row ${rowNumber}: Batch not found`);
          continue;
        }
      }

      // Validate date of birth if provided
      if (student.dateOfBirth) {
        const dob = new Date(student.dateOfBirth);
        if (isNaN(dob.getTime())) {
          errors.push(`Row ${rowNumber}: Invalid date of birth`);
          continue;
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    // Get all classes for the school to generate proper student IDs
    const classes = await prisma.class.findMany({
      where: { schoolId },
      select: { id: true, classCode: true }
    });

    // Generate unique student IDs
    const studentIds = new Set();
    const processedStudents = students.map(student => {
      let studentId;
      do {
        // Generate student ID based on class and current year
        const classCode = classes.find(c => c.id === student.classId)?.classCode || 'CLS';
        const year = new Date().getFullYear().toString().slice(-2);
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        studentId = `${classCode}${year}${randomNum}`;
      } while (studentIds.has(studentId));
      
      studentIds.add(studentId);
      
      return {
        studentId,
        name: student.name,
        email: student.email,
        phone: student.phone,
        age: student.age ? parseInt(student.age) : 0,
        rollNumber: student.rollNumber || null,
        dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : null,
        gender: student.gender,
        address: student.address,
        city: student.city,
        state: student.state,
        pincode: student.pincode,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        parentEmail: student.parentEmail,
        emergencyContact: student.emergencyContact,
        emergencyPhone: student.emergencyPhone,
        medicalConditions: student.medicalConditions,
        allergies: student.allergies,
        previousSchool: student.previousSchool,
        transportRequired: student.transportRequired || false,
        classId: student.classId,
        batchId: student.batchId,
        schoolId,
        createdBy: session.user.id
      };
    });

    // Create students in batch
    const createdStudents = await prisma.student.createMany({
      data: processedStudents
    });

    return NextResponse.json({ 
      message: `${createdStudents.count} students created successfully`,
      count: createdStudents.count
    });

  } catch (error) {
    console.error('Error creating bulk students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
