import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Main Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Powered by Meta Muse
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Home Services,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                AI-Connected
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto">
              Get instant quotes from verified contractors through your Muse agent. 
              Safe, transparent, and always in your control.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/auth/signin"
                className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg shadow-blue-600/30"
              >
                🏡 Homeowner Portal
              </Link>
              <Link
                href="/contractor"
                className="px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg shadow-green-600/30"
              >
                🔨 Contractor Portal
              </Link>
              <Link
                href="/admin"
                className="px-8 py-4 bg-slate-700 text-white rounded-xl hover:bg-slate-800 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg"
              >
                ⚙️ Admin
              </Link>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified Contractors
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Consent-First
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                OAuth 2.0 Secure
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="p-8 bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="h-7 w-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Consent-First Privacy</h3>
              <p className="text-slate-600">
                Preview exactly what will be shared before giving consent. Full audit trail of all actions.
              </p>
            </div>
            
            <div className="p-8 bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Verified Contractors</h3>
              <p className="text-slate-600">
                All contractors are licensed, insured, and background-checked before joining our network.
              </p>
            </div>
            
            <div className="p-8 bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="h-7 w-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Instant Quotes</h3>
              <p className="text-slate-600">
                Get competitive quotes within minutes. Compare contractors and choose the best fit for your needs.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 text-white mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  1
                </div>
                <h3 className="font-semibold mb-2">Tell Muse Your Need</h3>
                <p className="text-slate-300 text-sm">Describe your project through your Muse agent</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  2
                </div>
                <h3 className="font-semibold mb-2">Preview & Consent</h3>
                <p className="text-slate-300 text-sm">Review what's shared and approve contractors</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  3
                </div>
                <h3 className="font-semibold mb-2">Receive Quotes</h3>
                <p className="text-slate-300 text-sm">Get competitive bids from verified pros</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  ✓
                </div>
                <h3 className="font-semibold mb-2">Choose & Schedule</h3>
                <p className="text-slate-300 text-sm">Accept your favorite and get to work</p>
              </div>
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
