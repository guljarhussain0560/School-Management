'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { downloadSalarySlipPDF } from '@/lib/salary-slip-pdf'

export interface PayrollRecord {
  id: string
  employeeId: string
  employeeName: string
  department: string
  position: string
  basicSalary: number
  allowances: number
  deductions: number
  netSalary: number
  month: string
  year: string
  status: 'Pending' | 'Processed' | 'Paid'
}

export function usePayroll() {
  const [payrollForm, setPayrollForm] = useState({
    employeeId: '',
    employeeName: '',
    department: '',
    position: '',
    basicSalary: '',
    allowances: '',
    deductions: '',
    netSalary: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear().toString(),
    status: 'Pending',
  })

  const [employeeSearchId, setEmployeeSearchId] = useState('')
  const [isSearchingEmployee, setIsSearchingEmployee] = useState(false)
  const [employeeNotFound, setEmployeeNotFound] = useState(false)
  const [isUploadingPayroll, setIsUploadingPayroll] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<unknown>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([])

  const handlePayrollChange = (field: string, value: string) => {
    setPayrollForm(prev => {
      const updated = { ...prev, [field]: value }
      if (['basicSalary', 'allowances', 'deductions'].includes(field)) {
        const basic = parseFloat(updated.basicSalary) || 0
        const allow = parseFloat(updated.allowances) || 0
        const deduct = parseFloat(updated.deductions) || 0
        updated.netSalary = Math.max(0, basic + allow - deduct).toFixed(2)
      }
      return updated
    })
  }

  const handleSearchEmployee = async () => {
    if (!employeeSearchId) {
      toast.error('Enter an Employee ID to search')
      return
    }

    setIsSearchingEmployee(true)
    setEmployeeNotFound(false)

    try {
      const response = await fetch(`/api/employee?search=${employeeSearchId}&field=employeeId`)
      const data = await response.json()

      if (data.employees && data.employees.length > 0) {
        const emp = data.employees[0]
        setPayrollForm(prev => ({
          ...prev,
          employeeId: emp.employeeId,
          employeeName: emp.name,
          department: emp.department,
          position: emp.position,
          basicSalary: String(emp.salary || ''),
          allowances: '0',
          deductions: '0',
          netSalary: String(emp.salary || ''),
        }))
        toast.success(`Found employee: ${emp.name}`)
      } else {
        setEmployeeNotFound(true)
        toast.error('Employee not found')
      }
    } catch {
      toast.error('Failed to search employee')
    } finally {
      setIsSearchingEmployee(false)
    }
  }

  const handleDownloadSalarySlip = (record: PayrollRecord) => {
    try {
      const monthNumber = new Date(Date.parse(`${record.month} 1, 2026`)).getMonth() + 1 || 8
      downloadSalarySlipPDF({
        slipNumber: `SLIP-${record.id.slice(-6).toUpperCase()}`,
        employeeId: record.employeeId,
        employeeName: record.employeeName,
        department: record.department,
        position: record.position,
        basicSalary: Number(record.basicSalary),
        allowances: Number(record.allowances),
        deductions: Number(record.deductions),
        netSalary: Number(record.netSalary),
        month: monthNumber,
        year: parseInt(record.year) || 2026,
        status: record.status || 'Processed',
        date: new Date().toISOString().split('T')[0],
        schoolName: 'Greenwood High School',
      })
      toast.success('Salary slip downloaded successfully')
    } catch {
      toast.error('Error generating salary slip PDF')
    }
  }

  return {
    payrollForm,
    setPayrollForm,
    handlePayrollChange,
    employeeSearchId,
    setEmployeeSearchId,
    isSearchingEmployee,
    employeeNotFound,
    handleSearchEmployee,
    isUploadingPayroll,
    uploadProgress,
    uploadResult,
    updatingStatus,
    setUpdatingStatus,
    payrolls,
    setPayrolls,
    handleDownloadSalarySlip,
  }
}
