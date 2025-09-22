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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const field = searchParams.get('field') || 'studentId'
    const paymentMode = searchParams.get('paymentMode') || 'all'

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      schoolId: session.user.schoolId
    }

    // Add search filter
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

    // Add payment mode filter
    if (paymentMode && paymentMode !== 'all') {
      where.paymentMode = paymentMode
    }

    // Get total count for pagination
    const totalCount = await prisma.feeCollection.count({ where })

    // Get fee collections with pagination
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
                className: true,
                classCode: true
              }
            }
          }
        },
        collector: {
          select: {
            name: true
          }
        }
      },
      orderBy: { date: 'desc' },
      skip,
      take: limit
    })

    // Calculate summary statistics
    const [totalAmount, cashTotal, upiTotal, bankTransferTotal] = await Promise.all([
      prisma.feeCollection.aggregate({
        where: { schoolId: session.user.schoolId },
        _sum: { amount: true }
      }),
      prisma.feeCollection.aggregate({
        where: { schoolId: session.user.schoolId, paymentMode: 'CASH' },
        _sum: { amount: true }
      }),
      prisma.feeCollection.aggregate({
        where: { schoolId: session.user.schoolId, paymentMode: 'UPI' },
        _sum: { amount: true }
      }),
      prisma.feeCollection.aggregate({
        where: { schoolId: session.user.schoolId, paymentMode: 'BANK_TRANSFER' },
        _sum: { amount: true }
      })
    ])

    const summary = {
      totalAmount: Number(totalAmount._sum.amount || 0),
      totalRecords: totalCount,
      cashTotal: Number(cashTotal._sum.amount || 0),
      upiTotal: Number(upiTotal._sum.amount || 0),
      bankTransferTotal: Number(bankTransferTotal._sum.amount || 0)
    }

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      feeCollections,
      summary,
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
    console.error('Get fee collections error:', error)
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
    const { studentId, amount, paymentMode, receiptUrl, notes } = body

    // Normalize payment mode to uppercase and replace spaces with underscores
    const normalizedPaymentMode = paymentMode?.toUpperCase().replace(/\s+/g, '_')

    // Validation
    if (!studentId || !amount || !paymentMode) {
      return NextResponse.json(
        { error: 'Student ID, amount, and payment mode are required' },
        { status: 400 }
      )
    }

    // Check if student belongs to same school (search by studentId, id, rollNumber, and admissionNumber)
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { studentId: studentId },
          { id: studentId },
          { rollNumber: studentId },
          { admissionNumber: studentId }
        ],
        schoolId: session.user.schoolId!
      },
      include: {
        class: {
          select: {
            className: true,
            classCode: true
          }
        }
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Generate fee ID
    const feeId = `FEE${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

    // Create fee collection record
    const feeCollection = await prisma.feeCollection.create({
      data: {
        feeId,
        studentId: student.id, // Use the actual student ID from database
        amount: parseFloat(amount),
        paymentMode: normalizedPaymentMode,
        receiptUrl,
        notes,
        collectedBy: session.user.id,
        schoolId: session.user.schoolId!,
      }
    })

    // Generate receipt number
    const receiptNumber = `REC-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Prepare receipt data
    const receiptData = {
      receiptNumber,
      studentName: student.name,
      studentId: student.studentId,
      admissionNumber: student.admissionNumber,
      grade: student.class?.className || 'Unknown',
      amount: parseFloat(amount),
      paymentMode: normalizedPaymentMode,
      notes,
      date: new Date().toLocaleDateString('en-IN'),
      collectedBy: session.user.name || 'Admin',
      schoolName: 'Sample School' // You might want to get this from the school record
    };

    return NextResponse.json({
      message: 'Fee collection recorded successfully',
      feeCollection,
      receiptData
    }, { status: 201 })

  } catch (error) {
    console.error('Record fee collection error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
