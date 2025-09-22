import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const { events } = await request.json();

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'Events array is required' },
        { status: 400 }
      );
    }

    const validEventTypes = ['EXAM', 'HOLIDAY', 'EVENT', 'MEETING', 'DEADLINE', 'OTHER'];
    const results = [];
    const errors = [];

    // Validate all events first
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const rowNumber = i + 1;

      // Validate required fields
      const requiredFields = ['title', 'eventType', 'startDate'];
      for (const field of requiredFields) {
        if (!event[field]) {
          errors.push(`Row ${rowNumber}: ${field} is required`);
          continue;
        }
      }

      // Validate event type
      if (event.eventType && !validEventTypes.includes(event.eventType)) {
        errors.push(`Row ${rowNumber}: Invalid event type`);
        continue;
      }

      // Validate dates
      const startDate = new Date(event.startDate);
      if (isNaN(startDate.getTime())) {
        errors.push(`Row ${rowNumber}: Invalid start date`);
        continue;
      }

      if (event.endDate) {
        const endDate = new Date(event.endDate);
        if (isNaN(endDate.getTime())) {
          errors.push(`Row ${rowNumber}: Invalid end date`);
          continue;
        }
        if (endDate < startDate) {
          errors.push(`Row ${rowNumber}: End date cannot be before start date`);
          continue;
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    // Create events in batch
    const createdEvents = await prisma.academicEvent.createMany({
      data: events.map(event => ({
        title: event.title,
        description: event.description,
        eventType: event.eventType,
        startDate: new Date(event.startDate),
        endDate: event.endDate ? new Date(event.endDate) : null,
        startTime: event.startTime,
        endTime: event.endTime,
        venue: event.venue,
        isAllDay: event.isAllDay || false,
        isRecurring: event.isRecurring || false,
        recurringPattern: event.recurringPattern,
        targetAudience: event.targetAudience || [],
        schoolId,
        createdBy: session.user.id
      }))
    });

    return NextResponse.json({ 
      message: `${createdEvents.count} events created successfully`,
      count: createdEvents.count
    });

  } catch (error) {
    console.error('Error creating bulk events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
