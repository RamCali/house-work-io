import { prisma } from "./prisma"
import { env } from "./env"

/**
 * Sandbox mode utilities for testing with mock contractors and auto-quotes
 */

export function isSandboxMode(): boolean {
  return env.SANDBOX_MODE === "true"
}

export async function ensureSandboxContractors() {
  if (!isSandboxMode()) return

  const sandboxContractors = [
    {
      name: "[TEST] Quick Fix HVAC",
      email: "quickfix@sandbox.museconnector.test",
      phone: "+1-555-0101",
      trades: ["HVAC"],
      serviceZipCodes: ["94102", "94103", "94104", "94105", "94110"],
      licenseNumber: "TEST-12345",
      insuranceOnFile: true,
      verificationStatus: "VERIFIED",
      isSandbox: true,
      integrationType: "MANUAL",
    },
    {
      name: "[TEST] Bay Area Climate Control",
      email: "bayarea@sandbox.museconnector.test",
      phone: "+1-555-0102",
      trades: ["HVAC"],
      serviceZipCodes: ["94102", "94103", "94104", "94105", "94110", "94111"],
      licenseNumber: "TEST-67890",
      insuranceOnFile: true,
      verificationStatus: "VERIFIED",
      isSandbox: true,
      integrationType: "MANUAL",
    },
    {
      name: "[TEST] Reliable Roof Masters",
      email: "roofmasters@sandbox.museconnector.test",
      phone: "+1-555-0103",
      trades: ["ROOFING"],
      serviceZipCodes: ["94102", "94103", "94104", "94105"],
      licenseNumber: "TEST-11111",
      insuranceOnFile: true,
      verificationStatus: "VERIFIED",
      isSandbox: true,
      integrationType: "MANUAL",
    },
  ]

  for (const contractor of sandboxContractors) {
    await prisma.contractor.upsert({
      where: { email: contractor.email },
      create: contractor as any,
      update: contractor as any,
    })
  }

  console.log(`✓ Seeded ${sandboxContractors.length} sandbox contractors`)
}

export async function generateSandboxQuotes(rfqId: string) {
  if (!isSandboxMode()) return

  const rfq = await prisma.rFQ.findUnique({
    where: { id: rfqId },
    include: { shares: { include: { contractor: true } } },
  })

  if (!rfq) return

  // Generate realistic quotes from sandbox contractors
  for (const share of rfq.shares) {
    if (!share.contractor.isSandbox) continue

    const basePrice = generateBasePrice(rfq.trade)
    const variation = 0.8 + Math.random() * 0.4 // 80% to 120% of base
    const finalPrice = Math.round(basePrice * variation)

    const now = new Date()
    const startDate = new Date(now.getTime() + (7 + Math.random() * 14) * 24 * 60 * 60 * 1000)
    const validUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const quote = await prisma.quote.create({
      data: {
        rfqId: rfq.id,
        contractorId: share.contractorId,
        priceAmount: finalPrice,
        priceCurrency: "USD",
        scope: generateScope(rfq.trade, rfq.description),
        estimatedStartDate: startDate,
        estimatedDuration: generateDuration(rfq.trade),
        validUntil,
        notes: generateNotes(share.contractor.name),
        status: "PENDING",
      },
    })

    console.log(`✓ Generated sandbox quote from ${share.contractor.name}: $${(finalPrice / 100).toFixed(2)}`)
  }
}

function generateBasePrice(trade: string): number {
  const basePrices: Record<string, number> = {
    HVAC: 350000, // $3,500
    PLUMBING: 45000, // $450
    ROOFING: 1200000, // $12,000
    ELECTRICAL: 75000, // $750
    GENERAL_CONTRACTOR: 500000, // $5,000
  }
  return basePrices[trade] || 100000
}

function generateDuration(trade: string): string {
  const durations: Record<string, string[]> = {
    HVAC: ["1 day", "2 days", "1-2 days"],
    PLUMBING: ["2-3 hours", "Half day", "1 day"],
    ROOFING: ["3-5 days", "1 week", "5-7 days"],
    ELECTRICAL: ["Half day", "1 day", "2 days"],
    GENERAL_CONTRACTOR: ["1-2 weeks", "2-3 weeks"],
  }
  const options = durations[trade] || ["1-2 days"]
  return options[Math.floor(Math.random() * options.length)]
}

function generateScope(trade: string, description: string): string {
  const templates: Record<string, string[]> = {
    HVAC: [
      "Complete system inspection, repair or replacement of faulty components, testing, and warranty.",
      "Diagnostic assessment, AC unit repair/replacement, ductwork inspection, and system optimization.",
      "Full HVAC evaluation, parts and labor included, 1-year warranty on workmanship.",
    ],
    PLUMBING: [
      "Diagnose issue, repair or replace components, test system, clean work area.",
      "Full plumbing assessment, fix leak, replace damaged pipes if needed, warranty included.",
    ],
    ROOFING: [
      "Complete roof inspection, repair damaged sections or full replacement, materials and labor included.",
      "Assess roof condition, replace shingles/tiles as needed, weatherproofing, 5-year warranty.",
    ],
  }
  const options = templates[trade] || ["Standard service including parts and labor."]
  return options[Math.floor(Math.random() * options.length)]
}

function generateNotes(contractorName: string): string {
  const notes = [
    `Thank you for considering ${contractorName}. We're available to start within the estimated timeframe.`,
    `${contractorName} has been serving the community for over 10 years. Licensed, bonded, and insured.`,
    `We can schedule a free on-site consultation to provide a more detailed estimate.`,
    `Quote includes all materials and labor. Additional work will require separate approval.`,
  ]
  return notes[Math.floor(Math.random() * notes.length)]
}
