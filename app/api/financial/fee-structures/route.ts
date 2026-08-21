import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createFeeStructureSchema } from '@/lib/validation'
import { logger } from '@/lib/logger'

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
    const classId = searchParams.get('classId')
    const batchId = searchParams.get('batchId')
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')

    // Build where clause
    const where: any = {
      schoolId: session.user.schoolId
    }

    if (classId) {
      where.classId = classId
    }

    if (batchId) {
      where.batchId = batchId
    }

    if (category) {
      where.category = category
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    const feeStructures = await prisma.feeStructure.findMany({
      where,
      include: {
        class: {
          select: { id: true, classCode: true, sectionName: true }
        },
        batch: {
          select: { id: true, batchName: true, batchCode: true }
        },
        creator: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { collections: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      feeStructures
    })
  } catch (error) {
    logger.error('Error fetching fee structures', error as Error, { path: '/api/financial/fee-structures' })
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

    // Only admin can create fee structures
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = createFeeStructureSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Invalid fee structure data', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { 
      name, 
      description, 
      amount, 
      frequency, 
      category, 
      isMandatory, 
      isActive,
      applicableFrom,
      applicableTo,
      classId, 
      batchId 
    } = validation.data

    // Generate fee code
    const feeCount = await prisma.feeStructure.count({
      where: { schoolId: session.user.schoolId || '' }
    })
    const feeCode = `FEE${String(feeCount + 1).padStart(3, '0')}`

    // Check if fee structure already exists for the same class
    const existingFee = await prisma.feeStructure.findFirst({
      where: {
        name,
        classId: classId || null,
        schoolId: session.user.schoolId!
      }
    })

    if (existingFee) {
      return NextResponse.json(
        { error: 'Fee structure with this name already exists for the selected class' },
        { status: 409 }
      )
    }

    const feeStructure = await prisma.feeStructure.create({
      data: {
        feeCode,
        name,
        description: description || null,
        amount: typeof amount === 'number' ? amount : parseFloat(amount),
        frequency: frequency as any,
        category: category as any,
        isMandatory: isMandatory ?? true,
        isActive: isActive ?? true,
        applicableFrom: applicableFrom ? new Date(applicableFrom) : new Date(),
        applicableTo: applicableTo ? new Date(applicableTo) : null,
        classId: classId || null,
        batchId: batchId || null,
        schoolId: session.user.schoolId!,
        createdBy: session.user.id
      },
      include: {
        class: {
          select: { id: true, classCode: true, sectionName: true }
        },
        batch: {
          select: { id: true, batchName: true, batchCode: true }
        },
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json({
      feeStructure,
      message: 'Fee structure created successfully'
    }, { status: 201 })
  } catch (error) {
    logger.error('Error creating fee structure', error as Error, { path: '/api/financial/fee-structures' })
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

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, ...dataToValidate } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Fee structure ID is required' },
        { status: 400 }
      )
    }

    const validation = createFeeStructureSchema.partial().safeParse(dataToValidate)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Invalid update data' },
        { status: 400 }
      )
    }

    const existingFee = await prisma.feeStructure.findFirst({
      where: {
        id,
        schoolId: session.user.schoolId!
      }
    })

    if (!existingFee) {
      return NextResponse.json(
        { error: 'Fee structure not found' },
        { status: 404 }
      )
    }

    const valData = validation.data
    const updatedFeeStructure = await prisma.feeStructure.update({
      where: { id },
      data: {
        ...(valData.name && { name: valData.name }),
        ...(valData.description !== undefined && { description: valData.description || null }),
        ...(valData.amount !== undefined && { amount: typeof valData.amount === 'number' ? valData.amount : parseFloat(valData.amount) }),
        ...(valData.frequency && { frequency: valData.frequency as any }),
        ...(valData.category && { category: valData.category as any }),
        ...(valData.isMandatory !== undefined && { isMandatory: valData.isMandatory }),
        ...(valData.isActive !== undefined && { isActive: valData.isActive }),
        ...(valData.applicableFrom && { applicableFrom: new Date(valData.applicableFrom) }),
        ...(valData.applicableTo !== undefined && { applicableTo: valData.applicableTo ? new Date(valData.applicableTo) : null }),
        ...(valData.classId !== undefined && { classId: valData.classId || null }),
        ...(valData.batchId !== undefined && { batchId: valData.batchId || null }),
      }
    })

    return NextResponse.json({
      feeStructure: updatedFeeStructure,
      message: 'Fee structure updated successfully'
    })
  } catch (error) {
    logger.error('Error updating fee structure', error as Error, { path: '/api/financial/fee-structures' })
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

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Fee structure ID is required' },
        { status: 400 }
      )
    }

    const existingFee = await prisma.feeStructure.findFirst({
      where: {
        id,
        schoolId: session.user.schoolId!
      }
    })

    if (!existingFee) {
      return NextResponse.json(
        { error: 'Fee structure not found' },
        { status: 404 }
      )
    }

    await prisma.feeStructure.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Fee structure deleted successfully'
    })
  } catch (error) {
    logger.error('Error deleting fee structure', error as Error, { path: '/api/financial/fee-structures' })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
