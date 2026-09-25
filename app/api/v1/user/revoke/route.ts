import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateToken, apiHandler } from "@/lib/api-auth"
import { SCOPES } from "@/lib/types"
import { logConsent } from "@/lib/consent"

/**
 * POST /api/v1/user/revoke - Revoke access and delete user data
 */
export const POST = apiHandler(async (request: NextRequest) => {
  const auth = await validateToken(request, SCOPES.PROFILE_READ)

  // Log revocation
  await logConsent({
    userId: auth.userId,
    eventType: "REVOKE",
    scope: "all",
    ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
    userAgent: request.headers.get("user-agent") || undefined,
  })

  // Revoke all tokens
  await prisma.oAuthToken.updateMany({
    where: { userId: auth.userId },
    data: { revokedAt: new Date() },
  })

  return NextResponse.json({ success: true, message: "Access revoked" })
})

/**
 * DELETE /api/v1/user/data - Delete all user data
 */
export const DELETE = apiHandler(async (request: NextRequest) => {
  const auth = await validateToken(request, SCOPES.PROFILE_READ)

  // Log deletion
  await logConsent({
    userId: auth.userId,
    eventType: "DELETE",
    scope: "all",
    ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
    userAgent: request.headers.get("user-agent") || undefined,
  })

  // Delete user data (cascades to RFQs, photos, quotes, etc.)
  await prisma.user.delete({
    where: { id: auth.userId },
  })

  return NextResponse.json({ success: true, message: "All data deleted" })
})
