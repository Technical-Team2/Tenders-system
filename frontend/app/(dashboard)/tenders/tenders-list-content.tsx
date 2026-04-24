"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { 
  Search, 
  Filter, 
  SlidersHorizontal,
  ArrowUpDown,
  ExternalLink,
  Calendar,
  Building2,
  MapPin,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScoreBadge } from "@/components/score-badge"
import { StatusBadge } from "@/components/status-badge"
import type { Tender, TenderSource } from "@/lib/types"

interface TendersListContentProps {
  tenders: Tender[]
  sources: TenderSource[]
  sectors: string[]
}

function formatCurrency(amount: number | null, currency: string = "USD") {
  if (!amount) return "N/A"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount)
}

function formatDate(date: string | null) {
  if (!date) return "N/A"
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
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

export function TendersListContent({ tenders, sources, sectors }: TendersListContentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sectorFilter, setSectorFilter] = useState<string>("all")
  const [sourceFilter, setSourceFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const filteredTenders = useMemo(() => {
    let filtered = [...tenders]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(query) ||
        t.organization?.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(t => t.status === statusFilter)
    }

    // Sector filter
    if (sectorFilter !== "all") {
      filtered = filtered.filter(t => t.sector === sectorFilter)
    }

    // Source filter
    if (sourceFilter !== "all") {
      filtered = filtered.filter(t => t.source_id === sourceFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: number | string = 0
      let bVal: number | string = 0

      switch (sortBy) {
        case "score":
          aVal = a.tender_scores?.[0]?.score || 0
          bVal = b.tender_scores?.[0]?.score || 0
          break
        case "deadline":
          aVal = a.deadline || ""
          bVal = b.deadline || ""
          break
        case "budget":
          aVal = a.budget || 0
          bVal = b.budget || 0
          break
        default:
          aVal = a.created_at
          bVal = b.created_at
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1
      }
      return aVal < bVal ? 1 : -1
    })

    return filtered
  }, [tenders, searchQuery, statusFilter, sectorFilter, sourceFilter, sortBy, sortOrder])

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Tenders</h1>
          <p className="text-muted-foreground">
            {filteredTenders.length} of {tenders.length} tenders
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tenders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary border-border"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 bg-secondary border-border">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="ignored">Ignored</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="w-40 bg-secondary border-border">
                <SlidersHorizontal className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                {sectors.map(sector => (
                  <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-40 bg-secondary border-border">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {sources.map(source => (
                  <SelectItem key={source.id} value={source.id}>{source.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36 bg-secondary border-border">
                <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Added</SelectItem>
                <SelectItem value="score">AI Score</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
                <SelectItem value="budget">Budget</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="text-muted-foreground"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tenders List */}
      <div className="space-y-4">
        {filteredTenders.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No tenders found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          filteredTenders.map((tender) => {
            const daysUntil = getDaysUntilDeadline(tender.deadline)
            const isUrgent = daysUntil !== null && daysUntil <= 7 && daysUntil > 0
            const isPast = daysUntil !== null && daysUntil < 0

            return (
              <Link key={tender.id} href={`/tenders/${tender.id}`}>
                <Card className="border-border bg-card hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      {/* Score */}
                      <div className="flex-shrink-0 text-center">
                        {tender.tender_scores?.[0] ? (
                          <div className="space-y-1">
                            <ScoreBadge score={tender.tender_scores[0].score} size="lg" />
                            <p className="text-xs text-muted-foreground">AI Score</p>
                          </div>
                        ) : (
                          <div className="w-16 h-10 rounded-lg bg-secondary flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">N/A</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-medium text-card-foreground line-clamp-1">
                              {tender.title}
                            </h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3.5 w-3.5" />
                                {tender.organization || "Unknown"}
                              </span>
                              {tender.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {tender.location}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <StatusBadge status={tender.status} type="tender" />
                            {tender.source_url && (
                              <a 
                                href={tender.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </div>

                        {tender.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {tender.description}
                          </p>
                        )}

                        <div className="flex items-center gap-6 text-sm">
                          <span className="text-muted-foreground">
                            <span className="font-medium text-card-foreground">
                              {formatCurrency(tender.budget, tender.currency)}
                            </span>
                          </span>
                          {tender.sector && (
                            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
                              {tender.sector}
                            </span>
                          )}
                          <span className={`flex items-center gap-1 ${isUrgent ? "text-amber-400" : isPast ? "text-red-400" : "text-muted-foreground"}`}>
                            <Calendar className="h-3.5 w-3.5" />
                            {isPast ? "Deadline passed" : `Due: ${formatDate(tender.deadline)}`}
                            {isUrgent && ` (${daysUntil} days)`}
                          </span>
                          <span className="text-muted-foreground">
                            {tender.tender_sources?.name || "Unknown Source"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
