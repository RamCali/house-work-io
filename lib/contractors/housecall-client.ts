import { ContractorClient, RFQData, RFQResult, QuoteData } from "./types"

/**
 * Housecall Pro REST API integration (STUBBED)
 * 
 * In production, this would use:
 * - POST /leads to create a lead
 * - POST /estimates to create an estimate
 * - Lead conversion endpoints
 * 
 * Docs: https://docs.housecallpro.com/
 */
export class HousecallProContractorClient implements ContractorClient {
  constructor(
    private apiKey: string,
    private apiEndpoint: string = "https://api.housecallpro.com/v1"
  ) {}

  async sendRFQ(rfq: RFQData): Promise<RFQResult> {
    // STUB: Would make REST API calls here
    console.log(`[HousecallPro STUB] Would send RFQ ${rfq.id} via Housecall Pro API`)
    
    // Mock successful response
    return {
      success: true,
      externalId: `hcp-${rfq.id}-${Date.now()}`,
    }
  }

  async getQuote(externalId: string): Promise<QuoteData | null> {
    // STUB: Would fetch estimate from Housecall Pro API
    console.log(`[HousecallPro STUB] Would fetch estimate ${externalId}`)
    return null
  }

  // Stubbed helper methods that would be implemented
  private async createLead(rfq: RFQData) {
    // Would POST to /leads
    return { id: "mock-lead-id" }
  }

  private async createEstimate(leadId: string, rfq: RFQData) {
    // Would POST to /estimates
    return { id: "mock-estimate-id" }
  }

  private async convertLeadToJob(leadId: string) {
    // Would call lead conversion endpoint
    return { id: "mock-job-id" }
  }
}
