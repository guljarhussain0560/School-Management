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

    // Get total buses
    const totalBuses = await prisma.bus.count({
      where: { schoolId }
    });

    // Get active buses
    const activeBuses = await prisma.bus.count({
      where: {
        schoolId,
        status: 'ACTIVE'
      }
    });

    // Get buses by status
    const busesByStatus = await prisma.bus.groupBy({
      by: ['status'],
      where: { schoolId },
      _count: {
        status: true
      }
    });

    // Get total routes
    const totalRoutes = await prisma.busRoute.count({
      where: { schoolId }
    });

    // Get active routes
    const activeRoutes = await prisma.busRoute.count({
      where: {
        schoolId,
        status: 'ON_TIME'
      }
    });

    // Get delayed routes
    const delayedRoutes = await prisma.busRoute.count({
      where: {
        schoolId,
        status: 'DELAYED'
      }
    });

    // Get students using transport
    const studentsUsingTransport = await prisma.student.count({
      where: {
        schoolId,
        transportRequired: true
      }
    });

    // Get recent maintenance logs
    const recentMaintenance = await prisma.maintenanceLog.count({
      where: {
        schoolId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });

    return NextResponse.json({
      total: totalBuses,
      active: activeBuses,
      totalRoutes,
      activeRoutes,
      delayedRoutes,
      studentsUsingTransport,
      recentMaintenance,
      busesByStatus
    });

  } catch (error) {
    console.error('Error fetching bus stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
