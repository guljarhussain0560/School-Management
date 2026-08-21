import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../route'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import * as XLSX from 'xlsx'

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    employee: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    payroll: {
      create: vi.fn(),
      createMany: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}))

vi.mock('xlsx', () => ({
  read: vi.fn(),
  utils: {
    sheet_to_json: vi.fn(),
  },
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}))

describe('/api/financial/payroll Route Handler', () => {
  const mockAdminSession = {
    user: {
      id: 'admin-1',
      role: 'ADMIN',
      schoolId: 'school-123',
      name: 'School Admin',
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession as any)
  })

  it('rejects unauthenticated requests with 401', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null)
    const req = new NextRequest('http://localhost:3000/api/financial/payroll', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    })

    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('rejects non-admin roles with 403', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: 'teacher-1', role: 'TEACHER', schoolId: 'school-123' },
    } as any)

    const req = new NextRequest('http://localhost:3000/api/financial/payroll', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    })

    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it('creates single payroll record successfully via JSON POST', async () => {
    vi.mocked(prisma.employee.findFirst).mockResolvedValueOnce({
      id: 'emp-uuid-1',
      employeeId: 'EMP001',
      name: 'John Doe',
      department: 'Teaching',
      position: 'Math Teacher',
      status: 'ACTIVE',
      schoolId: 'school-123',
    } as any)

    vi.mocked(prisma.payroll.create).mockResolvedValueOnce({
      id: 'pay-1',
      payrollId: 'TEA202604001',
      employeeId: 'emp-uuid-1',
      employeeName: 'John Doe',
      department: 'Teaching',
      basicSalary: 50000,
      amount: 55000,
      month: 4,
      year: 2026,
      status: 'PAID',
    } as any)

    const req = new NextRequest('http://localhost:3000/api/financial/payroll', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        employeeId: 'EMP001',
        employeeName: 'John Doe',
        department: 'Teaching',
        position: 'Math Teacher',
        basicSalary: 50000,
        allowances: 10000,
        deductions: 5000,
        netSalary: 55000,
        month: 4,
        year: 2026,
        status: 'PAID',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.message).toContain('Payroll record created')
    expect(json.payroll.payrollId).toBe('TEA202604001')
  })

  it('rejects payroll creation for terminated employees with 400', async () => {
    vi.mocked(prisma.employee.findFirst).mockResolvedValueOnce({
      id: 'emp-uuid-2',
      employeeId: 'EMP002',
      name: 'Severus Snape',
      status: 'TERMINATED',
      schoolId: 'school-123',
    } as any)

    const req = new NextRequest('http://localhost:3000/api/financial/payroll', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        employeeId: 'EMP002',
        basicSalary: 45000,
        month: 4,
        year: 2026,
        status: 'PENDING',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Employee terminated')
  })

  it('returns 404 when employee does not exist', async () => {
    vi.mocked(prisma.employee.findFirst).mockResolvedValueOnce(null)

    const req = new NextRequest('http://localhost:3000/api/financial/payroll', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        employeeId: 'EMP_NON_EXISTENT',
        basicSalary: 40000,
        month: 4,
        year: 2026,
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(404)
  })

  it('processes bulk Excel upload file correctly', async () => {
    vi.mocked(XLSX.read).mockReturnValueOnce({
      SheetNames: ['Sheet1'],
      Sheets: { Sheet1: {} },
    } as any)

    vi.mocked(XLSX.utils.sheet_to_json).mockReturnValueOnce([
      {
        'Employee ID': 'EMP001',
        'Employee Name': 'John Doe',
        'Department': 'Teaching',
        'Basic Salary': 50000,
        'Allowances': 5000,
        'Deductions': 2000,
        'Month': 4,
        'Year': 2026,
      },
    ])

    vi.mocked(prisma.employee.findFirst).mockResolvedValueOnce({
      id: 'emp-1',
      employeeId: 'EMP001',
      name: 'John Doe',
      department: 'Teaching',
      position: 'Teacher',
      status: 'ACTIVE',
    } as any)

    vi.mocked(prisma.payroll.create).mockResolvedValueOnce({
      id: 'p-1',
      payrollId: 'TEA202604001',
      employeeId: 'emp-1',
      employeeName: 'John Doe',
    } as any)

    const mockFile = {
      name: 'payroll.xlsx',
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    }

    const mockFormData = {
      get: (key: string) => (key === 'file' ? mockFile : null),
    }

    const req = {
      headers: new Headers({ 'content-type': 'multipart/form-data' }),
      formData: async () => mockFormData,
    } as unknown as NextRequest

    const res = await POST(req)
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.records).toHaveLength(1)

  })
})
