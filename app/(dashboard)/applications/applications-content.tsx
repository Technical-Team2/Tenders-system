"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Send,
  FileText,
  Calendar,
  Building2,
  MoreVertical,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/status-badge"
import { ScoreBadge } from "@/components/score-badge"
import { updateApplicationStatus } from "./actions"
import type { Application } from "@/lib/types"

interface ApplicationsContentProps {
  applications: Application[]
}

function formatDate(date: string | null) {
  if (!date) return "N/A"
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const columns = [
  { id: "draft", title: "Draft", color: "border-zinc-500" },
  { id: "submitted", title: "Submitted", color: "border-blue-500" },
]

export function ApplicationsContent({ applications }: ApplicationsContentProps) {
  const router = useRouter()
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const handleDragStart = (id: string) => {
    setDraggedId(id)
  }

  const handleDrop = async (status: string) => {
    if (draggedId) {
      await updateApplicationStatus(draggedId, status as Application["status"])
      router.refresh()
      setDraggedId(null)
    }
  }

  const handleStatusChange = async (applicationId: string, status: string) => {
    await updateApplicationStatus(applicationId, status as Application["status"])
    router.refresh()
  }

  const applicationsByStatus = columns.reduce((acc, col) => {
    acc[col.id] = applications.filter(app => app.status === col.id)
    return acc
  }, {} as Record<string, Application[]>)

  const totalCount = applications.length
  const submittedCount = applications.filter(a => a.status === "submitted").length

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Send className="h-6 w-6 text-primary" />
            Applications
          </h1>
          <p className="text-muted-foreground">
            Track and manage your tender applications
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Applications</p>
            <p className="text-2xl font-semibold mt-1">{totalCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">In Progress</p>
            <p className="text-2xl font-semibold mt-1 text-zinc-400">
              {applicationsByStatus["draft"]?.length || 0}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Submitted</p>
            <p className="text-2xl font-semibold mt-1 text-blue-400">{submittedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="grid gap-6 lg:grid-cols-2">
        {columns.map((column) => (
          <div
            key={column.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(column.id)}
            className="space-y-4"
          >
            <div className={`flex items-center gap-2 pb-2 border-b-2 ${column.color}`}>
              <h3 className="font-medium text-foreground">{column.title}</h3>
              <span className="text-sm text-muted-foreground">
                ({applicationsByStatus[column.id]?.length || 0})
              </span>
            </div>
            
            <div className="space-y-3 min-h-96">
              {applicationsByStatus[column.id]?.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-8 text-center">
                  <p className="text-sm text-muted-foreground">No applications</p>
                </div>
              ) : (
                applicationsByStatus[column.id]?.map((app) => (
                  <Card 
                    key={app.id}
                    draggable
                    onDragStart={() => handleDragStart(app.id)}
                    className={`border-border bg-card cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors ${
                      draggedId === app.id ? "opacity-50" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-card-foreground line-clamp-2">
                          {app.tenders?.title || "Unknown Tender"}
                        </h4>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/tenders/${app.tender_id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Tender
                              </Link>
                            </DropdownMenuItem>
                            {app.status === "draft" && (
                              <DropdownMenuItem onClick={() => handleStatusChange(app.id, "submitted")}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark Submitted
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          <span className="truncate">{app.tenders?.organization || "Unknown"}</span>
                        </div>
                        
                        {app.tenders?.deadline && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Due: {formatDate(app.tenders.deadline)}</span>
                          </div>
                        )}
                        
                        {app.documents && app.documents.length > 0 && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <FileText className="h-3 w-3" />
                            <span>{app.documents.length} documents</span>
                          </div>
                        )}
                      </div>

                      {app.tenders?.tender_scores?.[0] && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Score</span>
                            <ScoreBadge score={app.tenders.tender_scores[0].score} size="sm" />
                          </div>
                        </div>
                      )}
                      
                      {app.notes && (
                        <p className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground line-clamp-2">
                          {app.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
