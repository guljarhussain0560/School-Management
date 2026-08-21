import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createExamSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

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
          select: { id: true, subjectName: true }
        },
        class: {
          select: { id: true, classCode: true, sectionName: true }
        },
        schedules: {
          where: { isActive: true },
          orderBy: { examDate: 'asc' }
        },
        results: {
          include: {
            student: {
              select: { id: true, name: true, rollNumber: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ exams });

  } catch (error) {
    logger.error('Error fetching exams', error as Error, { path: '/api/academic/exams' });
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
    const body = await request.json();
    const validation = createExamSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Invalid exam data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const {
      examName,
      examType,
      subjectId,
      classId,
      totalMarks,
      passingMarks,
      duration,
      instructions
    } = validation.data;

    // Check passing marks validation
    if (passingMarks > totalMarks) {
      return NextResponse.json(
        { error: 'Passing marks cannot be greater than total marks' },
        { status: 400 }
      );
    }

    // Check if exam already exists for the same class and subject
    const existingExam = await prisma.exam.findUnique({
      where: {
        examName_subjectId_classId: {
          examName,
          subjectId,
          classId
        }
      }
    });

    if (existingExam) {
      return NextResponse.json(
        { error: 'An exam with this name already exists for the selected subject and class' },
        { status: 400 }
      );
    }

    const exam = await prisma.exam.create({
      data: {
        examName,
        examType: examType as any,
        subjectId,
        classId,
        totalMarks,
        passingMarks,
        duration,
        instructions: instructions || null,
        schoolId,
        createdBy: session.user.id
      },
      include: {
        subject: {
          select: { id: true, subjectName: true }
        },
        class: {
          select: { id: true, classCode: true, sectionName: true }
        }
      }
    });

    return NextResponse.json({
      message: 'Exam created successfully',
      exam
    }, { status: 201 });

  } catch (error) {
    logger.error('Error creating exam', error as Error, { path: '/api/academic/exams' });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}