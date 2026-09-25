import { NextRequest, NextResponse } from "next/server"
import { validateToken, apiHandler } from "@/lib/api-auth"
import { SCOPES } from "@/lib/types"
import { getConsentHistory } from "@/lib/consent"

/**
 * GET /api/v1/consent/history - Get user's consent history
 */
export const GET = apiHandler(async (request: NextRequest) => {
  const auth = await validateToken(request, SCOPES.PROFILE_READ)

  const history = await getConsentHistory(auth.userId)

  return NextResponse.json({ history })
})
