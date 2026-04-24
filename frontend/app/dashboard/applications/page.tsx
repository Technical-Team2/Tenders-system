import { createClient } from "@/lib/supabase/server"
import { ApplicationsContent } from "../../(dashboard)/applications/applications-content"

export default async function ApplicationsPage() {
  const supabase = await createClient()

  const { data: applications } = await supabase
    .from("applications")
    .select("*, tenders(*, tender_scores(*))")
    .order("created_at", { ascending: false })

  return <ApplicationsContent applications={applications || []} />
}
