import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { collectFeeSchema } from '@/lib/validation'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const field = searchParams.get('field') || 'studentId'
    const paymentMode = searchParams.get('paymentMode') || 'all'

    const skip = (page - 1) * limit
    const where: any = {
      schoolId: session.user.schoolId || ""
    }

    if (search) {
      if (field === 'studentId') {
        where.student = {
          OR: [
            { studentId: { contains: search, mode: 'insensitive' } },
            { rollNumber: { contains: search, mode: 'insensitive' } },
            { admissionNumber: { contains: search, mode: 'insensitive' } }
          ]
        }
      } else if (field === 'admissionNumber') {
        where.student = {
          admissionNumber: { contains: search, mode: 'insensitive' }
        }
      } else if (field === 'studentName') {
        where.student = {
          name: { contains: search, mode: 'insensitive' }
        }
      } else if (field === 'amount') {
        where.amount = { equals: parseFloat(search) || 0 }
      } else if (field === 'paymentMode') {
        where.paymentMode = { contains: search, mode: 'insensitive' }
      }
    }

    if (paymentMode && paymentMode !== 'all') {
      where.paymentMode = paymentMode
    }

    const totalCount = await prisma.feeCollection.count({ where })

    const feeCollections = await prisma.feeCollection.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            name: true,
            rollNumber: true,
            admissionNumber: true,
            class: {
              select: {
                classCode: true,
                sectionName: true
              }
            }
          }
        },
        collector: {
          select: { name: true }
        }
      },
      orderBy: { date: 'desc' },
      skip,
      take: limit
    })

    const [totalAmount, cashTotal, upiTotal, bankTransferTotal] = await Promise.all([
      prisma.feeCollection.aggregate({
        where: { schoolId: session.user.schoolId || "" },
        _sum: { amount: true }
      }),
      prisma.feeCollection.aggregate({
        where: { schoolId: session.user.schoolId || "", paymentMode: 'CASH' },
        _sum: { amount: true }
      }),
      prisma.feeCollection.aggregate({
        where: { schoolId: session.user.schoolId || "", paymentMode: 'UPI' },
        _sum: { amount: true }
      }),
      prisma.feeCollection.aggregate({
        where: { schoolId: session.user.schoolId || "", paymentMode: 'BANK_TRANSFER' },
        _sum: { amount: true }
      })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      feeCollections,
      summary: {
        totalAmount: totalAmount._sum.amount || 0,
        cashTotal: cashTotal._sum.amount || 0,
        upiTotal: upiTotal._sum.amount || 0,
        bankTransferTotal: bankTransferTotal._sum.amount || 0,
        totalTransactions: totalCount
      },
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })

  } catch (error) {
    logger.error('Get fee collections error', error as Error, { path: '/api/financial/fee-collection' })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const validation = collectFeeSchema.safeParse({
      ...body,
      paymentMode: body.paymentMode?.toUpperCase()?.replace(/\s+/g, '_')
    })

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Invalid fee collection data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { studentId, amount, paymentMode, notes } = validation.data
    const receiptUrl = body.receiptUrl

    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { studentId: studentId },
          { id: studentId },
          { rollNumber: studentId },
          { admissionNumber: studentId }
        ],
        schoolId: session.user.schoolId || ""
      },
      include: {
        class: {
          select: { classCode: true, sectionName: true }
        }
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    const feeId = `FEE${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`

    const feeCollection = await prisma.feeCollection.create({
      data: {
        feeId,
        studentId: student.id,
        amount: typeof amount === 'number' ? amount : parseFloat(amount),
        paymentMode: paymentMode as any,
        receiptUrl: receiptUrl || null,
        notes: notes || null,
        collectedBy: session.user.id,
        schoolId: session.user.schoolId || "",
      }
    })

    const receiptNumber = `REC-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    return NextResponse.json({
      message: 'Fee collected successfully',
      feeCollection,
      receiptNumber
    }, { status: 201 })

  } catch (error) {
    logger.error('Create fee collection error', error as Error, { path: '/api/financial/fee-collection' })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
