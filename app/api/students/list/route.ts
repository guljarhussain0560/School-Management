import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Get students for the current school
    const students = await prisma.student.findMany({
      where: {
        schoolId: session.user.schoolId
      },
      select: {
        id: true,
        name: true,
        grade: true,
        admissionNumber: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      students
    })

  } catch (error) {
    console.error('Get students list error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
