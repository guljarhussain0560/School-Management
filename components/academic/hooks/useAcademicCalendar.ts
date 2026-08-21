'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client'

export interface AcademicEvent {
  id: string
  title: string
  description?: string
  eventType: string
  startDate: string
  endDate?: string
  startTime?: string
  endTime?: string
  venue?: string
  isAllDay: boolean
  isRecurring: boolean
  recurringPattern?: string
  targetAudience: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ClassItem {
  id: string
  className?: string
  classCode?: string
}

export interface SubjectItem {
  id: string
  subjectName: string
}

export function useAcademicCalendar() {
  const [events, setEvents] = useState<AcademicEvent[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [subjects, setSubjects] = useState<SubjectItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterClass, setFilterClass] = useState('all')

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiGet<{ events: AcademicEvent[] }>('/api/academic/calendar', {
        context: 'useAcademicCalendar.fetchEvents',
      })
      setEvents(data?.events || [])
    } catch {
      // Handled by apiRequest
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchClasses = useCallback(async () => {
    try {
      const data = await apiGet<{ classes: ClassItem[] }>('/api/academic/classes', {
        showErrorToast: false,
      })
      setClasses(data?.classes || [])
    } catch {
      // Handled
    }
  }, [])

  const fetchSubjects = useCallback(async () => {
    try {
      const data = await apiGet<{ subjects: SubjectItem[] }>('/api/academic/subjects', {
        showErrorToast: false,
      })
      setSubjects(data?.subjects || [])
    } catch {
      // Handled
    }
  }, [])

  useEffect(() => {
    fetchEvents()
    fetchClasses()
    fetchSubjects()
  }, [fetchEvents, fetchClasses, fetchSubjects])

  const createEvent = async (eventData: Partial<AcademicEvent>) => {
    const result = await apiPost<AcademicEvent>('/api/academic/calendar', eventData, {
      showSuccessToast: true,
      successMessage: 'Academic event created successfully',
      context: 'useAcademicCalendar.createEvent',
    })
    if (result) {
      await fetchEvents()
      setShowCreateDialog(false)
    }
    return result
  }

  const updateEvent = async (id: string, eventData: Partial<AcademicEvent>) => {
    const result = await apiPut<AcademicEvent>(`/api/academic/calendar/${id}`, eventData, {
      showSuccessToast: true,
      successMessage: 'Academic event updated successfully',
      context: 'useAcademicCalendar.updateEvent',
    })
    if (result) {
      await fetchEvents()
      setShowEditDialog(false)
    }
    return result
  }

  const deleteEvent = async (id: string) => {
    await apiDelete(`/api/academic/calendar/${id}`, {
      showSuccessToast: true,
      successMessage: 'Event deleted successfully',
      context: 'useAcademicCalendar.deleteEvent',
    })
    await fetchEvents()
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = filterType === 'all' || event.eventType === filterType
    return matchesSearch && matchesType
  })

  return {
    events: filteredEvents,
    rawEvents: events,
    classes,
    subjects,
    loading,
    selectedEvent,
    setSelectedEvent,
    showCreateDialog,
    setShowCreateDialog,
    showEditDialog,
    setShowEditDialog,
    currentDate,
    setCurrentDate,
    viewMode,
    setViewMode,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filterClass,
    setFilterClass,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  }
}
