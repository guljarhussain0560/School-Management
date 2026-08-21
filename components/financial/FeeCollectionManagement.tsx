'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DollarSign, Plus, Search, TrendingUp, Users } from 'lucide-react'
import { useFeeCollections } from './hooks/useFeeCollections'
import { FeeCollectionForm } from './FeeCollectionForm'
import { FeeCollectionTable } from './FeeCollectionTable'

export const FeeCollectionManagement: React.FC = () => {
  const {
    feeCollections,
    students,
    feeStructures,
    loading,
    totalCollected,
    searchTerm,
    setSearchTerm,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    collectFee,
    deleteCollection,
  } = useFeeCollections()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-emerald-600" />
            Fee Collection Management
          </h2>
          <p className="text-muted-foreground">
            Track student fee payments, collections, receipts, and revenue stats.
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Collect Fee
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              ${totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Across all recorded transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feeCollections.length}</div>
            <p className="text-xs text-muted-foreground">Filtered collections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">Active student roster</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Search Transactions</CardTitle>
          <CardDescription>Search by receipt number, student name, or student ID.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student name, ID, or receipt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <FeeCollectionTable
        collections={feeCollections}
        loading={loading}
        onDelete={deleteCollection}
      />

      {isCreateDialogOpen && (
        <FeeCollectionForm
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={collectFee}
          students={students}
          feeStructures={feeStructures}
        />
      )}
    </div>
  )
}

export default FeeCollectionManagement
