'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, Receipt, DollarSign } from 'lucide-react'
import { FeeCollection } from './hooks/useFeeCollections'

interface FeeCollectionTableProps {
  collections: FeeCollection[]
  loading: boolean
  onDelete: (id: string) => void
}

export const FeeCollectionTable: React.FC<FeeCollectionTableProps> = ({
  collections,
  loading,
  onDelete,
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading fee collection records...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Receipt / Fee ID</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Fee Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collections.length > 0 ? (
              collections.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-primary" />
                      <span>{item.feeId}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-sm">{item.student?.name || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">{item.student?.studentId || '-'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {item.feeStructure?.name || 'General Fee'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-emerald-600">
                    ${Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.paymentMode}</Badge>
                  </TableCell>
                  <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => onDelete(item.id)}
                      aria-label="Delete Record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  <DollarSign className="mx-auto h-8 w-8 opacity-30 mb-2" />
                  No fee collection records found. Click &quot;Collect Fee&quot; to add one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
