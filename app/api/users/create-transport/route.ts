import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateTemporaryPassword, validateEmail } from '@/lib/utils'
import { sendEmail, generateCredentialsEmail } from '@/lib/email'
import { UserRole } from '@prisma/client'

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
    const { name, email, phone } = body

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
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

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword()
    const hashedPassword = await hashPassword(temporaryPassword)

    // Create transport manager user
    const transportManager = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: UserRole.TRANSPORT,
        schoolId: session.user.schoolId!,
        createdBy: session.user.id,
      }
    })

    // Send credentials email
    const emailResult = await sendEmail(
      generateCredentialsEmail(name, email, temporaryPassword, 'TRANSPORT')
    )

    if (!emailResult.success) {
      console.error('Failed to send credentials email:', emailResult.error)
      // Don't fail the request, just log the error
    }

    // Return transport manager without password
    const { password: _, ...transportWithoutPassword } = transportManager

    return NextResponse.json({
      message: 'Transport manager created successfully',
      transport: transportWithoutPassword,
      emailSent: emailResult.success
    }, { status: 201 })

  } catch (error) {
    console.error('Create transport manager error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
