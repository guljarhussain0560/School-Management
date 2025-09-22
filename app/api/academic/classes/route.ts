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
        { className: { contains: search, mode: 'insensitive' } },
        { classCode: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [classes, totalCount] = await Promise.all([
      prisma.class.findMany({
        where,
        skip,
        take: limit,
        orderBy: { className: 'asc' },
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
          _count: {
            select: {
              students: true,
              subjects: true
            }
          }
        }
      }),
      prisma.class.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      classes,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit
      }
    });

  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
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
      className,
      level,
      section,
      description,
      capacity = 30,
      batchId
    } = await request.json();

    if (!className || !level || !section || !batchId) {
      return NextResponse.json(
        { error: 'Class name, level, section, and batch are required' },
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

    // Generate unique class code
    const classCode = await IDService.generateClassCode(batch.batchCode, level, section, session.user.schoolId!);

    // Check if class already exists in the same batch
    const existingClass = await prisma.class.findFirst({
      where: {
        className,
        batchId,
        schoolId: session.user.schoolId!
      }
    });

    if (existingClass) {
      return NextResponse.json(
        { error: 'Class already exists in this batch' },
        { status: 400 }
      );
    }

    const newClass = await prisma.class.create({
      data: {
        className,
        classCode,
        description: description || null,
        capacity,
        batchId,
        schoolId: session.user.schoolId!,
        createdBy: session.user.id
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
        _count: {
          select: {
            students: true,
            subjects: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Class created successfully',
      class: newClass
    });

  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json(
      { error: 'Failed to create class' },
      { status: 500 }
    );
  }
}
