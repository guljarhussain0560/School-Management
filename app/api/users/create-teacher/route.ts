import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateTemporaryPassword } from '@/lib/utils'
import { sendEmail, generateCredentialsEmail } from '@/lib/email'
import { UserRole } from '@prisma/client'
import { createTeacherUserSchema } from '@/lib/validation'
import { logger } from '@/lib/logger'

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
    const validation = createTeacherUserSchema.partial({ password: true }).safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Invalid teacher data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { name, email, phone } = validation.data

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

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword()
    const hashedPassword = await hashPassword(temporaryPassword)

    // Create teacher user
    const teacher = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: UserRole.TEACHER,
        schoolId: session.user.schoolId!,
        createdBy: session.user.id,
      }
    })

    // Send credentials email
    const emailResult = await sendEmail(
      generateCredentialsEmail(name, email, temporaryPassword, 'TEACHER')
    )

    if (!emailResult.success) {
      logger.warn('Failed to send credentials email', { email, error: emailResult.error })
    }

    // Return teacher without password
    const { password: _, ...teacherWithoutPassword } = teacher

    return NextResponse.json({
      message: 'Teacher created successfully',
      teacher: teacherWithoutPassword,
      emailSent: emailResult.success
    }, { status: 201 })

  } catch (error) {
    logger.error('Create teacher error', error as Error, { path: '/api/users/create-teacher' })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
