/**
 * Enterprise API Client Utility
 * Standardizes fetch requests, response validation, JSON parsing, error logging, and UI feedback across client components.
 */

import { toast } from 'sonner'
import { logger } from './logger'

export interface ApiRequestOptions extends RequestInit {
  showErrorToast?: boolean
  showSuccessToast?: boolean
  successMessage?: string
  context?: string
}

export class ApiError extends Error {
  status: number
  details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

/**
 * Standard typed API request wrapper
 */
export async function apiRequest<T = unknown>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    showErrorToast = true,
    showSuccessToast = false,
    successMessage,
    context = 'APIClient',
    headers,
    ...restOptions
  } = options

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // If body is FormData, let the browser set boundary headers automatically
  if (restOptions.body instanceof FormData) {
    delete defaultHeaders['Content-Type']
  }

  try {
    const response = await fetch(url, {
      headers: {
        ...defaultHeaders,
        ...(headers as Record<string, string>),
      },
      ...restOptions,
    })

    const contentType = response.headers.get('content-type')
    const isJson = contentType && contentType.includes('application/json')
    const data = isJson ? await response.json() : await response.text()

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' && data !== null && 'error' in data
          ? String((data as { error: unknown }).error)
          : null) ||
        (typeof data === 'object' && data !== null && 'message' in data
          ? String((data as { message: unknown }).message)
          : null) ||
        `Request failed with status ${response.status}`

      const error = new ApiError(errorMessage, response.status, data)

      logger.error(`API Error on ${url}`, error, {
        status: response.status,
        url,
        context,
        details: data,
      })

      if (showErrorToast) {
        toast.error(errorMessage)
      }

      throw error
    }

    if (showSuccessToast && successMessage) {
      toast.success(successMessage)
    }

    return data as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    const networkError = new ApiError(
      error instanceof Error ? error.message : 'Network request failed',
      0,
      error
    )

    logger.error(`Network Error on ${url}`, networkError, {
      url,
      context,
    })

    if (showErrorToast) {
      toast.error('Network error. Please check your connection.')
    }

    throw networkError
  }
}

export async function apiGet<T = unknown>(url: string, options: ApiRequestOptions = {}): Promise<T> {
  return apiRequest<T>(url, { method: 'GET', ...options })
}

export async function apiPost<T = unknown>(url: string, body?: unknown, options: ApiRequestOptions = {}): Promise<T> {
  return apiRequest<T>(url, {
    method: 'POST',
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    ...options,
  })
}

export async function apiPut<T = unknown>(url: string, body?: unknown, options: ApiRequestOptions = {}): Promise<T> {
  return apiRequest<T>(url, {
    method: 'PUT',
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    ...options,
  })
}

export async function apiDelete<T = unknown>(url: string, options: ApiRequestOptions = {}): Promise<T> {
  return apiRequest<T>(url, { method: 'DELETE', ...options })
}

/**
 * Domain API Helpers
 */
export async function getStudents(params?: Record<string, string | number>) {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ''
  return apiGet<{ students: any[]; pagination?: any }>(`/api/academic/students${query}`, { context: 'getStudents' })
}

export async function getClasses(params?: Record<string, string | number>) {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ''
  return apiGet<{ classes: any[]; pagination?: any }>(`/api/academic/classes${query}`, { context: 'getClasses' })
}

export async function getSubjects(params?: Record<string, string | number>) {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ''
  return apiGet<{ subjects: any[]; pagination?: any }>(`/api/academic/subjects${query}`, { context: 'getSubjects' })
}

export async function getExams(params?: Record<string, string | number>) {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ''
  return apiGet<{ exams: any[]; pagination?: any }>(`/api/academic/exams${query}`, { context: 'getExams' })
}

export async function createExam(payload: unknown) {
  return apiPost<{ exam: any; message: string }>('/api/academic/exams', payload, {
    showSuccessToast: true,
    successMessage: 'Exam created successfully',
    context: 'createExam',
  })
}

export async function deleteExam(examId: string) {
  return apiDelete<{ message: string }>(`/api/academic/exams?id=${examId}`, {
    showSuccessToast: true,
    successMessage: 'Exam deleted successfully',
    context: 'deleteExam',
  })
}

export async function getBuses(params?: Record<string, string | number>) {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ''
  return apiGet<{ buses: any[]; pagination?: any }>(`/api/transport/buses${query}`, { context: 'getBuses' })
}

export async function getRoutes(params?: Record<string, string | number>) {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ''
  return apiGet<{ routes: any[]; pagination?: any }>(`/api/transport/routes${query}`, { context: 'getRoutes' })
}

export async function createFeeCollection(payload: unknown) {
  return apiPost<{ feeCollection: any; message: string }>('/api/financial/fee-collection', payload, {
    showSuccessToast: true,
    successMessage: 'Fee collection recorded successfully',
    context: 'createFeeCollection',
  })
}

