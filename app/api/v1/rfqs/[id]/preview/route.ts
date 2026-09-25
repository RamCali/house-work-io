import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateToken, apiHandler, ForbiddenError } from "@/lib/api-auth"
import { SCOPES } from "@/lib/types"

/**
 * GET /api/v1/rfqs/:id/preview - Preview what will be shared with contractors
 * This allows users to see exactly what data will be shared before consenting
 */
export const GET = apiHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const auth = await validateToken(request, SCOPES.RFQ_READ)
  const { id } = await params

  const rfq = await prisma.rFQ.findUnique({
    where: { id },
    include: {
      photos: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  if (!rfq) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  if (rfq.userId !== auth.userId) {
    throw new ForbiddenError()
  }

  // Get contractors who would receive this RFQ
  const contractors = await prisma.contractor.findMany({
    where: {
      trades: {
        has: rfq.trade,
      },
      serviceZipCodes: {
        has: rfq.zipCode,
      },
      verificationStatus: "VERIFIED",
    },
    select: {
      id: true,
      name: true,
      licenseNumber: true,
      insuranceOnFile: true,
      verificationStatus: true,
    },
  })

  // Show exactly what will be shared
  const preview = {
    rfq: {
      trade: rfq.trade,
      zipCode: rfq.zipCode,
      description: rfq.description,
      urgency: rfq.urgency,
      budgetBand: rfq.budgetBand,
      photos: rfq.photos.map(p => p.url),
    },
    homeowner: {
      name: rfq.user.name,
      // Email would only be shared after consent
    },
    contractors: contractors.map(c => ({
      id: c.id,
      name: c.name,
      licenseNumber: c.licenseNumber,
      insuranceOnFile: c.insuranceOnFile,
      verified: c.verificationStatus === "VERIFIED",
    })),
  }

  return NextResponse.json({ preview })
})
