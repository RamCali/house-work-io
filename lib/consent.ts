import { prisma } from "./prisma"
import { ConsentEventType } from "./types"

export interface ConsentLogData {
  userId: string
  eventType: "SHARE" | "CONTACT" | "ACCEPT" | "PAYMENT" | "REVOKE" | "DELETE"
  rfqId?: string
  quoteId?: string
  scope?: string
  dataSnapshot?: any
  ipAddress?: string
  userAgent?: string
}

export async function logConsent(data: ConsentLogData) {
  return await prisma.consentLog.create({
    data: {
      userId: data.userId,
      eventType: data.eventType,
      rfqId: data.rfqId,
      quoteId: data.quoteId,
      scope: data.scope,
      dataSnapshot: data.dataSnapshot,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    },
  })
}

export async function verifyConsent(userId: string, rfqId: string): Promise<boolean> {
  const consentLog = await prisma.consentLog.findFirst({
    where: {
      userId,
      rfqId,
      eventType: "SHARE",
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return !!consentLog
}

export async function getConsentHistory(userId: string) {
  return await prisma.consentLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })
}
