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
    const search = searchParams.get('search') || '';

    if (studentId) {
      // Search by specific student ID
      const student = await prisma.student.findFirst({
        where: {
          studentId,
          schoolId: session.user.schoolId!,
          status: 'ACCEPTED'
        },
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
          parentContact: true,
          busRouteId: true,
          busRoute: {
            include: {
              bus: {
                select: {
                  id: true,
                  busNumber: true,
                  busName: true,
                  driverName: true
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

    // Search by name or student ID
    const students = await prisma.student.findMany({
      where: {
        schoolId: session.user.schoolId!,
        status: 'ACCEPTED',
        OR: [
          { studentId: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } }
        ]
      },
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
        parentContact: true,
        busRouteId: true,
        busRoute: {
          include: {
            bus: {
              select: {
                id: true,
                busNumber: true,
                busName: true,
                driverName: true
              }
            }
          }
        }
      },
      take: 10,
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ students });

  } catch (error) {
    console.error('Error searching students:', error);
    return NextResponse.json(
      { error: 'Failed to search students' },
      { status: 500 }
    );
  }
}
