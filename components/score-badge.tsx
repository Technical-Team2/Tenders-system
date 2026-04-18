import { cn } from "@/lib/utils"

interface ScoreBadgeProps {
  score: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
}

export function ScoreBadge({ score, size = "md", showLabel = false }: ScoreBadgeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-teal-500/20 text-teal-600 border-teal-500/30"
    if (score >= 60) return "bg-amber-500/20 text-amber-600 border-amber-500/30"
    return "bg-red-500/20 text-red-600 border-red-500/30"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "High"
    if (score >= 60) return "Medium"
    return "Low"
  }

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border font-medium",
        getScoreColor(score),
        sizeClasses[size]
      )}
    >
      {score}
      {showLabel && <span className="text-xs opacity-75">({getScoreLabel(score)})</span>}
    </span>
  )
}
