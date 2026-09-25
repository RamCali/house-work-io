import { NextRequest, NextResponse } from "next/server"

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store (use Redis in production for multi-instance deployments)
const store: RateLimitStore = {}

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  message?: string
}

export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<NextResponse | null> {
  // Get identifier (IP address or user ID from auth header)
  const identifier = getIdentifier(request)
  const now = Date.now()
  const resetTime = now + config.windowMs

  // Clean up expired entries
  cleanupExpiredEntries(now)

  // Get or create rate limit entry
  if (!store[identifier]) {
    store[identifier] = {
      count: 1,
      resetTime,
    }
    return null // Allow request
  }

  const entry = store[identifier]

  // Reset if window expired
  if (now > entry.resetTime) {
    entry.count = 1
    entry.resetTime = resetTime
    return null // Allow request
  }

  // Increment count
  entry.count++

  // Check if limit exceeded
  if (entry.count > config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    
    return new NextResponse(
      JSON.stringify({
        error: "rate_limit_exceeded",
        message: config.message || "Too many requests, please try again later",
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": retryAfter.toString(),
          "X-RateLimit-Limit": config.maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": Math.ceil(entry.resetTime / 1000).toString(),
        },
      }
    )
  }

  // Add rate limit headers to response
  return null // Allow request, middleware will add headers
}

function getIdentifier(request: NextRequest): string {
  // Try to get user ID from auth header
  const authHeader = request.headers.get("authorization")
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "")
    // In production, decode JWT to get user ID
    return `user:${token.substring(0, 20)}`
  }

  // Fall back to IP address
  const forwardedFor = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const ip = forwardedFor?.split(",")[0] || realIp || "unknown"
  
  return `ip:${ip}`
}

function cleanupExpiredEntries(now: number) {
  // Clean up every 100th request to avoid performance issues
  if (Math.random() > 0.01) return

  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  }
}

// Preset configurations
export const rateLimitConfigs = {
  // Strict: Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: "Too many authentication attempts, please try again later",
  },
  
  // Standard: General API endpoints
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    message: "Too many requests, please slow down",
  },
  
  // Relaxed: Read-only endpoints
  read: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 120,
    message: "Too many requests, please slow down",
  },
  
  // Strict: Write endpoints
  write: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
    message: "Too many write requests, please slow down",
  },
}

// Helper function to add rate limit headers to any response
export function addRateLimitHeaders(
  response: NextResponse,
  identifier: string,
  config: RateLimitConfig
): NextResponse {
  const entry = store[identifier]
  if (!entry) return response

  const remaining = Math.max(0, config.maxRequests - entry.count)
  
  response.headers.set("X-RateLimit-Limit", config.maxRequests.toString())
  response.headers.set("X-RateLimit-Remaining", remaining.toString())
  response.headers.set("X-RateLimit-Reset", Math.ceil(entry.resetTime / 1000).toString())

  return response
}
