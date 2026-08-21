import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createExpenseSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const contentType = request.headers.get('content-type') || ''
    let department = ''
    let amount = ''
    let description = ''
    let receipt: File | null = null
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      department = (formData.get('department') as string) || ''
      amount = (formData.get('amount') as string) || ''
      description = (formData.get('description') as string) || ''
      receipt = formData.get('receipt') as File | null
    } else {
      const json = await request.json()
      department = json.department || ''
      amount = json.amount ? json.amount.toString() : ''
      description = json.description || ''
    }

    const validation = createExpenseSchema.safeParse({ department, amount, description: description || 'General Expense' })
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Invalid expense payload' },
        { status: 400 }
      )
    }

    const amountValue = parseFloat(amount)

    // Handle receipt upload (optional)
    let receiptUrl = null
    if (receipt && receipt.size > 0) {
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
      message: 'Budget expense created successfully',
      expense: budgetExpense
    }, { status: 201 })

  } catch (error) {
    logger.error('Create budget expense error:', error)
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
    const department = searchParams.get('department') || 'all'

    const skip = (page - 1) * limit
    const where: any = {
      createdBy: session.user.id
    }

    if (department !== 'all') {
      where.department = department
    }

    const [expenses, total] = await Promise.all([
      prisma.budgetExpense.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.budgetExpense.count({ where })
    ])

    return NextResponse.json({
      expenses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    logger.error('Get budget expenses error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
