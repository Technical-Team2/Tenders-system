"use server"

import { apiClient } from "@/lib/api/client"
import { revalidatePath } from "next/cache"

export async function updateApplicationStatus(applicationId: string, status: string) {
  await apiClient.updateApplicationStatus(applicationId, status)

  revalidatePath("/applications")
  revalidatePath("/")
}

export async function deleteApplication(applicationId: string) {
  await apiClient.deleteApplication(applicationId)

  revalidatePath("/applications")
  revalidatePath("/")
}
