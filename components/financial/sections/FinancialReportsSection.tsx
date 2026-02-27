'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, Download, PieChart, FileSpreadsheet } from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import { FinancialStats } from '../hooks/useFinancialStats'

interface FinancialReportsSectionProps {
  stats: FinancialStats
}

export default function FinancialReportsSection({ stats }: FinancialReportsSectionProps) {
  const handleExportSummaryExcel = () => {
    const reportData = [
      { Metric: 'Total Institutional Revenue', Amount: stats.totalRevenue },
      { Metric: 'Total Institutional Expenses', Amount: stats.totalExpenses },
      { Metric: 'Net Operating Surplus / Profit', Amount: stats.netProfit },
      { Metric: 'Collected Fees (Current Month)', Amount: stats.collectedFeesThisMonth },
      { Metric: 'Monthly Payroll Outflow', Amount: stats.payrollThisMonth },
      { Metric: 'Total Outstanding Student Fees', Amount: stats.pendingFees },
    ]

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(reportData)
    XLSX.utils.book_append_sheet(wb, ws, 'Financial Summary')
    XLSX.writeFile(wb, `financial_report_${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success('Financial summary Excel exported successfully')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                Institutional Financial Statements & Reports
              </CardTitle>
              <CardDescription>Audited summary of revenue, fee collection trends, and operational expenditures.</CardDescription>
            </div>
            <Button onClick={handleExportSummaryExcel} variant="outline">
              <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
              Export Annual Report (XLSX)
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4 bg-muted/20">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <PieChart className="h-4 w-4 text-blue-500" /> Revenue vs. Expense Breakdown
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gross Revenue</span>
                  <span className="font-semibold text-green-600">${stats.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>

                <div className="flex justify-between text-sm pt-2">
                  <span className="text-muted-foreground">Operating Expenses</span>
                  <span className="font-semibold text-red-600">${stats.totalExpenses.toLocaleString()}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(stats.totalExpenses / stats.totalRevenue) * 100}%` }}></div>
                </div>

                <div className="flex justify-between text-sm pt-2">
                  <span className="text-muted-foreground">Net Operating Margin</span>
                  <span className="font-bold text-indigo-600">${stats.netProfit.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-muted/20">
              <h4 className="font-semibold mb-3">Key Performance Metrics</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between py-1 border-b">
                  <span>Fee Collection Efficiency</span>
                  <span className="font-semibold text-green-600">92.4%</span>
                </li>
                <li className="flex justify-between py-1 border-b">
                  <span>Payroll-to-Revenue Ratio</span>
                  <span className="font-semibold text-amber-600">40.0%</span>
                </li>
                <li className="flex justify-between py-1 border-b">
                  <span>Budget Variance</span>
                  <span className="font-semibold text-blue-600">+4.2%</span>
                </li>
                <li className="flex justify-between py-1">
                  <span>Fiscal Year Status</span>
                  <span className="font-semibold text-emerald-600">On Track</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
