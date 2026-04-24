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
import { getCurrentUserLocal } from '@/lib/supabase/client-auth'
import { ScoreBadge } from '@/components/score-badge'
import { StatusBadge } from '@/components/status-badge'
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

  useEffect(() => {
    const fetchUserData = async () => {
      const user = await getCurrentUserLocal()
      if (user?.user_metadata?.username) {
        setUserName(user.user_metadata.username)
      } else if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name)
      } else if (user?.email) {
        setUserName(user.email.split('@')[0])
      }
    }
    fetchUserData()
  }, [])

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
              <div className="rounded-lg bg-blue-100 p-3">
                <FileSearch className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold">{stats.totalTenders}</h3>
                <p className="text-muted-foreground">Total Tenders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-lg bg-green-100 p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold">{stats.newTenders}</h3>
                <p className="text-muted-foreground">New Tenders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-lg bg-purple-100 p-3">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold">{stats.highScoreTenders}</h3>
                <p className="text-muted-foreground">High Score Tenders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-lg bg-orange-100 p-3">
                <Send className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold">{stats.applicationsInProgress}</h3>
                <p className="text-muted-foreground">Draft Applications</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Recent Tenders (Last 10)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Org</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTenders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No tenders found in the database yet.
                  </TableCell>
                </TableRow>
              ) : recentTenders.map((tender) => (
                <TableRow key={tender.id}>
                  <TableCell className="font-medium">{tender.title}</TableCell>
                  <TableCell>{tender.organization || 'Unknown'}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>{formatDeadline(tender.deadline)}</span>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell>
                    {tender.tender_scores?.[0] ? (
                      <ScoreBadge score={tender.tender_scores[0].score} size="sm" />
                    ) : (
                      <span className="text-sm text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={tender.status} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/tenders/${tender.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4">
            <Button variant="outline" asChild>
              <Link href="/dashboard/tenders">
                View All Tenders
              </Link>
            </Button>
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
