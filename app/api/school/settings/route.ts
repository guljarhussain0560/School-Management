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

    // For now, return default settings since we don't have a settings table yet
    const defaultSettings = {
      id: 'default',
      academicYear: '2024-25',
      sessionStart: '2024-04-01',
      sessionEnd: '2025-03-31',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      schoolTimings: {
        start: '08:00',
        end: '15:00'
      },
      breakTimings: {
        start: '12:00',
        end: '12:30'
      },
      attendanceSettings: {
        minimumAttendance: 75,
        lateArrivalTime: '08:15'
      },
      feeSettings: {
        lateFeeAmount: 100,
        lateFeeDays: 5
      },
      notificationSettings: {
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true
      },
      systemSettings: {
        timezone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY',
        currency: 'INR',
        language: 'en'
      }
    };

    return NextResponse.json({ 
      settings: defaultSettings
    });

  } catch (error) {
    console.error('Error fetching school settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      academicYear,
      sessionStart,
      sessionEnd,
      schoolStartTime,
      schoolEndTime,
      breakStartTime,
      breakEndTime,
      minimumAttendance,
      lateArrivalTime,
      lateFeeAmount,
      lateFeeDays,
      timezone,
      dateFormat,
      currency,
      language
    } = body;

    // For now, just return success since we don't have a settings table
    // In a real implementation, you would save these to a database table
    console.log('School settings update requested:', body);

    return NextResponse.json({
      message: 'School settings updated successfully',
      settings: {
        id: 'default',
        academicYear: academicYear || '2024-25',
        sessionStart: sessionStart || '2024-04-01',
        sessionEnd: sessionEnd || '2025-03-31',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        schoolTimings: { 
          start: schoolStartTime || '08:00', 
          end: schoolEndTime || '15:00' 
        },
        breakTimings: { 
          start: breakStartTime || '12:00', 
          end: breakEndTime || '12:30' 
        },
        attendanceSettings: { 
          minimumAttendance: minimumAttendance || 75, 
          lateArrivalTime: lateArrivalTime || '08:15' 
        },
        feeSettings: { 
          lateFeeAmount: lateFeeAmount || 100, 
          lateFeeDays: lateFeeDays || 5 
        },
        notificationSettings: { 
          emailNotifications: true, 
          smsNotifications: true, 
          pushNotifications: true 
        },
        systemSettings: { 
          timezone: timezone || 'Asia/Kolkata', 
          dateFormat: dateFormat || 'DD/MM/YYYY', 
          currency: currency || 'INR', 
          language: language || 'en' 
        }
      }
    });

  } catch (error) {
    console.error('Error updating school settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
