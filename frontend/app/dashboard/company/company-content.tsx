"use client"

import { useState, useEffect } from "react"
import { 
  Building2, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Plus, 
  Search, 
  Loader2, 
  ExternalLink, 
  Edit2, 
  Trash2, 
  Save, 
  X,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  Cpu,
  History,
  Users,
  Bot,
  Target,
  Network,
  ArrowLeft,
  LayoutGrid,
  FileText
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { API_BASE_URL } from "@/lib/api/config"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

export default function CompanyContent() {
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractUrl, setExtractUrl] = useState("")
  const [editingCompany, setEditingCompany] = useState<any>(null)
  const [view, setView] = useState("list")
  const [message, setMessage] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [appendModal, setAppendModal] = useState({ isOpen: false, type: '', value: '' })
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null })

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/companies`)
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setCompanies(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch companies:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExtract = async () => {
    if (!extractUrl) return
    setIsExtracting(true)
    setMessage(null)
    try {
      const normalizedUrl = /^https?:\/\//i.test(extractUrl) ? extractUrl : `https://${extractUrl}`
      const response = await fetch(`${API_BASE_URL}/api/ai/extract-company`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedUrl })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Extraction failed")
      }
      
      const extractedData = await response.json()
      setEditingCompany(extractedData)
      setView("edit")
      
      fetchCompanies()
      setExtractUrl("")
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Could not extract company info. Please check the URL." })
    } finally {
      setIsExtracting(false)
    }
  }

  const handleSave = async () => {
    try {
      const isNew = !editingCompany.id
      const url = isNew 
        ? `${API_BASE_URL}/api/companies`
        : `${API_BASE_URL}/api/companies/${editingCompany.id}`
      
      const response = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCompany)
      })

      if (!response.ok) throw new Error("Failed to save")
      
      setMessage({ type: "success", text: `Company ${isNew ? 'created' : 'updated'} successfully!` })
      setView("list")
      setEditingCompany(null)
      fetchCompanies()
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save company profile." })
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    setDeleteModal({ isOpen: true, id })
  }

  const confirmDelete = async () => {
    const id = deleteModal.id
    try {
      await fetch(`${API_BASE_URL}/api/companies/${id}`, { method: "DELETE" })
      fetchCompanies()
      setDeleteModal({ isOpen: false, id: null })
      setMessage({ type: "success", text: "Company profile permanently removed." })
    } catch (error) {
      console.error("Delete failed:", error)
      setMessage({ type: "error", text: "Failed to delete company profile." })
    }
  }

  const openEdit = (company) => {
    setEditingCompany({ ...company })
    setView("edit")
  }

  const openNew = () => {
    setEditingCompany({
      name: "",
      website: "",
      description: "",
      industry: "",
      intelligence_summary: "",
      contacts: { emails: [], phones: [], addresses: [] },
      social_links: {},
      services: [],
      products: [],
      technologies: []
    })
    setView("edit")
  }

  const filteredCompanies = companies.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.website?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50/50">
      {view === "edit" && editingCompany ? (
        <div className="animate-in fade-in duration-500">
        {/* Header Navigation */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 md:gap-6 min-w-0">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => { setView("list"); setEditingCompany(null); }}
                className="rounded-full hover:bg-slate-100 h-10 w-10 md:h-12 md:w-12 shrink-0"
              >
                <ArrowLeft className="h-5 w-5 md:h-6 md:w-6 text-slate-600" />
              </Button>
              <div className="h-8 w-px bg-slate-200 hidden md:block" />
              <div className="min-w-0">
                <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight truncate">
                  {editingCompany.name || "New Organization"}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] md:text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-1.5 md:px-2 py-0.5 rounded shrink-0">Intelligence Mode</span>
                  {editingCompany.website && <span className="text-[10px] md:text-xs text-slate-400 font-medium truncate hidden sm:block">{editingCompany.website}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4 shrink-0">
              <Button variant="ghost" onClick={() => setView("list")} className="font-bold text-slate-500 hidden sm:flex">
                Discard
              </Button>
              <Button onClick={handleSave} className="bg-[#2563EB] hover:bg-blue-700 px-4 md:px-8 py-4 md:py-6 h-auto text-xs md:text-sm font-black shadow-xl shadow-blue-500/20 rounded-xl md:rounded-2xl uppercase tracking-widest transition-all active:scale-95">
                <Save className="h-4 w-4 md:h-5 md:w-5 md:mr-3" />
                <span className="hidden sm:inline">Finalize Info</span>
                <span className="sm:hidden text-[10px]">SAVE</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto pb-20">
          {/* Hero Section */}
          <div className="p-6 md:p-10 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 text-white relative overflow-hidden m-4 md:m-8 rounded-[2rem] md:rounded-[3rem] shadow-2xl">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/5 to-transparent skew-x-12 transform translate-x-20" />
            <div className="relative z-10 space-y-6 md:space-y-8">
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-md px-3 md:px-4 py-1 md:py-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                  Company Intelligence System
                </Badge>
                <div className="flex gap-2 items-center">
                  <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Data Sync Active</span>
                </div>
              </div>

              <div className="space-y-6">
                <Input 
                  value={editingCompany.name} 
                  onChange={(e) => setEditingCompany({...editingCompany, name: e.target.value})}
                  className="text-3xl md:text-6xl font-black bg-transparent border-none p-0 focus-visible:ring-0 placeholder:text-white/20 h-auto leading-tight md:leading-none tracking-tight"
                  placeholder="Organization Name"
                />
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
                  <div className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all cursor-pointer w-full sm:w-auto">
                    <Globe className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-400" />
                    <Input 
                      value={editingCompany.website || editingCompany.url || ""} 
                      onChange={(e) => setEditingCompany({...editingCompany, website: e.target.value})}
                      className="bg-transparent border-none p-0 focus-visible:ring-0 text-white/70 h-auto w-full sm:w-64 text-xs md:text-sm font-medium"
                      placeholder="company-domain.com"
                    />
                  </div>
                  <div className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl md:rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] md:text-xs font-bold uppercase tracking-wider w-full sm:w-auto">
                    <Briefcase className="h-3 md:h-3.5 w-3 md:w-3.5" />
                    <Input 
                      value={editingCompany.industry || ""} 
                      onChange={(e) => setEditingCompany({...editingCompany, industry: e.target.value})}
                      className="bg-transparent border-none p-0 focus-visible:ring-0 text-blue-300 h-auto w-full sm:w-32 text-[10px] md:text-xs font-bold uppercase"
                      placeholder="INDUSTRY"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="px-4 md:px-8">
            <div className="mb-6 md:mb-10 overflow-x-auto pb-4 scrollbar-hide">
              <TabsList className="h-12 md:h-16 bg-white rounded-2xl md:rounded-3xl border border-slate-100 p-1 md:p-2 gap-1 md:gap-2 shadow-sm inline-flex min-w-max">
                {[
                  { value: "overview", label: "Overview", icon: Building2 },
                  { value: "intelligence", label: "AI Insights", icon: Bot },
                  { value: "deep", label: "Strategic Focus", icon: Target },
                  { value: "offerings", label: "Portfolio", icon: Layers },
                  { value: "contacts", label: "Network", icon: Network },
                ].map((tab) => (
                  <TabsTrigger 
                    key={tab.value}
                    value={tab.value} 
                    className="h-full rounded-xl md:rounded-2xl data-[state=active]:bg-slate-900 data-[state=active]:text-white px-4 md:px-8 text-[10px] md:text-sm font-black transition-all flex items-center gap-2 uppercase tracking-widest"
                  >
                    <tab.icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="overview" className="m-0 space-y-6 md:space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {[
                  { label: "Year Founded", value: editingCompany.year_founded || editingCompany.yearFounded, icon: History, key: "year_founded", placeholder: "e.g. 2010" },
                  { label: "Employee Count", value: editingCompany.company_size || editingCompany.companySize, icon: Users, key: "company_size", placeholder: "e.g. 50-100" },
                  { label: "Headquarters", value: editingCompany.headquarters, icon: MapPin, key: "headquarters", placeholder: "City, Country" },
                  { label: "Business Type", value: editingCompany.business_type || editingCompany.businessType, icon: LayoutGrid, key: "business_type", placeholder: "e.g. B2B" }
                ].map((field) => (
                  <Card key={field.key} className="p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-slate-100 bg-white hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300 group/field">
                    <div className="flex items-center gap-4 mb-4 md:mb-6">
                      <div className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-slate-50 text-slate-400 group-hover/field:bg-blue-600 group-hover/field:text-white transition-all shadow-inner">
                        <field.icon className="h-4 w-4 md:h-5 md:w-5" />
                      </div>
                      <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{field.label}</span>
                    </div>
                    <Input 
                      value={field.value || ""} 
                      onChange={(e) => setEditingCompany({...editingCompany, [field.key]: e.target.value})}
                      className="font-black text-slate-900 border-none p-0 h-auto bg-transparent focus-visible:ring-0 text-lg md:text-xl placeholder:text-slate-200"
                      placeholder={field.placeholder}
                    />
                  </Card>
                ))}
              </div>

              <Card className="rounded-[2rem] md:rounded-[3rem] border-slate-100 bg-white p-6 md:p-12 overflow-hidden relative group/mission">
                <div className="absolute top-0 right-0 p-8 md:p-12 opacity-5 group-hover:opacity-10 transition-opacity hidden sm:block">
                  <FileText className="h-20 w-20 md:h-32 md:w-32 text-slate-900" />
                </div>
                <div className="relative z-10 space-y-6 md:space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="h-8 md:h-10 w-1.5 md:w-2 bg-blue-600 rounded-full" />
                    <h3 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight uppercase">Mission Statement & Purpose</h3>
                  </div>
                  <Textarea 
                    value={editingCompany.description || ""} 
                    onChange={(e) => setEditingCompany({...editingCompany, description: e.target.value})}
                    className="min-h-[150px] md:min-h-[200px] text-lg md:text-2xl leading-relaxed font-medium bg-transparent border-none p-0 focus-visible:ring-0 placeholder:text-slate-200 italic"
                    placeholder="Articulate the organization's core mission..."
                  />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="intelligence" className="m-0 space-y-10">
              <Card className="p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border border-blue-100/50 relative overflow-hidden group/intel shadow-xl">
                <div className="absolute top-0 right-0 p-12 hidden lg:block">
                  <Bot className="h-40 w-40 text-blue-200/30 rotate-12" />
                </div>
                <div className="relative z-10 space-y-6 md:space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 md:p-4 rounded-2xl md:rounded-3xl bg-white text-blue-600 shadow-xl border border-blue-100">
                      <Sparkles className="h-6 w-6 md:h-8 md:w-8" />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">AI Generated Matrix</h3>
                      <p className="text-[10px] md:text-xs font-bold text-blue-600/60 uppercase tracking-[0.3em] mt-1">Autonomous Intelligence Synthesis</p>
                    </div>
                  </div>
                  <Textarea 
                    value={editingCompany.intelligence_summary || editingCompany.intelligenceSummary || ""} 
                    onChange={(e) => setEditingCompany({...editingCompany, intelligence_summary: e.target.value})}
                    className="min-h-[250px] md:min-h-[300px] text-base md:text-xl font-medium leading-relaxed bg-white/60 backdrop-blur-sm rounded-2xl md:rounded-[3rem] border-blue-100 focus:border-blue-400 p-6 md:p-12 shadow-inner"
                    placeholder="Summarizing expertise, technical dominance, and market positioning..."
                  />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="deep" className="m-0 space-y-6 md:space-y-12">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
                <Card className="p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-slate-100 bg-white">
                  <div className="flex items-center gap-4 mb-6 md:mb-8">
                    <div className="h-8 md:h-10 w-1.5 md:w-2 bg-amber-500 rounded-full" />
                    <h3 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight">Strategic Positioning</h3>
                  </div>
                  <div className="space-y-4">
                    {(editingCompany.company_positioning || editingCompany.companyPositioning || []).map((pos, i) => (
                      <div key={i} className="p-4 md:p-6 rounded-2xl bg-amber-50/30 border border-amber-100/50 text-sm text-slate-700 font-bold leading-relaxed flex items-start gap-4 transition-all hover:bg-amber-50">
                        <span className="text-[10px] md:text-xs text-amber-700 font-black h-5 w-5 md:h-6 md:w-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
                        {pos}
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-slate-100 bg-white">
                  <div className="flex items-center gap-4 mb-6 md:mb-8">
                    <div className="h-8 md:h-10 w-1.5 md:w-2 bg-emerald-500 rounded-full" />
                    <h3 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight">Market Demographics</h3>
                  </div>
                  <div className="space-y-4">
                    {(editingCompany.target_customers || editingCompany.targetCustomers || []).map((cust, i) => (
                      <div key={i} className="p-4 md:p-6 rounded-2xl bg-emerald-50/30 border border-emerald-100/50 text-sm text-slate-700 font-bold leading-relaxed flex items-center gap-4 transition-all hover:bg-emerald-50">
                        <Users className="h-4 w-4 md:h-5 md:w-5 text-emerald-600" />
                        {cust}
                      </div>
                    ))}
                  </div>
                </Card>
               </div>
            </TabsContent>
            
            <TabsContent value="offerings" className="m-0 space-y-6 md:space-y-12">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
                  <Card className="p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-slate-100 bg-white">
                    <div className="flex items-center justify-between mb-6 md:mb-10">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="h-8 md:h-10 w-1.5 md:w-2 bg-violet-600 rounded-full" />
                        <h3 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight">Service Portfolio</h3>
                      </div>
                      <Button 
                        variant="ghost" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setAppendModal({ isOpen: true, type: 'services', value: '' });
                        }} 
                        className="text-violet-600 font-black text-[9px] md:text-[10px] tracking-widest uppercase hover:bg-violet-50 rounded-xl px-3 md:px-4 h-9 md:h-10"
                      >
                        <Plus className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" /> <span className="hidden sm:inline">Append</span>
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:gap-4">
                      {editingCompany.services?.map((srv, i) => (
                        <div key={i} className="group/item flex items-center justify-between p-4 md:p-6 rounded-2xl md:rounded-3xl bg-slate-50 border border-slate-100 hover:border-violet-200 hover:bg-white hover:shadow-xl transition-all">
                          <span className="font-black text-slate-700 text-sm md:text-base">{srv}</span>
                          <Button variant="ghost" size="icon" className="opacity-100 sm:opacity-0 group-hover/item:opacity-100 text-slate-300 hover:text-red-500" onClick={() => setEditingCompany({...editingCompany, services: editingCompany.services.filter((_, idx) => idx !== i)})}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                  
                  <Card className="p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-slate-100 bg-white">
                    <div className="flex items-center justify-between mb-6 md:mb-10">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="h-8 md:h-10 w-1.5 md:w-2 bg-rose-600 rounded-full" />
                        <h3 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight">Product Ecosystem</h3>
                      </div>
                      <Button 
                        variant="ghost" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setAppendModal({ isOpen: true, type: 'products', value: '' });
                        }} 
                        className="text-rose-600 font-black text-[9px] md:text-[10px] tracking-widest uppercase hover:bg-rose-50 rounded-xl px-3 md:px-4 h-9 md:h-10"
                      >
                        <Plus className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" /> <span className="hidden sm:inline">Append</span>
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:gap-4">
                      {editingCompany.products?.map((prd, i) => (
                        <div key={i} className="group/item flex items-center justify-between p-4 md:p-6 rounded-2xl md:rounded-3xl bg-slate-50 border border-slate-100 hover:border-rose-200 hover:bg-white hover:shadow-xl transition-all">
                          <span className="font-black text-slate-700 text-sm md:text-base">{prd}</span>
                          <Button variant="ghost" size="icon" className="opacity-100 sm:opacity-0 group-hover/item:opacity-100 text-slate-300 hover:text-red-500" onClick={() => setEditingCompany({...editingCompany, products: editingCompany.products.filter((_, idx) => idx !== i)})}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
               </div>
            </TabsContent>

            <TabsContent value="contacts" className="m-0 space-y-6 md:space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                  {[
                    { title: "Communications", key: "emails", icon: Mail, color: "blue", label: "Email" },
                    { title: "Direct Contact", key: "phones", icon: Phone, color: "emerald", label: "Phone" },
                    { title: "Headquarters", key: "addresses", icon: MapPin, color: "rose", label: "Address" }
                  ].map((section) => (
                    <Card key={section.key} className="p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-slate-100 bg-white shadow-sm overflow-hidden">
                      <div className="flex items-center gap-4 mb-6 md:mb-8">
                        <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-${section.color}-50 text-${section.color}-600 shadow-inner`}>
                          <section.icon className="h-4 md:h-5 w-4 md:w-5" />
                        </div>
                        <h4 className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-[0.2em]">{section.title}</h4>
                      </div>
                      <div className="space-y-3 md:space-y-4">
                        {editingCompany.contacts?.[section.key]?.map((item, i) => (
                          <div key={i} className="group/contact flex items-center gap-2 p-1 md:p-2 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 focus-within:bg-white focus-within:border-blue-200 transition-all">
                            <Input 
                              value={item} 
                              onChange={(e) => {
                                const items = [...editingCompany.contacts[section.key]]
                                items[i] = e.target.value
                                setEditingCompany({...editingCompany, contacts: {...editingCompany.contacts, [section.key]: items}})
                              }} 
                              className="h-9 md:h-10 border-none bg-transparent focus-visible:ring-0 text-xs md:text-sm font-bold text-slate-700 w-full" 
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => {
                                const items = editingCompany.contacts[section.key].filter((_, idx) => idx !== i)
                                setEditingCompany({...editingCompany, contacts: {...editingCompany.contacts, [section.key]: items}})
                              }} 
                              className="opacity-100 sm:opacity-0 group-hover/contact:opacity-100 text-slate-300 hover:text-red-500 h-7 md:h-8 w-7 md:w-8 transition-all"
                            >
                              <Trash2 className="h-3.5 md:h-4 w-3.5 md:w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl border-dashed border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 font-black uppercase text-[9px] md:text-[10px] tracking-widest transition-all"
                          onClick={() => {
                            const items = [...(editingCompany.contacts?.[section.key] || []), ""]
                            setEditingCompany({...editingCompany, contacts: {...(editingCompany.contacts || {}), [section.key]: items}})
                          }}
                        >
                          <Plus className="h-3.5 md:h-4 w-3.5 md:w-4 mr-2" />
                          Add {section.label}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
            </TabsContent>
          </Tabs>
        </div>
        </div>
      ) : (
        <div className="min-h-screen bg-white">
          {/* Search and Action Bar */}
          <div className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-24 md:h-28 flex flex-col md:flex-row items-center justify-center md:justify-between py-4 md:py-0 gap-4">
              <div className="flex items-center gap-6 md:gap-10 w-full md:w-auto flex-1">
                <div className="flex items-center gap-3 md:gap-4 shrink-0">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                    <Building2 className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">Company Info</h1>
                    <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Enterprise Intelligence</p>
                  </div>
                </div>
                
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search organizations..." 
                    className="pl-11 h-10 md:h-12 bg-slate-50 border-slate-100 rounded-xl md:rounded-2xl focus:bg-white transition-all text-xs md:text-sm font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                <div className="flex-1 md:flex-none flex bg-slate-100 p-1 md:p-1.5 rounded-xl md:rounded-2xl border border-slate-200 shadow-inner">
                    <div className="hidden lg:flex items-center gap-2 px-4 py-2">
                      <Bot className="h-4 w-4 text-blue-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI X-Ray</span>
                    </div>
                    <Input 
                      placeholder="URL..." 
                      className="flex-1 md:w-48 lg:w-64 border-none bg-transparent focus-visible:ring-0 text-xs md:text-sm font-bold h-10"
                      value={extractUrl}
                      onChange={(e) => setExtractUrl(e.target.value)}
                    />
                    <Button onClick={handleExtract} disabled={isExtracting} className="bg-white text-blue-600 hover:bg-blue-50 shadow-sm border-slate-200 rounded-lg md:rounded-xl h-10 px-3 md:px-6 font-black uppercase tracking-widest text-[9px] md:text-[10px] shrink-0">
                      {isExtracting ? <Loader2 className="h-3 w-3 animate-spin md:mr-2" /> : <Sparkles className="h-3 w-3 md:mr-2" />}
                      <span className="hidden sm:inline">Extract</span>
                    </Button>
                </div>
                <Button onClick={openNew} size="icon" className="md:h-12 md:w-auto md:px-8 rounded-xl md:rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs shrink-0 sm:aspect-square md:aspect-auto">
                  <Plus className="h-5 w-5 md:mr-2" />
                  <span className="hidden md:inline">Manual</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 md:py-12">
            {message && (
              <div className={cn(
                "mb-10 p-6 rounded-[2rem] flex items-center gap-4 border-2 animate-in slide-in-from-top-4",
                message.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-rose-50 border-rose-100 text-rose-800"
              )}>
                <div className={cn("p-2 rounded-xl", message.type === "success" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white")}>
                  {message.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <p className="font-black uppercase text-xs tracking-widest">{message.type === "success" ? "Success" : "Operation Failed"}</p>
                  <p className="text-sm font-medium opacity-80">{message.text}</p>
                </div>
                <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-black/5" onClick={() => setMessage(null)}><X className="h-4 w-4" /></button>
              </div>
            )}

            {loading ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[1,2,3,4,5,6].map(i => (
                  <Card key={i} className="h-72 rounded-[2.5rem] bg-slate-50 border-none animate-pulse" />
                ))}
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-8 bg-slate-50/50 rounded-[4rem] border-2 border-dashed border-slate-100">
                <div className="h-24 w-24 rounded-[2.5rem] bg-white border border-slate-100 flex items-center justify-center shadow-2xl shadow-blue-500/10">
                  <Building2 className="h-12 w-12 text-blue-100" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Empty Intelligence Hub</h3>
                  <p className="text-slate-500 font-medium max-w-sm mx-auto">Start building your organizational database by extracting intelligence from public domains.</p>
                </div>
                <Button onClick={openNew} className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 px-12 font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 transition-all active:scale-95">
                  Initialize Entry
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredCompanies.map((company) => (
                  <Card 
                    key={company.id} 
                    onClick={() => openEdit(company)}
                    className="group relative cursor-pointer border-slate-100 rounded-[2rem] md:rounded-[3rem] bg-white hover:border-blue-500/50 hover:shadow-[0_32px_64px_-16px_rgba(37,99,235,0.12)] transition-all duration-500 overflow-hidden"
                  >
                    <CardHeader className="p-6 md:p-8 pb-4">
                      <div className="flex items-center justify-between mb-4 md:mb-6">
                        <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                          <Building2 className="h-6 w-6 md:h-7 md:w-7" />
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-red-500 hover:bg-rose-50" onClick={(e) => handleDelete(company.id, e)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-xl font-black text-slate-900 tracking-tight line-clamp-1">{company.name}</CardTitle>
                        <div className="flex items-center gap-2 text-blue-500 text-xs font-bold truncate">
                          <Globe className="h-3 w-3" />
                          {company.website?.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-4 space-y-6">
                      <p className="text-sm font-medium text-slate-500 leading-relaxed line-clamp-3 min-h-[4.5rem]">
                        {company.intelligence_summary || company.description || "Corporate intelligence pending analysis."}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {company.industry && (
                          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-none px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg">
                            {company.industry}
                          </Badge>
                        )}
                        {company.year_founded && (
                          <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-none px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg">
                            Est. {company.year_founded}
                          </Badge>
                        )}
                      </div>
                      <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex -space-x-3">
                          {company.technologies?.slice(0, 4).map((tech, i) => (
                            <div key={i} className="h-8 w-8 rounded-full bg-white border-2 border-slate-50 flex items-center justify-center shadow-sm" title={tech}>
                              <Cpu className="h-3.5 w-3.5 text-slate-400" />
                            </div>
                          ))}
                          {company.technologies?.length > 4 && (
                            <div className="h-8 w-8 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[10px] text-white font-black shadow-sm">
                              +{company.technologies.length - 4}
                            </div>
                          )}
                        </div>
                        <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <ArrowLeft className="h-4 w-4 rotate-180" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Portfolio Append Modal */}
      <Dialog 
        open={appendModal.isOpen} 
        onOpenChange={(open) => setAppendModal(prev => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-slate-100 bg-white p-8 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900 tracking-tight uppercase">
              Add to {appendModal.type === 'services' ? 'Service Portfolio' : 'Product Ecosystem'}
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              Manually append a new item to this organizational asset category.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Input
              autoFocus
              placeholder={`Enter ${appendModal.type === 'services' ? 'service' : 'product'} name...`}
              value={appendModal.value}
              onChange={(e) => setAppendModal(prev => ({ ...prev, value: e.target.value }))}
              className="h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 font-bold text-slate-700 focus:bg-white transition-all shadow-inner"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && appendModal.value.trim()) {
                  const key = appendModal.type
                  setEditingCompany(prev => ({
                    ...prev,
                    [key]: [...(prev[key] || []), appendModal.value.trim()]
                  }))
                  setAppendModal({ isOpen: false, type: '', value: '' })
                }
              }}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setAppendModal({ isOpen: false, type: '', value: '' })} className="rounded-xl font-bold uppercase text-xs tracking-widest h-12">
              Cancel
            </Button>
            <Button 
              disabled={!appendModal.value.trim()}
              onClick={() => {
                const key = appendModal.type
                setEditingCompany(prev => ({
                  ...prev,
                  [key]: [...(prev[key] || []), appendModal.value.trim()]
                }))
                setAppendModal({ isOpen: false, type: '', value: '' })
              }}
              className={cn(
                "rounded-xl h-12 px-8 font-black uppercase tracking-widest text-xs shadow-xl",
                appendModal.type === 'services' ? "bg-violet-600 hover:bg-violet-700 shadow-violet-500/20" : "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20"
              )}
            >
              Append Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteModal.isOpen} onOpenChange={(open) => setDeleteModal({ ...deleteModal, isOpen: open })}>
        <AlertDialogContent className="rounded-[2.5rem] border-slate-100 bg-white p-10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-slate-900 tracking-tight uppercase">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium leading-relaxed">
              Are you absolutely sure? This will permanently remove the organizational intelligence for this entity. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8">
            <AlertDialogCancel className="rounded-xl font-bold uppercase text-xs tracking-widest h-12">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-12 px-8 font-black uppercase tracking-widest text-xs shadow-xl shadow-rose-500/20"
            >
              Confirm Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function Sparkles(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  )
}
