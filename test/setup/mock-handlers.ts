/**
 * Shared API Mock Handlers for Test Isolation
 * Provides standardized mock responses for academic, financial, transport, and health endpoints.
 */

export const mockAcademicData = {
  students: [
    {
      id: 'stu-101',
      studentId: 'GW26001',
      name: 'Harry Potter',
      rollNumber: 'R101',
      email: 'harry@hogwarts.edu',
      status: 'ACTIVE',
      class: { id: 'c-1', className: 'Grade 10', classCode: 'G10' },
    },
  ],
  classes: [
    { id: 'c-1', className: 'Grade 10', classCode: 'G10', capacity: 40 },
    { id: 'c-2', className: 'Grade 11', classCode: 'G11', capacity: 35 },
  ],
  subjects: [
    { id: 'sub-1', subjectName: 'Mathematics', subjectCode: 'MATH101', credits: 4 },
    { id: 'sub-2', subjectName: 'Physics', subjectCode: 'PHYS101', credits: 4 },
  ],
  exams: [
    {
      id: 'ex-1',
      examName: 'Midterm 2026',
      examType: 'MIDTERM',
      totalMarks: 100,
      passingMarks: 40,
      duration: 120,
      isActive: true,
    },
  ],
}

export const mockFinancialData = {
  stats: {
    totalRevenue: 2500000,
    totalExpenses: 1200000,
    netIncome: 1300000,
    pendingFees: 450000,
  },
  feeStructures: [
    {
      id: 'fs-1',
      feeCode: 'TUI-01',
      name: 'Tuition Fee Q1',
      amount: 10000,
      frequency: 'QUARTERLY',
      category: 'TUITION',
      isMandatory: true,
      isActive: true,
    },
  ],
}

export const mockOperationsData = {
  buses: [
    { id: 'bus-1', busNumber: 'GWR01L001', capacity: 50, status: 'ACTIVE' },
  ],
  routes: [
    { id: 'r-1', routeName: 'North Campus Line', startPoint: 'Station', endPoint: 'Campus' },
  ],
  safetyAlerts: [
    { id: 'al-1', type: 'Weather', priority: 'HIGH', description: 'Heavy Rain Alert', status: 'ACTIVE' },
  ],
}

/**
 * Global mock fetch resolver
 */
export function handleMockRequest(url: string, init?: RequestInit): any {
  if (url.includes('/api/academic/students')) return { students: mockAcademicData.students, pagination: { page: 1, limit: 10, total: 1, pages: 1 } }
  if (url.includes('/api/academic/classes')) return { classes: mockAcademicData.classes }
  if (url.includes('/api/academic/subjects')) return { subjects: mockAcademicData.subjects }
  if (url.includes('/api/academic/exams')) return { exams: mockAcademicData.exams }
  if (url.includes('/api/financial/stats')) return mockFinancialData.stats
  if (url.includes('/api/financial/fee-structures')) return { feeStructures: mockFinancialData.feeStructures }
  if (url.includes('/api/transport/buses')) return { buses: mockOperationsData.buses }
  if (url.includes('/api/transport/routes')) return { routes: mockOperationsData.routes }
  if (url.includes('/api/operations/safety-alerts')) return { alerts: mockOperationsData.safetyAlerts }
  if (url.includes('/api/health')) return { status: 'healthy', database: 'connected', timestamp: new Date().toISOString() }

  return { success: true }
}
