import { z } from "zod"

// Enums
export const TradeType = z.enum(["HVAC", "PLUMBING", "ROOFING", "ELECTRICAL", "GENERAL_CONTRACTOR"])
export const UrgencyType = z.enum(["ASAP", "WEEK", "MONTH", "FLEXIBLE"])
export const BudgetBand = z.enum(["UNDER_1K", "1K_5K", "5K_10K", "10K_PLUS", "UNSURE"])
export const RFQStatus = z.enum(["DRAFT", "PREVIEW", "SUBMITTED", "QUOTED", "ACCEPTED", "DECLINED", "CANCELLED"])
export const QuoteStatus = z.enum(["PENDING", "ACCEPTED", "DECLINED", "EXPIRED"])
export const VerificationStatus = z.enum(["PENDING", "VERIFIED", "SUSPENDED"])
export const IntegrationType = z.enum(["MANUAL", "JOBBER", "HOUSECALL_PRO"])
export const ConsentEventType = z.enum(["SHARE", "CONTACT", "ACCEPT", "PAYMENT", "REVOKE", "DELETE"])

// API Request/Response types
export const CreateRFQSchema = z.object({
  trade: TradeType,
  zipCode: z.string().regex(/^\d{5}$/),
  description: z.string().min(10).max(5000),
  urgency: UrgencyType,
  budgetBand: BudgetBand.optional(),
})

export const UpdateRFQSchema = CreateRFQSchema.partial()

export const ConsentRequestSchema = z.object({
  rfqId: z.string(),
  contractors: z.array(z.string()),
  scope: z.string(),
})

export const CreateQuoteSchema = z.object({
  rfqId: z.string(),
  contractorId: z.string(),
  priceAmount: z.number().int().positive(),
  priceCurrency: z.string().default("USD"),
  scope: z.string().min(10).max(5000),
  estimatedStartDate: z.string().datetime().optional(),
  estimatedDuration: z.string().optional(),
  validUntil: z.string().datetime().optional(),
  notes: z.string().optional(),
})

export const CreateContractorSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  trades: z.array(TradeType),
  serviceZipCodes: z.array(z.string().regex(/^\d{5}$/)),
  licenseNumber: z.string().optional(),
  insuranceOnFile: z.boolean().default(false),
  verificationStatus: VerificationStatus.default("PENDING"),
  isSandbox: z.boolean().default(false),
  integrationType: IntegrationType.optional(),
  integrationConfig: z.any().optional(),
})

export const UpdateContractorSchema = CreateContractorSchema.partial()

// OAuth scopes
export const SCOPES = {
  RFQ_READ: "rfq:read",
  RFQ_WRITE: "rfq:write",
  QUOTES_READ: "quotes:read",
  QUOTES_ACCEPT: "quotes:accept",
  PROFILE_READ: "profile:read",
} as const

export type Scope = typeof SCOPES[keyof typeof SCOPES]

export const SCOPE_DESCRIPTIONS: Record<Scope, string> = {
  "rfq:read": "View your service requests and quotes",
  "rfq:write": "Create and manage service requests",
  "quotes:read": "View quotes from contractors",
  "quotes:accept": "Accept or decline quotes",
  "profile:read": "View your profile information",
}

// Helper to validate scopes
export function validateScopes(requestedScopes: string): Scope[] {
  const scopes = requestedScopes.split(" ")
  const validScopes = Object.values(SCOPES)
  return scopes.filter((s): s is Scope => validScopes.includes(s as Scope))
}

// Helper to check if token has required scope
export function hasScope(tokenScopes: string, requiredScope: Scope): boolean {
  return tokenScopes.split(" ").includes(requiredScope)
}
