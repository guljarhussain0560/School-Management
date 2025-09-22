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

    const schoolId = session.user.schoolId!;
    const eventId = params.id;

    const event = await prisma.academicEvent.findFirst({
      where: { id: eventId, schoolId }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ event });

  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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

    const schoolId = session.user.schoolId!;
    const eventId = params.id;
    const data = await request.json();

    // Check if event exists
    const existingEvent = await prisma.academicEvent.findFirst({
      where: { id: eventId, schoolId }
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Validate event type if provided
    if (data.eventType) {
      const validEventTypes = ['EXAM', 'HOLIDAY', 'EVENT', 'MEETING', 'DEADLINE', 'OTHER'];
      if (!validEventTypes.includes(data.eventType)) {
        return NextResponse.json(
          { error: 'Invalid event type' },
          { status: 400 }
        );
      }
    }

    // Validate dates if provided
    if (data.startDate) {
      const startDate = new Date(data.startDate);
      if (isNaN(startDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid start date' },
          { status: 400 }
        );
      }
    }

    if (data.endDate) {
      const endDate = new Date(data.endDate);
      if (isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid end date' },
          { status: 400 }
        );
      }
    }

    // Update event
    const event = await prisma.academicEvent.update({
      where: { id: eventId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.eventType && { eventType: data.eventType }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
        ...(data.startTime !== undefined && { startTime: data.startTime }),
        ...(data.endTime !== undefined && { endTime: data.endTime }),
        ...(data.venue !== undefined && { venue: data.venue }),
        ...(data.isAllDay !== undefined && { isAllDay: data.isAllDay }),
        ...(data.isRecurring !== undefined && { isRecurring: data.isRecurring }),
        ...(data.recurringPattern !== undefined && { recurringPattern: data.recurringPattern }),
        ...(data.targetAudience !== undefined && { targetAudience: data.targetAudience })
      }
    });

    return NextResponse.json({ event });

  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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

    const schoolId = session.user.schoolId!;
    const eventId = params.id;

    // Check if event exists
    const existingEvent = await prisma.academicEvent.findFirst({
      where: { id: eventId, schoolId }
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Delete event
    await prisma.academicEvent.delete({
      where: { id: eventId }
    });

    return NextResponse.json({ message: 'Event deleted successfully' });

  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
