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
    const classId = searchParams.get('classId');
    const subjectId = searchParams.get('subjectId');

    // Build where clause
    const where: any = {
      schoolId: session.user.schoolId!
    };

    if (classId) {
      where.classId = classId;
    }

    if (subjectId) {
      where.subjectId = subjectId;
    }

    const subjectGrades = await prisma.subjectGrade.findMany({
      where,
      include: {
        subject: {
          select: {
            id: true,
            subjectName: true,
            subjectCode: true
          }
        },
        class: {
          select: {
            id: true,
            className: true,
            classCode: true,
            batch: {
              select: {
                batchName: true,
                academicYear: true
              }
            }
          }
        }
      },
      orderBy: [
        { class: { className: 'asc' } },
        { subject: { subjectName: 'asc' } }
      ]
    });

    return NextResponse.json({ subjectGrades });

  } catch (error) {
    console.error('Error fetching subject grades:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subject grades' },
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

    const { subjectId, classId } = await request.json();

    if (!subjectId || !classId) {
      return NextResponse.json(
        { error: 'Subject ID and Class ID are required' },
        { status: 400 }
      );
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.subjectGrade.findFirst({
      where: {
        subjectId,
        classId,
        schoolId: session.user.schoolId!
      }
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Subject is already assigned to this class' },
        { status: 400 }
      );
    }

    const newAssignment = await prisma.subjectGrade.create({
      data: {
        subjectId,
        classId,
        schoolId: session.user.schoolId!
      },
      include: {
        subject: {
          select: {
            id: true,
            subjectName: true,
            subjectCode: true
          }
        },
        class: {
          select: {
            id: true,
            className: true,
            classCode: true,
            batch: {
              select: {
                batchName: true,
                academicYear: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Subject assigned to class successfully',
      subjectGrade: newAssignment
    });

  } catch (error) {
    console.error('Error assigning subject to class:', error);
    return NextResponse.json(
      { error: 'Failed to assign subject to class' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const classId = searchParams.get('classId');

    if (!subjectId || !classId) {
      return NextResponse.json(
        { error: 'Subject ID and Class ID are required' },
        { status: 400 }
      );
    }

    // Check if assignment exists
    const existingAssignment = await prisma.subjectGrade.findFirst({
      where: {
        subjectId,
        classId,
        schoolId: session.user.schoolId!
      }
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { error: 'Subject assignment not found' },
        { status: 404 }
      );
    }

    await prisma.subjectGrade.delete({
      where: { id: existingAssignment.id }
    });

    return NextResponse.json({
      message: 'Subject assignment removed successfully'
    });

  } catch (error) {
    console.error('Error removing subject assignment:', error);
    return NextResponse.json(
      { error: 'Failed to remove subject assignment' },
      { status: 500 }
    );
  }
}
