import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { rateLimit, rateLimitConfigs, addRateLimitHeaders } from "./lib/rate-limit"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and internal routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") // files with extensions
  ) {
    return NextResponse.next()
  }

  // Apply rate limiting based on endpoint
  let rateLimitResponse = null

  if (pathname.startsWith("/api/oauth") || pathname.startsWith("/api/auth")) {
    // Strict rate limiting for auth endpoints
    rateLimitResponse = await rateLimit(request, rateLimitConfigs.auth)
  } else if (
    pathname.startsWith("/api/v1/rfqs") && request.method === "POST" ||
    pathname.startsWith("/api/v1/quotes") && request.method === "POST"
  ) {
    // Moderate rate limiting for write endpoints
    rateLimitResponse = await rateLimit(request, rateLimitConfigs.write)
  } else if (pathname.startsWith("/api")) {
    // Standard rate limiting for general API
    rateLimitResponse = await rateLimit(request, rateLimitConfigs.api)
  }

  if (rateLimitResponse) {
    return rateLimitResponse
  }

  // Continue with request
  const response = NextResponse.next()

  // Add security headers
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  
  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires these
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
    ].join("; ")
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
