import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateTemporaryPassword } from '@/lib/utils'
import { sendEmail, generateCredentialsEmail } from '@/lib/email'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { newPassword, sendEmail: shouldSendEmail } = body

    // Get the user to update
    const user = await prisma.user.findFirst({
      where: {
        id,
        schoolId: session.user.schoolId // Ensure user belongs to same school
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Generate new password or use provided one
    const password = newPassword || generateTemporaryPassword()
    const hashedPassword = await hashPassword(password)

    // Update user password
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    // Send email if requested
    let emailSent = false
    if (shouldSendEmail) {
      const emailResult = await sendEmail(
        generateCredentialsEmail(
          user.name || 'User',
          user.email,
          password,
          user.role as 'TEACHER' | 'TRANSPORT'
        )
      )
      emailSent = emailResult.success
    }

    return NextResponse.json({
      message: 'Password updated successfully',
      user: updatedUser,
      emailSent
    })

  } catch (error) {
    console.error('Update password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
