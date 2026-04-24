"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function toggleSource(sourceId: string, isActive: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("tender_sources")
    .update({ is_active: isActive })
    .eq("id", sourceId)

  if (error) {
    throw new Error(`Failed to toggle source: ${error.message}`)
  }

  revalidatePath("/sources")
}

export async function addSource(source: { name: string; base_url: string; type: string }) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("tender_sources")
    .insert({
      name: source.name,
      base_url: source.base_url,
      type: source.type,
      is_active: true,
    })

  if (error) {
    throw new Error(`Failed to add source: ${error.message}`)
  }

  revalidatePath("/sources")
}

export async function deleteSource(sourceId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("tender_sources")
    .delete()
    .eq("id", sourceId)

  if (error) {
    throw new Error(`Failed to delete source: ${error.message}`)
  }

  revalidatePath("/sources")
}
