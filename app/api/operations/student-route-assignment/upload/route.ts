import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No data found in Excel file' },
        { status: 400 }
      );
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any;
      const studentId = row['Student ID'] || row['studentId'] || row['StudentId'];
      const routeId = row['Route ID'] || row['routeId'] || row['RouteId'];

      if (!studentId || !routeId) {
        results.failed++;
        results.errors.push(`Row ${i + 2}: Missing Student ID or Route ID`);
        continue;
      }

      try {
        // Check if student exists and belongs to school
        const student = await prisma.student.findFirst({
          where: {
            studentId: studentId.toString(),
            schoolId: session.user.schoolId!
          }
        });

        if (!student) {
          results.failed++;
          results.errors.push(`Row ${i + 2}: Student with ID ${studentId} not found`);
          continue;
        }

        // Check if student has pickup address
        if (!student.pickupAddress) {
          results.failed++;
          results.errors.push(`Row ${i + 2}: Student ${studentId} has no pickup address`);
          continue;
        }

        // Check if route exists and belongs to school
        const route = await prisma.busRoute.findFirst({
          where: {
            id: routeId.toString(),
            schoolId: session.user.schoolId!
          },
          include: {
            bus: true,
            students: true
          }
        });

        if (!route) {
          results.failed++;
          results.errors.push(`Row ${i + 2}: Route with ID ${routeId} not found`);
          continue;
        }

        // Check if bus capacity is not exceeded
        if (route.students.length >= route.bus.capacity) {
          results.failed++;
          results.errors.push(`Row ${i + 2}: Bus capacity exceeded for route ${route.routeName}`);
          continue;
        }

        // Check if student is already assigned to a route
        if (student.busRouteId) {
          results.failed++;
          results.errors.push(`Row ${i + 2}: Student ${studentId} is already assigned to a route`);
          continue;
        }

        // Assign student to route
        await prisma.student.update({
          where: { id: student.id },
          data: { busRouteId: routeId.toString() }
        });

        results.success++;

      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      message: 'Excel upload completed',
      results
    });

  } catch (error) {
    console.error('Error processing Excel upload:', error);
    return NextResponse.json(
      { error: 'Failed to process Excel upload' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all students and routes for template
    const [students, routes] = await Promise.all([
      prisma.student.findMany({
        where: {
          schoolId: session.user.schoolId!,
          status: 'ACCEPTED'
        },
        select: {
          studentId: true,
          name: true,
          class: {
            select: {
              className: true,
              classCode: true
            }
          },
          pickupAddress: true
        },
        orderBy: { name: 'asc' }
      }),
      prisma.busRoute.findMany({
        where: {
          schoolId: session.user.schoolId!
        },
        include: {
          bus: {
            select: {
              busNumber: true,
              busName: true
            }
          }
        },
        orderBy: { routeName: 'asc' }
      })
    ]);

    // Create template data
    const templateData = [
      {
        'Student ID': 'STU001',
        'Student Name': 'John Doe',
        'Grade': '10',
        'Pickup Address': '123 Main St, City',
        'Route ID': 'route_id_here',
        'Route Name': 'Route A',
        'Bus Number': 'BUS001'
      }
    ];

    // Add sample data from actual students and routes
    const sampleStudents = students.slice(0, 5);
    const sampleRoutes = routes.slice(0, 3);

    sampleStudents.forEach((student, index) => {
      const route = sampleRoutes[index % sampleRoutes.length];
      templateData.push({
        'Student ID': student.studentId,
        'Student Name': student.name,
        'Grade': student.grade,
        'Pickup Address': student.pickupAddress || 'Not provided',
        'Route ID': route.id,
        'Route Name': route.routeName,
        'Bus Number': route.bus.busNumber
      });
    });

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    const columnWidths = [
      { wch: 12 }, // Student ID
      { wch: 20 }, // Student Name
      { wch: 8 },  // Grade
      { wch: 30 }, // Pickup Address
      { wch: 15 }, // Route ID
      { wch: 15 }, // Route Name
      { wch: 12 }  // Bus Number
    ];
    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Route Assignment');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="student_route_assignment_template.xlsx"'
      }
    });

  } catch (error) {
    console.error('Error generating Excel template:', error);
    return NextResponse.json(
      { error: 'Failed to generate Excel template' },
      { status: 500 }
    );
  }
}
