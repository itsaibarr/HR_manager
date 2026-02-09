"use client"

import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimeSavedMetricProps {
    candidateCount: number
}

export function TimeSavedMetric({ candidateCount }: TimeSavedMetricProps) {
    // Manual screening: 15 minutes per CV
    // Time saved = all manual screening time replaced by instant AI results
    const minutesSaved = candidateCount * 15
    const hoursSaved = Math.floor(minutesSaved / 60)
    const remainingMinutes = minutesSaved % 60
    
    if (candidateCount === 0) return null

    return (
        <div className="flex flex-col gap-1 px-4 py-3 rounded-sm bg-paper border border-border/60 h-[64px] transition-all text-left">
            <span className="text-xs font-sora font-semibold uppercase tracking-wider text-muted">
                Est. Time Saved
            </span>
            <div className="flex items-center gap-3">
                <span className="text-2xl font-mono font-medium text-card-foreground">
                    {hoursSaved}h{remainingMinutes > 0 && <span className="text-lg ml-0.5">{remainingMinutes}m</span>}
                </span>
                <span className="text-[10px] font-bold text-good-fit bg-good-fit/5 border border-good-fit/10 px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">
                    +1500% ROI
                </span>
            </div>
        </div>
    )
}
