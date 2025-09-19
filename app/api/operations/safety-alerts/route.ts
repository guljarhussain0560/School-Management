import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, AlertType, AlertPriority, AlertStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const safetyAlerts = await prisma.safetyAlert.findMany({
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
    const { type, priority, description } = await request.json();

    if (!type || !priority || !description) {
      return NextResponse.json(
        { error: 'Type, priority, and description are required' },
        { status: 400 }
      );
    }

    // For demo purposes, we'll use the first school and user
    // In a real app, you'd get these from the authenticated session
    const school = await prisma.school.findFirst();
    const user = await prisma.user.findFirst({
      where: { role: 'TRANSPORT' }
    });

    if (!school || !user) {
      return NextResponse.json(
        { error: 'School or user not found' },
        { status: 404 }
      );
    }

    const safetyAlert = await prisma.safetyAlert.create({
      data: {
        type: type.toUpperCase() as AlertType,
        priority: priority.toUpperCase() as AlertPriority,
        description,
        status: AlertStatus.ACTIVE,
        createdBy: user.id,
        schoolId: school.id
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
    const { alerts } = await request.json();

    if (!alerts || !Array.isArray(alerts)) {
      return NextResponse.json(
        { error: 'Alerts array is required' },
        { status: 400 }
      );
    }

    // Update all alerts to synced status
    const updatePromises = alerts.map((alert: any) =>
      prisma.safetyAlert.update({
        where: { id: alert.id },
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