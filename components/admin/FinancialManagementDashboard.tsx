'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DollarSign, Receipt, Briefcase, TrendingDown, 
  BarChart3, Settings, Users, BookOpen
} from 'lucide-react'

// Modular Hooks
import { useFinancialStats } from '@/components/financial/hooks/useFinancialStats'

// Modular Subcomponents & Sections
import FinancialOverviewCards from '@/components/financial/sections/FinancialOverviewCards'
import FeeCollectionSection from '@/components/financial/sections/FeeCollectionSection'
import PayrollManagementSection from '@/components/financial/sections/PayrollManagementSection'
import ExpenseTrackingSection from '@/components/financial/sections/ExpenseTrackingSection'
import FinancialReportsSection from '@/components/financial/sections/FinancialReportsSection'
import FeeStructureManagement from '@/components/financial/FeeStructureManagement'
import StudentFeeDetails from '@/components/financial/StudentFeeDetails'

interface FinancialManagementDashboardProps {
  activeSubSection: string
  setActiveSubSection: (section: string) => void
}

export default function FinancialManagementDashboard({
  activeSubSection,
  setActiveSubSection,
}: FinancialManagementDashboardProps) {
  const { stats, loading, refreshStats } = useFinancialStats()

  return (
    <div className="space-y-6">
      {/* Top Header & Context */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Institutional Financial Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage fee collections, student fee structures, employee payroll, and departmental expense budgets.
          </p>
        </div>
      </div>

      {/* Top Financial Metric KPI Cards */}
      <FinancialOverviewCards stats={stats} />

      {/* Sub-section Navigation Tabs */}
      <Tabs
        value={activeSubSection || 'fee-collection'}
        onValueChange={setActiveSubSection}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full mb-6">
          <TabsTrigger value="fee-collection" className="flex items-center gap-2 text-xs md:text-sm">
            <Receipt className="h-4 w-4" />
            Fee Collection
          </TabsTrigger>
          <TabsTrigger value="fee-structure" className="flex items-center gap-2 text-xs md:text-sm">
            <Settings className="h-4 w-4" />
            Fee Structure
          </TabsTrigger>
          <TabsTrigger value="student-fee-details" className="flex items-center gap-2 text-xs md:text-sm">
            <Users className="h-4 w-4" />
            Student Ledgers
          </TabsTrigger>
          <TabsTrigger value="payroll" className="flex items-center gap-2 text-xs md:text-sm">
            <Briefcase className="h-4 w-4" />
            Staff Payroll
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2 text-xs md:text-sm">
            <TrendingDown className="h-4 w-4" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2 text-xs md:text-sm">
            <BarChart3 className="h-4 w-4" />
            Financial Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fee-collection">
          <FeeCollectionSection />
        </TabsContent>

        <TabsContent value="fee-structure">
          <FeeStructureManagement />
        </TabsContent>

        <TabsContent value="student-fee-details">
          <StudentFeeDetails />
        </TabsContent>

        <TabsContent value="payroll">
          <PayrollManagementSection />
        </TabsContent>

        <TabsContent value="expenses">
          <ExpenseTrackingSection />
        </TabsContent>

        <TabsContent value="reports">
          <FinancialReportsSection stats={stats} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
