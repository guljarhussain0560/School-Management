'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export interface ExpenseRecord {
  id: string
  department: string
  amount: number
  description: string
  date: string
  receiptUrl?: string
  status?: string
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([])
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false)

  const [expenseForm, setExpenseForm] = useState({
    department: '',
    amount: '',
    description: '',
    category: 'General',
    receipt: null as File | null,
  })

  const handleExpenseChange = (field: string, value: string | File | null) => {
    setExpenseForm(prev => ({ ...prev, [field]: value }))
  }

  const resetExpenseForm = () => {
    setExpenseForm({
      department: '',
      amount: '',
      description: '',
      category: 'General',
      receipt: null,
    })
  }

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!expenseForm.department || !expenseForm.amount || !expenseForm.description) {
      toast.error('Please fill all required expense fields')
      return
    }

    try {
      const response = await fetch('/api/financial/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department: expenseForm.department,
          amount: parseFloat(expenseForm.amount),
          description: expenseForm.description,
          category: expenseForm.category,
        }),
      })

      if (response.ok) {
        toast.success('Expense recorded successfully')
        resetExpenseForm()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to record expense')
      }
    } catch {
      toast.error('Error submitting expense')
    }
  }

  return {
    expenses,
    setExpenses,
    isLoadingExpenses,
    setIsLoadingExpenses,
    expenseForm,
    handleExpenseChange,
    resetExpenseForm,
    handleExpenseSubmit,
  }
}
