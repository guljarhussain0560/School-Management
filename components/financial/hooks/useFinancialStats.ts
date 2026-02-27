'use client'

import { useState, useEffect } from 'react'

export interface FinancialStats {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  pendingFees: number
  collectedFeesThisMonth: number
  payrollThisMonth: number
}

export function useFinancialStats() {
  const [stats, setStats] = useState<FinancialStats>({
    totalRevenue: 450000,
    totalExpenses: 280000,
    netProfit: 170000,
    pendingFees: 65000,
    collectedFeesThisMonth: 125000,
    payrollThisMonth: 180000,
  })

  const [loading, setLoading] = useState(false)

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/financial/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(prev => ({ ...prev, ...data }))
      }
    } catch {
      // Fall back gracefully to existing state
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return { stats, loading, refreshStats: fetchStats }
}
