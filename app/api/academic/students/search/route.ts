import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const grade = searchParams.get('grade') || ''

    // Build where clause
    const where: any = {
      schoolId: session.user.schoolId,
      status: 'ACCEPTED' // Only show accepted students
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { studentId: { contains: search, mode: 'insensitive' } },
        { rollNumber: { contains: search, mode: 'insensitive' } },
        { admissionNumber: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (grade) {
      where.class = {
        className: {
          contains: `Class ${grade}`,
          mode: 'insensitive'
        }
      }
    }

    const students = await prisma.student.findMany({
      where,
      select: {
        id: true,
        studentId: true,
        name: true,
        rollNumber: true,
        admissionNumber: true,
        class: {
          select: {
            className: true,
            classCode: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      },
      take: 20 // Limit results for performance
    })

    return NextResponse.json({
      students
    })
  } catch (error) {
    console.error('Error searching students:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
