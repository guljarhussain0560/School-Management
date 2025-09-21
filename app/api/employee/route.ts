import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateUniqueEmployeeId } from '@/lib/employee-utils'

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
    const field = searchParams.get('field') || 'name'
    const department = searchParams.get('department') || 'all'
    const status = searchParams.get('status') || 'all'

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      schoolId: session.user.schoolId
    }

    // Check if there are any employees for this school
    const schoolEmployeesCount = await prisma.employee.count({ where: { schoolId: session.user.schoolId } })
    
    // If no employees found for this school, check if there are employees without schoolId
    if (schoolEmployeesCount === 0) {
      const allEmployeesCount = await prisma.employee.count()
      const employeesWithoutSchoolId = await prisma.employee.count({ where: { schoolId: null } })
      
      if (allEmployeesCount > 0 && employeesWithoutSchoolId > 0) {
        // There are employees but they don't have a schoolId - this is the issue
        console.log('⚠️ No employees found for schoolId:', session.user.schoolId)
        console.log('⚠️ But there are', employeesWithoutSchoolId, 'employees without schoolId')
        
        // For now, let's include employees without schoolId to show the user what's available
        // This is a temporary fix - the user should click "Fix School IDs" button
        where.OR = [
          { schoolId: session.user.schoolId },
          { schoolId: null }
        ]
        delete where.schoolId
      }
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

    // Get total count for pagination
    const totalCount = await prisma.employee.count({ where })

    // Get employees with pagination
    const employees = await prisma.employee.findMany({
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

    // Calculate summary statistics
    const [totalEmployees, activeEmployees, inactiveEmployees, onLeaveEmployees, totalSalary] = await Promise.all([
      prisma.employee.count({
        where: { schoolId: session.user.schoolId }
      }),
      prisma.employee.count({
        where: { schoolId: session.user.schoolId, status: 'ACTIVE' }
      }),
      prisma.employee.count({
        where: { schoolId: session.user.schoolId, status: 'INACTIVE' }
      }),
      prisma.employee.count({
        where: { schoolId: session.user.schoolId, status: 'ON_LEAVE' }
      }),
      prisma.employee.aggregate({
        where: { schoolId: session.user.schoolId, status: 'ACTIVE' },
        _sum: { salary: true }
      })
    ])

    const summary = {
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      onLeaveEmployees,
      totalSalary: Number(totalSalary._sum.salary || 0)
    }

    // Calculate pagination info
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
        hasPrevPage: page > 1
      }
    })

  } catch (error) {
    console.error('Get employees error:', error)
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
    const {
      name,
      email,
      phone,
      address,
      dateOfBirth,
      department,
      position,
      salary,
      emergencyContact,
      emergencyPhone,
      qualifications,
      experience,
      bankAccount,
      ifscCode,
      panNumber,
      aadharNumber,
      notes
    } = body

    // Validation
    if (!name || !email || !department || !position || !salary) {
      return NextResponse.json(
        { error: 'Name, email, department, position, and salary are required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { email }
    })

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee with this email already exists' },
        { status: 400 }
      )
    }

    // Generate unique employee ID
    const employeeId = await generateUniqueEmployeeId()

    // Create employee record
    const employee = await prisma.employee.create({
      data: {
        employeeId,
        name,
        email,
        phone,
        address,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        department,
        position,
        salary: parseFloat(salary),
        emergencyContact,
        emergencyPhone,
        qualifications,
        experience,
        bankAccount,
        ifscCode,
        panNumber,
        aadharNumber,
        notes,
        createdBy: session.user.id,
        schoolId: session.user.schoolId!,
      }
    })

    return NextResponse.json({
      message: 'Employee registered successfully',
      employee
    }, { status: 201 })

  } catch (error) {
    console.error('Create employee error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
