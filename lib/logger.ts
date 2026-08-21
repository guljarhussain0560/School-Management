/**
 * Enterprise Structured Logging Utility
 * Provides standardized, context-aware JSON and formatted logging across server and client components.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export interface LogContext {
  userId?: string
  schoolId?: string
  action?: string
  path?: string
  status?: number
  durationMs?: number
  [key: string]: unknown
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
  }
}

export type ErrorTrackerHandler = (error: Error | unknown, context?: LogContext) => void

let externalErrorTracker: ErrorTrackerHandler | null = null

export function registerErrorTracker(handler: ErrorTrackerHandler) {
  externalErrorTracker = handler
}

class StructuredLogger {
  private isProduction = process.env.NODE_ENV === 'production'

  private formatEntry(level: LogLevel, message: string, context?: LogContext, error?: Error | unknown): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    }

    if (context && Object.keys(context).length > 0) {
      entry.context = context
    }

    if (error) {
      if (error instanceof Error) {
        entry.error = {
          name: error.name,
          message: error.message,
          stack: this.isProduction ? undefined : error.stack,
        }
      } else {
        entry.error = {
          name: 'UnknownError',
          message: String(error),
        }
      }
    }

    return entry
  }

  private output(entry: LogEntry) {
    if (this.isProduction) {
      // In production, output clean single-line JSON for log aggregators (CloudWatch, Datadog, ELK)
      const json = JSON.stringify(entry)
      if (entry.level === 'error' || entry.level === 'fatal') {
        console.error(json)
      } else if (entry.level === 'warn') {
        console.warn(json)
      } else {
        console.log(json)
      }
    } else {
      // In development, output readable formatted text
      const icon = {
        debug: '🔍 [DEBUG]',
        info: 'ℹ️ [INFO]',
        warn: '⚠️ [WARN]',
        error: '❌ [ERROR]',
        fatal: '🚨 [FATAL]'
      }[entry.level]

      const meta = entry.context ? ` ${JSON.stringify(entry.context)}` : ''
      const errMsg = entry.error ? `\nError: ${entry.error.name}: ${entry.error.message}` : ''
      const stack = entry.error?.stack ? `\n${entry.error.stack}` : ''

      const outputMessage = `${entry.timestamp} ${icon} ${entry.message}${meta}${errMsg}${stack}`

      if (entry.level === 'error' || entry.level === 'fatal') {
        console.error(outputMessage)
      } else if (entry.level === 'warn') {
        console.warn(outputMessage)
      } else {
        console.log(outputMessage)
      }
    }
  }

  debug(message: string, context?: LogContext) {
    this.output(this.formatEntry('debug', message, context))
  }

  info(message: string, context?: LogContext) {
    this.output(this.formatEntry('info', message, context))
  }

  warn(message: string, context?: LogContext) {
    this.output(this.formatEntry('warn', message, context))
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    this.output(this.formatEntry('error', message, context, error))
    if (error && (process.env.ENABLE_ERROR_TRACKING === 'true' || process.env.SENTRY_DSN)) {
      try {
        if (externalErrorTracker) {
          externalErrorTracker(error, context)
        }
      } catch {
        // Prevent telemetry exception from bubbling
      }
    }
  }

  fatal(message: string, error?: Error | unknown, context?: LogContext) {
    this.output(this.formatEntry('fatal', message, context, error))
    if (error && (process.env.ENABLE_ERROR_TRACKING === 'true' || process.env.SENTRY_DSN)) {
      try {
        if (externalErrorTracker) {
          externalErrorTracker(error, context)
        }
      } catch {
        // Prevent telemetry exception from bubbling
      }
    }
  }
}

export const logger = new StructuredLogger()

