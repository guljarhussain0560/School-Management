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

    // Get batch statistics
    const [totalBatches, activeBatches, archivedBatches, totalStudents, unassignedStudents] = await Promise.all([
      // Total batches
      prisma.studentBatch.count({
        where: { schoolId: session.user.schoolId! }
      }),
      
      // Active batches
      prisma.studentBatch.count({
        where: { 
          schoolId: session.user.schoolId!,
          status: 'ACTIVE'
        }
      }),
      
      // Archived batches
      prisma.studentBatch.count({
        where: { 
          schoolId: session.user.schoolId!,
          status: 'ARCHIVED'
        }
      }),
      
      // Total students assigned to active batches (exclude archived)
      prisma.student.count({
        where: { 
          schoolId: session.user.schoolId!,
          batchId: { not: null },
          batch: {
            status: 'ACTIVE'
          }
        }
      }),
      
      // Unassigned students
      prisma.student.count({
        where: { 
          schoolId: session.user.schoolId!,
          batchId: null
        }
      })
    ]);

    // Get recent batches
    const recentBatches = await prisma.studentBatch.findMany({
      where: { schoolId: session.user.schoolId! },
      orderBy: { createdAt: 'desc' },
      take: 5,
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

    // Get batch distribution by academic year
    const batchDistribution = await prisma.studentBatch.groupBy({
      by: ['academicYear'],
      where: { schoolId: session.user.schoolId! },
      _count: {
        id: true
      },
      orderBy: {
        academicYear: 'desc'
      }
    });

    return NextResponse.json({
      stats: {
        totalBatches,
        activeBatches,
        archivedBatches,
        totalStudents,
        unassignedStudents
      },
      recentBatches,
      batchDistribution
    });

  } catch (error) {
    console.error('Error fetching batch statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batch statistics' },
      { status: 500 }
    );
  }
}
