import { cn } from "@/lib/utils"

type TenderStatus = "new" | "reviewed" | "applied" | "ignored"
type ApplicationStatus = "draft" | "submitted"

interface StatusBadgeProps {
  status: TenderStatus | ApplicationStatus
  type?: "tender" | "application"
}

const tenderStatusConfig: Record<TenderStatus, { label: string; className: string }> = {
  new: { label: "New", className: "bg-sky-500/20 text-sky-600 border-sky-500/30" },
  reviewed: { label: "Reviewed", className: "bg-indigo-500/20 text-indigo-600 border-indigo-500/30" },
  applied: { label: "Applied", className: "bg-teal-500/20 text-teal-600 border-teal-500/30" },
  ignored: { label: "Ignored", className: "bg-slate-500/20 text-slate-500 border-slate-500/30" },
}

const applicationStatusConfig: Record<ApplicationStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-slate-500/20 text-slate-500 border-slate-500/30" },
  submitted: { label: "Submitted", className: "bg-sky-500/20 text-sky-600 border-sky-500/30" },
}

export function StatusBadge({ status, type = "tender" }: StatusBadgeProps) {
  const config = type === "tender" 
    ? tenderStatusConfig[status as TenderStatus]
    : applicationStatusConfig[status as ApplicationStatus]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  )
}
