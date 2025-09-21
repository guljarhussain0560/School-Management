import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const contentType = request.headers.get('content-type')
    
    // Handle form data (with file upload)
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData()
      const department = formData.get('department') as string
      const amount = formData.get('amount') as string
      const description = formData.get('description') as string
      const receipt = formData.get('receipt') as File

      // Validation
      if (!department || !amount) {
        return NextResponse.json(
          { error: 'Department and amount are required' },
          { status: 400 }
        )
      }

      const amountValue = parseFloat(amount)
      if (isNaN(amountValue) || amountValue <= 0) {
        return NextResponse.json(
          { error: 'Amount must be a positive number' },
          { status: 400 }
        )
      }

      // Handle receipt upload (optional)
      let receiptUrl = null
      if (receipt && receipt.size > 0) {
        // For now, we'll store the file name. In production, you'd upload to S3 or similar
        receiptUrl = `receipts/${Date.now()}_${receipt.name}`
      }

      // Create budget expense record
      const budgetExpense = await prisma.budgetExpense.create({
        data: {
          department,
          amount: amountValue,
          description: description || null,
          receiptUrl,
          createdBy: session.user.id
        }
      })

      return NextResponse.json({
        message: 'Budget expense recorded successfully',
        expense: budgetExpense
      }, { status: 201 })
    }

    // Handle JSON data (without file upload)
    const body = await request.json()
    const { department, amount, description } = body

    // Validation
    if (!department || !amount) {
      return NextResponse.json(
        { error: 'Department and amount are required' },
        { status: 400 }
      )
    }

    const amountValue = parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      )
    }

    // Create budget expense record
    const budgetExpense = await prisma.budgetExpense.create({
      data: {
        department,
        amount: amountValue,
        description: description || null,
        createdBy: session.user.id
      }
    })

    return NextResponse.json({
      message: 'Budget expense recorded successfully',
      expense: budgetExpense
    }, { status: 201 })

  } catch (error) {
    console.error('Create budget expense error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const department = searchParams.get('department') || 'all'
    const status = searchParams.get('status') || 'all'

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    // Add search filter
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Add department filter
    if (department && department !== 'all') {
      where.department = department
    }

    // Add status filter
    if (status && status !== 'all') {
      where.status = status
    }

    // Get total count for pagination
    const totalCount = await prisma.budgetExpense.count({ where })

    // Get budget expenses with pagination
    const expenses = await prisma.budgetExpense.findMany({
      where,
      include: {
        creator: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    // Calculate comprehensive summary statistics for all budget statuses
    const [
      totalExpenses,
      totalAmount,
      pendingTotal,
      underReviewTotal,
      approvedTotal,
      rejectedTotal,
      completedTotal,
      cancelledTotal
    ] = await Promise.all([
      prisma.budgetExpense.count(),
      prisma.budgetExpense.aggregate({
        _sum: { amount: true }
      }),
      prisma.budgetExpense.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true }
      }),
      prisma.budgetExpense.aggregate({
        where: { status: 'UNDER_REVIEW' },
        _sum: { amount: true }
      }),
      prisma.budgetExpense.aggregate({
        where: { status: 'APPROVED' },
        _sum: { amount: true }
      }),
      prisma.budgetExpense.aggregate({
        where: { status: 'REJECTED' },
        _sum: { amount: true }
      }),
      prisma.budgetExpense.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.budgetExpense.aggregate({
        where: { status: 'CANCELLED' },
        _sum: { amount: true }
      })
    ])

    // Calculate net budget (total - rejected - cancelled)
    const netBudget = Number(totalAmount._sum.amount || 0) - 
                     Number(rejectedTotal._sum.amount || 0) - 
                     Number(cancelledTotal._sum.amount || 0)

    const summary = {
      totalExpenses,
      totalAmount: Number(totalAmount._sum.amount || 0),
      netBudget,
      pendingTotal: Number(pendingTotal._sum.amount || 0),
      underReviewTotal: Number(underReviewTotal._sum.amount || 0),
      approvedTotal: Number(approvedTotal._sum.amount || 0),
      rejectedTotal: Number(rejectedTotal._sum.amount || 0),
      completedTotal: Number(completedTotal._sum.amount || 0),
      cancelledTotal: Number(cancelledTotal._sum.amount || 0)
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
    console.error('Get budget expenses error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
