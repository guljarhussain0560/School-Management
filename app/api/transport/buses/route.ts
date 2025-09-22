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
      busNumber,
      registrationNumber,
      capacity,
      driverName,
      driverPhone,
      conductorName,
      conductorPhone,
      routeId,
      status = 'ACTIVE',
      fuelType = 'DIESEL',
      yearOfManufacture,
      insuranceExpiry,
      fitnessExpiry,
      lastServiceDate,
      nextServiceDate,
      mileage,
      notes
    } = await request.json();

    if (!busNumber || !registrationNumber || !capacity || !driverName || !driverPhone) {
      return NextResponse.json(
        { error: 'Bus number, registration number, capacity, driver name, and driver phone are required' },
        { status: 400 }
      );
    }

    // Check if bus number already exists
    const existingBus = await prisma.bus.findFirst({
      where: {
        busNumber,
        schoolId: session.user.schoolId!
      }
    });

    if (existingBus) {
      return NextResponse.json(
        { error: 'Bus number already exists' },
        { status: 400 }
      );
    }

    const bus = await prisma.bus.create({
      data: {
        busNumber,
        // registrationNumber field doesn't exist in schema
        capacity: parseInt(capacity),
        driverName,
        driverPhone,
        conductorName: conductorName || null,
        conductorPhone: conductorPhone || null,
        // routeId field doesn't exist in schema
        status: status as any,
        fuelType: fuelType as any,
        yearOfManufacture: yearOfManufacture ? parseInt(yearOfManufacture) : null,
        insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null,
        fitnessExpiry: fitnessExpiry ? new Date(fitnessExpiry) : null,
        lastServiceDate: lastServiceDate ? new Date(lastServiceDate) : null,
        nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : null,
        mileage: mileage ? parseInt(mileage) : null,
        notes: notes || null,
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
