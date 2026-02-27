'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Search, Download, Receipt, DollarSign, Filter, RefreshCw } from 'lucide-react'
import { useFeeCollection, FeeRecord } from '../hooks/useFeeCollection'

export default function FeeCollectionSection() {
  const {
    feeCurrentPage,
    setFeeCurrentPage,
    feeTotalPages,
    feeSearchTerm,
    setFeeSearchTerm,
    feeSearchField,
    setFeeSearchField,
    feePaymentModeFilter,
    setFeePaymentModeFilter,
    isLoadingFeeCollections,
    recentFeeCollections,
    feeForm,
    handleFeeFormChange,
    resetFeeForm,
    handleFeeSubmit,
    handleDownloadReceipt,
  } = useFeeCollection()

  return (
    <div className="space-y-6">
      {/* Fee Collection Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Collect Student Fee
          </CardTitle>
          <CardDescription>Record fee payment, generate instant receipt, and update student ledger.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFeeSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fee-student-id">Student ID *</Label>
                <Input
                  id="fee-student-id"
                  placeholder="e.g. STU-2026-001"
                  value={feeForm.studentId}
                  onChange={(e) => handleFeeFormChange('studentId', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fee-amount">Amount ($) *</Label>
                <Input
                  id="fee-amount"
                  type="number"
                  placeholder="0.00"
                  value={feeForm.amount}
                  onChange={(e) => handleFeeFormChange('amount', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fee-payment-mode">Payment Mode *</Label>
                <Select
                  value={feeForm.paymentMode}
                  onValueChange={(val) => handleFeeFormChange('paymentMode', val)}
                >
                  <SelectTrigger id="fee-payment-mode">
                    <SelectValue placeholder="Select Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="ONLINE">Online Transfer / NetBanking</SelectItem>
                    <SelectItem value="CARD">Debit / Credit Card</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                    <SelectItem value="UPI">UPI / Digital Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fee-notes">Payment Remarks / Notes</Label>
              <Textarea
                id="fee-notes"
                placeholder="Optional remarks (e.g. Term 1 Tuition Fee, Installment 2)"
                value={feeForm.notes}
                onChange={(e) => handleFeeFormChange('notes', e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={resetFeeForm}>
                Clear Form
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                <Receipt className="h-4 w-4 mr-2" />
                Process Payment & Receipt
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Transaction History & Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Recent Fee Collections</CardTitle>
              <CardDescription>Search and filter verified student transactions</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-8 w-64"
                  value={feeSearchTerm}
                  onChange={(e) => setFeeSearchTerm(e.target.value)}
                />
              </div>
              <Select value={feePaymentModeFilter} onValueChange={setFeePaymentModeFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Filter Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="ONLINE">Online</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">Receipt No</th>
                  <th className="px-4 py-3">Student ID</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentFeeCollections.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No fee collection records found.
                    </td>
                  </tr>
                ) : (
                  recentFeeCollections.map((record) => (
                    <tr key={record.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">REC-{record.id.slice(-6).toUpperCase()}</td>
                      <td className="px-4 py-3">{record.studentId}</td>
                      <td className="px-4 py-3 font-semibold text-green-600">${Number(record.amount).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{record.paymentMode}</Badge>
                      </td>
                      <td className="px-4 py-3">{record.date}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownloadReceipt(record)}
                        >
                          <Download className="h-4 w-4 mr-1" /> PDF
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
