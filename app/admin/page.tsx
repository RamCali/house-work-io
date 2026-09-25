"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function AdminDashboard() {
  const [rfqs, setRfqs] = useState<any[]>([])
  const [contractors, setContractors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // In production, these would be protected admin endpoints
      // For MVP, we're accessing DB directly via server components or API
      setLoading(false)
    } catch (error) {
      console.error("Failed to load data:", error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/" className="text-xl font-bold text-slate-900">
                Muse Connector
              </Link>
              <span className="ml-3 text-sm text-slate-600">Operator Admin</span>
            </div>
            <div className="flex gap-4">
              <Link
                href="/admin/rfqs"
                className="px-4 py-2 text-sm text-slate-700 hover:text-slate-900"
              >
                RFQs
              </Link>
              <Link
                href="/admin/contractors"
                className="px-4 py-2 text-sm text-slate-700 hover:text-slate-900"
              >
                Contractors
              </Link>
              <Link
                href="/admin/quotes"
                className="px-4 py-2 text-sm text-slate-700 hover:text-slate-900"
              >
                Quotes
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">
          Operator Dashboard
        </h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="text-sm text-slate-600 mb-1">Pending RFQs</div>
            <div className="text-3xl font-bold text-slate-900">{rfqs.filter(r => r.status === "SUBMITTED").length}</div>
            <Link href="/admin/rfqs?status=SUBMITTED" className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block">
              View all →
            </Link>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="text-sm text-slate-600 mb-1">Active Contractors</div>
            <div className="text-3xl font-bold text-slate-900">{contractors.filter(c => c.verificationStatus === "VERIFIED").length}</div>
            <Link href="/admin/contractors?status=VERIFIED" className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block">
              View all →
            </Link>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="text-sm text-slate-600 mb-1">Quotes Sent</div>
            <div className="text-3xl font-bold text-slate-900">0</div>
            <Link href="/admin/quotes" className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block">
              View all →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/admin/contractors/new"
              className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">➕</div>
              <div className="font-medium text-slate-900">Add Contractor</div>
              <div className="text-sm text-slate-600">Onboard a new contractor</div>
            </Link>

            <Link
              href="/admin/rfqs"
              className="p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="font-medium text-slate-900">Process RFQs</div>
              <div className="text-sm text-slate-600">Manage incoming requests</div>
            </Link>
          </div>
        </div>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-900">
            <strong>🧪 Sandbox Mode Active:</strong> All contractors marked as sandbox will auto-generate quotes.
            Use the admin panel to manage real contractors when ready for production.
          </p>
        </div>
      </div>
    </div>
  )
}
