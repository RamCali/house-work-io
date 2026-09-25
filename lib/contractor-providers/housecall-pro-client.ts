/**
 * Housecall Pro API Integration
 * Documentation: https://docs.housecallpro.com/
 */

import { ContractorClient, SendRFQParams, SendRFQResult, GetQuoteResult } from "./types"

export class HousecallProContractorClient implements ContractorClient {
  private apiKey: string
  private apiUrl: string

  constructor(apiKey: string, apiUrl?: string) {
    this.apiKey = apiKey
    this.apiUrl = apiUrl || process.env.HOUSECALL_PRO_API_URL || "https://api.housecallpro.com/v1"
  }

  async sendRFQ(params: SendRFQParams): Promise<SendRFQResult> {
    // PRODUCTION IMPLEMENTATION:
    // Housecall Pro uses REST API
    
    try {
      // Step 1: Create or find customer
      let customerId: string | null = null

      if (params.customerEmail) {
        // Search for existing customer
        const searchResponse = await fetch(
          `${this.apiUrl}/customers?email=${encodeURIComponent(params.customerEmail)}`,
          {
            headers: {
              "Authorization": `Bearer ${this.apiKey}`,
              "Accept": "application/json"
            }
          }
        )

        if (searchResponse.ok) {
          const customers = await searchResponse.json()
          if (customers.data && customers.data.length > 0) {
            customerId = customers.data[0].id
          }
        }

        // Create customer if not found
        if (!customerId && params.customerName) {
          const createCustomerResponse = await fetch(`${this.apiUrl}/customers`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${this.apiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              first_name: params.customerName.split(" ")[0],
              last_name: params.customerName.split(" ").slice(1).join(" "),
              email: params.customerEmail,
              // Add address from zipCode if needed
            })
          })

          if (createCustomerResponse.ok) {
            const customer = await createCustomerResponse.json()
            customerId = customer.data.id
          }
        }
      }

      // Step 2: Create job/lead
      const jobData = {
        customer_id: customerId,
        description: params.description,
        work_type: this.mapTradeToWorkType(params.trade),
        // Map urgency to scheduled time
        schedule_type: params.urgency === "ASAP" ? "emergency" : "standard",
        tags: [params.trade, params.urgency],
        custom_fields: {
          source: "muse-connector",
          rfq_id: params.id,
          budget_band: params.budgetBand,
          zip_code: params.zipCode
        },
        // Add photos if provided
        ...(params.photos && params.photos.length > 0 && {
          attachments: params.photos.map(url => ({ url }))
        })
      }

      const createJobResponse = await fetch(`${this.apiUrl}/jobs`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(jobData)
      })

      if (!createJobResponse.ok) {
        const errorData = await createJobResponse.json()
        throw new Error(`Housecall Pro API error: ${errorData.message || createJobResponse.statusText}`)
      }

      const job = await createJobResponse.json()

      console.log(`[HousecallPro] Created job ${job.data.id} for RFQ ${params.id}`)

      return {
        success: true,
        externalId: job.data.id,
        message: "Job created in Housecall Pro"
      }

    } catch (error: any) {
      console.error(`[HousecallPro] Failed to create job:`, error)
      
      // FALLBACK: In sandbox/development, return stub
      if (process.env.SANDBOX_MODE === "true") {
        const stubId = `hcp-${params.id}-${Date.now()}`
        console.log(`[HousecallPro STUB] Would send RFQ ${params.id} via Housecall Pro API`)
        return {
          success: true,
          externalId: stubId,
          message: "Stubbed - Housecall Pro integration not configured"
        }
      }

      return {
        success: false,
        error: error.message
      }
    }
  }

  async getQuote(externalId: string): Promise<GetQuoteResult> {
    // PRODUCTION IMPLEMENTATION:
    // Query Housecall Pro for estimate details
    
    try {
      // Get job details including estimates
      const response = await fetch(`${this.apiUrl}/jobs/${externalId}?include=estimates`, {
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Accept": "application/json"
        }
      })

      if (!response.ok) {
        throw new Error(`Housecall Pro API error: ${response.statusText}`)
      }

      const data = await response.json()
      const job = data.data

      // Check if job has an estimate
      if (!job.estimates || job.estimates.length === 0) {
        return { success: true, quote: null }
      }

      // Get the most recent estimate
      const estimate = job.estimates[0]

      // Get estimate details
      const estimateResponse = await fetch(`${this.apiUrl}/estimates/${estimate.id}`, {
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Accept": "application/json"
        }
      })

      if (!estimateResponse.ok) {
        throw new Error(`Failed to fetch estimate details`)
      }

      const estimateData = await estimateResponse.json()
      const estimateDetails = estimateData.data

      console.log(`[HousecallPro] Retrieved estimate ${estimateDetails.id} for job ${externalId}`)

      return {
        success: true,
        quote: {
          amount: Math.round(parseFloat(estimateDetails.total_amount) * 100), // Convert to cents
          description: estimateDetails.line_items
            ?.map((item: any) => `${item.name}: $${item.amount}`)
            .join("\n") || estimateDetails.description,
          estimatedDays: estimateDetails.estimated_completion_days || null,
          externalId: estimateDetails.id
        }
      }

    } catch (error: any) {
      console.error(`[HousecallPro] Failed to get estimate:`, error)
      
      // FALLBACK
      if (process.env.SANDBOX_MODE === "true") {
        console.log(`[HousecallPro STUB] Would fetch estimate ${externalId}`)
        return { success: true, quote: null }
      }

      return {
        success: false,
        error: error.message
      }
    }
  }

  private mapTradeToWorkType(trade: string): string {
    // Map our trade types to Housecall Pro work types
    const mapping: Record<string, string> = {
      "HVAC": "hvac",
      "PLUMBING": "plumbing",
      "ELECTRICAL": "electrical",
      "ROOFING": "roofing",
      "PAINTING": "painting",
      "CARPENTRY": "carpentry",
      "LANDSCAPING": "landscaping",
      "CLEANING": "cleaning"
    }

    return mapping[trade] || "general"
  }
}
