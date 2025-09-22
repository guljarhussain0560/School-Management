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

    const schoolId = session.user.schoolId!;

    // Get total students count
    const totalStudents = await prisma.student.count({
      where: { schoolId }
    });

    // Get recent admissions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAdmissions = await prisma.student.count({
      where: {
        schoolId,
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Get attendance rate (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const totalAttendanceRecords = await prisma.attendance.count({
      where: {
        schoolId,
        date: {
          gte: sevenDaysAgo
        }
      }
    });

    const presentRecords = await prisma.attendance.count({
      where: {
        schoolId,
        date: {
          gte: sevenDaysAgo
        },
        isPresent: true
      }
    });

    const attendanceRate = totalAttendanceRecords > 0 
      ? Math.round((presentRecords / totalAttendanceRecords) * 100)
      : 0;

    // Get students by status
    const studentsByStatus = await prisma.student.groupBy({
      by: ['status'],
      where: { schoolId },
      _count: {
        status: true
      }
    });

    // Get students by class
    const studentsByClass = await prisma.student.groupBy({
      by: ['classId'],
      where: { schoolId },
      _count: {
        classId: true
      }
    });

    return NextResponse.json({
      count: totalStudents,
      recentAdmissions,
      attendanceRate,
      studentsByStatus,
      studentsByClass
    });

  } catch (error) {
    console.error('Error fetching student stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
