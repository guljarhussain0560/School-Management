import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, AlertType, AlertPriority, AlertStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const safetyAlerts = await prisma.safetyAlert.findMany({
      where: {
        schoolId: session.user.schoolId!
      },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ safetyAlerts });
  } catch (error) {
    console.error('Error fetching safety alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch safety alerts' },
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

    const { type, priority, description } = await request.json();

    if (!type || !priority || !description) {
      return NextResponse.json(
        { error: 'Type, priority, and description are required' },
        { status: 400 }
      );
    }

    // Generate alert ID
    const alertId = `ALERT${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

    const safetyAlert = await prisma.safetyAlert.create({
      data: {
        alertId,
        type: type.toUpperCase() as AlertType,
        priority: priority.toUpperCase() as AlertPriority,
        description,
        status: AlertStatus.ACTIVE,
        createdBy: session.user.id,
        schoolId: session.user.schoolId!
      },
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ 
      message: 'Safety alert created successfully',
      alert: safetyAlert
    });
  } catch (error) {
    console.error('Error creating safety alert:', error);
    return NextResponse.json(
      { error: 'Failed to create safety alert' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { alerts } = await request.json();

    if (!alerts || !Array.isArray(alerts)) {
      return NextResponse.json(
        { error: 'Alerts array is required' },
        { status: 400 }
      );
    }

    // Update all alerts to synced status (only for the current school)
    const updatePromises = alerts.map((alert: any) =>
      prisma.safetyAlert.update({
        where: { 
          id: alert.id,
          schoolId: session.user.schoolId! // Ensure only school's alerts are updated
        },
        data: { 
          status: AlertStatus.SYNCED,
          syncedAt: new Date()
        }
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ 
      message: 'Alerts synced to dashboard successfully' 
    });
  } catch (error) {
    console.error('Error syncing alerts:', error);
    return NextResponse.json(
      { error: 'Failed to sync alerts' },
      { status: 500 }
    );
  }
}