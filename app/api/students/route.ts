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
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Get students with all related data
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where: {
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
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit
      }),
      prisma.student.count({
        where: {
          schoolId: session.user.schoolId!
        }
      })
    ]);

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get students error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
      previousSchool
    } = body;

    // Generate student ID
    const studentId = `STU${Date.now().toString().slice(-6)}`;

    const student = await prisma.student.create({
      data: {
        studentId,
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
        status: 'ACTIVE',
        schoolId: session.user.schoolId!,
        createdBy: session.user.id
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
      message: 'Student created successfully',
      student
    });

  } catch (error) {
    console.error('Create student error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
