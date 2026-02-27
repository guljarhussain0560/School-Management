'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Briefcase, Download, Upload, CheckCircle, Clock } from 'lucide-react'
import { usePayroll } from '../hooks/usePayroll'

export default function PayrollManagementSection() {
  const {
    payrollForm,
    handlePayrollChange,
    employeeSearchId,
    setEmployeeSearchId,
    isSearchingEmployee,
    employeeNotFound,
    handleSearchEmployee,
    payrolls,
    handleDownloadSalarySlip,
  } = usePayroll()

  return (
    <div className="space-y-6">
      {/* Employee Search & Payroll Entry */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            Generate Staff Payroll & Salary Slip
          </CardTitle>
          <CardDescription>Search employee by ID to auto-populate basic pay and calculate net compensation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Box */}
          <div className="flex gap-3 max-w-md">
            <div className="flex-1">
              <Input
                placeholder="Enter Employee ID (e.g. EMP-001)"
                value={employeeSearchId}
                onChange={(e) => setEmployeeSearchId(e.target.value)}
              />
            </div>
            <Button onClick={handleSearchEmployee} disabled={isSearchingEmployee}>
              <Search className="h-4 w-4 mr-2" />
              {isSearchingEmployee ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {employeeNotFound && (
            <p className="text-sm text-red-600">No employee found matching ID: {employeeSearchId}</p>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
            <div className="space-y-2">
              <Label>Employee Name</Label>
              <Input
                placeholder="Employee Name"
                value={payrollForm.employeeName}
                onChange={(e) => handlePayrollChange('employeeName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Input
                placeholder="Department"
                value={payrollForm.department}
                onChange={(e) => handlePayrollChange('department', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Position</Label>
              <Input
                placeholder="Position"
                value={payrollForm.position}
                onChange={(e) => handlePayrollChange('position', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Basic Salary ($)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={payrollForm.basicSalary}
                onChange={(e) => handlePayrollChange('basicSalary', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Allowances ($)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={payrollForm.allowances}
                onChange={(e) => handlePayrollChange('allowances', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Deductions ($)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={payrollForm.deductions}
                onChange={(e) => handlePayrollChange('deductions', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Month</Label>
              <Select value={payrollForm.month} onValueChange={(val) => handlePayrollChange('month', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Year</Label>
              <Input
                type="number"
                value={payrollForm.year}
                onChange={(e) => handlePayrollChange('year', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-foreground">Net Payable Salary ($)</Label>
              <Input
                readOnly
                className="bg-muted font-bold text-green-600 text-lg"
                value={`$${payrollForm.netSalary || '0.00'}`}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                handleDownloadSalarySlip({
                  id: 'sample',
                  employeeId: payrollForm.employeeId || 'EMP-001',
                  employeeName: payrollForm.employeeName || 'Staff Member',
                  department: payrollForm.department || 'Academic',
                  position: payrollForm.position || 'Teacher',
                  basicSalary: parseFloat(payrollForm.basicSalary) || 0,
                  allowances: parseFloat(payrollForm.allowances) || 0,
                  deductions: parseFloat(payrollForm.deductions) || 0,
                  netSalary: parseFloat(payrollForm.netSalary) || 0,
                  month: payrollForm.month,
                  year: payrollForm.year,
                  status: 'Processed',
                })
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Salary Slip (PDF)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
