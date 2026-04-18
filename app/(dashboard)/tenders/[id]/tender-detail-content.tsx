"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  ExternalLink, 
  Calendar, 
  Building2, 
  MapPin,
  DollarSign,
  Clock,
  FileText,
  Mail,
  Phone,
  User,
  CheckCircle,
  AlertTriangle,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScoreBadge } from "@/components/score-badge"
import { StatusBadge } from "@/components/status-badge"
import { updateTenderStatus, createApplication } from "./actions"
import type { Tender, ExtractedDetails, Application } from "@/lib/types"

interface TenderDetailContentProps {
  tender: Tender
  extractedDetails: ExtractedDetails | null
  application: Application | null
}

function formatCurrency(amount: number | null, currency: string = "USD") {
  if (!amount) return "N/A"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(date: string | null) {
  if (!date) return "N/A"
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function getDaysUntilDeadline(deadline: string | null) {
  if (!deadline) return null
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diffTime = deadlineDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export function TenderDetailContent({ 
  tender, 
  extractedDetails, 
  application 
}: TenderDetailContentProps) {
  const router = useRouter()
  const score = tender.tender_scores?.[0]
  const daysUntil = getDaysUntilDeadline(tender.deadline)
  const isUrgent = daysUntil !== null && daysUntil <= 7 && daysUntil > 0
  const isPast = daysUntil !== null && daysUntil < 0

  const handleStatusChange = async (status: string) => {
    await updateTenderStatus(tender.id, status as Tender["status"])
    router.refresh()
  }

  const handleStartApplication = async () => {
    await createApplication(tender.id)
    router.refresh()
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-4">
          <Link 
            href="/tenders" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tenders
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <StatusBadge status={tender.status} type="tender" />
              {score && <ScoreBadge score={score.score} showLabel />}
            </div>
            <h1 className="text-2xl font-semibold text-foreground">{tender.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {tender.organization || "Unknown Organization"}
              </span>
              {tender.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {tender.location}
                </span>
              )}
              {tender.tender_sources && (
                <span className="text-sm">
                  Source: {tender.tender_sources.name}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {tender.source_url && (
            <Button variant="outline" asChild>
              <a href={tender.source_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Original
              </a>
            </Button>
          )}
          {!application ? (
            <Button onClick={handleStartApplication}>
              <FileText className="h-4 w-4 mr-2" />
              Start Application
            </Button>
          ) : (
            <Button asChild>
              <Link href={`/applications?tender=${tender.id}`}>
                View Application
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {tender.description || "No description available"}
              </p>
            </CardContent>
          </Card>

          {/* Requirements */}
          {extractedDetails && (
            <>
              {extractedDetails.requirements && (
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {extractedDetails.requirements}
                    </p>
                  </CardContent>
                </Card>
              )}

              {extractedDetails.eligibility && (
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Eligibility Criteria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {extractedDetails.eligibility}
                    </p>
                  </CardContent>
                </Card>
              )}

              {extractedDetails.submission_method && (
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Submission Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {extractedDetails.submission_method}
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* AI Score Breakdown */}
          {score?.breakdown && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Score Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {Object.entries(score.breakdown).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="text-sm font-medium">{value}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            value >= 80 ? "bg-emerald-500" :
                            value >= 60 ? "bg-amber-500" : "bg-red-500"
                          }`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Key Details */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Key Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-medium">{formatCurrency(tender.budget, tender.currency)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Deadline</p>
                  <p className={`font-medium ${isUrgent ? "text-amber-400" : isPast ? "text-red-400" : ""}`}>
                    {formatDate(tender.deadline)}
                  </p>
                  {daysUntil !== null && !isPast && (
                    <p className={`text-xs ${isUrgent ? "text-amber-400" : "text-muted-foreground"}`}>
                      {daysUntil} days remaining
                    </p>
                  )}
                </div>
              </div>
              {tender.sector && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Sector</p>
                    <p className="font-medium">{tender.sector}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Added</p>
                  <p className="font-medium">{formatDate(tender.created_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          {extractedDetails?.contact_info && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {extractedDetails.contact_info.name && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{extractedDetails.contact_info.name}</span>
                  </div>
                )}
                {extractedDetails.contact_info.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={`mailto:${extractedDetails.contact_info.email}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {extractedDetails.contact_info.email}
                    </a>
                  </div>
                )}
                {extractedDetails.contact_info.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{extractedDetails.contact_info.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleStatusChange("reviewed")}
                disabled={tender.status === "reviewed"}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Reviewed
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleStatusChange("ignored")}
                disabled={tender.status === "ignored"}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Ignore Tender
              </Button>
            </CardContent>
          </Card>

          {/* Application Status */}
          {application && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Application</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <StatusBadge status={application.status} type="application" />
                </div>
                {application.notes && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {application.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
