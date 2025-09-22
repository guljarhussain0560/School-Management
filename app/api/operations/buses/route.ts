import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { IDService } from '@/lib/id-service';

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
        { busNumber: { contains: search, mode: 'insensitive' } },
        { busName: { contains: search, mode: 'insensitive' } },
        { driverName: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [buses, totalCount] = await Promise.all([
      prisma.bus.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          routes: {
            select: {
              id: true,
              routeName: true,
              status: true
            }
          }
        }
      }),
      prisma.bus.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      buses,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit
      }
    });

  } catch (error) {
    console.error('Error fetching buses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buses' },
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
      route,
      capacity,
      busName,
      driverName,
      driverPhone,
      conductorName,
      conductorPhone,
      status = 'ACTIVE'
    } = await request.json();

    if (!route || !capacity) {
      return NextResponse.json(
        { error: 'Route and capacity are required' },
        { status: 400 }
      );
    }

    // Initialize ID service with school configuration
    await IDService.initializeSchool(session.user.schoolId!);

    // Generate unique bus number
    const busNumber = await IDService.generateBusNumber(route, capacity, session.user.schoolId!);

    const bus = await prisma.bus.create({
      data: {
        busNumber,
        busName: busName || null,
        capacity: capacity || 50,
        driverName: driverName || null,
        driverPhone: driverPhone || null,
        conductorName: conductorName || null,
        conductorPhone: conductorPhone || null,
        status,
        schoolId: session.user.schoolId!
      },
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
      message: 'Bus created successfully',
      bus
    });

  } catch (error) {
    console.error('Error creating bus:', error);
    return NextResponse.json(
      { error: 'Failed to create bus' },
      { status: 500 }
    );
  }
}
