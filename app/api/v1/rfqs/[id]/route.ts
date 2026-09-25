import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateToken, apiHandler, ForbiddenError } from "@/lib/api-auth"
import { UpdateRFQSchema, SCOPES } from "@/lib/types"

/**
 * GET /api/v1/rfqs/:id - Get a specific RFQ
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
      quotes: {
        include: { contractor: true },
      },
      photos: true,
    },
  })

  if (!rfq) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  if (rfq.userId !== auth.userId) {
    throw new ForbiddenError()
  }

  return NextResponse.json({ rfq })
})

/**
 * PATCH /api/v1/rfqs/:id - Update an RFQ
 */
export const PATCH = apiHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const auth = await validateToken(request, SCOPES.RFQ_WRITE)
  const { id } = await params

  const rfq = await prisma.rFQ.findUnique({ where: { id } })

  if (!rfq) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  if (rfq.userId !== auth.userId) {
    throw new ForbiddenError()
  }

  const body = await request.json()
  const data = UpdateRFQSchema.parse(body)

  const updated = await prisma.rFQ.update({
    where: { id },
    data,
    include: {
      quotes: {
        include: { contractor: true },
      },
      photos: true,
    },
  })

  return NextResponse.json({ rfq: updated })
})

/**
 * DELETE /api/v1/rfqs/:id - Cancel an RFQ
 */
export const DELETE = apiHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const auth = await validateToken(request, SCOPES.RFQ_WRITE)
  const { id } = await params

  const rfq = await prisma.rFQ.findUnique({ where: { id } })

  if (!rfq) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  if (rfq.userId !== auth.userId) {
    throw new ForbiddenError()
  }

  const updated = await prisma.rFQ.update({
    where: { id },
    data: { status: "CANCELLED" },
  })

  return NextResponse.json({ rfq: updated })
})
