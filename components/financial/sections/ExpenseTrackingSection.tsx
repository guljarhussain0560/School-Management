'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { TrendingDown, Plus, FileText } from 'lucide-react'
import { useExpenses } from '../hooks/useExpenses'

export default function ExpenseTrackingSection() {
  const {
    expenses,
    expenseForm,
    handleExpenseChange,
    resetExpenseForm,
    handleExpenseSubmit,
  } = useExpenses()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            Record Departmental Expense
          </CardTitle>
          <CardDescription>Log institutional expenditures, allocate to departmental budgets, and attach receipts.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Department *</Label>
                <Select
                  value={expenseForm.department}
                  onValueChange={(val) => handleExpenseChange('department', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Academic">Academic & Laboratory</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="Transport">Transport & Fleet</SelectItem>
                    <SelectItem value="Maintenance">Facilities & Maintenance</SelectItem>
                    <SelectItem value="Sports">Sports & Extracurricular</SelectItem>
                    <SelectItem value="IT">IT Infrastructure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Amount ($) *</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={expenseForm.amount}
                  onChange={(e) => handleExpenseChange('amount', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  placeholder="e.g. Science Lab Equipment"
                  value={expenseForm.category}
                  onChange={(e) => handleExpenseChange('category', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description / Itemized Breakdown *</Label>
              <Textarea
                placeholder="Details of the expenditure..."
                value={expenseForm.description}
                onChange={(e) => handleExpenseChange('description', e.target.value)}
                rows={2}
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={resetExpenseForm}>
                Reset
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Submit Expense
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
