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

      // Create payroll record
      const payroll = await prisma.payroll.create({
        data: {
          employeeId,
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
        // Validate required fields
        if (!row['Employee ID'] || !row['Name'] || !row['Department']) {
          errors.push(`Row ${i + 2}: Missing required fields (Employee ID, Name, Department)`)
          continue
        }

        const payrollData = {
          employeeId: row['Employee ID'].toString().trim(),
          name: row['Name'].toString().trim(),
          department: row['Department'].toString().trim(),
          basicSalary: parseFloat(row['Basic Salary']) || 0,
          allowances: parseFloat(row['Allowances']) || 0,
          deductions: parseFloat(row['Deductions']) || 0,
          netSalary: parseFloat(row['Net Salary']) || 0,
          schoolId: session.user.schoolId!,
          processedBy: session.user.id,
        }

        // Create payroll record in database
        const payroll = await prisma.payroll.create({
          data: {
            employeeId: payrollData.employeeId,
            employeeName: payrollData.name,
            department: payrollData.department,
            position: row['Position']?.toString().trim() || '',
            basicSalary: payrollData.basicSalary,
            allowances: payrollData.allowances,
            deductions: payrollData.deductions,
            amount: payrollData.netSalary,
            month: new Date().getMonth() + 1, // Current month
            year: new Date().getFullYear(), // Current year
            status: 'PENDING',
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

    // Get total count for pagination
    const totalCount = await prisma.payroll.count({ where })

    // Get payroll records with pagination
    const payrolls = await prisma.payroll.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            employeeId: true,
            department: true,
            position: true
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

    // Calculate summary statistics
    const [totalPayroll, totalEmployees, teachingTotal, adminTotal, supportTotal] = await Promise.all([
      prisma.payroll.aggregate({
        where: { schoolId: session.user.schoolId },
        _sum: { amount: true }
      }),
      prisma.payroll.count({
        where: { schoolId: session.user.schoolId }
      }),
      prisma.payroll.aggregate({
        where: { schoolId: session.user.schoolId, department: 'Teaching' },
        _sum: { amount: true }
      }),
      prisma.payroll.aggregate({
        where: { 
          schoolId: session.user.schoolId, 
          department: { in: ['Administration', 'IT', 'Security'] }
        },
        _sum: { amount: true }
      }),
      prisma.payroll.aggregate({
        where: { 
          schoolId: session.user.schoolId, 
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
      payrolls,
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
