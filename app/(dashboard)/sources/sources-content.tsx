"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Database,
  ExternalLink,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Globe,
  FileCode,
  KeyRound,
  MoreVertical,
  Trash2,
  Pause,
  Play,
  Loader2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toggleSource, addSource, deleteSource } from "./actions"
import type { TenderSource, ScrapeLog } from "@/lib/types"

interface SourcesContentProps {
  sources: TenderSource[]
  scrapeLogs: ScrapeLog[]
  tenderCounts: Record<string, number>
}

function formatRelativeTime(date: string | null) {
  if (!date) return "Never"
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  
  if (diffHours < 1) return "Just now"
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return new Date(date).toLocaleDateString()
}

const typeIcons = {
  html: Globe,
  api: FileCode,
  login: KeyRound,
}

export function SourcesContent({ sources, scrapeLogs, tenderCounts }: SourcesContentProps) {
  const router = useRouter()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [deleteDialogSource, setDeleteDialogSource] = useState<TenderSource | null>(null)
  const [scrapingSourceId, setScrapingSourceId] = useState<string | null>(null)
  const [scrapeMessage, setScrapeMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [newSource, setNewSource] = useState({ name: "", base_url: "", type: "html" })
  const [isDeleting, setIsDeleting] = useState(false)

  const handleToggleSource = async (sourceId: string, isActive: boolean) => {
    await toggleSource(sourceId, isActive)
    router.refresh()
  }

  const handleAddSource = async () => {
    if (newSource.name && newSource.base_url) {
      await addSource(newSource)
      setNewSource({ name: "", base_url: "", type: "html" })
      setIsAddDialogOpen(false)
      router.refresh()
    }
  }

  const handleDeleteSource = async () => {
    if (!deleteDialogSource) return
    setIsDeleting(true)
    try {
      await deleteSource(deleteDialogSource.id)
      setDeleteDialogSource(null)
      router.refresh()
    } catch (error) {
      console.error("Failed to delete source:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleScrapeSource = async (source: TenderSource) => {
    setScrapingSourceId(source.id)
    setScrapeMessage(null)
    
    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId: source.id, url: source.base_url }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setScrapeMessage({ 
          type: "success", 
          text: data.message || `Found ${data.tendersFound} tenders, added ${data.tendersInserted} new` 
        })
        router.refresh()
      } else {
        setScrapeMessage({ type: "error", text: data.error || "Scraping failed" })
      }
    } catch (error) {
      setScrapeMessage({ 
        type: "error", 
        text: error instanceof Error ? error.message : "Scraping failed" 
      })
    } finally {
      setScrapingSourceId(null)
      // Clear message after 5 seconds
      setTimeout(() => setScrapeMessage(null), 5000)
    }
  }

  const activeSources = sources.filter(s => s.is_active).length
  const totalTenders = Object.values(tenderCounts).reduce((a, b) => a + b, 0)
  const recentSuccessRate = scrapeLogs.length > 0 
    ? Math.round((scrapeLogs.filter(l => l.status === "success").length / scrapeLogs.length) * 100)
    : 0

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Database className="h-6 w-6 text-accent" />
            Tender Sources
          </h1>
          <p className="text-muted-foreground">
            Manage your tender data sources and scraping configuration
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Source
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Add New Source</DialogTitle>
              <DialogDescription>
                Enter the website URL to scrape for tenders. The system will automatically find and extract tender listings.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Source Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Kenya Government Tenders"
                  value={newSource.name}
                  onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Website URL</Label>
                <Input
                  id="url"
                  placeholder="https://example.com/tenders"
                  value={newSource.base_url}
                  onChange={(e) => setNewSource({ ...newSource, base_url: e.target.value })}
                  className="bg-background border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the main page URL. The scraper will find tender listings and follow relevant links.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Source Type</Label>
                <Select 
                  value={newSource.type} 
                  onValueChange={(value) => setNewSource({ ...newSource, type: value })}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="html">HTML Scraping</SelectItem>
                    <SelectItem value="api">API Integration</SelectItem>
                    <SelectItem value="login">Login Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSource} className="bg-primary hover:bg-primary/90">
                Add Source
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Scrape Message */}
      {scrapeMessage && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          scrapeMessage.type === "success" 
            ? "bg-success/10 text-success border border-success/20" 
            : "bg-destructive/10 text-destructive border border-destructive/20"
        }`}>
          {scrapeMessage.type === "success" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{scrapeMessage.text}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Sources</p>
            <p className="text-2xl font-semibold mt-1 text-foreground">{sources.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active Sources</p>
            <p className="text-2xl font-semibold mt-1 text-success">{activeSources}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Tenders Collected</p>
            <p className="text-2xl font-semibold mt-1 text-foreground">{totalTenders}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Success Rate</p>
            <p className="text-2xl font-semibold mt-1 text-foreground">{recentSuccessRate}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sources List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-medium text-foreground">Configured Sources</h2>
          
          {sources.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="p-12 text-center">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No sources configured yet</p>
                <Button className="mt-4 bg-primary hover:bg-primary/90" onClick={() => setIsAddDialogOpen(true)}>
                  Add Your First Source
                </Button>
              </CardContent>
            </Card>
          ) : (
            sources.map((source) => {
              const TypeIcon = typeIcons[source.type as keyof typeof typeIcons] || Globe
              const tenderCount = tenderCounts[source.id] || 0
              const isCurrentlyScraping = scrapingSourceId === source.id
              
              return (
                <Card 
                  key={source.id}
                  className={`border-border bg-card ${!source.is_active ? "opacity-60" : ""}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`rounded-lg p-2.5 ${source.is_active ? "bg-accent/10" : "bg-secondary"}`}>
                          <TypeIcon className={`h-5 w-5 ${source.is_active ? "text-accent" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-card-foreground">{source.name}</h3>
                            <span className="text-xs rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">
                              {source.type.toUpperCase()}
                            </span>
                          </div>
                          <a 
                            href={source.base_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-accent flex items-center gap-1 mt-1"
                          >
                            {source.base_url}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              Last scraped: {formatRelativeTime(source.last_scraped_at)}
                            </span>
                            <span>{tenderCount} tenders</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleScrapeSource(source)}
                          disabled={isCurrentlyScraping || !source.is_active}
                          className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                        >
                          {isCurrentlyScraping ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Scraping...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Scrape Now
                            </>
                          )}
                        </Button>
                        <Switch
                          checked={source.is_active}
                          onCheckedChange={(checked) => handleToggleSource(source.id, checked)}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleScrapeSource(source)} disabled={isCurrentlyScraping}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Run Scrape Now
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleSource(source.id, !source.is_active)}>
                              {source.is_active ? (
                                <>
                                  <Pause className="h-4 w-4 mr-2" />
                                  Pause Source
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-2" />
                                  Activate Source
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteDialogSource(source)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Source
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Recent Scrape Activity */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-foreground">Recent Activity</h2>
          <Card className="border-border bg-card">
            <CardContent className="p-4 space-y-3">
              {scrapeLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No scrape activity yet
                </p>
              ) : (
                scrapeLogs.slice(0, 10).map((log) => (
                  <div 
                    key={log.id}
                    className="flex items-start gap-3 py-2 border-b border-border last:border-0"
                  >
                    {log.status === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">
                        {log.tender_sources?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.status === "success" 
                          ? `Found ${log.records_found} tenders`
                          : log.error || "Failed"
                        }
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatRelativeTime(log.run_time)}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialogSource} onOpenChange={(open) => !open && setDeleteDialogSource(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Source</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteDialogSource?.name}&quot;? This will also remove all tenders associated with this source. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSource}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Source"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
