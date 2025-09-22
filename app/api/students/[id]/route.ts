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

    const student = await prisma.student.findUnique({
      where: {
        id: params.id,
        schoolId: session.user.schoolId!
      },
      include: {
        class: {
          select: {
            id: true,
            className: true,
            classCode: true
          }
        },
        batch: {
          select: {
            id: true,
            batchName: true
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ student });

  } catch (error) {
    console.error('Get student error:', error);
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
    
    if (!session?.user?.id || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      dateOfBirth,
      gender,
      classId,
      batchId,
      parentName,
      parentPhone,
      parentEmail,
      address,
      city,
      state,
      pincode,
      transportRequired,
      medicalConditions,
      allergies,
      previousSchool,
      status
    } = body;

    const student = await prisma.student.update({
      where: {
        id: params.id,
        schoolId: session.user.schoolId!
      },
      data: {
        name,
        email: email || null,
        phone: phone || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || null,
        classId,
        batchId: batchId || null,
        parentName: parentName || null,
        parentPhone: parentPhone || null,
        parentEmail: parentEmail || null,
        address: address || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        transportRequired: transportRequired || false,
        medicalConditions: medicalConditions || null,
        allergies: allergies || null,
        previousSchool: previousSchool || null,
        status: status || 'ACTIVE'
      },
      include: {
        class: {
          select: {
            id: true,
            className: true,
            classCode: true
          }
        },
        batch: {
          select: {
            id: true,
            batchName: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Student updated successfully',
      student
    });

  } catch (error) {
    console.error('Update student error:', error);
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
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await prisma.student.delete({
      where: {
        id: params.id,
        schoolId: session.user.schoolId!
      }
    });

    return NextResponse.json({
      message: 'Student deleted successfully'
    });

  } catch (error) {
    console.error('Delete student error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
