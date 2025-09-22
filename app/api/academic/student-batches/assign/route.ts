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

    const { studentIds, batchId } = await request.json();

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: 'Student IDs array is required' },
        { status: 400 }
      );
    }

    if (!batchId) {
      return NextResponse.json(
        { error: 'Batch ID is required' },
        { status: 400 }
      );
    }

    // Check if batch exists and belongs to school
    const batch = await prisma.studentBatch.findFirst({
      where: {
        id: batchId,
        schoolId: session.user.schoolId!
      }
    });

    if (!batch) {
      return NextResponse.json(
        { error: 'Student batch not found' },
        { status: 404 }
      );
    }

    // Check if batch is active and not archived
    if (batch.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cannot assign students to inactive or archived batch' },
        { status: 400 }
      );
    }

    // Validate all students exist and belong to school
    const students = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
        schoolId: session.user.schoolId!
      }
    });

    if (students.length !== studentIds.length) {
      return NextResponse.json(
        { error: 'Some students not found or do not belong to your school' },
        { status: 400 }
      );
    }

    // Update students to assign them to the batch
    const updateResult = await prisma.student.updateMany({
      where: {
        id: { in: studentIds },
        schoolId: session.user.schoolId!
      },
      data: {
        batchId: batchId
      }
    });

    return NextResponse.json({
      message: `${updateResult.count} students assigned to batch successfully`,
      assignedCount: updateResult.count
    });

  } catch (error) {
    console.error('Error assigning students to batch:', error);
    return NextResponse.json(
      { error: 'Failed to assign students to batch' },
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

    const { studentIds } = await request.json();

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: 'Student IDs array is required' },
        { status: 400 }
      );
    }

    // Remove students from their current batch
    const updateResult = await prisma.student.updateMany({
      where: {
        id: { in: studentIds },
        schoolId: session.user.schoolId!
      },
      data: {
        batchId: null
      }
    });

    return NextResponse.json({
      message: `${updateResult.count} students removed from batch successfully`,
      removedCount: updateResult.count
    });

  } catch (error) {
    console.error('Error removing students from batch:', error);
    return NextResponse.json(
      { error: 'Failed to remove students from batch' },
      { status: 500 }
    );
  }
}
