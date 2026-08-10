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

    const gradeData = await prisma.grade.findFirst({
      where: {
        id: params.id,
        schoolId: session.user.schoolId!
      },
      include: {
        batch: {
          select: { id: true, batchName: true, academicYear: true }
        },
        creator: {
          select: { id: true, name: true, email: true }
        },
        sections: {
          include: {
            _count: {
              select: { students: true }
            }
          },
          orderBy: { sectionName: 'asc' }
        },
        subjects: {
          include: {
            subject: {
              select: { id: true, subjectName: true, subjectCode: true }
            }
          }
        },
        _count: {
          select: { sections: true, subjects: true }
        }
      }
    });

    if (!gradeData) {
      return NextResponse.json(
        { error: 'Grade not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ grade: gradeData });

  } catch (error) {
    console.error('Error fetching grade:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grade' },
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
      gradeName,
      gradeLevel,
      description,
      isActive
    } = await request.json();

    if (!gradeName || !gradeLevel) {
      return NextResponse.json(
        { error: 'Grade name and level are required' },
        { status: 400 }
      );
    }

    // Check if grade exists and belongs to school
    const existingGrade = await prisma.grade.findFirst({
      where: {
        id: params.id,
        schoolId: session.user.schoolId!
      }
    });

    if (!existingGrade) {
      return NextResponse.json(
        { error: 'Grade not found' },
        { status: 404 }
      );
    }

    // Check if another grade with same name exists in the same batch
    const duplicateGrade = await prisma.grade.findFirst({
      where: {
        gradeName,
        batchId: existingGrade.batchId,
        schoolId: session.user.schoolId!,
        id: { not: params.id }
      }
    });

    if (duplicateGrade) {
      return NextResponse.json(
        { error: 'Grade name already exists in this batch' },
        { status: 400 }
      );
    }

    const updatedGrade = await prisma.grade.update({
      where: { id: params.id },
      data: {
        gradeName,
        gradeLevel: parseInt(gradeLevel),
        description: description || null,
        isActive: isActive !== undefined ? isActive : existingGrade.isActive
      },
      include: {
        batch: {
          select: { id: true, batchName: true, academicYear: true }
        },
        creator: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { sections: true, subjects: true }
        }
      }
    });

    return NextResponse.json({
      message: 'Grade updated successfully',
      grade: updatedGrade
    });

  } catch (error) {
    console.error('Error updating grade:', error);
    return NextResponse.json(
      { error: 'Failed to update grade' },
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

    // Check if grade exists and belongs to school
    const existingGrade = await prisma.grade.findFirst({
      where: {
        id: params.id,
        schoolId: session.user.schoolId!
      },
      include: {
        _count: {
          select: { sections: true }
        }
      }
    });

    if (!existingGrade) {
      return NextResponse.json(
        { error: 'Grade not found' },
        { status: 404 }
      );
    }

    // Check if grade has sections
    if (existingGrade._count.sections > 0) {
      return NextResponse.json(
        { error: 'Cannot delete grade with existing sections. Please delete all sections first.' },
        { status: 400 }
      );
    }

    await prisma.grade.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      message: 'Grade deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting grade:', error);
    return NextResponse.json(
      { error: 'Failed to delete grade' },
      { status: 500 }
    );
  }
}
