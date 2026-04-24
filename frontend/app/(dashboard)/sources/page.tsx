import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SourcesContent } from "./sources-content"

export default async function SourcesPage() {
  const supabase = await createClient()
  
  // Get current user and check admin role
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/signin')
  }
  
  // Check if user has admin role (you might need to add a role field to user_metadata)
  const isAdmin = user?.user_metadata?.role === 'admin'
  
  if (!isAdmin) {
    redirect('/dashboard')
  }

  const { data: sources } = await supabase
    .from("tender_sources")
    .select("*")
    .order("name")

  const { data: scrapeLogs } = await supabase
    .from("scrape_logs")
    .select("*, tender_sources(*)")
    .order("run_time", { ascending: false })
    .limit(20)

  // Get tender counts per source
  const { data: tenderCounts } = await supabase
    .from("tenders")
    .select("source_id")
  
  const countsBySource: Record<string, number> = {}
  tenderCounts?.forEach(t => {
    if (t.source_id) {
      countsBySource[t.source_id] = (countsBySource[t.source_id] || 0) + 1
    }
  })

  return (
    <SourcesContent 
      sources={sources || []} 
      scrapeLogs={scrapeLogs || []}
      tenderCounts={countsBySource}
    />
  )
}
