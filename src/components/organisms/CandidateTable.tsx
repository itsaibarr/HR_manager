"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { Trash2 } from "lucide-react"

// Candidate Data Handling
export interface Candidate {
  id: string
  name: string
  initials: string
  role: string
  experienceRaw: string // e.g. "8 yrs"
  score: number
  scoreBand: 'strong' | 'good' | 'borderline' | 'reject'
  topSkills: string[]
  appliedAt: string
}


interface CandidateTableProps {
  data: Candidate[]
  onView?: (candidateId: string) => void
  onDelete?: (candidateId: string) => void
}

export function CandidateTable({ data, onView, onDelete }: CandidateTableProps) {
  if (!data || data.length === 0) {
      return <div className="p-12 text-center text-muted border border-border border-dashed rounded-sm">No candidates yet. Upload a CV to get started.</div>
  }
  return (
    <div className="w-full bg-white rounded-sm border border-border flex flex-col">
      {/* Header */}
      <div className="flex items-center px-6 py-3 bg-cream border-b border-border gap-4">
        <div className="w-[200px] text-[11px] font-sora font-normal text-muted uppercase tracking-wider">Candidate</div>
        <div className="w-[80px] text-[11px] font-sora font-normal text-muted uppercase tracking-wider">Score</div>
        <div className="flex-1 text-[11px] font-sora font-normal text-muted uppercase tracking-wider">Exp / Skills</div>
        <div className="w-[100px] text-[11px] font-sora font-normal text-muted uppercase tracking-wider">Applied</div>
        <div className="w-[120px] text-[11px] font-sora font-normal text-muted uppercase tracking-wider text-right">Action</div>
      </div>

      {/* Rows */}
      <div className="flex flex-col">
        {data.map((candidate) => (
          <div
            key={candidate.id}
            onClick={() => onView?.(candidate.id)}
            className="flex items-center px-6 py-4 gap-4 border-b border-border/50 last:border-0 hover:bg-paper transition-colors group cursor-pointer"
          >
            {/* Candidate Info */}
            <div className="w-[200px] flex items-center gap-3">
              <Avatar className="h-8 w-8 bg-blue-100 text-blue-700">
                <AvatarFallback>{candidate.initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-sora font-semibold text-black-soft group-hover:text-navy transition-colors">
                  {candidate.name}
                </span>
                <span className="text-xs text-muted font-sora">{candidate.role}</span>
              </div>
            </div>

            {/* Score */}
            <div className="w-[80px]">
              <span className={cn(
                "font-mono text-sm font-semibold",
                candidate.scoreBand === 'strong' ? "text-green-600" :
                candidate.scoreBand === 'good' ? "text-blue-600" : "text-yellow-600"
              )}>
                {candidate.score}
              </span>
            </div>

            {/* Skills */}
            <div className="flex-1 flex items-center gap-2">
              <span className="text-xs text-muted font-sora mr-2">{candidate.experienceRaw} •</span>
              {candidate.topSkills.map((skill) => (
                <Badge key={skill} variant="secondary" className="px-1.5 py-0.5 text-[10px] font-normal bg-blue-50 text-blue-700 hover:bg-blue-100">
                  {skill}
                </Badge>
              ))}
            </div>

            {/* Date */}
            <div className="w-[100px] text-xs text-muted font-sora">
              {candidate.appliedAt}
            </div>

            {/* Action */}
            <div className="w-[120px] flex justify-end gap-2 items-center">
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
