import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Edit, Trash2, GraduationCap, Calendar } from 'lucide-react'
import { StudentBatch } from './hooks/useStudentBatches'

interface StudentBatchTableProps {
  batches: StudentBatch[]
  loading: boolean
  onEdit: (batch: StudentBatch) => void
  onDelete: (id: string) => void
}

export const StudentBatchTable: React.FC<StudentBatchTableProps> = ({
  batches,
  loading,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <GraduationCap className="mx-auto h-8 w-8 animate-pulse mb-2" />
        <p>Loading student batches...</p>
      </div>
    )
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Batch Code</TableHead>
            <TableHead>Batch Name</TableHead>
            <TableHead>Academic Year</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Students</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {batches.length > 0 ? (
            batches.map((batch) => (
              <TableRow key={batch.id}>
                <TableCell className="font-mono text-xs font-semibold">{batch.batchCode}</TableCell>
                <TableCell className="font-medium">{batch.batchName}</TableCell>
                <TableCell>{batch.academicYear}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(batch.startDate).toLocaleDateString()} - {batch.endDate ? new Date(batch.endDate).toLocaleDateString() : 'Present'}
                  </div>
                </TableCell>
                <TableCell>{batch._count?.students || 0}</TableCell>
                <TableCell>
                  <Badge variant={batch.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {batch.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(batch)}>
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
                          <AlertDialogTitle>Delete Batch?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete <span className="font-semibold">{batch.batchName}</span>?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(batch.id)}
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
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                <GraduationCap className="mx-auto h-8 w-8 opacity-30 mb-2" />
                No student batches registered. Click &quot;Add Batch&quot; to create one.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
