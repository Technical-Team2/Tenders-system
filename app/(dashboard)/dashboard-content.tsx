"use client"

import React, { useState, useEffect } from 'react'
import Link from "next/link"
import { 
  FileSearch, 
  Send, 
  Trophy, 
  Clock, 
  Database,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Plus,
  Bot,
  Building,
  Calendar,
  DollarSign,
  Eye,
  RefreshCw,
  Search,
  Target,
  User,
  X,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { getCurrentUserLocal } from '@/lib/supabase/client-auth'

interface Tender {
  id: string
  title: string
  organization: string
  deadline: string
  budget: number
  currency: string
  score: number
  status: 'New' | 'Reviewed' | 'Applied' | 'Shortlisted' | 'Rejected' | 'Closed'
  createdAt: string
}

interface Activity {
  id: string
  type: 'tender_added' | 'application_submitted' | 'status_changed'
  message: string
  timestamp: string
  details?: any
}

interface DashboardContentProps {
  stats?: any
  recentTenders?: any[]
  recentApplications?: any[]
  scrapeLogs?: any[]
}

function formatCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

function formatDeadline(deadline: string) {
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

function getScoreColor(score: number) {
  if (score >= 80) return 'text-green-600 bg-green-100'
  if (score >= 60) return 'text-yellow-600 bg-yellow-100'
  return 'text-red-600 bg-red-100'
}

function getStatusColor(status: string) {
  switch (status) {
    case 'New': return 'bg-blue-100 text-blue-800'
    case 'Reviewed': return 'bg-purple-100 text-purple-800'
    case 'Applied': return 'bg-green-100 text-green-800'
    case 'Shortlisted': return 'bg-orange-100 text-orange-800'
    case 'Rejected': return 'bg-red-100 text-red-800'
    case 'Closed': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function DashboardContent({ 
  stats, 
  recentTenders, 
  recentApplications, 
  scrapeLogs 
}: DashboardContentProps) {
  const [tenders, setTenders] = useState<Tender[]>([])
  const [highScoreTenders, setHighScoreTenders] = useState<Tender[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [isScrapeModalOpen, setIsScrapeModalOpen] = useState(false)
  const [isExtractModalOpen, setIsExtractModalOpen] = useState(false)
  const [isScraping, setIsScraping] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [scrapeUrl, setScrapeUrl] = useState('')
  const [extractUrl, setExtractUrl] = useState('')
  const [userName, setUserName] = useState<string | null>(null)

  // Fetch user data
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

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockTenders: Tender[] = [
      {
        id: '1',
        title: 'Government IT Infrastructure Modernization',
        organization: 'Federal Procurement Agency',
        deadline: '2024-04-25',
        budget: 250000,
        currency: 'USD',
        score: 92,
        status: 'New',
        createdAt: '2024-04-10T10:30:00'
      },
      {
        id: '2',
        title: 'Healthcare Equipment Supply',
        organization: 'Ministry of Health',
        deadline: '2024-04-28',
        budget: 180000,
        currency: 'USD',
        score: 78,
        status: 'Reviewed',
        createdAt: '2024-04-09T14:20:00'
      },
      {
        id: '3',
        title: 'Educational Software Development',
        organization: 'Department of Education',
        deadline: '2024-05-02',
        budget: 320000,
        currency: 'USD',
        score: 85,
        status: 'Applied',
        createdAt: '2024-04-08T09:15:00'
      },
      {
        id: '4',
        title: 'Transportation System Upgrade',
        organization: 'Transport Authority',
        deadline: '2024-04-22',
        budget: 450000,
        currency: 'USD',
        score: 68,
        status: 'New',
        createdAt: '2024-04-11T16:45:00'
      },
      {
        id: '5',
        title: 'Agricultural Technology Implementation',
        organization: 'Agriculture Ministry',
        deadline: '2024-04-30',
        budget: 150000,
        currency: 'USD',
        score: 81,
        status: 'Shortlisted',
        createdAt: '2024-04-07T11:30:00'
      },
      {
        id: '6',
        title: 'Renewable Energy Installation',
        organization: 'Energy Commission',
        deadline: '2024-05-05',
        budget: 680000,
        currency: 'USD',
        score: 89,
        status: 'New',
        createdAt: '2024-04-12T13:20:00'
      },
      {
        id: '7',
        title: 'Water Management System',
        organization: 'Water Resources Authority',
        deadline: '2024-04-20',
        budget: 290000,
        currency: 'USD',
        score: 73,
        status: 'Reviewed',
        createdAt: '2024-04-06T10:10:00'
      },
      {
        id: '8',
        title: 'Digital Transformation Consulting',
        organization: 'Digital Services Agency',
        deadline: '2024-04-26',
        budget: 195000,
        currency: 'USD',
        score: 77,
        status: 'Applied',
        createdAt: '2024-04-05T15:30:00'
      },
      {
        id: '9',
        title: 'Security System Implementation',
        organization: 'National Security Department',
        deadline: '2024-04-24',
        budget: 380000,
        currency: 'USD',
        score: 84,
        status: 'New',
        createdAt: '2024-04-13T09:45:00'
      },
      {
        id: '10',
        title: 'Public Works Maintenance',
        organization: 'Public Works Ministry',
        deadline: '2024-04-23',
        budget: 125000,
        currency: 'USD',
        score: 65,
        status: 'Rejected',
        createdAt: '2024-04-04T14:20:00'
      }
    ]
    
    setTenders(mockTenders.slice(0, 10)) // Last 10 tenders
    setHighScoreTenders(mockTenders.filter(t => t.score >= 80))

    const mockActivities: Activity[] = [
      {
        id: '1',
        type: 'tender_added',
        message: 'New tender "Security System Implementation" added',
        timestamp: '2024-04-13T09:45:00',
        details: { score: 84, organization: 'National Security Department' }
      },
      {
        id: '2',
        type: 'application_submitted',
        message: 'Application submitted for "Digital Transformation Consulting"',
        timestamp: '2024-04-12T16:30:00',
        details: { status: 'Applied' }
      },
      {
        id: '3',
        type: 'status_changed',
        message: 'Tender "Educational Software Development" status changed to Applied',
        timestamp: '2024-04-11T11:20:00',
        details: { oldStatus: 'Reviewed', newStatus: 'Applied' }
      },
      {
        id: '4',
        type: 'tender_added',
        message: 'New tender "Renewable Energy Installation" added',
        timestamp: '2024-04-12T13:20:00',
        details: { score: 89, organization: 'Energy Commission' }
      },
      {
        id: '5',
        type: 'status_changed',
        message: 'Tender "Agricultural Technology Implementation" status changed to Shortlisted',
        timestamp: '2024-04-10T14:15:00',
        details: { oldStatus: 'Applied', newStatus: 'Shortlisted' }
      }
    ]
    
    setActivities(mockActivities)
  }, [])

  const handleScrapeNewTenders = async () => {
    if (!scrapeUrl) {
      toast.error('Please enter a URL to scrape')
      return
    }
    
    setIsScraping(true)
    
    // Simulate API call
    setTimeout(() => {
      const newTender: Tender = {
        id: Date.now().toString(),
        title: 'Newly Scraped Tender',
        organization: 'Scraped Organization',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        budget: 200000,
        currency: 'USD',
        score: 75,
        status: 'New',
        createdAt: new Date().toISOString()
      }
      
      setTenders(prev => [newTender, ...prev.slice(0, 9)])
      setIsScraping(false)
      setIsScrapeModalOpen(false)
      setScrapeUrl('')
      toast.success('Successfully scraped new tenders')
    }, 2000)
  }

  const handleExtractCompany = async () => {
    if (!extractUrl) {
      toast.error('Please enter a URL to extract company info')
      return
    }
    
    setIsExtracting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsExtracting(false)
      setIsExtractModalOpen(false)
      setExtractUrl('')
      toast.success('Company information extracted successfully')
    }, 3000)
  }

  const dashboardStats = {
    totalTenders: 247,
    newThisWeek: 18,
    avgScore: 72,
    pendingApps: 5
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header */}
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-lg bg-blue-100 p-3">
                <FileSearch className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold">{dashboardStats.totalTenders}</h3>
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
                <h3 className="text-2xl font-bold">{dashboardStats.newThisWeek}</h3>
                <p className="text-muted-foreground">New This Week</p>
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
                <h3 className="text-2xl font-bold">{dashboardStats.avgScore}</h3>
                <p className="text-muted-foreground">Avg Score</p>
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
                <h3 className="text-2xl font-bold">{dashboardStats.pendingApps}</h3>
                <p className="text-muted-foreground">Pending Apps</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Dialog open={isScrapeModalOpen} onOpenChange={setIsScrapeModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Search className="mr-2 h-4 w-4" />
                  Scrape New Tenders
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Scrape New Tenders</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="scrape-url">Website URL</Label>
                    <Input
                      id="scrape-url"
                      placeholder="https://example.com/tenders"
                      value={scrapeUrl}
                      onChange={(e) => setScrapeUrl(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsScrapeModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleScrapeNewTenders} disabled={isScraping}>
                      {isScraping ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Scraping...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Scrape Tenders
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button asChild>
              <Link href="/assistant">
                <Bot className="mr-2 h-4 w-4" />
                AI Assistant
              </Link>
            </Button>

            <Dialog open={isExtractModalOpen} onOpenChange={setIsExtractModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Building className="mr-2 h-4 w-4" />
                  Extract Company
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Extract Company Information</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="extract-url">Company Website URL</Label>
                    <Input
                      id="extract-url"
                      placeholder="https://company.com"
                      value={extractUrl}
                      onChange={(e) => setExtractUrl(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsExtractModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleExtractCompany} disabled={isExtracting}>
                      {isExtracting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Extracting...
                        </>
                      ) : (
                        <>
                          <Building className="mr-2 h-4 w-4" />
                          Extract Info
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Recent Tenders */}
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
              {tenders.map((tender) => (
                <TableRow key={tender.id}>
                  <TableCell className="font-medium">{tender.title}</TableCell>
                  <TableCell>{tender.organization}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>{formatDeadline(tender.deadline)}</span>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getScoreColor(tender.score)}>
                      {tender.score}/100
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(tender.status)}>
                      {tender.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/tenders/${tender.id}`}>
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
              <Link href="/tenders">
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
            {highScoreTenders.map((tender) => (
              <div key={tender.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{tender.title}</h4>
                  <p className="text-sm text-muted-foreground">{tender.organization}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm">{formatCurrency(tender.budget, tender.currency)}</span>
                    <span className="text-sm">{formatDeadline(tender.deadline)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getScoreColor(tender.score)}>
                    {tender.score}/100
                  </Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/tenders/${tender.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="rounded-full bg-muted p-2">
                    {activity.type === 'tender_added' && <Plus className="h-4 w-4" />}
                    {activity.type === 'application_submitted' && <Send className="h-4 w-4" />}
                    {activity.type === 'status_changed' && <RefreshCw className="h-4 w-4" />}
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
