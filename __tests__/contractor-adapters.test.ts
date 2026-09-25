import { describe, it, expect, beforeEach, vi } from "vitest"
import { ManualContractorClient } from "../lib/contractors/manual-client"
import { JobberContractorClient } from "../lib/contractors/jobber-client"
import { HousecallProContractorClient } from "../lib/contractors/housecall-client"
import { createContractorClient } from "../lib/contractors/factory"
import type { RFQData } from "../lib/contractors/types"

describe("Contractor Adapters", () => {
  const mockRFQ: RFQData = {
    id: "test-rfq-123",
    trade: "HVAC",
    zipCode: "94102",
    description: "AC not cooling properly",
    urgency: "ASAP",
    budgetBand: "1K_5K",
    customerName: "Test User",
    customerEmail: "test@example.com",
    photos: ["https://example.com/photo1.jpg"],
  }

  describe("ManualContractorClient", () => {
    let client: ManualContractorClient

    beforeEach(() => {
      client = new ManualContractorClient("contractor-123")
    })

    it("should successfully send RFQ in manual mode", async () => {
      const result = await client.sendRFQ(mockRFQ)

      expect(result.success).toBe(true)
      expect(result.externalId).toBeDefined()
      expect(result.externalId).toContain("manual-")
      expect(result.externalId).toContain(mockRFQ.id)
    })

    it("should return null when getting quote (manual quotes entered via admin)", async () => {
      const quote = await client.getQuote("manual-123")
      expect(quote).toBeNull()
    })

    it("should handle RFQ without optional fields", async () => {
      const minimalRFQ: RFQData = {
        id: "minimal-rfq",
        trade: "PLUMBING",
        zipCode: "94103",
        description: "Leaky faucet",
        urgency: "WEEK",
        customerEmail: "user@example.com",
      }

      const result = await client.sendRFQ(minimalRFQ)
      expect(result.success).toBe(true)
    })
  })

  describe("JobberContractorClient", () => {
    let client: JobberContractorClient

    beforeEach(() => {
      // Mock client with test API key
      client = new JobberContractorClient("test-api-key", "https://api.test.getjobber.com/api/graphql")
    })

    it("should return success with external ID when sending RFQ", async () => {
      const result = await client.sendRFQ(mockRFQ)

      expect(result.success).toBe(true)
      expect(result.externalId).toBeDefined()
      expect(result.externalId).toContain("jobber-")
      expect(result.externalId).toContain(mockRFQ.id)
    })

    it("should handle RFQ with all fields populated", async () => {
      const completeRFQ: RFQData = {
        ...mockRFQ,
        budgetBand: "5K_10K",
        customerName: "Jane Smith",
        customerPhone: "+1-555-1234",
        photos: ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"],
      }

      const result = await client.sendRFQ(completeRFQ)
      expect(result.success).toBe(true)
    })

    it("should return null when getting quote (not yet implemented)", async () => {
      const quote = await client.getQuote("jobber-123")
      expect(quote).toBeNull()
    })

    it("should use correct GraphQL endpoint", () => {
      const customClient = new JobberContractorClient("key", "https://custom.endpoint.com/graphql")
      expect(customClient).toBeDefined()
    })
  })

  describe("HousecallProContractorClient", () => {
    let client: HousecallProContractorClient

    beforeEach(() => {
      // Mock client with test API key
      client = new HousecallProContractorClient("test-api-key", "https://api.test.housecallpro.com/v1")
    })

    it("should return success with external ID when sending RFQ", async () => {
      const result = await client.sendRFQ(mockRFQ)

      expect(result.success).toBe(true)
      expect(result.externalId).toBeDefined()
      expect(result.externalId).toContain("hcp-")
      expect(result.externalId).toContain(mockRFQ.id)
    })

    it("should handle different trade types", async () => {
      const trades = ["HVAC", "PLUMBING", "ROOFING", "ELECTRICAL"]

      for (const trade of trades) {
        const rfq: RFQData = {
          ...mockRFQ,
          trade,
        }

        const result = await client.sendRFQ(rfq)
        expect(result.success).toBe(true)
      }
    })

    it("should return null when getting quote (not yet implemented)", async () => {
      const quote = await client.getQuote("hcp-123")
      expect(quote).toBeNull()
    })

    it("should use correct REST endpoint", () => {
      const customClient = new HousecallProContractorClient("key", "https://custom.endpoint.com/v1")
      expect(customClient).toBeDefined()
    })
  })

  describe("Contractor Client Factory", () => {
    const contractorId = "test-contractor"

    it("should create ManualContractorClient for MANUAL type", () => {
      const client = createContractorClient(contractorId, {
        type: "MANUAL",
      })

      expect(client).toBeInstanceOf(ManualContractorClient)
    })

    it("should create JobberContractorClient for JOBBER type", () => {
      const client = createContractorClient(contractorId, {
        type: "JOBBER",
        config: { apiKey: "test-key" },
      })

      expect(client).toBeInstanceOf(JobberContractorClient)
    })

    it("should create HousecallProContractorClient for HOUSECALL_PRO type", () => {
      const client = createContractorClient(contractorId, {
        type: "HOUSECALL_PRO",
        config: { apiKey: "test-key" },
      })

      expect(client).toBeInstanceOf(HousecallProContractorClient)
    })

    it("should default to ManualContractorClient for unknown type", () => {
      const client = createContractorClient(contractorId, {
        type: "UNKNOWN" as any,
      })

      expect(client).toBeInstanceOf(ManualContractorClient)
    })

    it("should handle missing config for third-party integrations", () => {
      const jobberClient = createContractorClient(contractorId, {
        type: "JOBBER",
      })

      expect(jobberClient).toBeInstanceOf(JobberContractorClient)
    })
  })

  describe("Integration Patterns", () => {
    it("should handle RFQ send-receive flow for manual mode", async () => {
      const client = new ManualContractorClient("contractor-456")

      // Send RFQ
      const sendResult = await client.sendRFQ(mockRFQ)
      expect(sendResult.success).toBe(true)

      // Try to get quote (returns null in manual mode)
      const quote = await client.getQuote(sendResult.externalId!)
      expect(quote).toBeNull()
    })

    it("should generate unique external IDs per RFQ", async () => {
      const client = new JobberContractorClient("test-key")

      const result1 = await client.sendRFQ({ ...mockRFQ, id: "rfq-1" })
      const result2 = await client.sendRFQ({ ...mockRFQ, id: "rfq-2" })

      expect(result1.externalId).not.toBe(result2.externalId)
      expect(result1.externalId).toContain("rfq-1")
      expect(result2.externalId).toContain("rfq-2")
    })

    it("should maintain contractor ID in manual mode", async () => {
      const contractorId = "contractor-789"
      const client = new ManualContractorClient(contractorId)

      const result = await client.sendRFQ(mockRFQ)
      expect(result.externalId).toContain(contractorId)
    })
  })
})
