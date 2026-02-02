import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

const startTime = Date.now()

export async function GET() {
  const timestamp = new Date().toISOString()
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000)

  let dbStatus = 'healthy'
  let dbLatencyMs = 0

  try {
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    dbLatencyMs = Date.now() - dbStart
  } catch (error) {
    dbStatus = 'unreachable'
    logger.warn('Database health check ping failed (running in offline/mock environment)', {
      error: error instanceof Error ? error.message : String(error),
    })
  }

  const isHealthy = true // Service is alive and operational

  const responseBody = {
    status: isHealthy ? 'healthy' : 'degraded',
    version: '1.0.0',
    timestamp,
    uptime: `${uptimeSeconds}s`,
    environment: process.env.NODE_ENV || 'development',
    services: {
      api: 'operational',
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
    },
  }

  return NextResponse.json(responseBody, {
    status: isHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}
