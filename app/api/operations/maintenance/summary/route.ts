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

    // Get maintenance items summary
    const itemsSummary = await prisma.maintenanceItem.groupBy({
      by: ['status'],
      where: {
        schoolId: session.user.schoolId
      },
      _count: {
        status: true
      }
    })

    // Get maintenance logs summary
    const logsSummary = await prisma.maintenanceLog.groupBy({
      by: ['status'],
      where: {
        schoolId: session.user.schoolId
      },
      _count: {
        status: true
      }
    })

    // Get recent maintenance logs (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentLogs = await prisma.maintenanceLog.count({
      where: {
        schoolId: session.user.schoolId,
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    })

    // Get total counts
    const totalItems = await prisma.maintenanceItem.count({
      where: {
        schoolId: session.user.schoolId
      }
    })

    const totalLogs = await prisma.maintenanceLog.count({
      where: {
        schoolId: session.user.schoolId
      }
    })

    // Get items needing attention
    const itemsNeedingAttention = await prisma.maintenanceItem.count({
      where: {
        schoolId: session.user.schoolId,
        status: {
          in: ['NEEDS_REPAIR', 'IN_PROGRESS']
        }
      }
    })

    // Get logs needing attention
    const logsNeedingAttention = await prisma.maintenanceLog.count({
      where: {
        schoolId: session.user.schoolId,
        status: {
          in: ['NEEDS_REPAIR', 'IN_PROGRESS']
        }
      }
    })

    // Get facility breakdown
    const facilityBreakdown = await prisma.maintenanceLog.groupBy({
      by: ['facility'],
      where: {
        schoolId: session.user.schoolId
      },
      _count: {
        facility: true
      },
      orderBy: {
        _count: {
          facility: 'desc'
        }
      },
      take: 10
    })

    return NextResponse.json({
      summary: {
        totalItems,
        totalLogs,
        itemsNeedingAttention,
        logsNeedingAttention,
        recentLogs
      },
      itemsByStatus: itemsSummary,
      logsByStatus: logsSummary,
      facilityBreakdown
    })

  } catch (error) {
    console.error('Error fetching maintenance summary:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
