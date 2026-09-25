import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Muse Connector
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Get quotes from verified home service professionals through your Muse agent
          </p>
          
          <div className="flex gap-4 justify-center mb-16">
            <Link
              href="/auth/signin"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Homeowner Portal
            </Link>
            <Link
              href="/admin"
              className="px-8 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
            >
              Operator Admin
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16 text-left">
            <div className="p-6 bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="text-lg font-semibold mb-2">Consent-First</h3>
              <p className="text-slate-600 text-sm">
                Preview exactly what will be shared before giving consent to contractors
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="text-3xl mb-3">✅</div>
              <h3 className="text-lg font-semibold mb-2">Verified Contractors</h3>
              <p className="text-slate-600 text-sm">
                All contractors are licensed, insured, and verified before listing
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="text-lg font-semibold mb-2">Agent-Friendly API</h3>
              <p className="text-slate-600 text-sm">
                OAuth 2.0 with PKCE, OpenAPI spec, and MCP server for seamless integration
              </p>
            </div>
          </div>

          <div className="mt-16 p-6 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-900">
              <strong>🧪 Sandbox Mode Active:</strong> This instance is running in sandbox mode with test contractors.
              All quotes are auto-generated for testing purposes.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200">
            <div className="flex gap-6 justify-center text-sm text-slate-600">
              <Link href="/privacy" className="hover:text-slate-900">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-slate-900">Terms of Service</Link>
              <Link href="/verification" className="hover:text-slate-900">Contractor Verification</Link>
              <Link href="/api/docs" className="hover:text-slate-900">API Documentation</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
