import { ContractorClient, RFQData, RFQResult, QuoteData } from "./types"

/**
 * Manual/Email implementation - stores RFQs locally for operator to process
 * This is the active implementation for phase 0 (concierge mode)
 */
export class ManualContractorClient implements ContractorClient {
  constructor(private contractorId: string) {}

  async sendRFQ(rfq: RFQData): Promise<RFQResult> {
    // In manual mode, we just log that the RFQ needs to be sent
    // The operator will see this in the admin panel and send it manually
    console.log(`[Manual] RFQ ${rfq.id} ready to be sent to contractor ${this.contractorId}`)
    
    return {
      success: true,
      externalId: `manual-${rfq.id}-${this.contractorId}`,
    }
  }

  async getQuote(externalId: string): Promise<QuoteData | null> {
    // Manual quotes are entered directly in the admin panel
    // This method would only be used if we're checking status
    return null
  }
}
