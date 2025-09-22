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

    const route = await prisma.busRoute.findFirst({
      where: {
        id: params.id,
        schoolId: session.user.schoolId!
      },
      include: {
        bus: {
          select: {
            id: true,
            busNumber: true,
            busName: true,
            driverName: true,
            driverPhone: true,
            conductorName: true,
            conductorPhone: true,
            capacity: true
          }
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        students: {
          select: {
            id: true,
            studentId: true,
            name: true,
            class: {
              select: {
                className: true,
                classCode: true
              }
            },
            pickupAddress: true,
            parentContact: true
          }
        }
      }
    });

    if (!route) {
      return NextResponse.json(
        { error: 'Route not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ route });

  } catch (error) {
    console.error('Error fetching bus route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bus route' },
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
      routeName,
      busId,
      status,
      delayReason,
      delayMinutes
    } = await request.json();

    // Check if route exists and belongs to school
    const existingRoute = await prisma.busRoute.findFirst({
      where: {
        id: params.id,
        schoolId: session.user.schoolId!
      }
    });

    if (!existingRoute) {
      return NextResponse.json(
        { error: 'Route not found' },
        { status: 404 }
      );
    }

    // Check if bus exists and belongs to school (if busId is being changed)
    if (busId && busId !== existingRoute.busId) {
      const bus = await prisma.bus.findFirst({
        where: {
          id: busId,
          schoolId: session.user.schoolId!
        }
      });

      if (!bus) {
        return NextResponse.json(
          { error: 'Bus not found' },
          { status: 404 }
        );
      }
    }

    // Check if route name is being changed and if it already exists
    if (routeName && routeName !== existingRoute.routeName) {
      const duplicateRoute = await prisma.busRoute.findFirst({
        where: {
          routeName,
          schoolId: session.user.schoolId!,
          id: { not: params.id }
        }
      });

      if (duplicateRoute) {
        return NextResponse.json(
          { error: 'Route name already exists' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (routeName !== undefined) updateData.routeName = routeName;
    if (busId !== undefined) updateData.busId = busId;
    if (status !== undefined) updateData.status = status;
    if (delayReason !== undefined) updateData.delayReason = delayReason;
    if (delayMinutes !== undefined) updateData.delayMinutes = delayMinutes;
    
    // Update lastUpdated when status changes
    if (status !== undefined && status !== existingRoute.status) {
      updateData.lastUpdated = new Date();
    }

    const route = await prisma.busRoute.update({
      where: { id: params.id },
      data: updateData,
      include: {
        bus: {
          select: {
            id: true,
            busNumber: true,
            busName: true,
            driverName: true,
            capacity: true
          }
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        students: {
          select: {
            id: true,
            studentId: true,
            name: true,
            class: {
              select: {
                className: true,
                classCode: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Bus route updated successfully',
      route
    });

  } catch (error) {
    console.error('Error updating bus route:', error);
    return NextResponse.json(
      { error: 'Failed to update bus route' },
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

    // Check if route exists and belongs to school
    const existingRoute = await prisma.busRoute.findFirst({
      where: {
        id: params.id,
        schoolId: session.user.schoolId!
      },
      include: {
        students: true
      }
    });

    if (!existingRoute) {
      return NextResponse.json(
        { error: 'Route not found' },
        { status: 404 }
      );
    }

    // Check if route has assigned students
    if (existingRoute.students.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete route with assigned students. Please unassign all students first.' },
        { status: 400 }
      );
    }

    await prisma.busRoute.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      message: 'Bus route deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting bus route:', error);
    return NextResponse.json(
      { error: 'Failed to delete bus route' },
      { status: 500 }
    );
  }
}
