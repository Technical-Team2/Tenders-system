import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { TenderDetailContent } from "./tender-detail-content"

export default async function TenderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: tender } = await supabase
    .from("tenders")
    .select("*, tender_sources(*), tender_scores(*)")
    .eq("id", id)
    .single()

  if (!tender) {
    notFound()
  }

  const { data: extractedDetails } = await supabase
    .from("extracted_details")
    .select("*")
    .eq("tender_id", id)
    .single()

  const { data: application } = await supabase
    .from("applications")
    .select("*")
    .eq("tender_id", id)
    .single()

  return (
    <TenderDetailContent 
      tender={tender}
      extractedDetails={extractedDetails}
      application={application}
    />
  )
}
