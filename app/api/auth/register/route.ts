import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSchoolId } from '@/lib/school-id-generator'
import { hashPassword, validateEmail } from '@/lib/utils'
import { UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, schoolName, schoolRegNo, phone, entityType } = body

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user and school in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // First, create the admin user without schoolId
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: UserRole.ADMIN,
        }
      })

      // Generate school code from name
      const schoolCode = (schoolName || name)
        .replace(/[^a-zA-Z]/g, '')
        .substring(0, 3)
        .toUpperCase()
        .padEnd(3, 'X');

      // Then create the school with the admin reference
      const school = await tx.school.create({
        data: {
          schoolId: generateSchoolId(schoolName || name, schoolRegNo || `SCH-${Date.now()}`),
          schoolCode,
          name: schoolName || name,
          registrationNumber: schoolRegNo || `SCH-${Date.now()}`,
          phone: phone,
          email: email,
          adminId: user.id
        }
      })

      // Finally, update the user with the schoolId
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { schoolId: school.id }
      })

      return { user: updatedUser, school }
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = result.user

    return NextResponse.json({
      message: 'Registration successful',
      user: userWithoutPassword,
      school: result.school
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
