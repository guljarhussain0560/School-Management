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
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      schoolId: session.user.schoolId!
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { batchName: { contains: search, mode: 'insensitive' } },
        { academicYear: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [batches, totalCount] = await Promise.all([
      prisma.studentBatch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
              }
            }
          },
          _count: {
            select: {
              students: true
            }
          }
        }
      }),
      prisma.studentBatch.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      batches,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit
      }
    });

  } catch (error) {
    console.error('Error fetching student batches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student batches' },
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
      batchName,
      academicYear,
      startDate,
      endDate,
      description,
      status = 'ACTIVE'
    } = await request.json();

    if (!batchName || !academicYear || !startDate) {
      return NextResponse.json(
        { error: 'Batch name, academic year, and start date are required' },
        { status: 400 }
      );
    }

    // Initialize ID service with school configuration
    await IDService.initializeSchool(session.user.schoolId!);

    // Generate unique batch code
    const batchCode = await IDService.generateBatchCode(academicYear, session.user.schoolId!);

    // Check if batch name already exists for this school
    const existingBatch = await prisma.studentBatch.findFirst({
      where: {
        batchName,
        schoolId: session.user.schoolId!
      }
    });

    if (existingBatch) {
      return NextResponse.json(
        { error: 'Batch name already exists' },
        { status: 400 }
      );
    }

    const batch = await prisma.studentBatch.create({
      data: {
        batchCode,
        batchName,
        academicYear,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        description: description || null,
        status,
        schoolId: session.user.schoolId!,
        createdBy: session.user.id
      },
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
      message: 'Student batch created successfully',
      batch
    });

  } catch (error) {
    console.error('Error creating student batch:', error);
    return NextResponse.json(
      { error: 'Failed to create student batch' },
      { status: 500 }
    );
  }
}
