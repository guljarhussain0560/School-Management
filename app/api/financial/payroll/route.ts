import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.schoolId || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const contentType = request.headers.get('content-type')
    
    // Handle single payroll entry (JSON)
    if (contentType?.includes('application/json')) {
      const body = await request.json()
      const { employeeId, employeeName, department, position, basicSalary, allowances, deductions, netSalary, month, year, status } = body

      // Validation
      if (!employeeId || !employeeName || !department || !basicSalary || !netSalary || !month || !year) {
        return NextResponse.json(
          { error: 'Employee ID, name, department, basic salary, net salary, month, and year are required' },
          { status: 400 }
        )
      }

      // Find the employee by employeeId to get the database id
      const employee = await prisma.employee.findFirst({
        where: {
          OR: [
            { id: employeeId },
            { employeeId: employeeId }
          ],
          schoolId: session.user.schoolId
        }
      })

      if (!employee) {
        return NextResponse.json(
          { error: 'Employee not found' },
          { status: 404 }
        )
      }

      // Check if employee is terminated
      if (employee.status === 'TERMINATED') {
        return NextResponse.json(
          { 
            error: 'Employee terminated',
            message: 'Cannot create payroll record for terminated employee',
            employeeName: employee.name,
            employeeId: employee.employeeId
          },
          { status: 400 }
        )
      }

      // Create payroll record using the employee's database id
      const payroll = await prisma.payroll.create({
        data: {
          employeeId: employee.id, // Use the database id, not the employeeId string
          employeeName,
          department,
          position,
          basicSalary: parseFloat(basicSalary) || 0,
          allowances: parseFloat(allowances) || 0,
          deductions: parseFloat(deductions) || 0,
          amount: parseFloat(netSalary),
          month: parseInt(month),
          year: parseInt(year),
          status: (status?.toUpperCase() as any) || 'PENDING',
          uploadedBy: session.user.id,
          schoolId: session.user.schoolId!
        }
      })

      return NextResponse.json({
        message: 'Payroll record created successfully',
        payroll
      }, { status: 201 })
    }

    // Handle bulk upload (FormData)
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Read the Excel file
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    if (!jsonData || jsonData.length === 0) {
      return NextResponse.json({ error: 'No data found in file' }, { status: 400 })
    }

    const payrollRecords = []
    const errors = []

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as any
      
      try {
        // Validate required fields for simplified format
        if (!row['Employee ID'] || !row['Month'] || !row['Year']) {
          errors.push(`Row ${i + 2}: Missing required fields (Employee ID, Month, Year)`)
          continue
        }

        const employeeIdString = row['Employee ID'].toString().trim()
        
        // Find the employee by employeeId to get the database id and employee data
        const employee = await prisma.employee.findFirst({
          where: {
            OR: [
              { id: employeeIdString },
              { employeeId: employeeIdString }
            ],
            schoolId: session.user.schoolId
          }
        })

        if (!employee) {
          errors.push(`Row ${i + 2}: Employee not found for ID: ${employeeIdString}`)
          continue
        }

        // Check if employee is terminated
        if (employee.status === 'TERMINATED') {
          errors.push(`Row ${i + 2}: Employee terminated - ${employee.name} (${employeeIdString})`)
          continue
        }

        // Get values from Excel or use defaults
        const allowances = parseFloat(row['Allowances']) || 0
        const deductions = parseFloat(row['Deductions']) || 0
        const basicSalary = employee.salary || 0
        const netSalary = basicSalary + allowances - deductions
        const month = parseInt(row['Month']) || new Date().getMonth() + 1
        const year = parseInt(row['Year']) || new Date().getFullYear()
        const status = (row['Status']?.toString().toUpperCase() || 'PENDING') as any

        // Validate month and year
        if (month < 1 || month > 12) {
          errors.push(`Row ${i + 2}: Invalid month (${month}). Must be between 1-12`)
          continue
        }

        if (year < 2020 || year > 2030) {
          errors.push(`Row ${i + 2}: Invalid year (${year}). Must be between 2020-2030`)
          continue
        }

        const payrollData = {
          employeeId: employee.id, // Use the database id
          name: employee.name,
          department: employee.department,
          basicSalary: basicSalary,
          allowances: allowances,
          deductions: deductions,
          netSalary: netSalary,
          month: month,
          year: year,
          status: status,
          schoolId: session.user.schoolId!,
          processedBy: session.user.id,
        }

        // Create payroll record in database
        const payroll = await prisma.payroll.create({
          data: {
            employeeId: payrollData.employeeId,
            employeeName: payrollData.name,
            department: payrollData.department,
            position: employee.position || '',
            basicSalary: payrollData.basicSalary,
            allowances: payrollData.allowances,
            deductions: payrollData.deductions,
            amount: payrollData.netSalary,
            month: payrollData.month,
            year: payrollData.year,
            status: payrollData.status,
            uploadedBy: session.user.id,
            schoolId: session.user.schoolId!
          }
        })
        
        payrollRecords.push(payrollData)
      } catch (error) {
        console.error(`Error processing row ${i + 2}:`, error)
        errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      message: `Successfully processed ${payrollRecords.length} payroll records`,
      records: payrollRecords,
      errors: errors.length > 0 ? errors : undefined,
      totalProcessed: jsonData.length,
      successCount: payrollRecords.length,
      errorCount: errors.length
    }, { status: 201 })

  } catch (error) {
    console.error('Error in payroll upload:', error)
    return NextResponse.json(
      { error: 'Failed to process payroll upload' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const field = searchParams.get('field') || 'employeeName'
    const department = searchParams.get('department') || 'all'
    const status = searchParams.get('status') || 'all'

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      schoolId: session.user.schoolId
    }

    // Add search filter
    if (search) {
      if (field === 'employeeName') {
        where.employeeName = { contains: search, mode: 'insensitive' }
      } else if (field === 'employeeId') {
        where.employeeId = { contains: search, mode: 'insensitive' }
      } else if (field === 'department') {
        where.department = { contains: search, mode: 'insensitive' }
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

    // Get total count for pagination, excluding terminated employees
    const totalCount = await prisma.payroll.count({ 
      where: {
        ...where,
        employee: {
          status: {
            not: 'TERMINATED'
          }
        }
      }
    })

    // Get payroll records with pagination, excluding terminated employees
    const payrolls = await prisma.payroll.findMany({
      where: {
        ...where,
        employee: {
          status: {
            not: 'TERMINATED'
          }
        }
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            employeeId: true,
            department: true,
            position: true,
            status: true
          }
        },
        uploader: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    // Transform the data to include the employeeId string for display
    const transformedPayrolls = payrolls.map(payroll => ({
      ...payroll,
      displayEmployeeId: payroll.employee?.employeeId || payroll.employeeId
    }))

    // Calculate summary statistics, excluding terminated employees
    const baseWhere = { 
      schoolId: session.user.schoolId,
      employee: {
        status: {
          not: 'TERMINATED'
        }
      }
    }

    const [totalPayroll, totalEmployees, teachingTotal, adminTotal, supportTotal] = await Promise.all([
      prisma.payroll.aggregate({
        where: baseWhere,
        _sum: { amount: true }
      }),
      prisma.payroll.count({
        where: baseWhere
      }),
      prisma.payroll.aggregate({
        where: { 
          ...baseWhere, 
          department: 'Teaching' 
        },
        _sum: { amount: true }
      }),
      prisma.payroll.aggregate({
        where: { 
          ...baseWhere, 
          department: { in: ['Administration', 'IT', 'Security'] }
        },
        _sum: { amount: true }
      }),
      prisma.payroll.aggregate({
        where: { 
          ...baseWhere, 
          department: { in: ['Maintenance', 'Transport', 'Support Staff'] }
        },
        _sum: { amount: true }
      })
    ])

    const summary = {
      totalPayroll: Number(totalPayroll._sum.amount || 0),
      totalEmployees,
      teachingTotal: Number(teachingTotal._sum.amount || 0),
      adminTotal: Number(adminTotal._sum.amount || 0),
      supportTotal: Number(supportTotal._sum.amount || 0)
    }

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      payrolls: transformedPayrolls,
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
    console.error('Get payroll records error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
