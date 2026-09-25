"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNotification } from "@/components/notification-toast"

interface RFQ {
  id: string
  trade: string
  zipCode: string
  description: string
  urgency: string
  status: string
  createdAt: string
  quotes: Array<{
    id: string
    amount: number
    contractor: {
      businessName: string
    }
    status: string
  }>
}

export default function DashboardPage() {
  const router = useRouter()
  const { notify } = useNotification()
  const [rfqs, setRfqs] = useState<RFQ[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    completed: 0
  })

  useEffect(() => {
    fetchRFQs()
  }, [])

  const fetchRFQs = async () => {
    try {
      // This would use actual OAuth token in production
      const res = await fetch("/api/v1/rfqs")
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/auth/signin")
          return
        }
        throw new Error("Failed to fetch RFQs")
      }
      const data = await res.json()
      setRfqs(data.rfqs || [])
      
      // Calculate stats
      const total = data.rfqs?.length || 0
      const pending = data.rfqs?.filter((r: RFQ) => r.status === "DRAFT")?.length || 0
      const active = data.rfqs?.filter((r: RFQ) => r.status === "SUBMITTED")?.length || 0
      const completed = data.rfqs?.filter((r: RFQ) => r.status === "ACCEPTED")?.length || 0
      
      setStats({ total, pending, active, completed })
    } catch (error: any) {
      notify("error", "Error", error.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT": return "default"
      case "SUBMITTED": return "info"
      case "ACCEPTED": return "success"
      case "DECLINED": return "danger"
      default: return "default"
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "ASAP": return "danger"
      case "THIS_WEEK": return "warning"
      case "THIS_MONTH": return "info"
      case "FLEXIBLE": return "default"
      default: return "default"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold text-slate-900">
                Muse Connector
              </Link>
              <Badge variant="warning">Homeowner Portal</Badge>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/privacy")}>
                Privacy
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push("/auth/signin")}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
              <div className="text-sm text-slate-600 mt-1">Total Requests</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-slate-600">{stats.pending}</div>
              <div className="text-sm text-slate-600 mt-1">Draft</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600">{stats.active}</div>
              <div className="text-sm text-slate-600 mt-1">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-slate-600 mt-1">Completed</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Your Service Requests</h1>
          <Button onClick={() => router.push("/dashboard/new-rfq")}>
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Request
          </Button>
        </div>

        {/* RFQs List */}
        {rfqs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-slate-400 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No service requests yet</h3>
              <p className="text-slate-600 mb-6">Create your first service request to get quotes from verified contractors.</p>
              <Button onClick={() => router.push("/dashboard/new-rfq")}>Create Request</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {rfqs.map((rfq) => (
              <Card key={rfq.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle>{rfq.trade}</CardTitle>
                        <Badge variant={getStatusColor(rfq.status)}>
                          {rfq.status}
                        </Badge>
                        <Badge variant={getUrgencyColor(rfq.urgency)}>
                          {rfq.urgency.replace("_", " ")}
                        </Badge>
                      </div>
                      <CardDescription>
                        {rfq.zipCode} • Created {new Date(rfq.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    {rfq.quotes && rfq.quotes.length > 0 && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {rfq.quotes.length}
                        </div>
                        <div className="text-xs text-slate-600">
                          {rfq.quotes.length === 1 ? "Quote" : "Quotes"}
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 mb-4">{rfq.description}</p>
                  
                  {rfq.quotes && rfq.quotes.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-slate-900">Quotes Received:</div>
                      {rfq.quotes.slice(0, 3).map((quote) => (
                        <div key={quote.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <div className="font-medium text-slate-900">{quote.contractor.businessName}</div>
                            <div className="text-sm text-slate-600">
                              <Badge variant={quote.status === "ACCEPTED" ? "success" : "default"} className="mt-1">
                                {quote.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              ${quote.amount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                      {rfq.quotes.length > 3 && (
                        <div className="text-sm text-slate-500 text-center">
                          +{rfq.quotes.length - 3} more {rfq.quotes.length - 3 === 1 ? "quote" : "quotes"}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <div className="flex gap-2 w-full">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => router.push(`/dashboard/rfq/${rfq.id}`)}
                    >
                      View Details
                    </Button>
                    {rfq.status === "SUBMITTED" && rfq.quotes && rfq.quotes.length > 0 && (
                      <Button 
                        className="flex-1"
                        onClick={() => router.push(`/dashboard/rfq/${rfq.id}/quotes`)}
                      >
                        Review Quotes
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
