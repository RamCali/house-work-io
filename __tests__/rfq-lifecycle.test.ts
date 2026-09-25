import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { prisma } from "../lib/prisma"
import { logConsent, verifyConsent } from "../lib/consent"
import bcrypt from "bcryptjs"

describe("RFQ Lifecycle", () => {
  let testUserId: string
  let testContractorId: string
  let testRfqId: string

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        hashedPassword: await bcrypt.hash("test123", 10),
        name: "Test User",
      },
    })
    testUserId = user.id

    // Create test contractor
    const contractor = await prisma.contractor.create({
      data: {
        name: "Test Contractor",
        email: `contractor-${Date.now()}@example.com`,
        trades: ["HVAC"],
        serviceZipCodes: ["94102"],
        verificationStatus: "VERIFIED",
        insuranceOnFile: true,
        isSandbox: false,
      },
    })
    testContractorId = contractor.id
  })

  afterAll(async () => {
    // Clean up test data
    if (testRfqId) {
      await prisma.rFQ.delete({ where: { id: testRfqId } }).catch(() => {})
    }
    await prisma.contractor.delete({ where: { id: testContractorId } }).catch(() => {})
    await prisma.user.delete({ where: { id: testUserId } }).catch(() => {})
  })

  it("should create an RFQ in DRAFT status", async () => {
    const rfq = await prisma.rFQ.create({
      data: {
        userId: testUserId,
        trade: "HVAC",
        zipCode: "94102",
        description: "Need AC repair urgently",
        urgency: "ASAP",
        budgetBand: "1K_5K",
        status: "DRAFT",
      },
    })

    testRfqId = rfq.id

    expect(rfq.status).toBe("DRAFT")
    expect(rfq.submittedAt).toBeNull()
    expect(rfq.consentedAt).toBeNull()
  })

  it("should not allow submission without consent", async () => {
    // Verify that consent has not been given
    const hasConsent = await verifyConsent(testUserId, testRfqId)
    expect(hasConsent).toBe(false)
  })

  it("should log consent before sharing", async () => {
    const consentLog = await logConsent({
      userId: testUserId,
      eventType: "SHARE",
      rfqId: testRfqId,
      scope: "rfq:share",
      dataSnapshot: {
        contractors: [{ id: testContractorId, name: "Test Contractor" }],
        dataShared: { trade: "HVAC", zipCode: "94102" },
      },
    })

    expect(consentLog.eventType).toBe("SHARE")
    expect(consentLog.rfqId).toBe(testRfqId)
  })

  it("should verify consent after logging", async () => {
    const hasConsent = await verifyConsent(testUserId, testRfqId)
    expect(hasConsent).toBe(true)
  })

  it("should allow submission after consent", async () => {
    const updated = await prisma.rFQ.update({
      where: { id: testRfqId },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        consentedAt: new Date(),
      },
    })

    expect(updated.status).toBe("SUBMITTED")
    expect(updated.submittedAt).not.toBeNull()
    expect(updated.consentedAt).not.toBeNull()
  })

  it("should create RFQ share record", async () => {
    const share = await prisma.rFQShare.create({
      data: {
        rfqId: testRfqId,
        contractorId: testContractorId,
        sharedBy: testUserId,
      },
    })

    expect(share.rfqId).toBe(testRfqId)
    expect(share.contractorId).toBe(testContractorId)
  })

  it("should allow contractor to submit quote", async () => {
    const quote = await prisma.quote.create({
      data: {
        rfqId: testRfqId,
        contractorId: testContractorId,
        priceAmount: 350000, // $3,500
        priceCurrency: "USD",
        scope: "Complete AC repair including parts and labor",
        estimatedDuration: "1 day",
        status: "PENDING",
      },
    })

    expect(quote.status).toBe("PENDING")
    expect(quote.priceAmount).toBe(350000)
  })

  it("should log acceptance consent", async () => {
    const quote = await prisma.quote.findFirst({
      where: { rfqId: testRfqId },
    })

    expect(quote).not.toBeNull()

    const consentLog = await logConsent({
      userId: testUserId,
      eventType: "ACCEPT",
      rfqId: testRfqId,
      quoteId: quote!.id,
      scope: "quotes:accept",
      dataSnapshot: {
        contractor: { id: testContractorId, name: "Test Contractor" },
        amount: quote!.priceAmount,
      },
    })

    expect(consentLog.eventType).toBe("ACCEPT")
    expect(consentLog.quoteId).toBe(quote!.id)
  })

  it("should update quote to ACCEPTED status", async () => {
    const quote = await prisma.quote.findFirst({
      where: { rfqId: testRfqId },
    })

    const updated = await prisma.quote.update({
      where: { id: quote!.id },
      data: {
        status: "ACCEPTED",
        acceptedAt: new Date(),
      },
    })

    expect(updated.status).toBe("ACCEPTED")
    expect(updated.acceptedAt).not.toBeNull()
  })

  it("should retrieve consent history", async () => {
    const history = await prisma.consentLog.findMany({
      where: { userId: testUserId },
      orderBy: { createdAt: "desc" },
    })

    expect(history.length).toBeGreaterThanOrEqual(2) // SHARE and ACCEPT
    expect(history.some(h => h.eventType === "SHARE")).toBe(true)
    expect(history.some(h => h.eventType === "ACCEPT")).toBe(true)
  })
})
