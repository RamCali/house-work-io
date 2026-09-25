import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateScopes, SCOPES } from "@/lib/types"
import { nanoid } from "nanoid"

/**
 * OAuth 2.0 Authorization endpoint
 * Implements authorization code flow with PKCE
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  
  const clientId = searchParams.get("client_id")
  const redirectUri = searchParams.get("redirect_uri")
  const scope = searchParams.get("scope") || ""
  const state = searchParams.get("state")
  const codeChallenge = searchParams.get("code_challenge")
  const codeChallengeMethod = searchParams.get("code_challenge_method")
  const responseType = searchParams.get("response_type")

  // Validate required parameters
  if (responseType !== "code") {
    return NextResponse.json(
      { error: "unsupported_response_type" },
      { status: 400 }
    )
  }

  if (!clientId || !redirectUri || !codeChallenge) {
    return NextResponse.json(
      { error: "invalid_request", error_description: "Missing required parameters" },
      { status: 400 }
    )
  }

  if (codeChallengeMethod !== "S256") {
    return NextResponse.json(
      { error: "invalid_request", error_description: "Only S256 code challenge method is supported" },
      { status: 400 }
    )
  }

  // Validate scopes
  const requestedScopes = validateScopes(scope)
  if (requestedScopes.length === 0) {
    return NextResponse.json(
      { error: "invalid_scope" },
      { status: 400 }
    )
  }

  // In production, we'd validate the client_id and redirect_uri
  // For now, we'll accept any client and redirect to consent page
  
  const consentUrl = new URL("/oauth/consent", request.url)
  consentUrl.searchParams.set("client_id", clientId)
  consentUrl.searchParams.set("redirect_uri", redirectUri)
  consentUrl.searchParams.set("scope", requestedScopes.join(" "))
  consentUrl.searchParams.set("state", state || "")
  consentUrl.searchParams.set("code_challenge", codeChallenge)
  consentUrl.searchParams.set("code_challenge_method", codeChallengeMethod)

  return NextResponse.redirect(consentUrl)
}
