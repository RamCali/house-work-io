/**
 * Monitoring and logging utilities
 * Integrates with Sentry, Axiom, or other monitoring services
 */

interface LogLevel = "debug" | "info" | "warn" | "error"

interface LogContext {
  userId?: string
  requestId?: string
  endpoint?: string
  method?: string
  statusCode?: number
  duration?: number
  [key: string]: any
}

class Logger {
  private context: LogContext = {}

  setContext(context: Partial<LogContext>) {
    this.context = { ...this.context, ...context }
  }

  clearContext() {
    this.context = {}
  }

  private log(level: LogLevel, message: string, data?: any) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.context,
      ...data,
    }

    // Console logging (always)
    if (level === "error") {
      console.error(JSON.stringify(entry))
    } else if (level === "warn") {
      console.warn(JSON.stringify(entry))
    } else {
      console.log(JSON.stringify(entry))
    }

    // Send to external monitoring service
    this.sendToMonitoring(entry)
  }

  private sendToMonitoring(entry: any) {
    // Send to Axiom if configured
    if (process.env.AXIOM_TOKEN && process.env.AXIOM_DATASET) {
      fetch(`https://api.axiom.co/v1/datasets/${process.env.AXIOM_DATASET}/ingest`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.AXIOM_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([entry]),
      }).catch(err => console.error("Failed to send to Axiom:", err))
    }

    // Send to Sentry if error
    if (entry.level === "error" && process.env.SENTRY_DSN) {
      // Sentry SDK would be initialized elsewhere
      // This is just a placeholder
    }
  }

  debug(message: string, data?: any) {
    if (process.env.NODE_ENV !== "production") {
      this.log("debug", message, data)
    }
  }

  info(message: string, data?: any) {
    this.log("info", message, data)
  }

  warn(message: string, data?: any) {
    this.log("warn", message, data)
  }

  error(message: string, error?: Error | any, data?: any) {
    this.log("error", message, {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
      ...data,
    })
  }
}

export const logger = new Logger()

// Performance monitoring
export class PerformanceMonitor {
  private startTime: number

  constructor() {
    this.startTime = Date.now()
  }

  end(label: string, context?: any) {
    const duration = Date.now() - this.startTime
    
    logger.info(`Performance: ${label}`, {
      duration,
      ...context,
    })

    // Send metric to monitoring service
    if (process.env.AXIOM_TOKEN) {
      this.sendMetric(label, duration, context)
    }

    return duration
  }

  private sendMetric(label: string, duration: number, context?: any) {
    const metric = {
      timestamp: new Date().toISOString(),
      metric: label,
      value: duration,
      unit: "ms",
      ...context,
    }

    fetch(`https://api.axiom.co/v1/datasets/${process.env.AXIOM_DATASET}/ingest`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.AXIOM_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([metric]),
    }).catch(() => {})
  }
}

// Error tracking
export function captureException(error: Error, context?: any) {
  logger.error("Exception captured", error, context)

  // Send to Sentry if configured
  if (process.env.SENTRY_DSN) {
    // Sentry.captureException(error, { extra: context })
  }
}

// API request tracking
export function trackAPIRequest(config: {
  method: string
  endpoint: string
  statusCode: number
  duration: number
  userId?: string
  error?: string
}) {
  logger.info("API Request", config)
}

// Business metrics
export function trackEvent(event: string, properties?: any) {
  logger.info(`Event: ${event}`, properties)
}

// Health check
export async function getHealthStatus(): Promise<{
  status: "healthy" | "degraded" | "unhealthy"
  checks: Record<string, boolean>
  timestamp: string
}> {
  const checks: Record<string, boolean> = {}

  // Check database
  try {
    const { prisma } = await import("./prisma")
    await prisma.$queryRaw`SELECT 1`
    checks.database = true
  } catch {
    checks.database = false
  }

  // Check external APIs (if configured)
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      // Stripe health check would go here
      checks.stripe = true
    } catch {
      checks.stripe = false
    }
  }

  // Determine overall status
  const allHealthy = Object.values(checks).every(v => v)
  const anyHealthy = Object.values(checks).some(v => v)
  
  const status = allHealthy ? "healthy" : anyHealthy ? "degraded" : "unhealthy"

  return {
    status,
    checks,
    timestamp: new Date().toISOString(),
  }
}
