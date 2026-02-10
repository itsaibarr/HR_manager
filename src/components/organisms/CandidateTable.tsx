"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Trash2 } from "lucide-react"
import { ScoreBand } from "@/lib/evaluation/framework"

export interface Candidate {
  id: string
  name: string
  initials: string
  role: string
  experienceRaw: string
  score: number
  scoreBand: ScoreBand
  status?: 'pending' | 'shortlisted' | 'rejected' | 'interviewing' | 'offered'
  topSkills: string[]
  appliedAt: string
  jobContextName?: string
}

interface CandidateTableProps {
  data: Candidate[]
  onView?: (candidateId: string) => void
  onDelete?: (candidateId: string) => void
  showJobColumn?: boolean
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  className?: string
}

const statusLabels: Record<string, string> = {
  pending: 'New Signal',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  interviewing: 'Interview',
  offered: 'Offered'
}

export function CandidateTable({
  data,
  onView,
  onDelete,
  showJobColumn = false,
  selectedIds = [],
  onSelectionChange,
  className
}: CandidateTableProps) {
  const allSelected = data.length > 0 && selectedIds.length === data.length
  
  const toggleSelectAll = () => {
      if (onSelectionChange) {
          if (allSelected) {
              onSelectionChange([])
          } else {
              onSelectionChange(data.map(c => c.id))
          }
      }
  }

  const toggleSelection = (id: string) => {
      if (selectedIds.includes(id)) {
          onSelectionChange?.(selectedIds.filter(prevId => prevId !== id))
      } else {
          onSelectionChange?.([...selectedIds, id])
      }
  }

  if (data.length === 0) {
    return (
      <div className={cn("p-12 text-center text-muted border border-border border-dashed rounded-sm", className)}>
        No candidates yet. Upload a CV to get started.
      </div>
    )
  }
  
  return (
    <div className={cn("w-full bg-paper rounded-sm border border-border/80 flex flex-col overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center px-[var(--density-row-px)] py-[var(--density-row-py)] bg-accent/40 border-b border-border/60 gap-[var(--density-gap)]">
        <div className="w-[40px] flex items-center justify-center">
            <input 
                type="checkbox" 
                checked={allSelected}
                onChange={toggleSelectAll}
                className="h-[16px] w-[16px] rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
            />
        </div>
        <div className={cn("text-[10px] font-bold text-muted uppercase tracking-widest", showJobColumn ? "w-[180px]" : "w-[200px]")}>
          Candidate
        </div>
        {showJobColumn && (
          <div className="w-[140px] text-[10px] font-bold text-muted uppercase tracking-widest">Job Context</div>
        )}
        <div className="w-[60px] text-[10px] font-bold text-muted uppercase tracking-widest">Score</div>
        <div className="w-[90px] text-[10px] font-bold text-muted uppercase tracking-widest">Status</div>
        <div className="flex-1 text-[10px] font-bold text-muted uppercase tracking-widest">Skills & Experience</div>
        <div className="w-[100px] text-[10px] font-bold text-muted uppercase tracking-widest text-right px-2">Action</div>
      </div>

      {/* Rows */}
      <div className="flex flex-col">
        {data.map((candidate) => (
          <div
            key={candidate.id}
            onClick={() => onView?.(candidate.id)}
            className={cn(
                "flex items-center px-[var(--density-row-px)] py-[var(--density-row-py)] gap-[var(--density-gap)] border-b last:border-b-0 transition-all duration-150 group cursor-pointer",
                selectedIds.includes(candidate.id) ? "bg-accent/20 border-l-[3px] border-l-brand border-y border-r border-y-primary/5 border-r-primary/5 pl-[calc(var(--density-row-px)-3px)]" : "border-border/40 hover:bg-accent/30 border-l-[3px] border-l-transparent"
            )}
          >
            <div className="w-[40px] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <input 
                    type="checkbox" 
                    checked={selectedIds.includes(candidate.id)}
                    onChange={() => toggleSelection(candidate.id)}
                    className="h-[14px] w-[14px] rounded-xs border-border text-brand focus:ring-brand accent-brand cursor-pointer"
                />
            </div>
            {/* Candidate Info */}
            <div className={cn("flex items-center gap-3", showJobColumn ? "w-[180px]" : "w-[200px]")}>
              <div className="h-8 w-8 rounded-sm bg-brand/5 border border-brand/10 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold font-mono text-brand">{candidate.initials || "CA"}</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-foreground group-hover:text-brand transition-colors truncate leading-tight font-sora">
                  {candidate.name}
                </span>
                <span className="text-[11px] text-muted truncate">{candidate.role}</span>
              </div>
            </div>

            {/* Job Context */}
            {showJobColumn && (
              <div className="w-[140px]">
                <span className="text-[11px] text-muted/80 truncate block font-medium">
                  {candidate.jobContextName}
                </span>
              </div>
            )}

            {/* Score */}
            <div className="w-[60px]">
              <span className={cn(
                "font-mono text-base font-bold",
                candidate.scoreBand === 'Force Multiplier' ? "text-emerald-500" :
                candidate.scoreBand === 'Solid Contributor' ? "text-blue-500" : 
                candidate.scoreBand === 'Baseline Capable' ? "text-amber-500" : "text-destructive"
              )}>
                {candidate.score}
              </span>
            </div>

            {/* Status */}
            <div className="w-[110px]">
              <Badge 
                variant="outline"
                className={cn(
                    "rounded-xs text-[10px] font-bold uppercase tracking-wide border px-2 py-0.5",
                    candidate.status === 'shortlisted' ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                    candidate.status === 'interviewing' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                    candidate.status === 'offered' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                    candidate.status === 'rejected' ? "bg-destructive/10 text-destructive border-destructive/20" :
                    "bg-secondary/50 text-muted-foreground border-border"
                )}
              >
                {candidate.status || 'Pending'}
              </Badge>
            </div>

            {/* Experience & Skills */}
            <div className="flex-1 flex items-center gap-3 overflow-hidden">
              <span className="text-xs text-muted font-mono shrink-0 font-medium">{candidate.experienceRaw}</span>
              <div className="flex gap-1.5 overflow-hidden">
                {candidate.topSkills.slice(0, 2).map((skill) => (
                  <Badge 
                    key={skill} 
                    variant="outline" 
                    className="border-border/60 text-muted-foreground/80 shrink-0 rounded-xs text-[10px] px-1.5 bg-background"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action */}
            <div className="w-[110px] flex justify-end gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                className="h-7 px-3 text-[10px] font-bold uppercase tracking-widest hover:bg-brand/5 hover:text-brand rounded-xs border border-transparent hover:border-brand/10 transition-all font-sora"
                onClick={(e) => {
                  e.stopPropagation();
                  onView?.(candidate.id);
                }}
              >
                View
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-muted hover:text-destructive hover:bg-destructive/5 transition-all rounded-xs hover:border hover:border-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(candidate.id);
                }}
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={2.4} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
