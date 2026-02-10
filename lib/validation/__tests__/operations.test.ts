import { describe, it, expect } from 'vitest'
import { createBusSchema, createBusRouteSchema, createMaintenanceSchema } from '../operations'

describe('Operations & Transport Validation Schemas', () => {
  it('validates bus creation schema', () => {
    const valid = {
      route: 'East Campus Line',
      capacity: '40',
      busName: 'Express 4',
      status: 'ACTIVE' as const,
    }
    const result = createBusSchema.safeParse(valid)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.capacity).toBe(40)
    }
  })

  it('validates bus route creation with stops', () => {
    const valid = {
      routeName: 'Main City Route',
      startPoint: 'Station A',
      endPoint: 'School Main Gate',
      stops: ['Stop 1', 'Stop 2', 'Stop 3'],
    }
    const result = createBusRouteSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('validates maintenance log entry', () => {
    const valid = {
      busId: 'bus-1',
      serviceType: 'Oil Change & Brake Inspection',
      cost: 450,
      serviceDate: '2026-08-20',
      status: 'COMPLETED' as const,
    }
    const result = createMaintenanceSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })
})
