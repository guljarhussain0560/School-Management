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

    const schoolId = session.user.schoolId!;
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = { schoolId };

    if (eventType) {
      where.eventType = eventType;
    }

    if (startDate && endDate) {
      where.startDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const events = await prisma.academicEvent.findMany({
      where,
      orderBy: { startDate: 'asc' }
    });

    return NextResponse.json({ events });

  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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

    const schoolId = session.user.schoolId!;
    const data = await request.json();

    // Validate required fields
    const requiredFields = ['title', 'eventType', 'startDate'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate event type
    const validEventTypes = ['EXAM', 'HOLIDAY', 'EVENT', 'MEETING', 'DEADLINE', 'OTHER'];
    if (!validEventTypes.includes(data.eventType)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    // Validate dates
    const startDate = new Date(data.startDate);
    if (isNaN(startDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid start date' },
        { status: 400 }
      );
    }

    if (data.endDate) {
      const endDate = new Date(data.endDate);
      if (isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid end date' },
          { status: 400 }
        );
      }
      if (endDate < startDate) {
        return NextResponse.json(
          { error: 'End date cannot be before start date' },
          { status: 400 }
        );
      }
    }

    // Create event
    const event = await prisma.academicEvent.create({
      data: {
        title: data.title,
        description: data.description,
        eventType: data.eventType,
        startDate: startDate,
        endDate: data.endDate ? new Date(data.endDate) : null,
        startTime: data.startTime,
        endTime: data.endTime,
        venue: data.venue,
        isAllDay: data.isAllDay || false,
        isRecurring: data.isRecurring || false,
        recurringPattern: data.recurringPattern,
        targetAudience: data.targetAudience || [],
        schoolId,
        createdBy: session.user.id
      }
    });

    return NextResponse.json({ event }, { status: 201 });

  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}