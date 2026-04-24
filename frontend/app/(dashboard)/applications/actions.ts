"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateApplicationStatus(applicationId: string, status: string) {
  const supabase = await createClient()

  const updates: Record<string, string | null> = { status }
  
  if (status === "submitted") {
    updates.submitted_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from("applications")
    .update(updates)
    .eq("id", applicationId)

  if (error) {
    throw new Error(`Failed to update application: ${error.message}`)
  }

  revalidatePath("/applications")
  revalidatePath("/")
}

export async function deleteApplication(applicationId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", applicationId)

  if (error) {
    throw new Error(`Failed to delete application: ${error.message}`)
  }

  revalidatePath("/applications")
  revalidatePath("/")
}
