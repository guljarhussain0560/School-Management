import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { logger } from '@/lib/logger'
import { AppError, isAppError } from '@/lib/errors'

export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
  error?: string
  code?: string
  details?: unknown
  statusCode: number
}

export function apiSuccess<T>(data: T, message?: string, statusCode: number = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      statusCode,
    },
    { status: statusCode }
  )
}

export function apiError(
  error: string,
  statusCode: number = 500,
  details?: unknown,
  code?: string
) {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
      details,
      statusCode,
    },
    { status: statusCode }
  )
}

export function handleApiError(error: unknown, req?: NextRequest) {
  const path = req ? new URL(req.url).pathname : 'unknown_path'

  if (error instanceof ZodError) {
    logger.warn('Validation error on API route', {
      path,
      issues: error.issues,
    })

    const formattedIssues = error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message,
    }))

    return apiError('Validation failed', 400, formattedIssues, 'VALIDATION_ERROR')
  }

  if (isAppError(error)) {
    if (error.isOperational && error.statusCode < 500) {
      logger.warn(`Operational error on ${path}: ${error.message}`, {
        path,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
      })
    } else {
      logger.error(`AppError on ${path}: ${error.message}`, error, {
        path,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
      })
    }

    return apiError(error.message, error.statusCode, error.details, error.code)
  }

  if (error instanceof Error) {
    logger.error(`API Error on ${path}: ${error.message}`, error, { path })
    return apiError(error.message || 'Internal server error', 500, undefined, 'INTERNAL_SERVER_ERROR')
  }

  logger.error(`Unknown API Error on ${path}`, error, { path })
  return apiError('Internal server error', 500, undefined, 'INTERNAL_SERVER_ERROR')
}


export function withApiHandler<T>(
  handler: (request: NextRequest) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(request)
    } catch (error) {
      return handleApiError(error, request)
    }
  }
}
