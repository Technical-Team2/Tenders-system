"use server"

import { apiClient } from "@/lib/api/client"
import { revalidatePath } from "next/cache"

export async function toggleSource(sourceId: string, isActive: boolean) {
  await apiClient.updateTenderSource(sourceId, { is_active: isActive })
  revalidatePath("/sources")
}

export async function addSource(source: { name: string; base_url: string; type: string }) {
  await apiClient.createTenderSource(source)
  revalidatePath("/sources")
}

export async function deleteSource(sourceId: string) {
  await apiClient.deleteTenderSource(sourceId)
  revalidatePath("/sources")
}
