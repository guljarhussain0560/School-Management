import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const busRoutes = await prisma.busRoute.findMany({
      include: {
        students: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({ busRoutes });
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
    const { studentId, routeId } = await request.json();

    if (!studentId || !routeId) {
      return NextResponse.json(
        { error: 'Student ID and Route ID are required' },
        { status: 400 }
      );
    }

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Check if route exists
    const route = await prisma.busRoute.findUnique({
      where: { id: routeId }
    });

    if (!route) {
      return NextResponse.json(
        { error: 'Route not found' },
        { status: 404 }
      );
    }

    // Assign student to route
    await prisma.student.update({
      where: { id: studentId },
      data: { busRouteId: routeId }
    });

    return NextResponse.json({ 
      message: 'Student assigned to route successfully' 
    });
  } catch (error) {
    console.error('Error assigning student to route:', error);
    return NextResponse.json(
      { error: 'Failed to assign student to route' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { routeId, status, delayReason } = await request.json();

    if (!routeId || !status) {
      return NextResponse.json(
        { error: 'Route ID and status are required' },
        { status: 400 }
      );
    }

    // Update route status
    const updatedRoute = await prisma.busRoute.update({
      where: { id: routeId },
      data: { 
        status,
        delayReason: delayReason || null,
        lastUpdated: new Date()
      }
    });

    return NextResponse.json({ 
      message: 'Route status updated successfully',
      route: updatedRoute
    });
  } catch (error) {
    console.error('Error updating route status:', error);
    return NextResponse.json(
      { error: 'Failed to update route status' },
      { status: 500 }
    );
  }
}