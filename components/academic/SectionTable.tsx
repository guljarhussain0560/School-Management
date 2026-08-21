import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Edit, Trash2, Users } from 'lucide-react'
import { Section } from './hooks/useSections'

interface SectionTableProps {
  sections: Section[]
  loading: boolean
  onEdit: (section: Section) => void
  onDelete: (id: string) => void
}

export const SectionTable: React.FC<SectionTableProps> = ({
  sections,
  loading,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="mx-auto h-8 w-8 animate-pulse mb-2" />
        <p>Loading sections...</p>
      </div>
    )
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Class Code</TableHead>
            <TableHead>Section Name</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Students</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sections.length > 0 ? (
            sections.map((section) => (
              <TableRow key={section.id}>
                <TableCell className="font-mono text-xs font-semibold">{section.classCode}</TableCell>
                <TableCell className="font-medium">{section.sectionName}</TableCell>
                <TableCell>{section.grade?.gradeName || 'Unassigned'}</TableCell>
                <TableCell>{section.capacity}</TableCell>
                <TableCell>{section._count?.students || 0}</TableCell>
                <TableCell>
                  <Badge variant={section.isActive ? 'default' : 'secondary'}>
                    {section.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(section)}>
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
                          <AlertDialogTitle>Delete Section?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete <span className="font-semibold">{section.sectionName}</span>?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(section.id)}
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
                <Users className="mx-auto h-8 w-8 opacity-30 mb-2" />
                No sections found. Click &quot;Add Section&quot; to create one.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
