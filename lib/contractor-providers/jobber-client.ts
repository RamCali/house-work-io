/**
 * Jobber API Integration
 * Documentation: https://developer.getjobber.com/docs/
 */

import { ContractorClient, SendRFQParams, SendRFQResult, GetQuoteResult } from "./types"

export class JobberContractorClient implements ContractorClient {
  private apiKey: string
  private apiUrl: string

  constructor(apiKey: string, apiUrl?: string) {
    this.apiKey = apiKey
    this.apiUrl = apiUrl || process.env.JOBBER_API_URL || "https://api.getjobber.com/api/graphql"
  }

  async sendRFQ(params: SendRFQParams): Promise<SendRFQResult> {
    // PRODUCTION IMPLEMENTATION:
    // Jobber uses GraphQL API
    
    try {
      const mutation = `
        mutation CreateJobRequest($input: CreateJobRequestInput!) {
          createJobRequest(input: $input) {
            jobRequest {
              id
              title
              description
              status
            }
            userErrors {
              message
              path
            }
          }
        }
      `

      const variables = {
        input: {
          title: `${params.trade} Service - ${params.zipCode}`,
          description: params.description,
          // Map urgency to Jobber priority
          priority: this.mapUrgencyToPriority(params.urgency),
          // Add custom fields
          customFields: {
            trade: params.trade,
            zipCode: params.zipCode,
            budgetBand: params.budgetBand,
            sourceRfqId: params.id
          },
          // Add client information if provided
          ...(params.customerEmail && {
            client: {
              email: params.customerEmail,
              firstName: params.customerName?.split(" ")[0],
              lastName: params.customerName?.split(" ").slice(1).join(" ")
            }
          })
        }
      }

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "X-JOBBER-GRAPHQL-VERSION": "2024-01-01"
        },
        body: JSON.stringify({ query: mutation, variables })
      })

      if (!response.ok) {
        throw new Error(`Jobber API error: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.errors || data.data?.createJobRequest?.userErrors?.length > 0) {
        const errors = data.errors || data.data.createJobRequest.userErrors
        throw new Error(`Jobber API error: ${errors[0].message}`)
      }

      const jobRequest = data.data.createJobRequest.jobRequest

      console.log(`[Jobber] Created job request ${jobRequest.id} for RFQ ${params.id}`)

      return {
        success: true,
        externalId: jobRequest.id,
        message: "Job request created in Jobber"
      }

    } catch (error: any) {
      console.error(`[Jobber] Failed to create job request:`, error)
      
      // FALLBACK: In sandbox/development, return stub
      if (process.env.SANDBOX_MODE === "true") {
        const stubId = `jobber-${params.id}-${Date.now()}`
        console.log(`[Jobber STUB] Would send RFQ ${params.id} via Jobber API`)
        return {
          success: true,
          externalId: stubId,
          message: "Stubbed - Jobber integration not configured"
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
    // Query Jobber for quote details
    
    try {
      const query = `
        query GetJobRequest($id: ID!) {
          jobRequest(id: $id) {
            id
            title
            status
            quote {
              id
              total
              status
              lineItems {
                name
                description
                quantity
                unitCost
              }
            }
          }
        }
      `

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "X-JOBBER-GRAPHQL-VERSION": "2024-01-01"
        },
        body: JSON.stringify({ 
          query, 
          variables: { id: externalId } 
        })
      })

      if (!response.ok) {
        throw new Error(`Jobber API error: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.errors) {
        throw new Error(`Jobber API error: ${data.errors[0].message}`)
      }

      const jobRequest = data.data.jobRequest

      if (!jobRequest.quote) {
        return { success: true, quote: null }
      }

      console.log(`[Jobber] Retrieved quote for job request ${externalId}`)

      return {
        success: true,
        quote: {
          amount: jobRequest.quote.total,
          description: jobRequest.quote.lineItems
            .map((item: any) => `${item.name}: $${item.unitCost} x ${item.quantity}`)
            .join("\n"),
          estimatedDays: null, // Jobber doesn't provide this by default
          externalId: jobRequest.quote.id
        }
      }

    } catch (error: any) {
      console.error(`[Jobber] Failed to get quote:`, error)
      
      // FALLBACK
      if (process.env.SANDBOX_MODE === "true") {
        console.log(`[Jobber STUB] Would fetch quote ${externalId}`)
        return { success: true, quote: null }
      }

      return {
        success: false,
        error: error.message
      }
    }
  }

  private mapUrgencyToPriority(urgency: string): string {
    switch (urgency) {
      case "ASAP": return "urgent"
      case "THIS_WEEK": return "high"
      case "THIS_MONTH": return "normal"
      case "FLEXIBLE": return "low"
      default: return "normal"
    }
  }
}
