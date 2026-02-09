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
}

const statusLabels: Record<string, string> = {
  pending: 'New Signal',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  interviewing: 'Interview',
  offered: 'Offered'
}

export function CandidateTable({ data, onView, onDelete, showJobColumn = false }: CandidateTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="p-12 text-center text-muted border border-border border-dashed rounded-sm">
        No candidates yet. Upload a CV to get started.
      </div>
    )
  }
  
  return (
    <div className="w-full bg-paper rounded-sm border border-border/80 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center px-5 py-2.5 bg-accent/40 border-b border-border/60 gap-4">
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
            className="flex items-center px-5 py-3 gap-4 border-b border-border/40 last:border-0 hover:bg-accent/60 transition-all duration-150 group cursor-pointer"
          >
            {/* Candidate Info */}
            <div className={cn("flex items-center gap-3", showJobColumn ? "w-[180px]" : "w-[200px]")}>
              <div className="h-8 w-8 rounded-lg bg-linear-to-br from-primary/10 to-transparent border border-primary/10 flex items-center justify-center shrink-0">
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
            <div className="w-[90px]">
                        <Badge 
                          variant={
                            candidate.status === 'shortlisted' ? "shortlisted" :
                            candidate.status === 'rejected' ? "destructive" :
                            candidate.status === 'interviewing' ? "interviewing" :
                            candidate.status === 'offered' ? "offered" :
                            "secondary"
                          }         className="text-[9px] px-1.5 py-0"
              >
                {statusLabels[candidate.status || 'pending']}
              </Badge>
            </div>

            {/* Experience & Skills */}
            <div className="flex-1 flex items-center gap-2 overflow-hidden">
              <span className="text-[11px] text-muted font-mono shrink-0">{candidate.experienceRaw}</span>
              <div className="flex gap-1.5 overflow-hidden">
                {candidate.topSkills.slice(0, 2).map((skill) => (
                  <Badge 
                    key={skill} 
                    variant="outline" 
                    className="px-1.5 py-0 text-[10px] font-medium border-border/40 text-muted/80 shrink-0"
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
                size="sm" 
                className="h-9 px-3 text-[11px] font-bold uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  onView?.(candidate.id);
                }}
              >
                Profile
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 text-muted opacity-40 group-hover:opacity-100 hover:text-reject transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(candidate.id);
                }}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
