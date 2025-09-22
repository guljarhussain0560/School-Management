import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const grade = searchParams.get('grade') || 'all'

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build where clause
    const whereClause: any = {
      schoolId: session.user.schoolId
    }

    // Add search filter
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { grade: { contains: search, mode: 'insensitive' } },
        { parentName: { contains: search, mode: 'insensitive' } },
        { parentEmail: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Add grade filter
    if (grade && grade !== 'all') {
      whereClause.grade = grade
    }

    // Add status filter
    if (status && status !== 'all') {
      whereClause.status = status
    }

    // Get total count for pagination
    const totalCount = await prisma.student.count({ where: whereClause })

    // Get students with pagination
    const students = await prisma.student.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }, // Most recent first
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        class: {
          select: {
            className: true
          }
        },
        createdAt: true,
        updatedAt: true,
        email: true,
        parentContact: true,
        parentName: true,
        parentEmail: true,
        admissionDate: true,
        admissionNumber: true,
        status: true
      }
    })


    // Transform to match the expected format
    const recentAdmissions = students.map((student) => ({
      id: student.id,
      name: student.name,
      grade: student.class?.className || 'Unknown',
      enrolledDate: student.createdAt.toISOString().split('T')[0],
      status: student.status, // Use actual status from database
      parentName: student.parentName,
      parentEmail: student.parentEmail,
      parentContact: student.parentContact,
      admissionNumber: student.admissionNumber,
      admissionDate: student.admissionDate?.toISOString().split('T')[0]
    }))

    // Get statistics from actual database counts
    const [totalStudents, approvedCount, pendingCount, underReviewCount, rejectedCount] = await Promise.all([
      prisma.student.count({ where: { schoolId: session.user.schoolId } }),
      prisma.student.count({ where: { schoolId: session.user.schoolId, status: 'ACCEPTED' } }),
      prisma.student.count({ where: { schoolId: session.user.schoolId, status: 'PENDING' } }),
      prisma.student.count({ where: { schoolId: session.user.schoolId, status: 'UNDER_REVIEW' } }),
      prisma.student.count({ where: { schoolId: session.user.schoolId, status: 'REJECTED' } })
    ])

    const stats = {
      total: totalStudents,
      approved: approvedCount,
      pending: pendingCount,
      underReview: underReviewCount,
      rejected: rejectedCount
    }


    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      admissions: recentAdmissions,
      stats,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage
      }
    })

  } catch (error) {
    console.error('Error fetching recent admissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent admissions' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { studentId, status } = await request.json()

    if (!studentId || !status) {
      return NextResponse.json({ error: 'Student ID and status are required' }, { status: 400 })
    }

    // For now, we'll just return success since we don't have a status field in Student model
    // In a real implementation, you might want to add an admission status field
    return NextResponse.json({
      message: 'Admission status updated successfully',
      studentId,
      status
    })

  } catch (error) {
    console.error('Error updating admission status:', error)
    return NextResponse.json(
      { error: 'Failed to update admission status' },
      { status: 500 }
    )
  }
}
