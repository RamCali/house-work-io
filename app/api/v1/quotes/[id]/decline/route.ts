import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateToken, apiHandler, ForbiddenError } from "@/lib/api-auth"
import { SCOPES } from "@/lib/types"

/**
 * POST /api/v1/quotes/:id/decline - Decline a quote
 */
export const POST = apiHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const auth = await validateToken(request, SCOPES.QUOTES_ACCEPT)
  const { id } = await params

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      rfq: true,
      contractor: true,
    },
  })

  if (!quote) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  if (quote.rfq.userId !== auth.userId) {
    throw new ForbiddenError()
  }

  if (quote.status !== "PENDING") {
    return NextResponse.json(
      { error: "invalid_status", message: "Quote already processed" },
      { status: 400 }
    )
  }

  const updated = await prisma.quote.update({
    where: { id },
    data: {
      status: "DECLINED",
      declinedAt: new Date(),
    },
    include: {
      contractor: true,
    },
  })

  return NextResponse.json({ quote: updated })
})
