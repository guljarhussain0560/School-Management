import { describe, it, expect } from 'vitest'
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  BadRequestError,
  InternalServerError,
  isAppError
} from '../errors'

describe('AppError Taxonomy', () => {
  it('instantiates base AppError with default properties', () => {
    const error = new AppError('Something went wrong')
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(AppError)
    expect(error.message).toBe('Something went wrong')
    expect(error.statusCode).toBe(500)
    expect(error.code).toBe('INTERNAL_SERVER_ERROR')
    expect(error.isOperational).toBe(true)
    expect(error.toJSON()).toEqual({
      name: 'AppError',
      message: 'Something went wrong',
      statusCode: 500,
      code: 'INTERNAL_SERVER_ERROR',
      details: undefined,
      isOperational: true
    })
  })

  it('instantiates ValidationError with 400 status and details', () => {
    const details = [{ field: 'name', message: 'Name is required' }]
    const error = new ValidationError('Invalid student data', details)
    expect(error.statusCode).toBe(400)
    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.details).toEqual(details)
    expect(isAppError(error)).toBe(true)
  })

  it('instantiates UnauthorizedError with 401 status', () => {
    const error = new UnauthorizedError('Session expired')
    expect(error.statusCode).toBe(401)
    expect(error.code).toBe('UNAUTHORIZED')
    expect(error.message).toBe('Session expired')
    expect(isAppError(error)).toBe(true)
  })

  it('instantiates ForbiddenError with 403 status', () => {
    const error = new ForbiddenError('Admin access required')
    expect(error.statusCode).toBe(403)
    expect(error.code).toBe('FORBIDDEN')
    expect(error.message).toBe('Admin access required')
    expect(isAppError(error)).toBe(true)
  })

  it('instantiates NotFoundError with 404 status and identifier', () => {
    const error = new NotFoundError('Student', 'STU-001')
    expect(error.statusCode).toBe(404)
    expect(error.code).toBe('NOT_FOUND')
    expect(error.message).toBe("Student with identifier 'STU-001' not found")
    expect(error.details).toEqual({ resource: 'Student', identifier: 'STU-001' })
  })

  it('instantiates ConflictError and BadRequestError', () => {
    const conflict = new ConflictError('Student ID already exists')
    expect(conflict.statusCode).toBe(409)
    expect(conflict.code).toBe('CONFLICT')

    const badReq = new BadRequestError('Bad input syntax')
    expect(badReq.statusCode).toBe(400)
    expect(badReq.code).toBe('BAD_REQUEST')
  })

  it('instantiates InternalServerError with isOperational=false', () => {
    const internal = new InternalServerError('Database connection failed')
    expect(internal.statusCode).toBe(500)
    expect(internal.code).toBe('INTERNAL_SERVER_ERROR')
    expect(internal.isOperational).toBe(false)
  })

  it('correctly identifies AppError instances via isAppError', () => {
    expect(isAppError(new AppError('test'))).toBe(true)
    expect(isAppError(new ValidationError('test'))).toBe(true)
    expect(isAppError(new Error('native error'))).toBe(false)
    expect(isAppError('string error')).toBe(false)
    expect(isAppError(null)).toBe(false)
  })
})
