"use client"

import React, { useMemo, useState } from 'react'
import {
  Building2,
  Database,
  ExternalLink,
  FileText,
  Globe2,
  Layers3,
  LinkIcon,
  Loader2,
  Mail,
  MapPin,
  Network,
  Phone,
  Sparkles,
  Target,
  Workflow,
  Clock,
  CheckCircle2,
  Cpu,
  Bot,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Github,
  Users,
} from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { useToast } from '@/hooks/use-toast'
import { API_BASE_URL } from '@/lib/api/config'
import { cn } from '@/lib/utils'

type ContactInfo = {
  emails?: string[]
  phones?: string[]
  addresses?: string[]
  whatsapp?: string[]
  contactForms?: string[]
  supportLinks?: string[]
}

type CompanyInfo = {
  name?: string | null
  website?: string | null
  tagline?: string | null
  description?: string | null
  about?: string | null
  industry?: string | null
  businessCategory?: string | null
  businessType?: string | null
  yearFounded?: string | null
  companySize?: string | null
  headquarters?: string | null
  services?: string[]
  products?: string[]
  technologies?: string[]
  platforms?: string[]
  businessFocus?: string[]
  operationalCapabilities?: string[]
  valuePropositions?: string[]
  companyPositioning?: string[]
  targetCustomers?: string[]
  automationCapabilities?: string[]
  integrations?: string[]
  keywords?: string[]
  metaDescription?: string | null
  pageTitle?: string | null
  canonicalUrl?: string | null
  ogData?: Record<string, string | null>
  contacts?: ContactInfo
  socialLinks?: Record<string, string | null>
  digitalPresence?: Record<string, any>
  intelligenceSummary?: string | null
}

const hasItems = (items?: unknown[]) => Array.isArray(items) && items.length > 0
const compact = (items?: Array<string | null | undefined>) => (items || []).filter(Boolean) as string[]

