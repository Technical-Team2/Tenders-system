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
} from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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

function EmptySection({ label }: { label: string }) {
  return <p className="text-sm text-muted-foreground">No {label.toLowerCase()} found on the scanned page.</p>
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
    <section className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-semibold uppercase text-muted-foreground">{title}</h3>
      </div>
      {children}
    </section>
  )
}

function BadgeCloud({ items, variant = 'secondary' }: { items?: string[]; variant?: 'secondary' | 'outline' }) {
  if (!hasItems(items)) return <EmptySection label="items" />
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

function InsightList({ items }: { items?: string[] }) {
  if (!hasItems(items)) return <EmptySection label="insights" />
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items!.map((item) => (
        <div key={item} className="rounded-lg border bg-background p-3 text-sm leading-relaxed">
          {item}
        </div>
      ))}
    </div>
  )
}

function ContactCard({
  icon: Icon,
  title,
  items,
  type,
}: {
  icon: React.ElementType
  title: string
  items?: string[]
  type?: 'email' | 'phone' | 'link'
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {title}
      </div>
      {hasItems(items) ? (
        <div className="space-y-1">
          {items!.map((item) => {
            const href = type === 'email' ? `mailto:${item}` : type === 'phone' ? `tel:${item}` : item
            return type ? (
              <a key={item} href={href} target={type === 'link' ? '_blank' : undefined} rel="noopener noreferrer" className="block break-words text-sm text-primary hover:underline">
                {item}
              </a>
            ) : (
              <p key={item} className="text-sm leading-relaxed">{item}</p>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Not found</p>
      )}
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastExtractedCompany', JSON.stringify(data))
      }
    } catch (e: any) {
      toast({ title: 'Extraction failed', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Database className="mr-2 h-4 w-4" />
        Extract Company Info
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Extract Company Information
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                placeholder="Enter company website URL (e.g. https://example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading && urlLooksValid) handleExtract()
                }}
                disabled={loading}
              />
              <Button onClick={handleExtract} disabled={loading || !urlLooksValid} className="shrink-0">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {loading ? 'Extracting' : 'Extract Profile'}
              </Button>
            </div>

            {loading && <LoadingProfile />}

            {!loading && !hasCompanyData && (
              <Empty className="border bg-muted/20">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Building2 className="h-5 w-5" />
                  </EmptyMedia>
                  <EmptyTitle>No company profile loaded</EmptyTitle>
                  <EmptyDescription>
                    Enter a company website to build a structured intelligence profile from public site content.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}

            {!loading && companyInfo && (
              <Card className="gap-0 overflow-hidden rounded-lg py-0">
                <div className="border-b bg-muted/40 p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-3">
                      <div>
                        <h2 className="text-2xl font-semibold tracking-tight">{companyInfo.name || 'Company name not found'}</h2>
                        <p className="mt-1 text-base text-muted-foreground">{companyInfo.tagline || companyInfo.pageTitle || 'Public company intelligence profile'}</p>
                      </div>
                      <p className="max-w-3xl text-sm leading-relaxed">{companyInfo.description || companyInfo.about || 'No company description was found on the scanned page.'}</p>
                      <div className="flex flex-wrap gap-2">
                        {compact([companyInfo.industry, companyInfo.businessCategory, companyInfo.businessType]).map((item) => (
                          <Badge key={item} variant="outline" className="rounded-md">{item}</Badge>
                        ))}
                      </div>
                    </div>
                    {companyInfo.website && (
                      <Button asChild variant="outline" size="sm" className="shrink-0">
                        <a href={companyInfo.website} target="_blank" rel="noopener noreferrer">
                          <Globe2 className="mr-2 h-4 w-4" />
                          Website
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                <CardContent className="space-y-8 p-6">
                  <Section title="Company Intelligence Summary" icon={FileText}>
                    <div className="rounded-lg border bg-background p-4 text-sm leading-relaxed">
                      {companyInfo.intelligenceSummary || 'The scan completed, but there was not enough public text to generate a confident intelligence summary.'}
                    </div>
                  </Section>

                  <Section title="Company Overview" icon={Building2}>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        ['Headquarters', companyInfo.headquarters],
                        ['Company Size', companyInfo.companySize],
                        ['Founded', companyInfo.yearFounded],
                        ['Website', companyInfo.website],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-lg border bg-background p-4">
                          <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
                          <p className="mt-2 break-words text-sm font-medium">{value || 'Not found'}</p>
                        </div>
                      ))}
                    </div>
                  </Section>

                  <Section title="Core Services" icon={Layers3}>
                    <BadgeCloud items={services} />
                  </Section>

                  <Section title="Technology Stack" icon={Network}>
                    <BadgeCloud items={techStack} variant="outline" />
                  </Section>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <Section title="Business Focus" icon={Target}>
                      <InsightList items={companyInfo.businessFocus} />
                    </Section>
                    <Section title="Operational Capabilities" icon={Workflow}>
                      <InsightList items={compact([...(companyInfo.operationalCapabilities || []), ...(companyInfo.automationCapabilities || [])])} />
                    </Section>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <Section title="Positioning" icon={Sparkles}>
                      <InsightList items={compact([...(companyInfo.companyPositioning || []), ...(companyInfo.valuePropositions || [])])} />
                    </Section>
                    <Section title="Target Customers & Integrations" icon={LinkIcon}>
                      <div className="space-y-3">
                        <BadgeCloud items={companyInfo.targetCustomers} />
                        {hasItems(companyInfo.integrations) && <BadgeCloud items={companyInfo.integrations} variant="outline" />}
                      </div>
                    </Section>
                  </div>

                  <Section title="Contact Information" icon={Mail}>
                    <div className="grid gap-3 md:grid-cols-2">
                      <ContactCard icon={Mail} title="Emails" items={companyInfo.contacts?.emails} type="email" />
                      <ContactCard icon={Phone} title="Phones" items={companyInfo.contacts?.phones} type="phone" />
                      <ContactCard icon={MapPin} title="Addresses" items={companyInfo.contacts?.addresses} />
                      <ContactCard icon={ExternalLink} title="Support & Contact Links" items={compact([...(companyInfo.contacts?.supportLinks || []), ...(companyInfo.contacts?.contactForms || []), ...(companyInfo.contacts?.whatsapp || [])])} type="link" />
                    </div>
                  </Section>

                  <Section title="Social Media" icon={Globe2}>
                    {socialLinks.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {socialLinks.map(([label, value]) => (
                          <Button key={label} asChild variant="outline" size="sm" className="capitalize">
                            <a href={value} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-3.5 w-3.5" />
                              {label === 'twitter' ? 'X / Twitter' : label}
                            </a>
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <EmptySection label="social media links" />
                    )}
                  </Section>

                  <Section title="Digital Presence Insights" icon={Globe2}>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg border bg-background p-4">
                        <p className="text-xs font-medium uppercase text-muted-foreground">SEO Title</p>
                        <p className="mt-2 text-sm">{companyInfo.pageTitle || 'Not found'}</p>
                      </div>
                      <div className="rounded-lg border bg-background p-4">
                        <p className="text-xs font-medium uppercase text-muted-foreground">Canonical URL</p>
                        <p className="mt-2 break-words text-sm">{companyInfo.canonicalUrl || 'Not found'}</p>
                      </div>
                      <div className="rounded-lg border bg-background p-4 md:col-span-2">
                        <p className="text-xs font-medium uppercase text-muted-foreground">Meta Description</p>
                        <p className="mt-2 text-sm leading-relaxed">{companyInfo.metaDescription || 'Not found'}</p>
                      </div>
                      <div className="rounded-lg border bg-background p-4 md:col-span-2">
                        <p className="text-xs font-medium uppercase text-muted-foreground">OpenGraph</p>
                        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                          {Object.entries(companyInfo.ogData || {}).filter(([, value]) => Boolean(value)).map(([key, value]) => (
                            <div key={key} className="break-words">
                              <span className="font-medium capitalize">{key}: </span>
                              {String(value)}
                            </div>
                          ))}
                          {Object.values(companyInfo.ogData || {}).every((value) => !value) && <p className="text-muted-foreground">No OpenGraph data found.</p>}
                        </div>
                      </div>
                    </div>
                    {hasItems(companyInfo.keywords) && (
                      <div className="pt-1">
                        <BadgeCloud items={companyInfo.keywords} variant="outline" />
                      </div>
                    )}
                  </Section>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
