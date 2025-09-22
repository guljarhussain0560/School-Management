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

    const classData = await prisma.class.findFirst({
      where: {
        id: params.id,
        schoolId: session.user.schoolId!
      },
      include: {
        batch: {
          select: {
            id: true,
            batchName: true,
            academicYear: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        subjects: {
          include: {
            subject: {
              select: {
                id: true,
                subjectName: true,
                subjectCode: true
              }
            }
          }
        },
        students: {
          select: {
            id: true,
            studentId: true,
            name: true,
            rollNumber: true,
            email: true
          },
          orderBy: { rollNumber: 'asc' }
        },
        _count: {
          select: {
            students: true,
            subjects: true
          }
        }
      }
    });

    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ class: classData });

  } catch (error) {
    console.error('Error fetching class:', error);
    return NextResponse.json(
      { error: 'Failed to fetch class' },
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

    const {
      className,
      classCode,
      description,
      capacity,
      isActive
    } = await request.json();

    // Check if class exists and belongs to school
    const existingClass = await prisma.class.findFirst({
      where: {
        id: params.id,
        schoolId: session.user.schoolId!
      }
    });

    if (!existingClass) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    // Check if class name is being changed and if it already exists
    if (className && className !== existingClass.className) {
      const duplicateClass = await prisma.class.findFirst({
        where: {
          className,
          batchId: existingClass.batchId,
          schoolId: session.user.schoolId!,
          id: { not: params.id }
        }
      });

      if (duplicateClass) {
        return NextResponse.json(
          { error: 'Class name already exists in this batch' },
          { status: 400 }
        );
      }
    }

    // Check if class code is being changed and if it already exists
    if (classCode && classCode !== existingClass.classCode) {
      const duplicateCode = await prisma.class.findFirst({
        where: {
          classCode,
          batchId: existingClass.batchId,
          schoolId: session.user.schoolId!,
          id: { not: params.id }
        }
      });

      if (duplicateCode) {
        return NextResponse.json(
          { error: 'Class code already exists in this batch' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (className !== undefined) updateData.className = className;
    if (classCode !== undefined) updateData.classCode = classCode;
    if (description !== undefined) updateData.description = description;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedClass = await prisma.class.update({
      where: { id: params.id },
      data: updateData,
      include: {
        batch: {
          select: {
            id: true,
            batchName: true,
            academicYear: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            students: true,
            subjects: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Class updated successfully',
      class: updatedClass
    });

  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json(
      { error: 'Failed to update class' },
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

    // Check if class exists and belongs to school
    const existingClass = await prisma.class.findFirst({
      where: {
        id: params.id,
        schoolId: session.user.schoolId!
      },
      include: {
        students: true
      }
    });

    if (!existingClass) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    // Check if class has students assigned
    if (existingClass.students.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete class with assigned students. Please reassign students first.' },
        { status: 400 }
      );
    }

    await prisma.class.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      message: 'Class deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json(
      { error: 'Failed to delete class' },
      { status: 500 }
    );
  }
}
