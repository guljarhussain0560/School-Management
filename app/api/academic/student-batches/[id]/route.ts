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

    const batch = await prisma.studentBatch.findFirst({
      where: {
        id: params.id,
        schoolId: session.user.schoolId!
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        students: {
          select: {
            id: true,
            studentId: true,
            name: true,
            class: {
              select: {
                className: true,
                classCode: true
              }
            },
            email: true,
            parentContact: true,
            status: true
          },
          orderBy: { name: 'asc' }
        },
        _count: {
          select: {
            students: true
          }
        }
      }
    });

    if (!batch) {
      return NextResponse.json(
        { error: 'Student batch not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ batch });

  } catch (error) {
    console.error('Error fetching student batch:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student batch' },
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
      batchName,
      academicYear,
      startDate,
      endDate,
      description,
      status
    } = await request.json();

    // Check if batch exists and belongs to school
    const existingBatch = await prisma.studentBatch.findFirst({
      where: {
        id: params.id,
        schoolId: session.user.schoolId!
      }
    });

    if (!existingBatch) {
      return NextResponse.json(
        { error: 'Student batch not found' },
        { status: 404 }
      );
    }

    // Check if batch name is being changed and if it already exists
    if (batchName && batchName !== existingBatch.batchName) {
      const duplicateBatch = await prisma.studentBatch.findFirst({
        where: {
          batchName,
          schoolId: session.user.schoolId!,
          id: { not: params.id }
        }
      });

      if (duplicateBatch) {
        return NextResponse.json(
          { error: 'Batch name already exists' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (batchName !== undefined) updateData.batchName = batchName;
    if (academicYear !== undefined) updateData.academicYear = academicYear;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;

    const batch = await prisma.studentBatch.update({
      where: { id: params.id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            students: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Student batch updated successfully',
      batch
    });

  } catch (error) {
    console.error('Error updating student batch:', error);
    return NextResponse.json(
      { error: 'Failed to update student batch' },
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

    // Check if batch exists and belongs to school
    const existingBatch = await prisma.studentBatch.findFirst({
      where: {
        id: params.id,
        schoolId: session.user.schoolId!
      },
      include: {
        students: true
      }
    });

    if (!existingBatch) {
      return NextResponse.json(
        { error: 'Student batch not found' },
        { status: 404 }
      );
    }

    // Check if batch has students assigned
    if (existingBatch.students.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete batch with assigned students. Please reassign students first.' },
        { status: 400 }
      );
    }

    await prisma.studentBatch.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      message: 'Student batch deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting student batch:', error);
    return NextResponse.json(
      { error: 'Failed to delete student batch' },
      { status: 500 }
    );
  }
}
