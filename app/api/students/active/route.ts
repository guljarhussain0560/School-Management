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
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const grade = searchParams.get('grade') || '';

    const skip = (page - 1) * limit;

    // Build where clause - exclude students from archived batches
    const where: any = {
      schoolId: session.user.schoolId!,
      OR: [
        // Students with no batch assignment
        { batchId: null },
        // Students assigned to active or inactive batches (not archived)
        {
          batch: {
            status: {
              in: ['ACTIVE', 'INACTIVE']
            }
          }
        }
      ]
    };

    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { studentId: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { rollNumber: { contains: search, mode: 'insensitive' } }
          ]
        }
      ];
    }

    if (grade) {
      where.class = {
        className: {
          contains: grade,
          mode: 'insensitive'
        }
      };
    }

    const [students, totalCount] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          batch: {
            select: {
              id: true,
              batchName: true,
              academicYear: true,
              status: true
            }
          }
        }
      }),
      prisma.student.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      students,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit
      }
    });

  } catch (error) {
    console.error('Error fetching active students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active students' },
      { status: 500 }
    );
  }
}
