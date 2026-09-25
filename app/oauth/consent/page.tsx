"use client"

import { useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import { SCOPE_DESCRIPTIONS, type Scope } from "@/lib/types"
import { nanoid } from "nanoid"
import crypto from "crypto"

function ConsentContent() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  
  const clientId = searchParams.get("client_id")
  const redirectUri = searchParams.get("redirect_uri")
  const scope = searchParams.get("scope") || ""
  const state = searchParams.get("state")
  const codeChallenge = searchParams.get("code_challenge")
  const codeChallengeMethod = searchParams.get("code_challenge_method")

  const scopes = scope.split(" ").filter(Boolean) as Scope[]

  const handleAllow = async () => {
    setLoading(true)
    
    // In production, this would create a session and proper auth code
    // For MVP, we'll create a simplified code
    const userId = "demo-user-" + nanoid(8) // In production, get from session
    const authCode = `code_${userId}_${codeChallenge}`

    const callback = new URL(redirectUri!)
    callback.searchParams.set("code", authCode)
    if (state) callback.searchParams.set("state", state)

    window.location.href = callback.toString()
  }

  const handleDeny = () => {
    const callback = new URL(redirectUri!)
    callback.searchParams.set("error", "access_denied")
    if (state) callback.searchParams.set("state", state)
    window.location.href = callback.toString()
  }

  if (!clientId || !redirectUri) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          <div className="text-red-600 text-center">
            <p className="font-semibold mb-2">Invalid Request</p>
            <p className="text-sm">Missing required OAuth parameters</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Authorize Access</h1>
          <p className="text-slate-600 mt-2">
            <strong>Muse</strong> wants to access your Muse Connector account
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="mb-6">
            <p className="text-sm text-slate-700 mb-4">
              This application will be able to:
            </p>
            <ul className="space-y-2">
              {scopes.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span className="text-slate-700">{SCOPE_DESCRIPTIONS[s]}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-slate-200 pt-4 mb-6">
            <p className="text-xs text-slate-600">
              By authorizing, you agree that Muse can access your service requests and quotes
              on your behalf. You can revoke access at any time from your dashboard.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDeny}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 disabled:opacity-50"
            >
              Deny
            </button>
            <button
              onClick={handleAllow}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? "Authorizing..." : "Allow"}
            </button>
          </div>
        </div>

        <p className="mt-4 text-xs text-center text-slate-500">
          Redirecting to: {redirectUri}
        </p>
      </div>
    </div>
  )
}

export default function ConsentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <ConsentContent />
    </Suspense>
  )
}
