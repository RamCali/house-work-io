export interface ContractorClient {
  sendRFQ(rfq: RFQData): Promise<RFQResult>
  getQuote(externalId: string): Promise<QuoteData | null>
}

export interface RFQData {
  id: string
  trade: string
  zipCode: string
  description: string
  urgency: string
  budgetBand?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  photos?: string[]
}

export interface RFQResult {
  success: boolean
  externalId?: string
  error?: string
}

export interface QuoteData {
  externalId: string
  priceAmount: number
  priceCurrency: string
  scope: string
  estimatedStartDate?: Date
  estimatedDuration?: string
  validUntil?: Date
  notes?: string
}
