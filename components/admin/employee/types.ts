export interface Employee {
  id: string
  employeeId: string
  name: string
  email: string
  phone?: string
  address?: string
  dateOfBirth?: string
  dateOfJoining: string
  department: string
  position: string
  salary: number
  status: 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | 'ON_LEAVE'
  emergencyContact?: string
  emergencyPhone?: string
  qualifications?: string
  experience?: string
  bankAccount?: string
  ifscCode?: string
  panNumber?: string
  aadharNumber?: string
  notes?: string
  creator?: {
    name: string
  }
}

export interface EmployeeSummary {
  totalEmployees: number
  activeEmployees: number
  inactiveEmployees: number
  onLeaveEmployees: number
  totalSalary: number
}

export interface EmployeeFormData {
  name: string
  email: string
  phone: string
  address: string
  dateOfBirth: string
  dateOfJoining: string
  department: string
  position: string
  salary: string
  status: 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | 'ON_LEAVE'
  emergencyContact: string
  emergencyPhone: string
  qualifications: string
  experience: string
  bankAccount: string
  ifscCode: string
  panNumber: string
  aadharNumber: string
  notes: string
}