function isValidUrl(value: string) {
  if (!value.trim()) return false
  try {
    new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`)
    return true
  } catch {
    return false
  }
}

function SectionCard({ title, icon: Icon, color, items }: { title: string, icon: any, color: string, items: string[] }) {
  return (
    <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden group/card hover:border-blue-200 transition-all">
      <div className={`p-6 border-b border-slate-50 bg-${color}-50/30 flex items-center gap-3`}>
        <div className={`p-2 rounded-xl bg-${color}-100 text-${color}-600 group-hover/card:bg-${color}-600 group-hover/card:text-white transition-all`}>
          <Icon className="h-4 w-4" />
        </div>
        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{title}</h4>
      </div>
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <Badge key={i} variant="outline" className="bg-white border-slate-100 text-slate-500 font-bold px-3 py-1.5 rounded-xl">
              {item}
            </Badge>
          ))}
          {items.length === 0 && <p className="text-xs font-bold text-slate-300 italic">No entries identified.</p>}
        </div>
      </CardContent>
    </Card>
  )
}

function ContactList({ icon: Icon, items, label }: { icon: any, items?: string[], label: string }) {
  if (!hasItems(items)) return null
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="space-y-1">
        {items?.map((item, i) => (
          <p key={i} className="text-sm font-bold text-slate-700 truncate hover:text-blue-600 cursor-pointer">{item}</p>
        ))}
      </div>
    </div>
  )
}

function SocialIcon({ label }: { label: string }) {
  const l = label.toLowerCase()
  if (l.includes('twitter') || l === 'x') return <Twitter className="h-5 w-5" />
  if (l.includes('linkedin')) return <Linkedin className="h-5 w-5" />
  if (l.includes('facebook')) return <Facebook className="h-5 w-5" />
  if (l.includes('instagram')) return <Instagram className="h-5 w-5" />
  if (l.includes('github')) return <Github className="h-5 w-5" />
  return <Globe2 className="h-5 w-5" />
}

function PresenceCard({ label, value, fullWidth }: { label: string, value?: string | null, fullWidth?: boolean }) {
  return (
    <div className={cn("space-y-2 p-6 rounded-2xl bg-white border border-slate-100", fullWidth && "md:col-span-2 lg:col-span-4")}>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-slate-700 leading-relaxed truncate">{value || 'N/A'}</p>
    </div>
  )
}

function Section({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-slate-50 text-slate-400">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function BadgeCloud({ items, variant = 'secondary' }: { items?: string[]; variant?: 'secondary' | 'outline' }) {
  if (!hasItems(items)) return <p className="text-sm text-muted-foreground">No items found on the scanned page.</p>
  return (
    <div className="flex flex-wrap gap-2">
      {items!.map((item) => (
        <Badge key={item} variant={variant} className="max-w-full whitespace-normal rounded-md px-2.5 py-1 text-left">
          {item}
        </Badge>
      ))}
    </div>
  )
}

function LoadingProfile() {
  return (
    <div className="space-y-5 rounded-lg border bg-muted/30 p-5">
      <div className="space-y-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    </div>
  )
}

export function CompanyScraperCard() {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('lastExtractedCompany')
        return cached ? JSON.parse(cached) : null
      } catch {
        return null
      }
    }
    return null
  })
  const { toast } = useToast()

  const urlLooksValid = isValidUrl(url)
  const hasCompanyData = Boolean(companyInfo)
  const services = useMemo(() => compact([...(companyInfo?.services || []), ...(companyInfo?.products || [])]), [companyInfo])
  const techStack = useMemo(() => compact([...(companyInfo?.technologies || []), ...(companyInfo?.platforms || [])]), [companyInfo])
  const socialLinks = Object.entries(companyInfo?.socialLinks || {}).filter(([, value]) => Boolean(value)) as [string, string][]

  const handleExtract = async () => {
    if (!urlLooksValid) {
      toast({ title: 'Enter a valid website URL', description: 'Use a company domain like https://example.com.', variant: 'destructive' })
      return
    }

    setLoading(true)
    setCompanyInfo(null)
    try {
      const normalizedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`
      const res = await fetch(`${API_BASE_URL}/api/ai/extract-company`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizedUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to extract company info')
      setCompanyInfo(data)
      
      // Store in localStorage for persistence across navigations
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastExtractedCompany', JSON.stringify(data))
      }

      toast({ title: 'Extraction successful', description: `Data retrieved for ${data.name || url}.`, variant: 'default' })
    } catch (e: any) {
      toast({ title: 'Extraction failed', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* <Button variant="outline" onClick={() => setOpen(true)}>
        <Database className="mr-2 h-4 w-4" />
        Extract Company Info
      </Button> */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Extract Company Information
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-8 p-1">
            <div className="flex flex-col gap-4 sm:flex-row items-center p-2 rounded-[2rem] bg-slate-50 border border-slate-100 focus-within:bg-white focus-within:border-blue-200 focus-within:shadow-2xl focus-within:shadow-blue-500/5 transition-all">
              <div className="flex-1 w-full px-4">
                <Input
                  placeholder="Analyze company domain (e.g. https://signox.co.ke)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !loading && urlLooksValid) handleExtract()
                  }}
                  disabled={loading}
                  className="border-none bg-transparent focus-visible:ring-0 text-lg font-medium placeholder:text-slate-400 h-12"
                />
              </div>
              <Button 
                onClick={handleExtract} 
                disabled={loading || !urlLooksValid} 
                className="shrink-0 h-12 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 text-sm font-black uppercase tracking-widest transition-all active:scale-95"
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                {loading ? 'Processing...' : 'Run Intelligence Scan'}
              </Button>
            </div>

            {loading && <LoadingProfile />}

            {!loading && !hasCompanyData && (
              <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 rounded-[3rem] border-2 border-dashed border-slate-100 bg-slate-50/50">
                <div className="p-6 rounded-3xl bg-white shadow-xl border border-slate-100">
                  <Globe2 className="h-12 w-12 text-blue-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Ready for Extraction</h3>
                  <p className="text-slate-500 max-w-sm font-medium">
                    Enter a corporate URL above to start the autonomous intelligence gathering process.
                  </p>
                </div>
              </div>
            )}

            {!loading && companyInfo && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Hero Card */}
                <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-12 text-white shadow-2xl">
                  <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/20 to-transparent skew-x-12 transform translate-x-20" />
                  <div className="relative z-10 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                      <div className="space-y-6 flex-1">
                        <div className="space-y-3">
                          <Badge className="bg-blue-500 text-white border-none px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em]">
                            Verified Intelligence Profile
                          </Badge>
                          <h2 className="text-5xl font-black tracking-tight leading-none">{companyInfo.name || 'Organization Identity Pending'}</h2>
                          <p className="text-xl text-blue-100/70 font-medium tracking-tight">
                            {companyInfo.tagline || companyInfo.pageTitle || 'Strategic analysis from public data sources.'}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {compact([companyInfo.industry, companyInfo.businessCategory, companyInfo.businessType]).map((item) => (
                            <div key={item} className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                      {companyInfo.website && (
                        <Button asChild className="bg-white text-slate-900 hover:bg-blue-50 rounded-2xl px-8 h-14 font-black uppercase tracking-widest text-xs shadow-xl">
                          <a href={companyInfo.website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-3 h-5 w-5" />
                            Visit Site
                          </a>
                        </Button>
                      )}
                    </div>
                    
                    <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-2xl">
                      <p className="text-lg leading-relaxed text-blue-50/90 font-medium italic">
                        "{companyInfo.description || companyInfo.about || 'Autonomous scan found no explicit mission statement on the target page.'}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                  <div className="lg:col-span-2 space-y-8">
                    {/* Intelligence Summary */}
                    <Card className="rounded-[2.5rem] border-slate-100 shadow-sm overflow-hidden">
                      <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/30">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-2xl bg-blue-100 text-blue-600">
                            <Sparkles className="h-6 w-6" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-black uppercase tracking-tight">AI Synthesis</CardTitle>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Strategic Intelligence Report</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-10 text-lg leading-relaxed text-slate-600 font-medium">
                        {companyInfo.intelligenceSummary || 'Insufficient textual data for detailed AI synthesis.'}
                      </CardContent>
                    </Card>

                    {/* Offerings Grid */}
                    <div className="grid md:grid-cols-2 gap-8">
                      <SectionCard title="Core Services" icon={Layers3} color="indigo" items={services} />
                      <SectionCard title="Tech Ecosystem" icon={Network} color="blue" items={techStack} />
                    </div>

                    {/* Strategic Insights */}
                    <Card className="rounded-[2.5rem] border-slate-100 shadow-sm">
                      <CardContent className="p-10 space-y-10">
                        <Section title="Strategic Positioning" icon={Target}>
                          <div className="grid gap-3">
                            {compact([...(companyInfo.companyPositioning || []), ...(companyInfo.valuePropositions || [])]).map((pos, i) => (
                              <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-700 flex items-start gap-3">
                                <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                                {pos}
                              </div>
                            ))}
                          </div>
                        </Section>
                        <Section title="Capabilities & Automation" icon={Workflow}>
                          <div className="flex flex-wrap gap-2">
                            {compact([...(companyInfo.operationalCapabilities || []), ...(companyInfo.automationCapabilities || [])]).map((cap, i) => (
                              <Badge key={i} className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-4 py-2 rounded-xl text-xs font-bold">
                                {cap}
                              </Badge>
                            ))}
                          </div>
                        </Section>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-8">
                    {/* Key Stats */}
                    <Card className="rounded-[2.5rem] border-slate-100 shadow-sm bg-blue-50/30">
                      <CardContent className="p-8 space-y-6">
                        <h3 className="text-xs font-black text-blue-900/40 uppercase tracking-[0.2em] mb-4">Firmographics</h3>
                        {[
                          ['Location', companyInfo.headquarters, MapPin],
                          ['Scale', companyInfo.companySize, Users],
                          ['Inception', companyInfo.yearFounded, Clock],
                        ].map(([label, value, Icon]: any) => (
                          <div key={label} className="flex items-center gap-4 group/stat">
                            <div className="p-2.5 rounded-xl bg-white border border-blue-100 text-blue-500 group-hover/stat:bg-blue-500 group-hover/stat:text-white transition-all shadow-sm">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                              <p className="text-sm font-bold text-slate-900">{value || 'N/A'}</p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Contact Directory */}
                    <Card className="rounded-[2.5rem] border-slate-100 shadow-sm">
                      <CardContent className="p-8 space-y-8">
                        <div className="space-y-6">
                          <h3 className="text-xs font-black text-slate-900/40 uppercase tracking-[0.2em]">Contact Hub</h3>
                          <ContactList icon={Mail} items={companyInfo.contacts?.emails} label="Emails" />
                          <ContactList icon={Phone} items={companyInfo.contacts?.phones} label="Phones" />
                        </div>
                        
                        <div className="pt-8 border-t border-slate-100">
                          <h3 className="text-xs font-black text-slate-900/40 uppercase tracking-[0.2em] mb-6">Social Footprint</h3>
                          <div className="flex flex-wrap gap-2">
                            {socialLinks.map(([label, value]) => (
                              <Button key={label} asChild variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition-all">
                                <a href={value} target="_blank" rel="noopener noreferrer">
                                  <SocialIcon label={label} />
                                </a>
                              </Button>
                            ))}
                            {socialLinks.length === 0 && <p className="text-xs font-bold text-slate-300 italic">No social links detected.</p>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Digital Footprint */}
                <Card className="rounded-[3rem] border-slate-100 shadow-sm bg-slate-50/50">
                  <CardHeader className="p-12 pb-6">
                    <CardTitle className="text-2xl font-black tracking-tight">Digital Fingerprint</CardTitle>
                  </CardHeader>
                  <CardContent className="p-12 pt-0 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    <PresenceCard label="Page Title" value={companyInfo.pageTitle} />
                    <PresenceCard label="Hostname" value={companyInfo.digitalPresence?.hostname} />
                    <PresenceCard label="Meta Description" value={companyInfo.metaDescription} fullWidth />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <DialogFooter className="p-8 border-t border-slate-50 bg-white">
            <Button 
              variant="ghost" 
              onClick={() => setOpen(false)}
              className="text-slate-400 font-black uppercase tracking-widest text-xs hover:text-slate-600"
            >
              Exit Scanner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
