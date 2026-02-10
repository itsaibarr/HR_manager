"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Trash2 } from "lucide-react"

export interface Candidate {
  id: string
  name: string
  initials: string
  role: string
  experienceRaw: string
  score: number
  scoreBand: 'strong' | 'good' | 'borderline' | 'reject'
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
                "flex items-center px-[var(--density-row-px)] py-[var(--density-row-py)] gap-[var(--density-gap)] border-b last:border-0 transition-all duration-150 group cursor-pointer",
                selectedIds.includes(candidate.id) ? "bg-accent/20 border-primary/20" : "border-border/40 hover:bg-accent/60"
            )}
          >
            <div className="w-[40px] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <input 
                    type="checkbox" 
                    checked={selectedIds.includes(candidate.id)}
                    onChange={() => toggleSelection(candidate.id)}
                    className="h-[16px] w-[16px] rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
                />
            </div>
            {/* Candidate Info */}
            <div className={cn("flex items-center gap-3", showJobColumn ? "w-[180px]" : "w-[200px]")}>
              <div className="h-8 w-8 rounded-sm bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold font-mono text-primary/80">{candidate.initials || "CA"}</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-primary group-hover:text-primary/80 transition-colors truncate leading-tight">
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
                candidate.scoreBand === 'strong' ? "text-strong-fit" :
                candidate.scoreBand === 'good' ? "text-good-fit" : 
                candidate.scoreBand === 'borderline' ? "text-borderline" : "text-reject"
              )}>
                {candidate.score}
              </span>
            </div>

            {/* Status */}
            <div className="w-[110px]">
                        <Badge 
                          variant={
                            candidate.status === 'shortlisted' ? "shortlisted" :
                            candidate.status === 'rejected' ? "destructive" :
                            candidate.status === 'interviewing' ? "interviewing" :
                            candidate.status === 'offered' ? "offered" :
                            "secondary"
                          }
              >
                {statusLabels[candidate.status || 'pending']}
              </Badge>
            </div>

            {/* Experience & Skills */}
            <div className="flex-1 flex items-center gap-2 overflow-hidden">
              <span className="text-xs text-muted font-mono shrink-0">{candidate.experienceRaw}</span>
              <div className="flex gap-1.5 overflow-hidden">
                {candidate.topSkills.slice(0, 2).map((skill) => (
                  <Badge 
                    key={skill} 
                    variant="outline" 
                    className="border-border/40 text-muted/80 shrink-0"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action */}
            <div className="w-[110px] flex justify-end gap-1 items-center">
              <Button 
                variant="ghost" 
                className="h-10 px-5 text-[11px] font-bold uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-all hover:bg-primary/5 hover:text-primary rounded-sm"
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
                className="h-9 w-9 text-muted opacity-20 group-hover:opacity-100 hover:text-reject hover:bg-reject/5 transition-all rounded-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(candidate.id);
                }}
              >
                <Trash2 className="w-[18px] h-[18px]" strokeWidth={2.4} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
