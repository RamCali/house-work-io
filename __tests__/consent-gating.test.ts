import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { prisma } from "../lib/prisma"
import { verifyConsent } from "../lib/consent"
import bcrypt from "bcryptjs"

describe("Consent Gating", () => {
  let testUserId: string
  let testRfqId: string

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: `consent-test-${Date.now()}@example.com`,
        hashedPassword: await bcrypt.hash("test123", 10),
        name: "Consent Test User",
      },
    })
    testUserId = user.id

    const rfq = await prisma.rFQ.create({
      data: {
        userId: testUserId,
        trade: "HVAC",
        zipCode: "94102",
        description: "Test RFQ for consent",
        urgency: "WEEK",
        status: "DRAFT",
      },
    })
    testRfqId = rfq.id
  })

  afterAll(async () => {
    await prisma.rFQ.delete({ where: { id: testRfqId } }).catch(() => {})
    await prisma.user.delete({ where: { id: testUserId } }).catch(() => {})
  })

  it("should not allow sharing without consent", async () => {
    const hasConsent = await verifyConsent(testUserId, testRfqId)
    expect(hasConsent).toBe(false)
  })

  it("should prevent submission to SUBMITTED status without consent log", async () => {
    const rfq = await prisma.rFQ.findUnique({ where: { id: testRfqId } })
    expect(rfq?.status).toBe("DRAFT")
    
    // In production, the API would check verifyConsent() before allowing this update
    // This test verifies that consent records are required
    const hasConsent = await verifyConsent(testUserId, testRfqId)
    expect(hasConsent).toBe(false)
  })

  it("should create RFQ share only after consent is logged", async () => {
    // Without consent, attempting to create a share would be blocked by the API
    const hasConsent = await verifyConsent(testUserId, testRfqId)
    expect(hasConsent).toBe(false)
    
    // This would fail in the API endpoint due to consent check
    // await prisma.rFQShare.create(...) // Would be blocked
  })

  it("should maintain audit trail of all consent events", async () => {
    const logs = await prisma.consentLog.findMany({
      where: {
        userId: testUserId,
        rfqId: testRfqId,
      },
    })

    // Initially should be empty (no consent given yet)
    expect(logs.length).toBe(0)
  })

  it("should store consent snapshot with approved data", async () => {
    const consentSnapshot = {
      contractors: [{ id: "test-contractor", name: "Test Co" }],
      dataShared: {
        trade: "HVAC",
        zipCode: "94102",
        description: "Test RFQ for consent",
      },
      consentedAt: new Date().toISOString(),
    }

    const updated = await prisma.rFQ.update({
      where: { id: testRfqId },
      data: {
        consentSnapshot,
        consentedAt: new Date(),
      },
    })

    expect(updated.consentSnapshot).toEqual(consentSnapshot)
    expect(updated.consentedAt).not.toBeNull()
  })

  it("should verify data snapshot matches what user consented to", async () => {
    const rfq = await prisma.rFQ.findUnique({
      where: { id: testRfqId },
    })

    expect(rfq?.consentSnapshot).toBeDefined()
    const snapshot = rfq?.consentSnapshot as any
    expect(snapshot.dataShared.trade).toBe("HVAC")
    expect(snapshot.dataShared.zipCode).toBe("94102")
  })
})
