import { cn } from "@/lib/utils"

interface PipelineProps {
  counts: {
    new: number
    screening: number
    interview: number
    offer: number
  }
}

export function PipelineVisual({ counts }: PipelineProps) {
  const stages = [
    { id: "new", label: "New", count: counts.new, active: false },
    { id: "screening", label: "Screening", count: counts.screening, active: true }, // Mock active state
    { id: "interview", label: "Interview", count: counts.interview, active: false },
    { id: "offer", label: "Offer", count: counts.offer, active: false },
  ]

  return (
    <div className="grid grid-cols-4 gap-4 w-full">
      {stages.map((stage) => (
        <div
          key={stage.id}
          className={cn(
            "flex flex-col gap-1 px-4 py-3 rounded-sm bg-white border h-[64px] transition-all",
            stage.active
              ? "border-navy shadow-sm ring-1 ring-navy/5"
              : "border-border"
          )}
        >
          <span
            className={cn(
              "text-xs font-sora font-semibold uppercase tracking-wider",
              stage.active ? "text-navy" : "text-muted"
            )}
          >
            {stage.label}
          </span>
          <span
            className={cn(
              "text-2xl font-mono font-medium",
              stage.active ? "text-navy" : "text-black-soft"
            )}
          >
            {stage.count}
          </span>
        </div>
      ))}
    </div>
  )
}
