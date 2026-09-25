"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PhotoUpload } from "@/components/photo-upload"
import { useNotification } from "@/components/notification-toast"

export default function NewRFQPage() {
  const router = useRouter()
  const { notify } = useNotification()
  const [loading, setLoading] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])
  const [formData, setFormData] = useState({
    trade: "",
    zipCode: "",
    description: "",
    urgency: "THIS_WEEK",
    budgetBand: "1K_5K"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Upload photos first if any
      let photoUrls: string[] = []
      if (photos.length > 0) {
        // In production, upload to cloud storage
        // For now, we'll use data URLs
        photoUrls = await Promise.all(
          photos.map(file => {
            return new Promise<string>((resolve) => {
              const reader = new FileReader()
              reader.onloadend = () => resolve(reader.result as string)
              reader.readAsDataURL(file)
            })
          })
        )
      }

      // Create RFQ
      const res = await fetch("/api/v1/rfqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          photos: photoUrls.map(url => ({ url }))
        })
      })

      if (!res.ok) {
        throw new Error("Failed to create request")
      }

      const data = await res.json()
      notify("success", "Request Created!", "Your service request has been created successfully")
      router.push(`/dashboard/rfq/${data.rfq.id}`)
    } catch (error: any) {
      notify("error", "Error", error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-slate-900">New Service Request</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Tell us about your project</CardTitle>
              <CardDescription>
                Provide details about the work you need done. The more information you share, 
                the more accurate quotes you'll receive.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Trade Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Service Type *
                  </label>
                  <select
                    required
                    value={formData.trade}
                    onChange={(e) => setFormData({ ...formData, trade: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a service...</option>
                    <option value="HVAC">HVAC (Heating & Cooling)</option>
                    <option value="PLUMBING">Plumbing</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="ROOFING">Roofing</option>
                    <option value="PAINTING">Painting</option>
                    <option value="CARPENTRY">Carpentry</option>
                    <option value="LANDSCAPING">Landscaping</option>
                    <option value="CLEANING">Cleaning</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* Zip Code */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Zip Code *
                  </label>
                  <input
                    type="text"
                    required
                    pattern="[0-9]{5}"
                    placeholder="94102"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Project Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe what work needs to be done, any specific requirements, and any relevant details..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Tip: Include details like size, materials, timeline preferences, and any challenges
                  </p>
                </div>

                {/* Photos */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Project Photos
                  </label>
                  <PhotoUpload maxPhotos={5} onPhotosChange={setPhotos} />
                </div>

                {/* Urgency */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Timeline *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { value: "ASAP", label: "ASAP", desc: "Emergency" },
                      { value: "THIS_WEEK", label: "This Week", desc: "3-7 days" },
                      { value: "THIS_MONTH", label: "This Month", desc: "1-4 weeks" },
                      { value: "FLEXIBLE", label: "Flexible", desc: "No rush" }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, urgency: option.value })}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          formData.urgency === option.value
                            ? "border-blue-500 bg-blue-50 text-blue-900"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="font-semibold text-sm">{option.label}</div>
                        <div className="text-xs text-slate-600 mt-1">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Estimated Budget
                  </label>
                  <select
                    value={formData.budgetBand}
                    onChange={(e) => setFormData({ ...formData, budgetBand: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="UNDER_1K">Under $1,000</option>
                    <option value="1K_5K">$1,000 - $5,000</option>
                    <option value="5K_10K">$5,000 - $10,000</option>
                    <option value="10K_25K">$10,000 - $25,000</option>
                    <option value="OVER_25K">Over $25,000</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    This helps contractors understand your expectations
                  </p>
                </div>

                {/* Submit */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </span>
                    ) : (
                      <>
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Create Request
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <svg className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">What happens next?</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Your request will be saved as a draft</li>
                    <li>• You'll preview exactly what contractors will see</li>
                    <li>• You'll give explicit consent before we share your information</li>
                    <li>• Verified contractors will submit quotes for you to review</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
