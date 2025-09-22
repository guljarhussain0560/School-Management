import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateSchoolId } from '@/lib/school-id-generator'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { 
      name, 
      registrationNumber, 
      address, 
      phone, 
      email 
    } = body

    // Validate required fields
    if (!name || !registrationNumber) {
      return NextResponse.json(
        { error: 'School name and registration number are required' },
        { status: 400 }
      )
    }

    // Check if school already exists
    const existingSchool = await prisma.school.findFirst({
      where: {
        OR: [
          { registrationNumber },
          { name: { equals: name, mode: 'insensitive' } }
        ]
      }
    })

    if (existingSchool) {
      return NextResponse.json(
        { error: 'School with this registration number or name already exists' },
        { status: 400 }
      )
    }

    // Generate school ID
    const schoolId = generateSchoolId(name, registrationNumber)
    
    // Generate school code (first 3 letters of name)
    const schoolCode = name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase()

    // Create school
    const school = await prisma.school.create({
      data: {
        schoolId,
        schoolCode,
        name,
        registrationNumber,
        address,
        phone,
        email,
        adminId: session.user.id
      }
    })

    // Update user with schoolId
    await prisma.user.update({
      where: { id: session.user.id },
      data: { schoolId: school.id }
    })

    return NextResponse.json({
      success: true,
      school: {
        id: school.id,
        schoolId: school.schoolId,
        schoolCode: school.schoolCode,
        name: school.name,
        registrationNumber: school.registrationNumber,
        address: school.address,
        phone: school.phone,
        email: school.email
      }
    })

  } catch (error) {
    console.error('School registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register school' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Get school information
    const school = await prisma.school.findFirst({
      where: { adminId: session.user.id },
      select: {
        id: true,
        schoolId: true,
        schoolCode: true,
        name: true,
        registrationNumber: true,
        address: true,
        phone: true,
        email: true,
        createdAt: true
      }
    })

    if (!school) {
      return NextResponse.json(
        { error: 'No school found for this admin' },
        { status: 404 }
      )
    }

    return NextResponse.json({ school })

  } catch (error) {
    console.error('Get school error:', error)
    return NextResponse.json(
      { error: 'Failed to get school information' },
      { status: 500 }
    )
  }
}
