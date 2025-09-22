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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const examId = searchParams.get('examId');
    const studentId = searchParams.get('studentId');
    const classId = searchParams.get('classId');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      schoolId: session.user.schoolId!
    };

    if (examId) {
      where.examId = examId;
    }

    if (studentId) {
      where.studentId = studentId;
    }

    if (classId) {
      where.exam = {
        classId: classId
      };
    }

    const [results, totalCount] = await Promise.all([
      prisma.examResult.findMany({
        where,
        skip,
        take: limit,
        orderBy: { marksObtained: 'desc' },
        include: {
          exam: {
            select: {
              id: true,
              examName: true,
              examType: true,
              totalMarks: true,
              passingMarks: true,
              subject: {
                select: {
                  subjectName: true,
                  subjectCode: true
                }
              },
              class: {
                select: {
                  className: true,
                  classCode: true
                }
              }
            }
          },
          student: {
            select: {
              id: true,
              studentId: true,
              name: true,
              rollNumber: true
            }
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.examResult.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      results,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit
      }
    });

  } catch (error) {
    console.error('Error fetching exam results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exam results' },
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

    const {
      examId,
      studentId,
      marksObtained,
      grade,
      remarks
    } = await request.json();

    if (!examId || !studentId || marksObtained === undefined) {
      return NextResponse.json(
        { error: 'Exam ID, Student ID, and marks obtained are required' },
        { status: 400 }
      );
    }

    // Get exam details to calculate if passed
    const exam = await prisma.exam.findFirst({
      where: {
        id: examId,
        schoolId: session.user.schoolId!
      }
    });

    if (!exam) {
      return NextResponse.json(
        { error: 'Exam not found' },
        { status: 404 }
      );
    }

    // Check if result already exists
    const existingResult = await prisma.examResult.findFirst({
      where: {
        examId,
        studentId,
        schoolId: session.user.schoolId!
      }
    });

    if (existingResult) {
      return NextResponse.json(
        { error: 'Result already exists for this student and exam' },
        { status: 400 }
      );
    }

    const isPassed = parseFloat(marksObtained) >= exam.passingMarks;

    const newResult = await prisma.examResult.create({
      data: {
        examId,
        studentId,
        marksObtained: parseFloat(marksObtained),
        grade: grade || null,
        remarks: remarks || null,
        isPassed,
        schoolId: session.user.schoolId!,
        createdBy: session.user.id
      },
      include: {
        exam: {
          select: {
            id: true,
            examName: true,
            examType: true,
            totalMarks: true,
            passingMarks: true,
            subject: {
              select: {
                subjectName: true,
                subjectCode: true
              }
            },
            class: {
              select: {
                className: true,
                classCode: true
              }
            }
          }
        },
        student: {
          select: {
            id: true,
            studentId: true,
            name: true,
            rollNumber: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Exam result created successfully',
      result: newResult
    });

  } catch (error) {
    console.error('Error creating exam result:', error);
    return NextResponse.json(
      { error: 'Failed to create exam result' },
      { status: 500 }
    );
  }
}
