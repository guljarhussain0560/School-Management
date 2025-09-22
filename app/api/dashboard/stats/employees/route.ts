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

    // Get total employees
    const totalEmployees = await prisma.employee.count({
      where: { schoolId }
    });

    // Get active employees
    const activeEmployees = await prisma.employee.count({
      where: {
        schoolId,
        status: 'ACTIVE'
      }
    });

    // Get employees by status
    const employeesByStatus = await prisma.employee.groupBy({
      by: ['status'],
      where: { schoolId },
      _count: {
        status: true
      }
    });

    // Get employees by department
    const employeesByDepartment = await prisma.employee.groupBy({
      by: ['department'],
      where: { schoolId },
      _count: {
        department: true
      }
    });

    // Get total users (including system users)
    const totalUsers = await prisma.user.count({
      where: { schoolId }
    });

    // Get users by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      where: { schoolId },
      _count: {
        role: true
      }
    });

    // Get recent hires (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentHires = await prisma.employee.count({
      where: {
        schoolId,
        dateOfJoining: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Get pending payroll records
    const pendingPayroll = await prisma.payroll.count({
      where: {
        schoolId,
        status: 'PENDING'
      }
    });

    return NextResponse.json({
      count: totalEmployees,
      active: activeEmployees,
      totalUsers,
      recentHires,
      pendingPayroll,
      employeesByStatus,
      employeesByDepartment,
      usersByRole
    });

  } catch (error) {
    console.error('Error fetching employee stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
