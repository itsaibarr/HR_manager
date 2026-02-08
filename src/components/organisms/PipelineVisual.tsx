import { cn } from "@/lib/utils"

interface PipelineProps {
  counts: {
    new: number
    screening: number
    interview: number
    offer: number
  }
  activeStage?: string
  onStageClick?: (stage: string) => void
}

export function PipelineVisual({ counts, activeStage, onStageClick }: PipelineProps) {
  const stages = [
    { id: "new", label: "New", count: counts.new, status: "pending" },
    { id: "screening", label: "Shortlisted", count: counts.screening, status: "shortlisted" },
    { id: "interview", label: "Interview", count: counts.interview, status: "interviewing" },
    { id: "offer", label: "Offer", count: counts.offer, status: "offered" },
  ]

  return (
    <div className="grid grid-cols-4 gap-4 w-full">
      {stages.map((stage) => {
        const isActive = activeStage === stage.id
        const isClickable = !!onStageClick
        
        return (
          <button
            key={stage.id}
            onClick={() => onStageClick?.(stage.id)}
            disabled={!isClickable}
            className={cn(
              "flex flex-col gap-1 px-4 py-3 rounded-sm bg-card border h-[64px] transition-all text-left",
              isActive
                ? "border-navy shadow-sm ring-1 ring-navy/5"
                : "border-border",
              isClickable && "hover:border-navy/50 cursor-pointer"
            )}
          >
            <span
              className={cn(
                "text-xs font-sora font-semibold uppercase tracking-wider",
                isActive ? "text-navy" : "text-muted"
              )}
            >
              {stage.label}
            </span>
            <span
              className={cn(
                "text-2xl font-mono font-medium",
                isActive ? "text-navy" : "text-card-foreground"
              )}
            >
              {stage.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
