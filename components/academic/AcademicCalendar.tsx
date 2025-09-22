'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, CalendarDays, Plus, Edit, Trash2, Eye, 
  Clock, MapPin, Users, BookOpen, GraduationCap, AlertCircle,
  Download, Upload, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import FormWithExcel from '../common/FormWithExcel';

interface AcademicEvent {
  id: string;
  title: string;
  description?: string;
  eventType: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  venue?: string;
  isAllDay: boolean;
  isRecurring: boolean;
  recurringPattern?: string;
  targetAudience: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Class {
  id: string;
  className: string;
}

interface Subject {
  id: string;
  subjectName: string;
}

const AcademicCalendar: React.FC = () => {
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterClass, setFilterClass] = useState('all');

  useEffect(() => {
    fetchEvents();
    fetchClasses();
    fetchSubjects();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/academic/calendar');
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch calendar events');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/academic/classes');
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/academic/subjects');
      if (response.ok) {
        const data = await response.json();
        setSubjects(data.subjects || []);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleCreateEvent = async (data: any) => {
    try {
      const response = await fetch('/api/academic/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success('Event created successfully');
        setShowCreateDialog(false);
        fetchEvents();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  const handleBulkCreateEvents = async (data: any[]) => {
    try {
      const response = await fetch('/api/academic/calendar/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: data })
      });

      if (response.ok) {
        toast.success(`${data.length} events created successfully`);
        fetchEvents();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create events');
      }
    } catch (error) {
      console.error('Error creating events:', error);
      toast.error('Failed to create events');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`/api/academic/calendar/${eventId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Event deleted successfully');
        fetchEvents();
      } else {
        toast.error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'EXAM': return 'bg-red-100 text-red-800';
      case 'HOLIDAY': return 'bg-green-100 text-green-800';
      case 'EVENT': return 'bg-blue-100 text-blue-800';
      case 'MEETING': return 'bg-purple-100 text-purple-800';
      case 'DEADLINE': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = new Date(event.startDate).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || event.eventType === filterType;
    const matchesClass = filterClass === 'all' || event.targetAudience.includes(filterClass);
    
    return matchesSearch && matchesType && matchesClass;
  });

  const eventFields = [
    { name: 'title', label: 'Event Title', type: 'text' as const, required: true, placeholder: 'Enter event title' },
    { name: 'description', label: 'Description', type: 'textarea' as const, required: false, placeholder: 'Event description...' },
    { name: 'eventType', label: 'Event Type', type: 'select' as const, required: true,
      options: [
        { value: 'EXAM', label: 'Exam' },
        { value: 'HOLIDAY', label: 'Holiday' },
        { value: 'EVENT', label: 'School Event' },
        { value: 'MEETING', label: 'Meeting' },
        { value: 'DEADLINE', label: 'Deadline' },
        { value: 'OTHER', label: 'Other' }
      ]
    },
    { name: 'startDate', label: 'Start Date', type: 'date' as const, required: true },
    { name: 'endDate', label: 'End Date', type: 'date' as const, required: false },
    { name: 'startTime', label: 'Start Time', type: 'text' as const, required: false, placeholder: 'HH:MM' },
    { name: 'endTime', label: 'End Time', type: 'text' as const, required: false, placeholder: 'HH:MM' },
    { name: 'venue', label: 'Venue', type: 'text' as const, required: false, placeholder: 'Event venue' },
    { name: 'isAllDay', label: 'All Day Event', type: 'checkbox' as const, required: false },
    { name: 'isRecurring', label: 'Recurring Event', type: 'checkbox' as const, required: false }
  ];

  const renderCalendarGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dayEvents = getEventsForDate(current);
      const isCurrentMonth = current.getMonth() === month;
      const isToday = current.toDateString() === new Date().toDateString();
      
      days.push(
        <div
          key={i}
          className={`min-h-[100px] p-2 border border-gray-200 ${
            isCurrentMonth ? 'bg-white' : 'bg-gray-50'
          } ${isToday ? 'bg-blue-50 border-blue-300' : ''}`}
        >
          <div className={`text-sm font-medium mb-1 ${
            isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
          } ${isToday ? 'text-blue-600' : ''}`}>
            {current.getDate()}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 3).map(event => (
              <div
                key={event.id}
                className={`text-xs p-1 rounded truncate cursor-pointer ${getEventTypeColor(event.eventType)}`}
                onClick={() => setSelectedEvent(event)}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Academic Calendar</h2>
          <p className="text-gray-600">Manage academic events, exams, and important dates</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>
                Add a new event to the academic calendar
              </DialogDescription>
            </DialogHeader>
            <FormWithExcel
              title="Event Details"
              fields={eventFields}
              templateKey="academicEvents"
              onSubmit={handleCreateEvent}
              onBulkSubmit={handleBulkCreateEvents}
              submitButtonText="Create Event"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-semibold">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('month')}
              >
                Month
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('week')}
              >
                Week
              </Button>
              <Button
                variant={viewMode === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('day')}
              >
                Day
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-gray-100 p-2 text-center font-medium text-sm">
                {day}
              </div>
            ))}
            {renderCalendarGrid()}
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>All scheduled academic events</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="min-w-[150px]">
              <Label htmlFor="type-filter">Event Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="EXAM">Exam</SelectItem>
                  <SelectItem value="HOLIDAY">Holiday</SelectItem>
                  <SelectItem value="EVENT">School Event</SelectItem>
                  <SelectItem value="MEETING">Meeting</SelectItem>
                  <SelectItem value="DEADLINE">Deadline</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Events Table */}
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{event.title}</div>
                        {event.description && (
                          <div className="text-sm text-gray-500 truncate max-w-[200px]">
                            {event.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getEventTypeColor(event.eventType)}>
                        {event.eventType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(event.startDate).toLocaleDateString()}
                      {event.endDate && event.endDate !== event.startDate && (
                        <div className="text-sm text-gray-500">
                          to {new Date(event.endDate).toLocaleDateString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {event.isAllDay ? (
                        <span className="text-sm text-gray-500">All Day</span>
                      ) : (
                        <div>
                          {event.startTime && <div>{event.startTime}</div>}
                          {event.endTime && <div className="text-sm text-gray-500">to {event.endTime}</div>}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{event.venue || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEditDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent && !showEditDialog} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              <Badge className={selectedEvent ? getEventTypeColor(selectedEvent.eventType) : ''}>
                {selectedEvent?.eventType}
              </Badge>
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              {selectedEvent.description && (
                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-gray-600">{selectedEvent.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedEvent.startDate).toLocaleDateString()}
                    {selectedEvent.endDate && selectedEvent.endDate !== selectedEvent.startDate && (
                      <span> to {new Date(selectedEvent.endDate).toLocaleDateString()}</span>
                    )}
                  </p>
                </div>
                <div>
                  <Label>Time</Label>
                  <p className="text-sm text-gray-600">
                    {selectedEvent.isAllDay ? 'All Day' : 
                     `${selectedEvent.startTime || 'TBD'}${selectedEvent.endTime ? ` - ${selectedEvent.endTime}` : ''}`}
                  </p>
                </div>
                {selectedEvent.venue && (
                  <div className="col-span-2">
                    <Label>Venue</Label>
                    <p className="text-sm text-gray-600">{selectedEvent.venue}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setShowEditDialog(true);
                  setSelectedEvent(null);
                }}>
                  Edit Event
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AcademicCalendar;
