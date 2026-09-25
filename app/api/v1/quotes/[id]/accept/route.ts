import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateToken, apiHandler, ForbiddenError } from "@/lib/api-auth"
import { SCOPES } from "@/lib/types"
import { logConsent } from "@/lib/consent"

/**
 * POST /api/v1/quotes/:id/accept - Accept a quote
 * This is a consequential action requiring explicit user approval
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

  // Log acceptance consent
  await logConsent({
    userId: auth.userId,
    eventType: "ACCEPT",
    rfqId: quote.rfqId,
    quoteId: quote.id,
    scope: "quotes:accept",
    dataSnapshot: {
      contractor: { id: quote.contractor.id, name: quote.contractor.name },
      amount: quote.priceAmount,
      currency: quote.priceCurrency,
    },
    ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
    userAgent: request.headers.get("user-agent") || undefined,
  })

  // Update quote status
  const updated = await prisma.quote.update({
    where: { id },
    data: {
      status: "ACCEPTED",
      acceptedAt: new Date(),
    },
    include: {
      contractor: true,
    },
  })

  // Update RFQ status
  await prisma.rFQ.update({
    where: { id: quote.rfqId },
    data: { status: "ACCEPTED" },
  })

  // Decline other quotes for this RFQ
  await prisma.quote.updateMany({
    where: {
      rfqId: quote.rfqId,
      id: { not: id },
      status: "PENDING",
    },
    data: { status: "DECLINED" },
  })

  return NextResponse.json({ quote: updated })
})
