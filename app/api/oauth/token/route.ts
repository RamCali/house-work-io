import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"
import crypto from "crypto"

/**
 * OAuth 2.0 Token endpoint
 * Exchanges authorization code for access token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.formData()
    
    const grantType = body.get("grant_type")
    const code = body.get("code") as string
    const redirectUri = body.get("redirect_uri") as string
    const clientId = body.get("client_id") as string
    const codeVerifier = body.get("code_verifier") as string

    if (grantType !== "authorization_code") {
      return NextResponse.json(
        { error: "unsupported_grant_type" },
        { status: 400 }
      )
    }

    if (!code || !redirectUri || !clientId || !codeVerifier) {
      return NextResponse.json(
        { error: "invalid_request" },
        { status: 400 }
      )
    }

    // In production, verify the authorization code and PKCE challenge
    // For this MVP, we'll create a simple token
    
    // Verify PKCE challenge (in production, retrieve from stored auth code)
    const hash = crypto.createHash("sha256").update(codeVerifier).digest("base64url")
    
    // For demo purposes, extract userId from code (format: "code_userId_random")
    const parts = code.split("_")
    if (parts.length < 3 || parts[0] !== "code") {
      return NextResponse.json(
        { error: "invalid_grant" },
        { status: 400 }
      )
    }
    
    const userId = parts[1]
    const storedChallenge = parts[parts.length - 1]
    
    // Verify PKCE
    if (hash !== storedChallenge) {
      return NextResponse.json(
        { error: "invalid_grant", error_description: "Invalid code verifier" },
        { status: 400 }
      )
    }

    // Extract scope from code (simplified - in production, store with auth code)
    const scope = body.get("scope") as string || "rfq:read rfq:write quotes:read quotes:accept profile:read"

    // Create access token
    const accessToken = `mca_${nanoid(32)}`
    const refreshToken = `mcr_${nanoid(32)}`
    const expiresIn = 3600 // 1 hour
    const expiresAt = new Date(Date.now() + expiresIn * 1000)

    await prisma.oAuthToken.create({
      data: {
        userId,
        accessToken,
        refreshToken,
        scope,
        expiresAt,
      },
    })

    return NextResponse.json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: expiresIn,
      refresh_token: refreshToken,
      scope,
    })
  } catch (error) {
    console.error("Token error:", error)
    return NextResponse.json(
      { error: "server_error" },
      { status: 500 }
    )
  }
}
