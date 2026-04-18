import { createClient } from "@/lib/supabase/server"
import { TendersListContent } from "../../(dashboard)/tenders/tenders-list-content"

export default async function TendersPage() {
  const supabase = await createClient()

  const { data: tenders } = await supabase
    .from("tenders")
    .select("*, tender_sources(*), tender_scores(*)")
    .order("created_at", { ascending: false })

  const { data: sources } = await supabase
    .from("tender_sources")
    .select("*")
    .eq("is_active", true)

  // Get unique sectors
  const sectors = [...new Set(tenders?.map(t => t.sector).filter(Boolean))]

  return (
    <TendersListContent 
      tenders={tenders || []} 
      sources={sources || []}
      sectors={sectors as string[]}
    />
  )
}
