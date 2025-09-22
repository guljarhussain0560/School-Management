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
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause
    const where: any = {
      schoolId: session.user.schoolId
    }

    if (studentId) {
      where.studentId = studentId
    }

    if (status) {
      where.status = status
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const feeCollections = await prisma.feeCollection.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            studentId: true,
            class: {
              select: {
                className: true,
                classCode: true
              }
            }
          }
        },
        feeStructure: {
          select: {
            id: true,
            name: true,
            feeCode: true,
            category: true
          }
        },
        collector: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json({
      feeCollections
    })
  } catch (error) {
    console.error('Error fetching fee collections:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      studentId, 
      feeStructureId, 
      amount, 
      paymentMode, 
      dueDate, 
      notes 
    } = body

    // Validate required fields
    if (!studentId || !amount || !paymentMode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if student exists and belongs to school
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        schoolId: session.user.schoolId!
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // If feeStructureId is provided, validate it
    if (feeStructureId) {
      const feeStructure = await prisma.feeStructure.findFirst({
        where: {
          id: feeStructureId,
          schoolId: session.user.schoolId!
        }
      })

      if (!feeStructure) {
        return NextResponse.json(
          { error: 'Fee structure not found' },
          { status: 404 }
        )
      }
    }

    // Generate fee collection ID
    const feeCount = await prisma.feeCollection.count({
      where: { schoolId: session.user.schoolId }
    })
    const feeId = `FEE${String(feeCount + 1).padStart(6, '0')}`

    const feeCollection = await prisma.feeCollection.create({
      data: {
        feeId,
        studentId,
        feeStructureId: feeStructureId || null,
        amount: parseFloat(amount),
        paymentMode,
        collectedBy: session.user.id,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes: notes || null,
        schoolId: session.user.schoolId!
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            studentId: true,
            class: {
              select: {
                className: true,
                classCode: true
              }
            }
          }
        },
        feeStructure: {
          select: {
            id: true,
            name: true,
            feeCode: true,
            category: true
          }
        },
        collector: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      feeCollection,
      message: 'Fee collection recorded successfully'
    })
  } catch (error) {
    console.error('Error creating fee collection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      id,
      amount, 
      paymentMode, 
      status,
      dueDate, 
      notes 
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Fee collection ID is required' },
        { status: 400 }
      )
    }

    // Check if fee collection exists and belongs to school
    const existingCollection = await prisma.feeCollection.findFirst({
      where: {
        id,
        schoolId: session.user.schoolId!
      }
    })

    if (!existingCollection) {
      return NextResponse.json(
        { error: 'Fee collection not found' },
        { status: 404 }
      )
    }

    const updatedCollection = await prisma.feeCollection.update({
      where: { id },
      data: {
        amount: amount ? parseFloat(amount) : existingCollection.amount,
        paymentMode: paymentMode || existingCollection.paymentMode,
        status: status || existingCollection.status,
        dueDate: dueDate ? new Date(dueDate) : existingCollection.dueDate,
        notes: notes !== undefined ? notes : existingCollection.notes
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            studentId: true,
            class: {
              select: {
                className: true,
                classCode: true
              }
            }
          }
        },
        feeStructure: {
          select: {
            id: true,
            name: true,
            feeCode: true,
            category: true
          }
        },
        collector: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      feeCollection: updatedCollection,
      message: 'Fee collection updated successfully'
    })
  } catch (error) {
    console.error('Error updating fee collection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const collectionId = searchParams.get('id')

    if (!collectionId) {
      return NextResponse.json(
        { error: 'Fee collection ID is required' },
        { status: 400 }
      )
    }

    // Check if fee collection exists and belongs to school
    const feeCollection = await prisma.feeCollection.findFirst({
      where: {
        id: collectionId,
        schoolId: session.user.schoolId!
      }
    })

    if (!feeCollection) {
      return NextResponse.json(
        { error: 'Fee collection not found' },
        { status: 404 }
      )
    }

    await prisma.feeCollection.delete({
      where: {
        id: collectionId
      }
    })

    return NextResponse.json({
      message: 'Fee collection deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting fee collection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
