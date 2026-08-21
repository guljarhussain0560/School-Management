'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Plus, Search } from 'lucide-react'
import { useAcademicCalendar, AcademicEvent } from './hooks/useAcademicCalendar'
import { CalendarEventForm } from './CalendarEventForm'
import { CalendarEventList } from './CalendarEventList'

export const AcademicCalendar: React.FC = () => {
  const {
    events,
    loading,
    selectedEvent,
    setSelectedEvent,
    showCreateDialog,
    setShowCreateDialog,
    showEditDialog,
    setShowEditDialog,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useAcademicCalendar()

  const handleEdit = (event: AcademicEvent) => {
    setSelectedEvent(event)
    setShowEditDialog(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Academic Calendar
          </h2>
          <p className="text-muted-foreground">
            Schedule and manage school holidays, exams, PTA meetings, and campus events.
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filters & Search</CardTitle>
          <CardDescription>Filter calendar events by category or search by keyword.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search event title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="HOLIDAY">Holidays</SelectItem>
                <SelectItem value="EXAM">Examinations</SelectItem>
                <SelectItem value="EVENT">Events</SelectItem>
                <SelectItem value="MEETING">Meetings</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <CalendarEventList
        events={events}
        loading={loading}
        onEdit={handleEdit}
        onDelete={deleteEvent}
      />

      {showCreateDialog && (
        <CalendarEventForm
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSubmit={createEvent}
          title="Create New Academic Event"
        />
      )}

      {showEditDialog && selectedEvent && (
        <CalendarEventForm
          isOpen={showEditDialog}
          onClose={() => {
            setShowEditDialog(false)
            setSelectedEvent(null)
          }}
          onSubmit={(data) => updateEvent(selectedEvent.id, data)}
          initialData={selectedEvent}
          title="Edit Academic Event"
        />
      )}
    </div>
  )
}

export default AcademicCalendar
