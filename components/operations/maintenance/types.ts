export interface MaintenanceItem {
  id: string
  name: string
  description?: string
  status: 'OK' | 'NEEDS_REPAIR' | 'IN_PROGRESS'
  notes?: string
  photoUrl?: string
  lastChecked: string
  createdAt?: string
  updatedAt?: string
}

export interface MaintenanceLog {
  id: string
  facility: string
  status: 'OK' | 'NEEDS_REPAIR' | 'IN_PROGRESS'
  notes?: string
  proofUrl?: string
  reportedBy?: string
  createdAt: string
  updatedAt?: string
  reporter?: {
    id: string
    name: string
    email: string
  }
}

export interface MaintenanceSummaryData {
  totalItems: number
  totalLogs: number
  itemsNeedingAttention: number
  logsNeedingAttention: number
  recentLogs: number
}
