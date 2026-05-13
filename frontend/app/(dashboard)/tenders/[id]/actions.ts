"use server"

import { apiClient } from "@/lib/api/client"
import { revalidatePath } from "next/cache"

export async function updateTenderStatus(tenderId: string, status: string) {
  await apiClient.updateTenderStatus(tenderId, status)

  revalidatePath(`/tenders/${tenderId}`)
  revalidatePath("/tenders")
  revalidatePath("/")
}

export async function createApplication(tenderId: string) {
  const data = await apiClient.createDraftApplication(tenderId)
  await apiClient.updateTenderStatus(tenderId, "applied")

  revalidatePath(`/tenders/${tenderId}`)
  revalidatePath("/tenders")
  revalidatePath("/applications")
  revalidatePath("/")

  return data
}
