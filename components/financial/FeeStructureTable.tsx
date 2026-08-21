import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Edit, Trash2, DollarSign } from 'lucide-react'
import { FeeStructure } from './hooks/useFeeStructures'

interface FeeStructureTableProps {
  feeStructures: FeeStructure[]
  loading: boolean
  onEdit: (fee: FeeStructure) => void
  onDelete: (id: string) => void
}

export const FeeStructureTable: React.FC<FeeStructureTableProps> = ({
  feeStructures,
  loading,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <DollarSign className="mx-auto h-8 w-8 animate-pulse mb-2" />
        <p>Loading fee structures...</p>
      </div>
    )
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fee Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Class / Batch</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feeStructures.length > 0 ? (
            feeStructures.map((fee) => (
              <TableRow key={fee.id}>
                <TableCell className="font-mono text-xs font-semibold">{fee.feeCode}</TableCell>
                <TableCell className="font-medium">{fee.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{fee.category}</Badge>
                </TableCell>
                <TableCell className="font-semibold">₹{fee.amount.toLocaleString()}</TableCell>
                <TableCell className="text-xs capitalize">{fee.frequency.toLowerCase()}</TableCell>
                <TableCell className="text-xs">
                  {fee.class?.className || 'All Classes'} / {fee.batch?.batchName || 'All Batches'}
                </TableCell>
                <TableCell>
                  <Badge variant={fee.isActive ? 'default' : 'secondary'}>
                    {fee.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(fee)}>
                      <Edit className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Fee Structure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete <span className="font-semibold">{fee.name}</span>? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(fee.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                <DollarSign className="mx-auto h-8 w-8 opacity-30 mb-2" />
                No fee structures configured. Click &quot;Add Fee Structure&quot; to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
