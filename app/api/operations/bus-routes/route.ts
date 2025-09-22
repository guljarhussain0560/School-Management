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
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      schoolId: session.user.schoolId!
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { routeName: { contains: search, mode: 'insensitive' } },
        { bus: { busNumber: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [routes, totalCount] = await Promise.all([
      prisma.busRoute.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      prisma.busRoute.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      routes,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit
      }
    });

  } catch (error) {
    console.error('Error fetching bus routes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bus routes' },
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

    const {
      routeName,
      busId,
      status = 'ON_TIME'
    } = await request.json();

    if (!routeName || !busId) {
      return NextResponse.json(
        { error: 'Route name and bus ID are required' },
        { status: 400 }
      );
    }

    // Check if bus exists and belongs to school
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

    // Check if route name already exists for this school
    const existingRoute = await prisma.busRoute.findFirst({
      where: {
        routeName,
        schoolId: session.user.schoolId!
      }
    });

    if (existingRoute) {
      return NextResponse.json(
        { error: 'Route name already exists' },
        { status: 400 }
      );
    }

    const route = await prisma.busRoute.create({
      data: {
        routeName,
        busId,
        status,
        managedBy: session.user.id,
        schoolId: session.user.schoolId!
      },
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
      message: 'Bus route created successfully',
      route
    });

  } catch (error) {
    console.error('Error creating bus route:', error);
    return NextResponse.json(
      { error: 'Failed to create bus route' },
      { status: 500 }
    );
  }
}