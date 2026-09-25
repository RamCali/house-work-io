import { NextRequest } from "next/server"
import { prisma } from "./prisma"
import { hasScope, Scope } from "./types"

export class UnauthorizedError extends Error {
  constructor(message: string = "Unauthorized") {
    super(message)
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = "Forbidden") {
    super(message)
    this.name = "ForbiddenError"
  }
}

export interface AuthContext {
  userId: string
  token: {
    id: string
    scope: string
  }
}

/**
 * Validate OAuth access token and check scopes
 */
export async function validateToken(
  request: NextRequest,
  requiredScope?: Scope
): Promise<AuthContext> {
  const authHeader = request.headers.get("authorization")
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing or invalid authorization header")
  }

  const accessToken = authHeader.substring(7)

  const token = await prisma.oAuthToken.findFirst({
    where: {
      accessToken,
      revokedAt: null,
    },
  })

  if (!token) {
    throw new UnauthorizedError("Invalid or revoked token")
  }

  // Check expiration
  if (token.expiresAt && token.expiresAt < new Date()) {
    throw new UnauthorizedError("Token expired")
  }

  // Check required scope
  if (requiredScope && !hasScope(token.scope, requiredScope)) {
    throw new ForbiddenError(`Missing required scope: ${requiredScope}`)
  }

  return {
    userId: token.userId,
    token: {
      id: token.id,
      scope: token.scope,
    },
  }
}

/**
 * Helper to wrap API handlers with error handling
 */
export function apiHandler<T = any>(
  handler: (request: NextRequest, context?: any) => Promise<T>
) {
  return async (request: NextRequest, context?: any) => {
    try {
      return await handler(request, context)
    } catch (error) {
      console.error("API error:", error)
      
      if (error instanceof UnauthorizedError) {
        return Response.json(
          { error: "unauthorized", message: error.message },
          { status: 401 }
        )
      }
      
      if (error instanceof ForbiddenError) {
        return Response.json(
          { error: "forbidden", message: error.message },
          { status: 403 }
        )
      }
      
      return Response.json(
        { error: "internal_error", message: "An unexpected error occurred" },
        { status: 500 }
      )
    }
  }
}
