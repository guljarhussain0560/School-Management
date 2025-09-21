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

    const schoolId = session.user.schoolId

    // Get all employees that don't have a schoolId or have a different schoolId
    const employeesToUpdate = await prisma.employee.findMany({
      where: {
        OR: [
          { schoolId: null },
          { schoolId: { not: schoolId } }
        ]
      },
      select: {
        id: true,
        name: true,
        schoolId: true
      }
    })

    if (employeesToUpdate.length === 0) {
      return NextResponse.json({
        message: 'All employees already have the correct schoolId',
        updated: 0
      })
    }

    // Update all employees to have the correct schoolId
    const updateResult = await prisma.employee.updateMany({
      where: {
        OR: [
          { schoolId: null },
          { schoolId: { not: schoolId } }
        ]
      },
      data: {
        schoolId: schoolId
      }
    })

    return NextResponse.json({
      message: `Updated ${updateResult.count} employees with correct schoolId`,
      updated: updateResult.count,
      employees: employeesToUpdate.map(emp => ({
        id: emp.id,
        name: emp.name,
        oldSchoolId: emp.schoolId
      }))
    })

  } catch (error) {
    console.error('Fix school IDs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
