'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, CalendarDays, MapPin } from 'lucide-react'
import { AcademicEvent } from './hooks/useAcademicCalendar'

interface CalendarEventListProps {
  events: AcademicEvent[]
  loading: boolean
  onEdit: (event: AcademicEvent) => void
  onDelete: (id: string) => void
}

export const CalendarEventList: React.FC<CalendarEventListProps> = ({
  events,
  loading,
  onEdit,
  onDelete,
}) => {
  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'HOLIDAY':
        return 'destructive'
      case 'EXAM':
        return 'secondary'
      case 'MEETING':
        return 'outline'
      default:
        return 'default'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading calendar events...
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
              <TableHead>Event Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length > 0 ? (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <span>{event.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(event.eventType)}>
                      {event.eventType}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(event.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {event.endDate ? new Date(event.endDate).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    {event.venue ? (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {event.venue}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(event)}
                        aria-label="Edit Event"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => onDelete(event.id)}
                        aria-label="Delete Event"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No academic events found. Click &quot;Add Event&quot; to schedule one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
