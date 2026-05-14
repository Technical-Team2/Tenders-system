"use client"

import React, { useEffect, useState } from 'react'
import Link from "next/link"
import { 
  FileSearch, 
  Send, 
  Clock, 
  Database,
  TrendingUp,
  Plus,
  Bot,
  Eye,
  RefreshCw,
  Target,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/lib/auth/context'
import { ScoreBadge } from '@/components/score-badge'
import { cn } from '@/lib/utils'
import type { Application, DashboardStats, ScrapeLog, Tender } from '@/lib/types'

interface Activity {
  id: string
  type: 'tender_added' | 'application_submitted' | 'scrape_completed'
  message: string
  timestamp: string
}

interface DashboardContentProps {
  stats: DashboardStats
  recentTenders: Tender[]
  recentApplications: Application[]
  scrapeLogs: ScrapeLog[]
}

function formatCurrency(amount: number | null, currency: string = "USD") {
  if (!amount) return "N/A"

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

function formatDeadline(deadline: string | null) {
  if (!deadline) return 'No deadline'

  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diffMs = deadlineDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'Expired'
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  return `${diffDays} days`
}

function formatRelativeTime(timestamp: string) {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  
  if (diffHours < 1) return "Just now"
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

export function DashboardContent({ 
  stats, 
  recentTenders, 
  recentApplications, 
  scrapeLogs 
}: DashboardContentProps) {
  const [userName, setUserName] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user?.user_metadata?.username) {
      setUserName(user.user_metadata.username)
    } else if (user?.user_metadata?.full_name) {
      setUserName(user.user_metadata.full_name)
    } else if (user?.email) {
      setUserName(user.email.split('@')[0])
    } else {
      setUserName(null)
    }
  }, [user])

  const highScoreTenders = [...recentTenders]
    .filter((tender) => (tender.tender_scores?.[0]?.score ?? 0) >= 80)
    .sort((a, b) => (b.tender_scores?.[0]?.score ?? 0) - (a.tender_scores?.[0]?.score ?? 0))
    .slice(0, 5)

  const activities: Activity[] = [
    ...recentTenders.map((tender) => ({
      id: `tender-${tender.id}`,
      type: 'tender_added' as const,
      message: `New tender "${tender.title}" added`,
      timestamp: tender.created_at,
    })),
    ...recentApplications.map((application) => ({
      id: `application-${application.id}`,
      type: 'application_submitted' as const,
      message: `Application ${application.status === 'submitted' ? 'submitted' : 'started'} for "${application.tenders?.title || 'Unknown Tender'}"`,
      timestamp: application.submitted_at || application.created_at,
    })),
    ...scrapeLogs
      .filter((log) => log.status === 'success')
      .map((log) => ({
        id: `scrape-${log.id}`,
        type: 'scrape_completed' as const,
        message: `${log.tender_sources?.name || 'Source'} scrape completed with ${log.records_found} records found`,
        timestamp: log.run_time,
      })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8)

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, {userName || 'User'}!
          </h2>
          <p className="text-muted-foreground">
            Here are your latest tender opportunities
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-lg bg-blue-100 p-3 flex-shrink-0">
                <FileSearch className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <h3 className="text-2xl font-bold truncate">{stats.totalTenders}</h3>
                <p className="text-muted-foreground text-sm">Total Tenders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-lg bg-green-100 p-3 flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <h3 className="text-2xl font-bold truncate">{stats.newTenders}</h3>
                <p className="text-muted-foreground text-sm">New Tenders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-lg bg-purple-100 p-3 flex-shrink-0">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <h3 className="text-2xl font-bold truncate">{stats.highScoreTenders}</h3>
                <p className="text-muted-foreground text-sm">High Score Tenders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-lg bg-orange-100 p-3 flex-shrink-0">
                <Send className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <h3 className="text-2xl font-bold truncate">{stats.applicationsInProgress}</h3>
                <p className="text-muted-foreground text-sm">Draft Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/dashboard/tenders">
                <FileSearch className="mr-2 h-4 w-4" />
                Review Tenders
              </Link>
            </Button>

            <Button asChild>
              <Link href="/dashboard/applications">
                <Send className="mr-2 h-4 w-4" />
                Applications
              </Link>
            </Button>

            <Button asChild>
              <Link href="/dashboard/assistant">
                <Bot className="mr-2 h-4 w-4" />
                AI Assistant
              </Link>
            </Button>

            <Button asChild variant="outline">
              <Link href="/dashboard/sources">
                <Database className="mr-2 h-4 w-4" />
                Manage Sources
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <CardTitle className="text-xl font-bold">Recent Tenders (Last 10)</CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-600 font-semibold" asChild>
            <Link href="/dashboard/tenders">
              View All
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-slate-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="font-bold text-slate-700 py-4">Tender Title</TableHead>
                  <TableHead className="font-bold text-slate-700">Organization</TableHead>
                  <TableHead className="font-bold text-slate-700">Category</TableHead>
                  <TableHead className="font-bold text-slate-700">Deadline</TableHead>
                  <TableHead className="font-bold text-slate-700">Priority</TableHead>
                  <TableHead className="font-bold text-slate-700">Score</TableHead>
                  <TableHead className="font-bold text-slate-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTenders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No tenders found in the database yet.
                    </TableCell>
                  </TableRow>
                ) : recentTenders.map((tender) => (
                  <TableRow key={tender.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-semibold text-slate-900 py-4">
                      <div className="max-w-[300px] truncate" title={tender.title}>
                        {tender.title}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      <div className="max-w-[200px] truncate" title={tender.organization || 'N/A'}>
                        {tender.organization || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        {tender.categories?.[0] || tender.sector || 'General'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-sm whitespace-nowrap">{formatDeadline(tender.deadline)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        tender.priority === 'high' ? "bg-red-50 text-red-600" :
                        tender.priority === 'medium' ? "bg-amber-50 text-amber-600" :
                        "bg-blue-50 text-blue-600"
                      )}>
                        {(tender.priority || 'Medium').toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {tender.tender_scores?.[0] ? (
                        <ScoreBadge score={tender.tender_scores[0].score} size="sm" />
                      ) : (
                        <span className="text-xs font-medium text-slate-400">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" asChild>
                        <Link href={`/dashboard/tenders/${tender.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>


      {/* High Score Tenders */}
      <Card>
        <CardHeader>
          <CardTitle>High Score Tenders (Score &ge; 80)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {highScoreTenders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No high-score tenders found in the recent database records.
              </p>
            ) : highScoreTenders.map((tender) => (
              <div key={tender.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{tender.title}</h4>
                  <p className="text-sm text-muted-foreground">{tender.organization || 'Unknown'}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm">{formatCurrency(tender.budget, tender.currency)}</span>
                    <span className="text-sm">{formatDeadline(tender.deadline)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {tender.tender_scores?.[0] && (
                    <ScoreBadge score={tender.tender_scores[0].score} size="sm" />
                  )}
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/tenders/${tender.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No recent activity found.
                </p>
              ) : activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="rounded-full bg-muted p-2">
                    {activity.type === 'tender_added' && <Plus className="h-4 w-4" />}
                    {activity.type === 'application_submitted' && <Send className="h-4 w-4" />}
                    {activity.type === 'scrape_completed' && <RefreshCw className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{formatRelativeTime(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
