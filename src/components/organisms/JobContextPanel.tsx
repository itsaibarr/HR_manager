import { MapPin, Briefcase, Clock, Calendar, FileText, CheckCircle2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

interface JobContextPanelProps {
  job?: {
    title: string
    original_description?: string | null
    responsibilities: string[]
    mustHaveSkills: string[]
    niceToHaveSkills: string[]
    non_requirements?: string[]
    experience_expectations: any
    created_at: string
  }
  width?: number
}

export function JobContextPanel({ job, width = 340 }: JobContextPanelProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  
  if (!job) {
    return (
      <div className="bg-paper h-full border-l border-border/60 p-6 flex items-center justify-center" style={{ width: `${width}px` }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-accent/30 flex items-center justify-center animate-pulse">
            <Briefcase className="w-4 h-4 text-muted/40" strokeWidth={2.4} />
          </div>
          <div className="text-[11px] font-bold text-muted uppercase tracking-widest font-mono">Loading context...</div>
        </div>
      </div>
    )
  }

  const exp = job.experience_expectations || {}
  const hasOriginalDescription = job.original_description && job.original_description.trim().length > 0
  
  return (
    <div 
      className="bg-paper h-full border-l border-border/60 overflow-y-auto shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.1)] shrink-0"
      style={{ width: `${width}px` }}
    >
      <div className="p-6 space-y-8 font-sora">
        
        {/* Original Job Description - MOST IMPORTANT */}
        {hasOriginalDescription && (
          <section className="space-y-4">
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 font-mono">
              <FileText className="w-3 h-3 text-brand" strokeWidth={2.4} />
              Original Job Description
            </h3>
            <div className="relative group">
              <div 
                className={`text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap font-sans pl-3 border-l-2 border-brand/20 ${
                  isDescriptionExpanded ? '' : 'line-clamp-12'
                }`}
              >
                {job.original_description}
              </div>
              {job.original_description && job.original_description.length > 300 && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="text-[11px] font-mono text-brand hover:text-brand/80 hover:underline mt-3 pl-3 uppercase tracking-wider font-bold"
                >
                  {isDescriptionExpanded ? 'Show less [-]' : 'Show more [+]'}
                </button>
              )}
            </div>
          </section>
        )}

        {/* Requirements */}
        <section className="space-y-6 pt-6 border-t border-border/40">
          <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
            Requirements
          </h3>
          
          {/* Must-Have Skills */}
          {job.mustHaveSkills && job.mustHaveSkills.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                <span className="text-sm font-bold text-foreground">Must-Have Skills</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {job.mustHaveSkills.map(skill => (
                  <Badge key={skill} variant="secondary" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 rounded-sm px-2.5 py-1 text-[13px] font-medium leading-relaxed">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Nice-to-Have Skills */}
          {job.niceToHaveSkills && job.niceToHaveSkills.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                <span className="text-sm font-bold text-foreground">Nice-to-Have Skills</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {job.niceToHaveSkills.map(skill => (
                  <Badge key={skill} variant="outline" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20 rounded-sm px-2.5 py-1 text-[13px] font-medium leading-relaxed pointer-events-none">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Non-Requirements */}
          {job.non_requirements && job.non_requirements.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                <span className="text-sm font-bold text-foreground">Non-Requirements</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {job.non_requirements.map((item, i) => (
                  <Badge key={i} variant="outline" className="text-destructive/80 border-destructive/20 bg-destructive/5 rounded-sm px-2.5 py-1 text-[13px]">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Job Info */}
        <section className="space-y-4 pt-6 border-t border-border/40">
          <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
            Job Details
          </h3>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-2 rounded-sm hover:bg-accent/50 transition-colors border border-transparent hover:border-border/40 group">
              <div className="p-1.5 rounded-sm bg-background border border-border/40 text-brand group-hover:border-brand/40 transition-colors">
                <MapPin className="w-3.5 h-3.5" strokeWidth={2.4} />
              </div>
              <span className="text-sm font-medium text-foreground">Remote</span>
            </div>
            
            <div className="flex items-center gap-3 p-2 rounded-sm hover:bg-accent/50 transition-colors border border-transparent hover:border-border/40 group">
              <div className="p-1.5 rounded-sm bg-background border border-border/40 text-brand group-hover:border-brand/40 transition-colors">
                 <Briefcase className="w-3.5 h-3.5" strokeWidth={2.4} />
              </div>
              <span className="text-sm font-medium text-foreground">{exp.level || 'Mid-Senior'} Level</span>
            </div>

            <div className="flex items-center gap-3 p-2 rounded-sm hover:bg-accent/50 transition-colors border border-transparent hover:border-border/40 group">
               <div className="p-1.5 rounded-sm bg-background border border-border/40 text-brand group-hover:border-brand/40 transition-colors">
                <Clock className="w-3.5 h-3.5" strokeWidth={2.4} />
               </div>
              <span className="text-sm font-medium text-foreground">{exp.minYears || 3}+ Years Exp.</span>
            </div>

            <div className="flex items-center gap-3 p-2 rounded-sm hover:bg-accent/50 transition-colors border border-transparent hover:border-border/40 group">
               <div className="p-1.5 rounded-sm bg-background border border-border/40 text-brand group-hover:border-brand/40 transition-colors">
                <Calendar className="w-3.5 h-3.5" strokeWidth={2.4} />
               </div>
              <span className="text-xs font-medium text-foreground font-mono">
                Created {new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
