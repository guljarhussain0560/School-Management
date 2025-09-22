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

    // Get recent activities from different sources
    const activities = [];

    // Recent student admissions
    const recentAdmissions = await prisma.student.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        createdAt: true,
        status: true
      }
    });

    recentAdmissions.forEach(student => {
      activities.push({
        id: `admission-${student.id}`,
        type: 'admission',
        message: `New student admission: ${student.name}`,
        timestamp: student.createdAt.toISOString(),
        status: student.status === 'ACCEPTED' ? 'success' : 'info'
      });
    });

    // Recent fee payments
    const recentPayments = await prisma.feeCollection.findMany({
      where: { 
        schoolId,
        status: 'PAID'
      },
      orderBy: { date: 'desc' },
      take: 5,
      select: {
        id: true,
        amount: true,
        date: true,
        student: {
          select: {
            name: true
          }
        }
      }
    });

    recentPayments.forEach(payment => {
      activities.push({
        id: `payment-${payment.id}`,
        type: 'payment',
        message: `Fee payment received: ₹${payment.amount} from ${payment.student.name}`,
        timestamp: payment.date.toISOString(),
        status: 'success'
      });
    });

    // Recent maintenance logs
    const recentMaintenance = await prisma.maintenanceLog.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        facility: true,
        status: true,
        createdAt: true
      }
    });

    recentMaintenance.forEach(maintenance => {
      activities.push({
        id: `maintenance-${maintenance.id}`,
        type: 'maintenance',
        message: `Maintenance ${maintenance.status.toLowerCase()}: ${maintenance.facility}`,
        timestamp: maintenance.createdAt.toISOString(),
        status: maintenance.status === 'OK' ? 'success' : 'warning'
      });
    });

    // Recent safety alerts
    const recentAlerts = await prisma.safetyAlert.findMany({
      where: { 
        schoolId,
        status: 'ACTIVE'
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        type: true,
        priority: true,
        description: true,
        createdAt: true
      }
    });

    recentAlerts.forEach(alert => {
      activities.push({
        id: `alert-${alert.id}`,
        type: 'alert',
        message: `${alert.type} alert: ${alert.description}`,
        timestamp: alert.createdAt.toISOString(),
        status: alert.priority === 'CRITICAL' ? 'error' : 'warning'
      });
    });

    // Recent academic activities
    const recentAssignments = await prisma.assignment.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        title: true,
        createdAt: true,
        status: true
      }
    });

    recentAssignments.forEach(assignment => {
      activities.push({
        id: `assignment-${assignment.id}`,
        type: 'academic',
        message: `New assignment created: ${assignment.title}`,
        timestamp: assignment.createdAt.toISOString(),
        status: 'info'
      });
    });

    // Sort activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Get pending tasks count
    const pendingTasks = await Promise.all([
      prisma.student.count({
        where: {
          schoolId,
          status: 'PENDING'
        }
      }),
      prisma.feeCollection.count({
        where: {
          schoolId,
          status: 'PENDING'
        }
      }),
      prisma.maintenanceLog.count({
        where: {
          schoolId,
          status: 'NEEDS_REPAIR'
        }
      }),
      prisma.safetyAlert.count({
        where: {
          schoolId,
          status: 'ACTIVE'
        }
      })
    ]);

    const totalPendingTasks = pendingTasks.reduce((sum, count) => sum + count, 0);

    return NextResponse.json({
      activities: activities.slice(0, 10), // Return only latest 10 activities
      pendingTasks: totalPendingTasks
    });

  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
