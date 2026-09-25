import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateToken, apiHandler, ForbiddenError } from "@/lib/api-auth"
import { SCOPES } from "@/lib/types"
import { logConsent } from "@/lib/consent"
import { createContractorClient } from "@/lib/contractors"
import { isSandboxMode, generateSandboxQuotes } from "@/lib/sandbox"

/**
 * POST /api/v1/rfqs/:id/submit - Submit RFQ with consent
 * This is the explicit consent step - user approves sharing their data
 */
export const POST = apiHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const auth = await validateToken(request, SCOPES.RFQ_WRITE)
  const { id } = await params

  const rfq = await prisma.rFQ.findUnique({
    where: { id },
    include: {
      user: true,
      photos: true,
    },
  })

  if (!rfq) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  if (rfq.userId !== auth.userId) {
    throw new ForbiddenError()
  }

  if (rfq.status !== "DRAFT" && rfq.status !== "PREVIEW") {
    return NextResponse.json(
      { error: "invalid_status", message: "RFQ already submitted" },
      { status: 400 }
    )
  }

  const body = await request.json()
  const { contractorIds, consent } = body

  if (!consent || !contractorIds || contractorIds.length === 0) {
    return NextResponse.json(
      { error: "invalid_request", message: "Consent and contractor selection required" },
      { status: 400 }
    )
  }

  // Get contractors
  const contractors = await prisma.contractor.findMany({
    where: {
      id: { in: contractorIds },
      trades: { has: rfq.trade },
      serviceZipCodes: { has: rfq.zipCode },
      verificationStatus: "VERIFIED",
    },
  })

  if (contractors.length === 0) {
    return NextResponse.json(
      { error: "no_contractors", message: "No valid contractors found" },
      { status: 400 }
    )
  }

  // Create consent snapshot
  const consentSnapshot = {
    contractors: contractors.map(c => ({ id: c.id, name: c.name })),
    dataShared: {
      trade: rfq.trade,
      zipCode: rfq.zipCode,
      description: rfq.description,
      urgency: rfq.urgency,
      budgetBand: rfq.budgetBand,
      homeownerName: rfq.user.name,
      homeownerEmail: rfq.user.email,
      photos: rfq.photos.length,
    },
    consentedAt: new Date().toISOString(),
  }

  // Log consent
  await logConsent({
    userId: auth.userId,
    eventType: "SHARE",
    rfqId: rfq.id,
    scope: "rfq:share",
    dataSnapshot: consentSnapshot,
    ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
    userAgent: request.headers.get("user-agent") || undefined,
  })

  // Update RFQ
  const updated = await prisma.rFQ.update({
    where: { id },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
      consentedAt: new Date(),
      consentSnapshot,
    },
  })

  // Share with contractors
  for (const contractor of contractors) {
    await prisma.rFQShare.create({
      data: {
        rfqId: rfq.id,
        contractorId: contractor.id,
        sharedBy: auth.userId,
      },
    })

    // Send to contractor via their integration
    const client = createContractorClient(contractor.id, {
      type: contractor.integrationType as any || "MANUAL",
      config: contractor.integrationConfig,
    })

    await client.sendRFQ({
      id: rfq.id,
      trade: rfq.trade,
      zipCode: rfq.zipCode,
      description: rfq.description,
      urgency: rfq.urgency,
      budgetBand: rfq.budgetBand,
      customerName: rfq.user.name || undefined,
      customerEmail: rfq.user.email,
      photos: rfq.photos.map(p => p.url),
    })
  }

  // In sandbox mode, auto-generate quotes
  if (isSandboxMode()) {
    setTimeout(async () => {
      await generateSandboxQuotes(rfq.id)
    }, 2000) // Small delay to simulate real contractors
  }

  return NextResponse.json({
    rfq: updated,
    sharedWith: contractors.map(c => ({ id: c.id, name: c.name })),
  })
})
