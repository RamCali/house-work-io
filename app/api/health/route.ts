import { NextResponse } from "next/server"
import { getHealthStatus } from "@/lib/monitoring"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const health = await getHealthStatus()
    
    const statusCode = health.status === "healthy" ? 200 : 
                      health.status === "degraded" ? 200 : 503

    return NextResponse.json(health, { status: statusCode })
  } catch (error) {
    return NextResponse.json({
      status: "unhealthy",
      checks: {},
      timestamp: new Date().toISOString(),
      error: "Health check failed",
    }, { status: 503 })
  }
}
