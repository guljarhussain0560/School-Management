import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

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
    const department = searchParams.get('department') || 'all'
    const status = searchParams.get('status') || 'all'
    const format = searchParams.get('format') || 'csv'

    // Build where clause
    const where: any = {}
    
    if (session.user.schoolId) {
      where.schoolId = session.user.schoolId
    }

    // Add department filter
    if (department && department !== 'all') {
      where.department = department
    }

    // Add status filter
    if (status && status !== 'all') {
      where.status = status
    }

    // Get all employees matching the filters
    const employees = await prisma.employee.findMany({
      where,
      include: {
        creator: {
          select: { name: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Prepare data for export
    const exportData = employees.map(emp => ({
      'Employee ID': emp.employeeId,
      'Name': emp.name,
      'Email': emp.email,
      'Phone': emp.phone || '',
      'Address': emp.address || '',
      'Date of Birth': emp.dateOfBirth ? new Date(emp.dateOfBirth).toLocaleDateString() : '',
      'Date of Joining': new Date(emp.dateOfJoining).toLocaleDateString(),
      'Department': emp.department,
      'Position': emp.position,
      'Salary': emp.salary,
      'Status': emp.status,
      'Emergency Contact': emp.emergencyContact || '',
      'Emergency Phone': emp.emergencyPhone || '',
      'Qualifications': emp.qualifications || '',
      'Experience': emp.experience || '',
      'Bank Account': emp.bankAccount || '',
      'IFSC Code': emp.ifscCode || '',
      'PAN Number': emp.panNumber || '',
      'Aadhar Number': emp.aadharNumber || '',
      'Notes': emp.notes || '',
      'Created By': emp.creator?.name || '',
      'Created At': new Date(emp.createdAt).toLocaleDateString()
    }))

    if (format === 'json') {
      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="employees_${department}_${status}_${new Date().toISOString().split('T')[0]}.json"`
        }
      })
    }

    // Create workbook for Excel/CSV
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(exportData)

    // Set column widths
    const columnWidths = [
      { wch: 15 }, // Employee ID
      { wch: 20 }, // Name
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 30 }, // Address
      { wch: 12 }, // Date of Birth
      { wch: 12 }, // Date of Joining
      { wch: 15 }, // Department
      { wch: 20 }, // Position
      { wch: 10 }, // Salary
      { wch: 10 }, // Status
      { wch: 20 }, // Emergency Contact
      { wch: 15 }, // Emergency Phone
      { wch: 30 }, // Qualifications
      { wch: 30 }, // Experience
      { wch: 15 }, // Bank Account
      { wch: 12 }, // IFSC Code
      { wch: 12 }, // PAN Number
      { wch: 15 }, // Aadhar Number
      { wch: 30 }, // Notes
      { wch: 20 }, // Created By
      { wch: 12 }  // Created At
    ]
    worksheet['!cols'] = columnWidths

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees')

    let buffer: Buffer
    let contentType: string
    let fileExtension: string

    if (format === 'xlsx') {
      buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      fileExtension = 'xlsx'
    } else {
      // Default to CSV
      buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'csv' })
      contentType = 'text/csv'
      fileExtension = 'csv'
    }

    const filename = `employees_${department}_${status}_${new Date().toISOString().split('T')[0]}.${fileExtension}`

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })

  } catch (error) {
    console.error('Download employees error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
