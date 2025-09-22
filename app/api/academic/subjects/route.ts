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
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      schoolId: session.user.schoolId!
    };

    if (search) {
      where.OR = [
        { subjectName: { contains: search, mode: 'insensitive' } },
        { subjectCode: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [subjects, totalCount] = await Promise.all([
      prisma.subject.findMany({
        where,
        skip,
        take: limit,
        orderBy: { subjectName: 'asc' },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          classGrades: {
            include: {
              class: {
                select: {
                  id: true,
                  className: true,
                  classCode: true,
                  batch: {
                    select: {
                      batchName: true,
                      academicYear: true
                    }
                  }
                }
              }
            }
          },
          _count: {
            select: {
              classGrades: true
            }
          }
        }
      }),
      prisma.subject.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      subjects,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit
      }
    });

  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
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
      subjectName,
      category,
      level,
      description
    } = await request.json();

    if (!subjectName || !category || !level) {
      return NextResponse.json(
        { error: 'Subject name, category, and level are required' },
        { status: 400 }
      );
    }

    // Initialize ID service with school configuration
    await IDService.initializeSchool(session.user.schoolId!);

    // Generate unique subject code
    const subjectCode = await IDService.generateSubjectCode(category, subjectName, level);

    const newSubject = await prisma.subject.create({
      data: {
        subjectCode,
        subjectName,
        description: description || null,
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
            classGrades: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Subject created successfully',
      subject: newSubject
    });

  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json(
      { error: 'Failed to create subject' },
      { status: 500 }
    );
  }
}