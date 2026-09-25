import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateToken, apiHandler } from "@/lib/api-auth"
import { CreateRFQSchema, SCOPES } from "@/lib/types"

/**
 * GET /api/v1/rfqs - List RFQs for authenticated user
 */
export const GET = apiHandler(async (request: NextRequest) => {
  const auth = await validateToken(request, SCOPES.RFQ_READ)

  const rfqs = await prisma.rFQ.findMany({
    where: { userId: auth.userId },
    include: {
      quotes: {
        include: { contractor: true },
      },
      photos: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ rfqs })
})

/**
 * POST /api/v1/rfqs - Create a new RFQ
 */
export const POST = apiHandler(async (request: NextRequest) => {
  const auth = await validateToken(request, SCOPES.RFQ_WRITE)

  const body = await request.json()
  const data = CreateRFQSchema.parse(body)

  const rfq = await prisma.rFQ.create({
    data: {
      ...data,
      userId: auth.userId,
      status: "DRAFT",
    },
  })

  return NextResponse.json({ rfq }, { status: 201 })
})
