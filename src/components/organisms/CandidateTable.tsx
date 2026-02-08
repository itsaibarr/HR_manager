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
  pending: 'New',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  interviewing: 'Interviewing',
  offered: 'Offered'
}

const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  shortlisted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  interviewing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  offered: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
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
    <div className="w-full bg-card rounded-sm border border-border flex flex-col">
      {/* Header */}
      <div className="flex items-center px-6 py-3 bg-accent/50 border-b border-border gap-4">
        <div className={cn("text-[11px] font-sora font-normal text-muted uppercase tracking-wider", showJobColumn ? "w-[180px]" : "w-[200px]")}>
          Candidate
        </div>
        {showJobColumn && (
          <div className="w-[140px] text-[11px] font-sora font-normal text-muted uppercase tracking-wider">Job</div>
        )}
        <div className="w-[60px] text-[11px] font-sora font-normal text-muted uppercase tracking-wider">Score</div>
        <div className="w-[90px] text-[11px] font-sora font-normal text-muted uppercase tracking-wider">Status</div>
        <div className="flex-1 text-[11px] font-sora font-normal text-muted uppercase tracking-wider">Skills</div>
        <div className="w-[80px] text-[11px] font-sora font-normal text-muted uppercase tracking-wider">Applied</div>
        <div className="w-[100px] text-[11px] font-sora font-normal text-muted uppercase tracking-wider text-right">Action</div>
      </div>

      {/* Rows */}
      <div className="flex flex-col">
        {data.map((candidate) => (
          <div
            key={candidate.id}
            onClick={() => onView?.(candidate.id)}
            className="flex items-center px-6 py-4 gap-4 border-b border-border/50 last:border-0 hover:bg-accent/50 transition-colors group cursor-pointer"
          >
            {/* Candidate Info */}
            <div className={cn("flex items-center gap-3", showJobColumn ? "w-[180px]" : "w-[200px]")}>
              <Avatar className="h-8 w-8 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                <AvatarFallback>{candidate.initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-sora font-semibold text-card-foreground group-hover:text-primary transition-colors truncate">
                  {candidate.name}
                </span>
                <span className="text-xs text-muted font-sora truncate">{candidate.role}</span>
              </div>
            </div>

            {/* Job Context */}
            {showJobColumn && (
              <div className="w-[140px]">
                <span className="text-xs text-muted font-sora truncate block">
                  {candidate.jobContextName}
                </span>
              </div>
            )}

            {/* Score */}
            <div className="w-[60px]">
              <span className={cn(
                "font-mono text-sm font-semibold",
                candidate.scoreBand === 'strong' ? "text-green-600" :
                candidate.scoreBand === 'good' ? "text-blue-600" : 
                candidate.scoreBand === 'borderline' ? "text-yellow-600" : "text-red-600"
              )}>
                {candidate.score}
              </span>
            </div>

            {/* Status */}
            <div className="w-[90px]">
              <Badge className={cn("text-[10px] px-2 py-0.5", statusColors[candidate.status || 'pending'])}>
                {statusLabels[candidate.status || 'pending']}
              </Badge>
            </div>

            {/* Skills */}
            <div className="flex-1 flex items-center gap-1.5 overflow-hidden">
              <span className="text-xs text-muted font-sora mr-1 shrink-0">{candidate.experienceRaw} •</span>
              {candidate.topSkills.slice(0, 3).map((skill) => (
                <Badge 
                  key={skill} 
                  variant="secondary" 
                  className="px-1.5 py-0.5 text-[10px] font-normal bg-blue-50 text-blue-700 hover:bg-blue-100 shrink-0 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
                >
                  {skill}
                </Badge>
              ))}
            </div>

            {/* Date */}
            <div className="w-[80px] text-xs text-muted font-sora">
              {candidate.appliedAt}
            </div>

            {/* Action */}
            <div className="w-[100px] flex justify-end gap-2 items-center">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 px-3 text-xs"
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
                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(candidate.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
