"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNotification } from "@/components/notification-toast"

interface IncomingRFQ {
  id: string
  trade: string
  zipCode: string
  description: string
  urgency: string
  budgetBand: string | null
  createdAt: string
  user: {
    name: string
  }
  photos: Array<{
    url: string
  }>
  hasQuote: boolean
  myQuote?: {
    id: string
    amount: number
    status: string
  }
}

export default function ContractorPortalPage() {
  const router = useRouter()
  const { notify } = useNotification()
  const [rfqs, setRfqs] = useState<IncomingRFQ[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "new" | "quoted">("all")
  const [stats, setStats] = useState({
    total: 0,
    newRequests: 0,
    quoted: 0,
    accepted: 0
  })

  useEffect(() => {
    fetchRFQs()
    // Poll for new RFQs every 30 seconds
    const interval = setInterval(fetchRFQs, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchRFQs = async () => {
    try {
      // In production, this would use contractor authentication
      // For now, we'll fetch sandbox RFQs
      const res = await fetch("/api/v1/contractor/rfqs")
      if (!res.ok) {
        throw new Error("Failed to fetch RFQs")
      }
      const data = await res.json()
      setRfqs(data.rfqs || [])
      
      // Calculate stats
      const total = data.rfqs?.length || 0
      const newRequests = data.rfqs?.filter((r: IncomingRFQ) => !r.hasQuote)?.length || 0
      const quoted = data.rfqs?.filter((r: IncomingRFQ) => r.hasQuote)?.length || 0
      const accepted = data.rfqs?.filter((r: IncomingRFQ) => r.myQuote?.status === "ACCEPTED")?.length || 0
      
      setStats({ total, newRequests, quoted, accepted })
    } catch (error: any) {
      console.error("Error fetching RFQs:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRFQs = rfqs.filter((rfq) => {
    if (filter === "new") return !rfq.hasQuote
    if (filter === "quoted") return rfq.hasQuote
    return true
  })

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
          <p className="mt-4 text-slate-600">Loading contractor portal...</p>
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
              <Badge variant="success">Contractor Portal</Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-600">
                <span className="inline-flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Live Updates
                </span>
              </div>
              <Button variant="ghost" size="sm">
                Profile
              </Button>
              <Button variant="outline" size="sm">
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
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600">{stats.newRequests}</div>
              <div className="text-sm text-blue-900 mt-1">New Requests</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-slate-600">{stats.quoted}</div>
              <div className="text-sm text-slate-600 mt-1">Quoted</div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600">{stats.accepted}</div>
              <div className="text-sm text-green-900 mt-1">Accepted</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant={filter === "all" ? "primary" : "ghost"} 
            size="sm"
            onClick={() => setFilter("all")}
          >
            All ({rfqs.length})
          </Button>
          <Button 
            variant={filter === "new" ? "primary" : "ghost"} 
            size="sm"
            onClick={() => setFilter("new")}
          >
            New ({stats.newRequests})
          </Button>
          <Button 
            variant={filter === "quoted" ? "primary" : "ghost"} 
            size="sm"
            onClick={() => setFilter("quoted")}
          >
            Quoted ({stats.quoted})
          </Button>
        </div>

        {/* RFQs List */}
        {filteredRFQs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-slate-400 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No requests found</h3>
              <p className="text-slate-600">
                {filter === "new" ? "No new requests at the moment." : 
                 filter === "quoted" ? "You haven't submitted any quotes yet." :
                 "No service requests available."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRFQs.map((rfq) => (
              <Card key={rfq.id} className={!rfq.hasQuote ? "border-blue-200 bg-blue-50/30" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle>{rfq.trade}</CardTitle>
                        {!rfq.hasQuote && (
                          <Badge variant="info">NEW</Badge>
                        )}
                        <Badge variant={getUrgencyColor(rfq.urgency)}>
                          {rfq.urgency.replace("_", " ")}
                        </Badge>
                        {rfq.budgetBand && (
                          <Badge variant="default">{rfq.budgetBand}</Badge>
                        )}
                      </div>
                      <CardDescription>
                        {rfq.zipCode} • {rfq.user.name} • {new Date(rfq.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    {rfq.myQuote && (
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          ${rfq.myQuote.amount.toLocaleString()}
                        </div>
                        <Badge variant={rfq.myQuote.status === "ACCEPTED" ? "success" : "default"}>
                          {rfq.myQuote.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 mb-4">{rfq.description}</p>
                  
                  {rfq.photos && rfq.photos.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-slate-900 mb-2">
                        Photos ({rfq.photos.length}):
                      </div>
                      <div className="flex gap-2 overflow-x-auto">
                        {rfq.photos.slice(0, 4).map((photo, idx) => (
                          <img
                            key={idx}
                            src={photo.url}
                            alt={`RFQ photo ${idx + 1}`}
                            className="h-20 w-20 object-cover rounded-lg border border-slate-200"
                          />
                        ))}
                        {rfq.photos.length > 4 && (
                          <div className="h-20 w-20 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-medium">
                            +{rfq.photos.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <div className="flex gap-2 w-full">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => router.push(`/contractor/rfq/${rfq.id}`)}
                    >
                      View Full Details
                    </Button>
                    {!rfq.hasQuote ? (
                      <Button 
                        className="flex-1"
                        onClick={() => {
                          router.push(`/contractor/rfq/${rfq.id}/quote`)
                          notify("info", "Quote Form", "Opening quote submission form")
                        }}
                      >
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Submit Quote
                      </Button>
                    ) : (
                      <Button 
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push(`/contractor/rfq/${rfq.id}/quote`)}
                      >
                        Edit Quote
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
