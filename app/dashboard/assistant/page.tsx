import { createClient } from "@/lib/supabase/server"
import { AssistantContent } from "../../(dashboard)/assistant/assistant-content"

export default async function AssistantPage() {
  const supabase = await createClient()

  const { data: recentTenders } = await supabase
    .from("tenders")
    .select("*, tender_scores(*)")
    .order("created_at", { ascending: false })
    .limit(10)

  return <AssistantContent recentTenders={recentTenders || []} />
}
