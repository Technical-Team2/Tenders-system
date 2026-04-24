"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateTenderStatus(tenderId: string, status: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("tenders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", tenderId)

  if (error) {
    throw new Error(`Failed to update tender status: ${error.message}`)
  }

  revalidatePath(`/tenders/${tenderId}`)
  revalidatePath("/tenders")
  revalidatePath("/")
}

export async function createApplication(tenderId: string) {
  const supabase = await createClient()

  // Check if application already exists
  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("tender_id", tenderId)
    .single()

  if (existing) {
    return existing
  }

  const { data, error } = await supabase
    .from("applications")
    .insert({
      tender_id: tenderId,
      status: "draft",
      notes: "",
      documents: [],
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create application: ${error.message}`)
  }

  // Update tender status to applied
  await supabase
    .from("tenders")
    .update({ status: "applied", updated_at: new Date().toISOString() })
    .eq("id", tenderId)

  revalidatePath(`/tenders/${tenderId}`)
  revalidatePath("/tenders")
  revalidatePath("/applications")
  revalidatePath("/")

  return data
}
