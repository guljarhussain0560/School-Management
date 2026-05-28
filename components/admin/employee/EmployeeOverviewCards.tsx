'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Users, UserCheck, UserX, DollarSign } from 'lucide-react'
import { EmployeeSummary } from './types'

interface EmployeeOverviewCardsProps {
  summary: EmployeeSummary
}

export function EmployeeOverviewCards({ summary }: EmployeeOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="border-l-4 border-l-primary shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Staff</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{summary.totalEmployees}</h3>
          </div>
          <div className="p-2.5 bg-primary/10 rounded-full text-primary">
            <Users className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-emerald-500 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Staff</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{summary.activeEmployees}</h3>
          </div>
          <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/40 rounded-full text-emerald-600">
            <UserCheck className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-amber-500 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">On Leave</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{summary.onLeaveEmployees}</h3>
          </div>
          <div className="p-2.5 bg-amber-100 dark:bg-amber-950/40 rounded-full text-amber-600">
            <UserX className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-500 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monthly Payroll</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">₹{summary.totalSalary.toLocaleString()}</h3>
          </div>
          <div className="p-2.5 bg-blue-100 dark:bg-blue-950/40 rounded-full text-blue-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
