import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createStudentSchema } from '@/lib/validation';
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
            select: { id: true, classCode: true, sectionName: true }
          },
          batch: {
            select: { id: true, batchName: true }
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
    logger.error('Get students error', error as Error, { path: '/api/students' });
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
    const validation = createStudentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Invalid student data', details: validation.error.errors },
        { status: 400 }
      );
    }

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
    } = validation.data;

    // Generate student ID
    const studentId = `STU${Date.now().toString().slice(-6)}`;

    const student = await prisma.student.create({
      data: {
        studentId,
        name,
        email: email || null,
        studentPhone: phone || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || null,
        classId,
        batchId: batchId || '',
        age: parseInt(body.age) || 10,
        rollNumber: body.rollNumber || `ROL${Date.now().toString().slice(-4)}`,
        parentName: parentName || null,
        parentPhone: parentPhone || phone || null,
        parentEmail: parentEmail || null,
        address: address || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        transportRequired: transportRequired || false,
        medicalConditions: medicalConditions || null,
        allergies: allergies || null,
        previousSchool: previousSchool || null,
        status: 'ACCEPTED',
        schoolId: session.user.schoolId!,
        createdBy: session.user.id
      },
      include: {
        class: {
          select: { id: true, classCode: true, sectionName: true }
        },
        batch: {
          select: { id: true, batchName: true }
        }
      }
    });

    return NextResponse.json({
      message: 'Student created successfully',
      student
    }, { status: 201 });

  } catch (error) {
    logger.error('Create student error', error as Error, { path: '/api/students' });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
