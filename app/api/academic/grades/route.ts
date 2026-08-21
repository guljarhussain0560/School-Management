import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { IDService } from '@/lib/id-service';

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
    const batchId = searchParams.get('batchId');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      schoolId: session.user.schoolId!
    };

    if (batchId && batchId !== 'all') {
      where.batchId = batchId;
    }

    if (search) {
      where.OR = [
        { gradeName: { contains: search, mode: 'insensitive' } },
        { gradeCode: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [grades, totalCount] = await Promise.all([
      prisma.grade.findMany({
        where,
        skip,
        take: limit,
        orderBy: { gradeLevel: 'asc' },
        include: {
          batch: {
            select: { id: true, batchName: true, academicYear: true }
          },
          creator: {
            select: { id: true, name: true, email: true }
          },
          sections: {
            select: { id: true, sectionName: true, sectionType: true, capacity: true, _count: {
                select: {
                  students: true }
              }
            }
          },
          _count: {
            select: { sections: true, subjects: true }
          }
        }
      }),
      prisma.grade.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      grades,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit
      }
    });

  } catch (error) {
    logger.error('Error fetching grades:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grades' },
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
      gradeName,
      gradeLevel,
      description,
      batchId
    } = await request.json();

    if (!gradeName || !gradeLevel || !batchId) {
      return NextResponse.json(
        { error: 'Grade name, level, and batch are required' },
        { status: 400 }
      );
    }

    // Get batch information
    const batch = await prisma.studentBatch.findUnique({
      where: { id: batchId },
      select: { batchCode: true }
    });

    if (!batch) {
      return NextResponse.json(
        { error: 'Invalid batch ID' },
        { status: 400 }
      );
    }

    // Initialize ID service with school configuration
    await IDService.initializeSchool(session.user.schoolId!);

    // Generate unique grade code
    const gradeCode = await IDService.generateGradeCode(gradeLevel, session.user.schoolId!);

    // Check if grade already exists in the same batch
    const existingGrade = await prisma.grade.findFirst({
      where: {
        gradeName,
        batchId,
        schoolId: session.user.schoolId!
      }
    });

    if (existingGrade) {
      return NextResponse.json(
        { error: 'Grade already exists in this batch' },
        { status: 400 }
      );
    }

    const newGrade = await prisma.grade.create({
      data: {
        gradeName,
        gradeCode,
        gradeLevel: parseInt(gradeLevel),
        description: description || null,
        batchId,
        schoolId: session.user.schoolId!,
        createdBy: session.user.id
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
      message: 'Grade created successfully',
      grade: newGrade
    });

  } catch (error) {
    logger.error('Error creating grade:', error);
    return NextResponse.json(
      { error: 'Failed to create grade' },
      { status: 500 }
    );
  }
}