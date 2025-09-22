import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const schoolId = session.user.schoolId!;

    // Get current month revenue
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const currentMonthRevenue = await prisma.feeCollection.aggregate({
      where: {
        schoolId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        status: 'PAID'
      },
      _sum: {
        amount: true
      }
    });

    // Get last month revenue for comparison
    const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    const lastMonthRevenue = await prisma.feeCollection.aggregate({
      where: {
        schoolId,
        date: {
          gte: lastMonthStart,
          lte: lastMonthEnd
        },
        status: 'PAID'
      },
      _sum: {
        amount: true
      }
    });

    // Get total pending fees
    const pendingFees = await prisma.feeCollection.aggregate({
      where: {
        schoolId,
        status: {
          in: ['PENDING', 'OVERDUE']
        }
      },
      _sum: {
        amount: true
      }
    });

    // Get fee collection rate
    const totalExpectedFees = await prisma.feeCollection.aggregate({
      where: {
        schoolId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      _sum: {
        amount: true
      }
    });

    const collectedFees = currentMonthRevenue._sum.amount || 0;
    const expectedFees = totalExpectedFees._sum.amount || 0;
    const collectionRate = expectedFees > 0 ? Math.round((collectedFees / expectedFees) * 100) : 0;

    // Get revenue by payment mode
    const revenueByMode = await prisma.feeCollection.groupBy({
      by: ['paymentMode'],
      where: {
        schoolId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        status: 'PAID'
      },
      _sum: {
        amount: true
      }
    });

    // Get revenue by fee category
    const revenueByCategory = await prisma.feeCollection.groupBy({
      by: ['feeStructureId'],
      where: {
        schoolId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        status: 'PAID'
      },
      _sum: {
        amount: true
      }
    });

    return NextResponse.json({
      total: Number(collectedFees),
      currentMonth: Number(collectedFees),
      lastMonth: Number(lastMonthRevenue._sum.amount || 0),
      pending: Number(pendingFees._sum.amount || 0),
      collectionRate,
      revenueByMode,
      revenueByCategory
    });

  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
