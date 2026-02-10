"use client"

import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimeSavedMetricProps {
    candidateCount: number
}

export function TimeSavedMetric({ candidateCount }: TimeSavedMetricProps) {
    // Constants for estimation
    const MANUAL_TIME_MINS = 15
    const AI_TIME_MINS = 1 // Allocation for upload/processing wait

    // Calculate savings
    const minutesSaved = candidateCount * (MANUAL_TIME_MINS - AI_TIME_MINS)
    const hoursSaved = Math.floor(minutesSaved / 60)
    const remainingMinutes = minutesSaved % 60
    
    // Calculate ROI: (Net Profit / Cost) * 100
    // Net Profit (in time) = (Manual Time - AI Time)
    // Cost (in time) = AI Time
    const roi = AI_TIME_MINS > 0 
        ? Math.round(((MANUAL_TIME_MINS - AI_TIME_MINS) / AI_TIME_MINS) * 100)
        : 0

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
                    +{roi}% ROI
                </span>
            </div>
        </div>
    )
}
