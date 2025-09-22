import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const bus = await prisma.bus.findFirst({
      where: {
        id: params.id,
        schoolId: session.user.schoolId!
      },
      include: {
        routes: {
          select: {
            id: true,
            routeName: true,
            status: true,
            students: {
              select: {
                id: true,
                studentId: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!bus) {
      return NextResponse.json(
        { error: 'Bus not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ bus });

  } catch (error) {
    console.error('Error fetching bus:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bus' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      busNumber,
      busName,
      capacity,
      driverName,
      driverPhone,
      conductorName,
      conductorPhone,
      status
    } = await request.json();

    // Check if bus exists and belongs to school
    const existingBus = await prisma.bus.findFirst({
      where: {
        id: params.id,
        schoolId: session.user.schoolId!
      }
    });

    if (!existingBus) {
      return NextResponse.json(
        { error: 'Bus not found' },
        { status: 404 }
      );
    }

    // Check if bus number is being changed and if it already exists
    if (busNumber && busNumber !== existingBus.busNumber) {
      const duplicateBus = await prisma.bus.findFirst({
        where: {
          busNumber,
          schoolId: session.user.schoolId!,
          id: { not: params.id }
        }
      });

      if (duplicateBus) {
        return NextResponse.json(
          { error: 'Bus number already exists' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (busNumber !== undefined) updateData.busNumber = busNumber;
    if (busName !== undefined) updateData.busName = busName;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (driverName !== undefined) updateData.driverName = driverName;
    if (driverPhone !== undefined) updateData.driverPhone = driverPhone;
    if (conductorName !== undefined) updateData.conductorName = conductorName;
    if (conductorPhone !== undefined) updateData.conductorPhone = conductorPhone;
    if (status !== undefined) updateData.status = status;

    const bus = await prisma.bus.update({
      where: { id: params.id },
      data: updateData,
      include: {
        routes: {
          select: {
            id: true,
            routeName: true,
            status: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Bus updated successfully',
      bus
    });

  } catch (error) {
    console.error('Error updating bus:', error);
    return NextResponse.json(
      { error: 'Failed to update bus' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if bus exists and belongs to school
    const existingBus = await prisma.bus.findFirst({
      where: {
        id: params.id,
        schoolId: session.user.schoolId!
      },
      include: {
        routes: true
      }
    });

    if (!existingBus) {
      return NextResponse.json(
        { error: 'Bus not found' },
        { status: 404 }
      );
    }

    // Check if bus has active routes
    if (existingBus.routes.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete bus with active routes. Please remove all routes first.' },
        { status: 400 }
      );
    }

    await prisma.bus.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      message: 'Bus deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting bus:', error);
    return NextResponse.json(
      { error: 'Failed to delete bus' },
      { status: 500 }
    );
  }
}
