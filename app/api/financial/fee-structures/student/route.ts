import { logger } from '@/lib/logger'
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
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      )
    }

    // Get student details
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        schoolId: session.user.schoolId!
      },
      include: {
        class: true,
        batch: true
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Get applicable fee structures for the student
    const feeStructures = await prisma.feeStructure.findMany({
      where: {
        schoolId: session.user.schoolId!,
        isActive: true,
        applicableFrom: { lte: new Date() },
        AND: [
          {
            OR: [
              { classId: null },
              { classId: student.classId },
              { batchId: student.batchId }
            ]
          },
          {
            OR: [
              { applicableTo: { gte: new Date() } },
              { applicableTo: null }
            ]
          }
        ]
      },
      include: {
        class: {
          select: { id: true, classCode: true, sectionName: true }
        },
        batch: {
          select: { id: true, batchName: true, batchCode: true }
        },
        collections: {
          where: {
            studentId: studentId
          },
          select: { id: true, amount: true, status: true, date: true, dueDate: true }
        }
      },
      orderBy: {
        category: 'asc'
      }
    })

    // Calculate total fees and paid amounts
    const feeSummary = feeStructures.map(fee => {
      const totalPaid = fee.collections.reduce((sum: number, collection: any) => {
        return sum + (collection.status === 'PAID' ? Number(collection.amount) : 0)
      }, 0)
      
      const pendingAmount = Number(fee.amount) - totalPaid
      
      return {
        ...fee,
        totalPaid,
        pendingAmount,
        isPaid: pendingAmount <= 0
      }
    })

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        studentId: student.studentId,
        class: student.class,
        batch: student.batch
      },
      feeStructures: feeSummary
    })
  } catch (error) {
    logger.error('Error fetching student fee structures:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
