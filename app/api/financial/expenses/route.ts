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
    const department = searchParams.get('department') || 'all'

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      createdBy: session.user.id
    }

    // Add department filter
    if (department && department !== 'all') {
      where.department = department
    }

    // Get total count for pagination
    const totalCount = await prisma.budgetExpense.count({ where })

    // Get expenses with pagination
    const expenses = await prisma.budgetExpense.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    // Calculate summary statistics
    const [totalAmount, pendingAmount, approvedAmount, rejectedAmount] = await Promise.all([
      prisma.budgetExpense.aggregate({
        where: { createdBy: session.user.id },
        _sum: { amount: true }
      }),
      prisma.budgetExpense.aggregate({
        where: { createdBy: session.user.id, status: 'PENDING' },
        _sum: { amount: true }
      }),
      prisma.budgetExpense.aggregate({
        where: { createdBy: session.user.id, status: 'APPROVED' },
        _sum: { amount: true }
      }),
      prisma.budgetExpense.aggregate({
        where: { createdBy: session.user.id, status: 'REJECTED' },
        _sum: { amount: true }
      })
    ])

    const summary = {
      totalAmount: Number(totalAmount._sum.amount || 0),
      totalRecords: totalCount,
      pendingAmount: Number(pendingAmount._sum.amount || 0),
      approvedAmount: Number(approvedAmount._sum.amount || 0),
      rejectedAmount: Number(rejectedAmount._sum.amount || 0)
    }

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      expenses,
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
    console.error('Get expenses error:', error)
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

    const formData = await request.formData()
    const department = formData.get('department') as string
    const amount = formData.get('amount') as string
    const description = formData.get('description') as string
    const receipt = formData.get('receipt') as File | null

    // Validation
    if (!department || !amount || !description) {
      return NextResponse.json(
        { error: 'Department, amount, and description are required' },
        { status: 400 }
      )
    }

    // For now, we'll store the receipt as a simple string
    // In a real implementation, you'd upload to S3 or similar
    let receiptUrl = null
    if (receipt && receipt.size > 0) {
      receiptUrl = `receipt_${Date.now()}_${receipt.name}`
    }

    // Create expense record
    const expense = await prisma.budgetExpense.create({
      data: {
        department,
        amount: parseFloat(amount),
        description,
        receiptUrl,
        createdBy: session.user.id
      }
    })

    return NextResponse.json({
      message: 'Expense recorded successfully',
      expense
    }, { status: 201 })

  } catch (error) {
    console.error('Record expense error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
