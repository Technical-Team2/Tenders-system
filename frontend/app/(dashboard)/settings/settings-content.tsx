"use client"

import { useState } from "react"
import { 
  Settings,
  Building2,
  Bell,
  Shield,
  Palette,
  Globe,
  Save,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function SettingsContent() {
  const [companyProfile, setCompanyProfile] = useState({
    name: "Acme Technologies",
    description: "Leading provider of cloud infrastructure and cybersecurity solutions. Specializing in government and enterprise digital transformation projects.",
    sectors: ["IT Services", "Cybersecurity", "Cloud Infrastructure"],
    locations: ["United States", "United Kingdom", "Singapore"],
    certifications: ["ISO 27001", "SOC 2 Type II", "FedRAMP Moderate"],
  })

  const [notifications, setNotifications] = useState({
    newTenders: true,
    deadlineReminders: true,
    scoreThreshold: 70,
    emailDigest: "daily",
  })

  const [scrapeSettings, setScrapeSettings] = useState({
    frequency: "daily",
    maxConcurrent: 3,
    retryOnFailure: true,
  })

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground">
          Configure your tender intelligence system
        </p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4" />
            Company Profile
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Scoring
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="scraping" className="gap-2">
            <Globe className="h-4 w-4" />
            Scraping
          </TabsTrigger>
        </TabsList>

        {/* Company Profile Tab */}
        <TabsContent value="company" className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                This information is used by the AI to score tender relevance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={companyProfile.name}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, name: e.target.value })}
                  className="bg-secondary border-border"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Company Description</Label>
                <Textarea
                  id="description"
                  value={companyProfile.description}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, description: e.target.value })}
                  className="bg-secondary border-border min-h-32"
                  placeholder="Describe your company's core competencies and services..."
                />
              </div>

              <div className="space-y-2">
                <Label>Target Sectors</Label>
                <div className="flex flex-wrap gap-2">
                  {companyProfile.sectors.map((sector, index) => (
                    <span 
                      key={index}
                      className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                    >
                      {sector}
                    </span>
                  ))}
                  <Button variant="outline" size="sm" className="rounded-full">
                    + Add Sector
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Certifications</Label>
                <div className="flex flex-wrap gap-2">
                  {companyProfile.certifications.map((cert, index) => (
                    <span 
                      key={index}
                      className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400"
                    >
                      {cert}
                    </span>
                  ))}
                  <Button variant="outline" size="sm" className="rounded-full">
                    + Add Certification
                  </Button>
                </div>
              </div>

              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Scoring Tab */}
        <TabsContent value="ai" className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>AI Scoring Configuration</CardTitle>
              <CardDescription>
                Configure how tenders are scored against your company profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Relevance Weight</Label>
                    <p className="text-sm text-muted-foreground">
                      How important is sector and service alignment
                    </p>
                  </div>
                  <Select defaultValue="high">
                    <SelectTrigger className="w-32 bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Budget Fit Weight</Label>
                    <p className="text-sm text-muted-foreground">
                      Consider tender budget in scoring
                    </p>
                  </div>
                  <Select defaultValue="medium">
                    <SelectTrigger className="w-32 bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Competition Analysis</Label>
                    <p className="text-sm text-muted-foreground">
                      Factor in estimated competition level
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Geographic Preference</Label>
                    <p className="text-sm text-muted-foreground">
                      Boost scores for preferred locations
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Control when and how you receive alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>New Tender Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new high-score tenders are found
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.newTenders}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, newTenders: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Deadline Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Remind me about upcoming application deadlines
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.deadlineReminders}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, deadlineReminders: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Minimum Score Threshold</Label>
                  <p className="text-sm text-muted-foreground">
                    Only alert for tenders with score above this value
                  </p>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={notifications.scoreThreshold}
                    onChange={(e) => 
                      setNotifications({ ...notifications, scoreThreshold: parseInt(e.target.value) || 0 })
                    }
                    className="w-32 bg-secondary border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email Digest Frequency</Label>
                  <Select 
                    value={notifications.emailDigest}
                    onValueChange={(value) => 
                      setNotifications({ ...notifications, emailDigest: value })
                    }
                  >
                    <SelectTrigger className="w-48 bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Summary</SelectItem>
                      <SelectItem value="none">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scraping Tab */}
        <TabsContent value="scraping" className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Scraping Configuration</CardTitle>
              <CardDescription>
                Configure how tender sources are scraped
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Scrape Frequency</Label>
                  <Select 
                    value={scrapeSettings.frequency}
                    onValueChange={(value) => 
                      setScrapeSettings({ ...scrapeSettings, frequency: value })
                    }
                  >
                    <SelectTrigger className="w-48 bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Every Hour</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Max Concurrent Scrapes</Label>
                  <p className="text-sm text-muted-foreground">
                    Number of sources to scrape simultaneously
                  </p>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={scrapeSettings.maxConcurrent}
                    onChange={(e) => 
                      setScrapeSettings({ ...scrapeSettings, maxConcurrent: parseInt(e.target.value) || 1 })
                    }
                    className="w-32 bg-secondary border-border"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-retry on Failure</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically retry failed scrapes
                    </p>
                  </div>
                  <Switch 
                    checked={scrapeSettings.retryOnFailure}
                    onCheckedChange={(checked) => 
                      setScrapeSettings({ ...scrapeSettings, retryOnFailure: checked })
                    }
                  />
                </div>
              </div>

              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
