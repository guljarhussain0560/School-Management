import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const schoolId = session.user.schoolId!;
    const examId = params.id;

    const exam = await prisma.exam.findFirst({
      where: { id: examId, schoolId },
      include: {
        subject: {
          select: {
            id: true,
            subjectName: true
          }
        },
        class: {
          select: {
            id: true,
            className: true
          }
        },
        schedules: {
          orderBy: { examDate: 'asc' }
        },
        results: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                rollNumber: true
              }
            }
          }
        }
      }
    });

    if (!exam) {
      return NextResponse.json(
        { error: 'Exam not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ exam });

  } catch (error) {
    console.error('Error fetching exam:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const schoolId = session.user.schoolId!;
    const examId = params.id;
    const data = await request.json();

    // Check if exam exists
    const existingExam = await prisma.exam.findFirst({
      where: { id: examId, schoolId }
    });

    if (!existingExam) {
      return NextResponse.json(
        { error: 'Exam not found' },
        { status: 404 }
      );
    }

    // Validate exam type if provided
    if (data.examType) {
      const validExamTypes = ['QUIZ', 'TEST', 'MID_TERM', 'FINAL', 'ASSIGNMENT', 'PROJECT', 'PRACTICAL', 'ORAL'];
      if (!validExamTypes.includes(data.examType)) {
        return NextResponse.json(
          { error: 'Invalid exam type' },
          { status: 400 }
        );
      }
    }

    // Validate marks if provided
    if (data.passingMarks && data.totalMarks && data.passingMarks > data.totalMarks) {
      return NextResponse.json(
        { error: 'Passing marks cannot be greater than total marks' },
        { status: 400 }
      );
    }

    // Update exam
    const exam = await prisma.exam.update({
      where: { id: examId },
      data: {
        ...(data.examName && { examName: data.examName }),
        ...(data.examType && { examType: data.examType }),
        ...(data.subjectId && { subjectId: data.subjectId }),
        ...(data.classId && { classId: data.classId }),
        ...(data.totalMarks && { totalMarks: data.totalMarks }),
        ...(data.passingMarks && { passingMarks: data.passingMarks }),
        ...(data.duration && { duration: data.duration }),
        ...(data.instructions !== undefined && { instructions: data.instructions }),
        ...(data.isActive !== undefined && { isActive: data.isActive })
      },
      include: {
        subject: {
          select: {
            id: true,
            subjectName: true
          }
        },
        class: {
          select: {
            id: true,
            className: true
          }
        }
      }
    });

    return NextResponse.json({ exam });

  } catch (error) {
    console.error('Error updating exam:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const schoolId = session.user.schoolId!;
    const examId = params.id;

    // Check if exam exists
    const existingExam = await prisma.exam.findFirst({
      where: { id: examId, schoolId }
    });

    if (!existingExam) {
      return NextResponse.json(
        { error: 'Exam not found' },
        { status: 404 }
      );
    }

    // Delete exam (this will cascade delete related schedules and results)
    await prisma.exam.delete({
      where: { id: examId }
    });

    return NextResponse.json({ message: 'Exam deleted successfully' });

  } catch (error) {
    console.error('Error deleting exam:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
