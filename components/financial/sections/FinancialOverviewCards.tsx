'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { DollarSign, TrendingUp, TrendingDown, Users, Receipt, Briefcase } from 'lucide-react'
import { FinancialStats } from '../hooks/useFinancialStats'

interface FinancialOverviewCardsProps {
  stats: FinancialStats
}

export default function FinancialOverviewCards({ stats }: FinancialOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="border-l-4 border-l-green-500 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase">Total Revenue</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">
              ${stats.totalRevenue.toLocaleString()}
            </h3>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +12% from last month
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded-full text-green-600">
            <DollarSign className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-500 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase">Fees Collected</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">
              ${stats.collectedFeesThisMonth.toLocaleString()}
            </h3>
            <p className="text-xs text-blue-600 flex items-center mt-1">
              <Receipt className="h-3 w-3 mr-1" /> This Month
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-full text-blue-600">
            <Receipt className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-amber-500 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase">Monthly Payroll</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">
              ${stats.payrollThisMonth.toLocaleString()}
            </h3>
            <p className="text-xs text-amber-600 flex items-center mt-1">
              <Briefcase className="h-3 w-3 mr-1" /> Active Staff
            </p>
          </div>
          <div className="p-3 bg-amber-50 rounded-full text-amber-600">
            <Briefcase className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-red-500 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase">Pending Dues</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">
              ${stats.pendingFees.toLocaleString()}
            </h3>
            <p className="text-xs text-red-600 flex items-center mt-1">
              <TrendingDown className="h-3 w-3 mr-1" /> Needs Follow-up
            </p>
          </div>
          <div className="p-3 bg-red-50 rounded-full text-red-600">
            <TrendingDown className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
