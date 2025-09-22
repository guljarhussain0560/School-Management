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
          select: {
            id: true,
            className: true,
            classCode: true
          }
        },
        batch: {
          select: {
            id: true,
            batchName: true,
            batchCode: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            collections: true
          }
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
    console.error('Error fetching fee structures:', error)
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
    } = body

    // Validate required fields
    if (!name || !amount || !frequency || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate fee code
    const feeCount = await prisma.feeStructure.count({
      where: { schoolId: session.user.schoolId }
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
        description,
        amount: parseFloat(amount),
        frequency,
        category,
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
          select: {
            id: true,
            className: true,
            classCode: true
          }
        },
        batch: {
          select: {
            id: true,
            batchName: true,
            batchCode: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      feeStructure,
      message: 'Fee structure created successfully'
    })
  } catch (error) {
    console.error('Error creating fee structure:', error)
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

    // Only admin can update fee structures
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { 
      id,
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
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Fee structure ID is required' },
        { status: 400 }
      )
    }

    // Check if fee structure exists and belongs to school
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

    const updatedFeeStructure = await prisma.feeStructure.update({
      where: { id },
      data: {
        name,
        description,
        amount: parseFloat(amount),
        frequency,
        category,
        isMandatory,
        isActive,
        applicableFrom: applicableFrom ? new Date(applicableFrom) : existingFee.applicableFrom,
        applicableTo: applicableTo ? new Date(applicableTo) : existingFee.applicableTo,
        classId: classId || null,
        batchId: batchId || null
      },
      include: {
        class: {
          select: {
            id: true,
            className: true,
            classCode: true
          }
        },
        batch: {
          select: {
            id: true,
            batchName: true,
            batchCode: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      feeStructure: updatedFeeStructure,
      message: 'Fee structure updated successfully'
    })
  } catch (error) {
    console.error('Error updating fee structure:', error)
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

    // Only admin can delete fee structures
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const feeStructureId = searchParams.get('id')

    if (!feeStructureId) {
      return NextResponse.json(
        { error: 'Fee structure ID is required' },
        { status: 400 }
      )
    }

    // Check if fee structure exists and belongs to school
    const feeStructure = await prisma.feeStructure.findFirst({
      where: {
        id: feeStructureId,
        schoolId: session.user.schoolId!
      },
      include: {
        _count: {
          select: {
            collections: true
          }
        }
      }
    })

    if (!feeStructure) {
      return NextResponse.json(
        { error: 'Fee structure not found' },
        { status: 404 }
      )
    }

    // Check if there are any fee collections for this structure
    if (feeStructure._count.collections > 0) {
      return NextResponse.json(
        { error: 'Cannot delete fee structure with existing collections. Please deactivate it instead.' },
        { status: 400 }
      )
    }

    await prisma.feeStructure.delete({
      where: {
        id: feeStructureId
      }
    })

    return NextResponse.json({
      message: 'Fee structure deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting fee structure:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
