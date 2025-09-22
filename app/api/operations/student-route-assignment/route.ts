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
    const studentId = searchParams.get('studentId');
    const routeId = searchParams.get('routeId');

    if (studentId) {
      // Get student's current route assignment
      const student = await prisma.student.findFirst({
        where: {
          studentId,
          schoolId: session.user.schoolId!
        },
        include: {
          busRoute: {
            include: {
              bus: {
                select: {
                  id: true,
                  busNumber: true,
                  busName: true,
                  driverName: true,
                  driverPhone: true
                }
              }
            }
          }
        }
      });

      if (!student) {
        return NextResponse.json(
          { error: 'Student not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ student });
    }

    if (routeId) {
      // Get all students assigned to a route
      const route = await prisma.busRoute.findFirst({
        where: {
          id: routeId,
          schoolId: session.user.schoolId!
        },
        include: {
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
          },
          bus: {
            select: {
              id: true,
              busNumber: true,
              busName: true,
              capacity: true
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
    }

    // Get all route assignments
    const assignments = await prisma.student.findMany({
      where: {
        schoolId: session.user.schoolId!,
        busRouteId: { not: null }
      },
      include: {
        busRoute: {
          include: {
            bus: {
              select: {
                id: true,
                busNumber: true,
                busName: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ assignments });

  } catch (error) {
    console.error('Error fetching student route assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student route assignments' },
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

    const { studentId, routeId } = await request.json();

    if (!studentId || !routeId) {
      return NextResponse.json(
        { error: 'Student ID and Route ID are required' },
        { status: 400 }
      );
    }

    // Check if student exists and belongs to school
    const student = await prisma.student.findFirst({
      where: {
        studentId,
        schoolId: session.user.schoolId!
      }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Check if student has pickup address
    if (!student.pickupAddress) {
      return NextResponse.json(
        { error: 'Student pickup address not found. Please update the student profile with pickup address.' },
        { status: 400 }
      );
    }

    // Check if route exists and belongs to school
    const route = await prisma.busRoute.findFirst({
      where: {
        id: routeId,
        schoolId: session.user.schoolId!
      },
      include: {
        bus: true,
        students: true
      }
    });

    if (!route) {
      return NextResponse.json(
        { error: 'Route not found' },
        { status: 404 }
      );
    }

    // Check if bus capacity is not exceeded
    if (route.students.length >= route.bus.capacity) {
      return NextResponse.json(
        { error: 'Bus capacity exceeded. Cannot assign more students to this route.' },
        { status: 400 }
      );
    }

    // Check if student is already assigned to a route
    if (student.busRouteId) {
      return NextResponse.json(
        { error: 'Student is already assigned to a route. Please unassign first.' },
        { status: 400 }
      );
    }

    // Assign student to route
    const updatedStudent = await prisma.student.update({
      where: { id: student.id },
      data: { busRouteId: routeId },
      include: {
        busRoute: {
          include: {
            bus: {
              select: {
                id: true,
                busNumber: true,
                busName: true,
                driverName: true,
                driverPhone: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Student assigned to route successfully',
      student: updatedStudent
    });

  } catch (error) {
    console.error('Error assigning student to route:', error);
    return NextResponse.json(
      { error: 'Failed to assign student to route' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { studentId } = await request.json();

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Check if student exists and belongs to school
    const student = await prisma.student.findFirst({
      where: {
        studentId,
        schoolId: session.user.schoolId!
      }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    if (!student.busRouteId) {
      return NextResponse.json(
        { error: 'Student is not assigned to any route' },
        { status: 400 }
      );
    }

    // Unassign student from route
    const updatedStudent = await prisma.student.update({
      where: { id: student.id },
      data: { busRouteId: null }
    });

    return NextResponse.json({
      message: 'Student unassigned from route successfully',
      student: updatedStudent
    });

  } catch (error) {
    console.error('Error unassigning student from route:', error);
    return NextResponse.json(
      { error: 'Failed to unassign student from route' },
      { status: 500 }
    );
  }
}
