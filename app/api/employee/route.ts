import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { IDService } from '@/lib/id-service'
import { createEmployeeSchema, employeeQuerySchema } from '@/lib/validation/employee'
import { logger } from '@/lib/logger'
import { apiError } from '@/lib/api-handler'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      logger.warn('Unauthorized employee list access attempt', { path: '/api/employee' })
      return apiError('Unauthorized - Admin access required', 403)
    }

    const { searchParams } = new URL(request.url)
    const queryResult = employeeQuerySchema.safeParse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      search: searchParams.get('search') || '',
      field: searchParams.get('field') || 'name',
      department: searchParams.get('department') || 'all',
      status: searchParams.get('status') || 'all',
    })

    if (!queryResult.success) {
      return apiError('Invalid query parameters', 400, queryResult.error.issues)
    }

    const { page, limit, search, field, department, status } = queryResult.data
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (session.user.schoolId) {
      where.schoolId = session.user.schoolId
    } else {
      logger.info('User has no schoolId, querying across all accessible employees', { userId: session.user.id })
    }

    // Add search filter
    if (search) {
      if (field === 'name') {
        where.name = { contains: search, mode: 'insensitive' }
      } else if (field === 'employeeId') {
        where.employeeId = { contains: search, mode: 'insensitive' }
      } else if (field === 'email') {
        where.email = { contains: search, mode: 'insensitive' }
      } else if (field === 'phone') {
        where.phone = { contains: search, mode: 'insensitive' }
      } else if (field === 'position') {
        where.position = { contains: search, mode: 'insensitive' }
      }
    }

    // Add department filter
    if (department && department !== 'all') {
      where.department = department
    }

    // Add status filter
    if (status && status !== 'all') {
      where.status = status
    }

    // Execute queries in parallel
    const [totalCount, employees, totalEmployees, activeEmployees, inactiveEmployees, onLeaveEmployees, totalSalary] = await Promise.all([
      prisma.employee.count({ where }),
      prisma.employee.findMany({
        where,
        include: {
          creator: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.employee.count({
        where: session.user.schoolId ? { schoolId: session.user.schoolId } : {},
      }),
      prisma.employee.count({
        where: session.user.schoolId ? { schoolId: session.user.schoolId || "", status: 'ACTIVE' } : { status: 'ACTIVE' },
      }),
      prisma.employee.count({
        where: session.user.schoolId ? { schoolId: session.user.schoolId || "", status: 'INACTIVE' } : { status: 'INACTIVE' },
      }),
      prisma.employee.count({
        where: session.user.schoolId ? { schoolId: session.user.schoolId || "", status: 'ON_LEAVE' } : { status: 'ON_LEAVE' },
      }),
      prisma.employee.aggregate({
        where: session.user.schoolId ? { schoolId: session.user.schoolId || "", status: 'ACTIVE' } : { status: 'ACTIVE' },
        _sum: { salary: true },
      }),
    ])

    const summary = {
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      onLeaveEmployees,
      totalSalary: Number(totalSalary._sum.salary || 0),
    }

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      employees,
      summary,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    })
  } catch (error) {
    logger.error('Get employees error', error, { path: '/api/employee' })
    return apiError('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      logger.warn('Unauthorized employee creation attempt', { path: '/api/employee' })
      return apiError('Unauthorized - Admin access required', 403)
    }

    const body = await request.json()
    const validationResult = createEmployeeSchema.safeParse(body)

    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.issues)
    }

    const data = validationResult.data

    // Check if email already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { email: data.email },
    })

    if (existingEmployee) {
      return apiError('Employee with this email already exists', 400)
    }

    const schoolId = session.user.schoolId || 'default-school'

    // Initialize ID service with school configuration
    await IDService.initializeSchool(schoolId)

    // Determine role based on department/position
    let role: 'ADMIN' | 'TEACHER' | 'TRANSPORT' = 'TEACHER'
    if (data.department.toLowerCase().includes('admin') || data.position.toLowerCase().includes('admin')) {
      role = 'ADMIN'
    } else if (data.department.toLowerCase().includes('transport') || data.position.toLowerCase().includes('transport')) {
      role = 'TRANSPORT'
    }

    // Generate unique employee ID
    const employeeId = await IDService.generateEmployeeId(role, schoolId)

    // Create employee record
    const employee = await prisma.employee.create({
      data: {
        employeeId,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        department: data.department,
        position: data.position,
        salary: data.salary,
        emergencyContact: data.emergencyContact || null,
        emergencyPhone: data.emergencyPhone || null,
        qualifications: data.qualifications || null,
        experience: data.experience || null,
        bankAccount: data.bankAccount || null,
        ifscCode: data.ifscCode || null,
        panNumber: data.panNumber || null,
        aadharNumber: data.aadharNumber || null,
        notes: data.notes || null,
        createdBy: session.user.id,
        schoolId,
      },
    })

    logger.info('Employee created successfully', {
      employeeId: employee.employeeId,
      schoolId,
      createdById: session.user.id,
    })

    return NextResponse.json(
      {
        message: 'Employee registered successfully',
        employee,
      },
      { status: 201 }
    )
  } catch (error) {
    logger.error('Create employee error', error, { path: '/api/employee' })
    return apiError('Internal server error', 500)
  }
}
