import { logger } from '@/lib/logger'
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
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const where: any = {
      schoolId: session.user.schoolId!
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { routeName: { contains: search, mode: 'insensitive' } },
        { delayReason: { contains: search, mode: 'insensitive' } }
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
            select: { id: true, busNumber: true, status: true }
          },
          manager: {
            select: { id: true, name: true, email: true }
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
    logger.error('Error fetching bus routes:', error);
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

    if (!['ADMIN', 'TRANSPORT'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Transport or Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { routeName, status = 'ON_TIME', busId, delayReason } = body;

    if (!routeName) {
      return NextResponse.json(
        { error: 'Route name is required' },
        { status: 400 }
      );
    }

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

    const firstBus = busId ? { id: busId } : await prisma.bus.findFirst({ where: { schoolId: session.user.schoolId! } });
    const route = await prisma.busRoute.create({
      data: {
        routeName,
        busId: firstBus?.id || '',
        status: (status as any) || 'ON_TIME',
        delayReason: delayReason || null,
        managedBy: session.user.id,
        schoolId: session.user.schoolId!
      },
      include: {
        bus: {
          select: { id: true, busNumber: true, status: true }
        }
      }
    });

    return NextResponse.json({
      message: 'Route created successfully',
      route
    }, { status: 201 });

  } catch (error) {
    logger.error('Error creating bus route:', error);
    return NextResponse.json(
      { error: 'Failed to create bus route' },
      { status: 500 }
    );
  }
}
