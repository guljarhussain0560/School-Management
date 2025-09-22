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

    // Get school profile for the current user's school
    const school = await prisma.school.findFirst({
      where: { 
        OR: [
          { adminId: session.user.id },
          { id: session.user.schoolId }
        ]
      },
      select: {
        id: true,
        schoolId: true,
        schoolCode: true,
        name: true,
        registrationNumber: true,
        address: true,
        phone: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      profile: {
        id: school.id,
        schoolName: school.name,
        schoolCode: school.schoolCode,
        address: school.address,
        phone: school.phone,
        email: school.email,
        // Add default values for missing fields
        city: '',
        state: '',
        pincode: '',
        country: '',
        website: '',
        establishedYear: 2000,
        affiliation: '',
        board: '',
        principalName: '',
        principalEmail: '',
        principalPhone: '',
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,
        motto: '',
        vision: '',
        mission: '',
        isActive: true,
        createdAt: school.createdAt.toISOString(),
        updatedAt: school.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching school profile:', error);
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
      schoolName,
      schoolCode,
      address,
      city,
      state,
      pincode,
      country,
      phone,
      email,
      website,
      establishedYear,
      affiliation,
      board,
      principalName,
      principalEmail,
      principalPhone,
      motto,
      vision,
      mission
    } = body;

    // Validate required fields
    if (!schoolName || !schoolCode) {
      return NextResponse.json(
        { error: 'School name and school code are required' },
        { status: 400 }
      );
    }

    // Find the school to update
    const school = await prisma.school.findFirst({
      where: { 
        OR: [
          { adminId: session.user.id },
          { id: session.user.schoolId }
        ]
      }
    });

    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    // Check if school code is being changed and if it already exists
    if (schoolCode !== school.schoolCode) {
      const existingSchool = await prisma.school.findFirst({
        where: {
          schoolCode,
          id: { not: school.id }
        }
      });

      if (existingSchool) {
        return NextResponse.json(
          { error: 'School code already exists' },
          { status: 400 }
        );
      }
    }

    // Update school profile
    const updatedSchool = await prisma.school.update({
      where: { id: school.id },
      data: {
        name: schoolName,
        schoolCode,
        address: address || school.address,
        phone: phone || school.phone,
        email: email || school.email,
        // Note: Additional fields like city, state, etc. would need to be added to the schema
        // For now, we'll store them in a JSON field or extend the schema
      },
      select: {
        id: true,
        schoolId: true,
        schoolCode: true,
        name: true,
        registrationNumber: true,
        address: true,
        phone: true,
        email: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      message: 'School profile updated successfully',
      profile: {
        id: updatedSchool.id,
        schoolName: updatedSchool.name,
        schoolCode: updatedSchool.schoolCode,
        address: updatedSchool.address,
        phone: updatedSchool.phone,
        email: updatedSchool.email,
        city: '',
        state: '',
        pincode: '',
        country: '',
        website: '',
        establishedYear: 2000,
        affiliation: '',
        board: '',
        principalName: '',
        principalEmail: '',
        principalPhone: '',
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,
        motto: '',
        vision: '',
        mission: '',
        isActive: true,
        createdAt: updatedSchool.updatedAt.toISOString(),
        updatedAt: updatedSchool.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating school profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
