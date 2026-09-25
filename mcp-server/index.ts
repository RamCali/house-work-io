#!/usr/bin/env node

/**
 * Muse Connector MCP Server
 * 
 * Exposes Muse Connector API operations as MCP tools for seamless agent integration.
 * Run with: node --loader tsx/esm mcp-server/index.ts
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js"

interface MCPConfig {
  apiBaseUrl: string
  accessToken?: string
}

const config: MCPConfig = {
  apiBaseUrl: process.env.MUSE_API_URL || "http://localhost:43123/api/v1",
  accessToken: process.env.MUSE_ACCESS_TOKEN,
}

const server = new Server(
  {
    name: "muse-connector",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
)

// Tool definitions
const tools = [
  {
    name: "list_rfqs",
    description: "List all service requests (RFQs) for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "create_rfq",
    description: "Create a new service request (RFQ) in draft status",
    inputSchema: {
      type: "object",
      properties: {
        trade: {
          type: "string",
          enum: ["HVAC", "PLUMBING", "ROOFING", "ELECTRICAL", "GENERAL_CONTRACTOR"],
          description: "Type of service needed",
        },
        zipCode: {
          type: "string",
          pattern: "^\\d{5}$",
          description: "5-digit ZIP code",
        },
        description: {
          type: "string",
          description: "Detailed description of the service needed",
        },
        urgency: {
          type: "string",
          enum: ["ASAP", "WEEK", "MONTH", "FLEXIBLE"],
          description: "How soon the service is needed",
        },
        budgetBand: {
          type: "string",
          enum: ["UNDER_1K", "1K_5K", "5K_10K", "10K_PLUS", "UNSURE"],
          description: "Approximate budget range",
        },
      },
      required: ["trade", "zipCode", "description", "urgency"],
    },
  },
  {
    name: "get_rfq",
    description: "Get details of a specific RFQ including quotes",
    inputSchema: {
      type: "object",
      properties: {
        rfqId: {
          type: "string",
          description: "RFQ ID",
        },
      },
      required: ["rfqId"],
    },
  },
  {
    name: "preview_rfq_sharing",
    description: "Preview what data will be shared with contractors before submitting",
    inputSchema: {
      type: "object",
      properties: {
        rfqId: {
          type: "string",
          description: "RFQ ID",
        },
      },
      required: ["rfqId"],
    },
  },
  {
    name: "submit_rfq",
    description: "Submit RFQ with explicit user consent to share with contractors. REQUIRES USER APPROVAL.",
    inputSchema: {
      type: "object",
      properties: {
        rfqId: {
          type: "string",
          description: "RFQ ID",
        },
        contractorIds: {
          type: "array",
          items: { type: "string" },
          description: "List of contractor IDs to share with",
        },
        consent: {
          type: "boolean",
          description: "User must explicitly consent (set to true)",
        },
      },
      required: ["rfqId", "contractorIds", "consent"],
    },
  },
  {
    name: "accept_quote",
    description: "Accept a quote from a contractor. REQUIRES USER APPROVAL.",
    inputSchema: {
      type: "object",
      properties: {
        quoteId: {
          type: "string",
          description: "Quote ID",
        },
      },
      required: ["quoteId"],
    },
  },
  {
    name: "decline_quote",
    description: "Decline a quote from a contractor",
    inputSchema: {
      type: "object",
      properties: {
        quoteId: {
          type: "string",
          description: "Quote ID",
        },
      },
      required: ["quoteId"],
    },
  },
  {
    name: "get_consent_history",
    description: "View audit log of all consent events and data sharing",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "revoke_access",
    description: "Revoke OAuth access and invalidate all tokens",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
]

// Helper to make API calls
async function callAPI(
  endpoint: string,
  method: string = "GET",
  body?: any
): Promise<any> {
  if (!config.accessToken) {
    throw new Error("No access token configured. Set MUSE_ACCESS_TOKEN environment variable.")
  }

  const url = `${config.apiBaseUrl}${endpoint}`
  const options: RequestInit = {
    method,
    headers: {
      "Authorization": `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
    },
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(url, options)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }))
    throw new Error(`API error: ${JSON.stringify(error)}`)
  }

  return await response.json()
}

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools }
})

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    switch (name) {
      case "list_rfqs": {
        const result = await callAPI("/rfqs")
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      case "create_rfq": {
        const result = await callAPI("/rfqs", "POST", args)
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      case "get_rfq": {
        const result = await callAPI(`/rfqs/${args.rfqId}`)
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      case "preview_rfq_sharing": {
        const result = await callAPI(`/rfqs/${args.rfqId}/preview`)
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      case "submit_rfq": {
        const result = await callAPI(`/rfqs/${args.rfqId}/submit`, "POST", {
          contractorIds: args.contractorIds,
          consent: args.consent,
        })
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      case "accept_quote": {
        const result = await callAPI(`/quotes/${args.quoteId}/accept`, "POST")
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      case "decline_quote": {
        const result = await callAPI(`/quotes/${args.quoteId}/decline`, "POST")
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      case "get_consent_history": {
        const result = await callAPI("/consent/history")
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      case "revoke_access": {
        const result = await callAPI("/user/revoke", "POST")
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    }
  }
})

// Start server
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error("Muse Connector MCP server running on stdio")
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
