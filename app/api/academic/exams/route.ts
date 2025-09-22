import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const schoolId = session.user.schoolId!;
    const { searchParams } = new URL(request.url);
    const examType = searchParams.get('type');
    const classId = searchParams.get('classId');
    const subjectId = searchParams.get('subjectId');

    const where: any = { schoolId };

    if (examType) {
      where.examType = examType;
    }
    if (classId) {
      where.classId = classId;
    }
    if (subjectId) {
      where.subjectId = subjectId;
    }

    const exams = await prisma.exam.findMany({
      where,
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
          where: { isActive: true },
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
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ exams });

  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const data = await request.json();

    // Validate required fields
    const requiredFields = ['examName', 'examType', 'subjectId', 'classId', 'totalMarks', 'passingMarks', 'duration'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate exam type
    const validExamTypes = ['QUIZ', 'TEST', 'MID_TERM', 'FINAL', 'ASSIGNMENT', 'PROJECT', 'PRACTICAL', 'ORAL'];
    if (!validExamTypes.includes(data.examType)) {
      return NextResponse.json(
        { error: 'Invalid exam type' },
        { status: 400 }
      );
    }

    // Validate marks
    if (data.passingMarks > data.totalMarks) {
      return NextResponse.json(
        { error: 'Passing marks cannot be greater than total marks' },
        { status: 400 }
      );
    }

    // Check if subject and class exist
    const subject = await prisma.subject.findFirst({
      where: { id: data.subjectId, schoolId }
    });

    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }

    const classExists = await prisma.class.findFirst({
      where: { id: data.classId, schoolId }
    });

    if (!classExists) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    // Create exam
    const exam = await prisma.exam.create({
      data: {
        examName: data.examName,
        examType: data.examType,
        subjectId: data.subjectId,
        classId: data.classId,
        totalMarks: data.totalMarks,
        passingMarks: data.passingMarks,
        duration: data.duration,
        instructions: data.instructions,
        schoolId,
        createdBy: session.user.id
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

    return NextResponse.json({ exam }, { status: 201 });

  } catch (error) {
    console.error('Error creating exam:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}