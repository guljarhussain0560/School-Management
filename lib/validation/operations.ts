import { z } from 'zod'

export const createBusSchema = z.object({
  route: z.string().min(1, 'Route is required'),
  capacity: z.coerce.number().int().positive('Capacity must be a positive integer').default(50),
  busName: z.string().optional().nullable(),
  driverName: z.string().optional().nullable(),
  driverPhone: z.string().optional().nullable(),
  conductorName: z.string().optional().nullable(),
  conductorPhone: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).default('ACTIVE'),
})

export const createBusRouteSchema = z.object({
  routeName: z.string().min(1, 'Route name is required'),
  startPoint: z.string().min(1, 'Start point is required'),
  endPoint: z.string().min(1, 'End point is required'),
  stops: z.array(z.string()).optional().default([]),
  busId: z.string().optional().nullable(),
})

export const createMaintenanceSchema = z.object({
  busId: z.string().min(1, 'Bus ID is required'),
  serviceType: z.string().min(1, 'Service type is required'),
  cost: z.coerce.number().min(0, 'Cost must be non-negative'),
  serviceDate: z.string().min(1, 'Service date is required'),
  description: z.string().optional().nullable(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED']).default('SCHEDULED'),
})

export type CreateBusInput = z.infer<typeof createBusSchema>
export type CreateBusRouteInput = z.infer<typeof createBusRouteSchema>
export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>
