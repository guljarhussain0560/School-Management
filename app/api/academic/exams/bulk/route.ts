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
    const { exams } = await request.json();

    if (!Array.isArray(exams) || exams.length === 0) {
      return NextResponse.json(
        { error: 'Exams array is required' },
        { status: 400 }
      );
    }

    const validExamTypes = ['QUIZ', 'TEST', 'MID_TERM', 'FINAL', 'ASSIGNMENT', 'PROJECT', 'PRACTICAL', 'ORAL'];
    const results = [];
    const errors = [];

    // Validate all exams first
    for (let i = 0; i < exams.length; i++) {
      const exam = exams[i];
      const rowNumber = i + 1;

      // Validate required fields
      const requiredFields = ['examName', 'examType', 'subjectId', 'classId', 'totalMarks', 'passingMarks', 'duration'];
      for (const field of requiredFields) {
        if (!exam[field]) {
          errors.push(`Row ${rowNumber}: ${field} is required`);
          continue;
        }
      }

      // Validate exam type
      if (exam.examType && !validExamTypes.includes(exam.examType)) {
        errors.push(`Row ${rowNumber}: Invalid exam type`);
        continue;
      }

      // Validate marks
      if (exam.passingMarks > exam.totalMarks) {
        errors.push(`Row ${rowNumber}: Passing marks cannot be greater than total marks`);
        continue;
      }

      // Check if subject exists
      const subject = await prisma.subject.findFirst({
        where: { id: exam.subjectId, schoolId }
      });

      if (!subject) {
        errors.push(`Row ${rowNumber}: Subject not found`);
        continue;
      }

      // Check if class exists
      const classExists = await prisma.class.findFirst({
        where: { id: exam.classId, schoolId }
      });

      if (!classExists) {
        errors.push(`Row ${rowNumber}: Class not found`);
        continue;
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    // Create exams in batch
    const createdExams = await prisma.exam.createMany({
      data: exams.map(exam => ({
        examName: exam.examName,
        examType: exam.examType,
        subjectId: exam.subjectId,
        classId: exam.classId,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        duration: exam.duration,
        instructions: exam.instructions,
        schoolId,
        createdBy: session.user.id
      }))
    });

    return NextResponse.json({ 
      message: `${createdExams.count} exams created successfully`,
      count: createdExams.count
    });

  } catch (error) {
    console.error('Error creating bulk exams:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
