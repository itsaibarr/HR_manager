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
}

export function JobContextPanel({ job }: JobContextPanelProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  
  if (!job) {
    return (
      <div className="w-[320px] bg-white h-full border-l border-border p-6">
        <div className="text-sm text-muted">Loading context...</div>
      </div>
    )
  }

  const exp = job.experience_expectations || {}
  const hasOriginalDescription = job.original_description && job.original_description.trim().length > 0
  
  return (
    <div className="w-[320px] bg-white h-full border-l border-border overflow-y-auto">
      <div className="p-6 space-y-6 font-sora">
        
        {/* Original Job Description - MOST IMPORTANT */}
        {hasOriginalDescription && (
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-black-soft uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Original Job Description
            </h3>
            <div className="relative">
              <div 
                className={`text-sm text-black-soft leading-relaxed whitespace-pre-wrap ${
                  isDescriptionExpanded ? '' : 'line-clamp-6'
                }`}
              >
                {job.original_description}
              </div>
              {job.original_description && job.original_description.length > 200 && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="text-xs text-navy hover:underline mt-2"
                >
                  {isDescriptionExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          </section>
        )}

        {/* Requirements */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-xs font-semibold text-black-soft uppercase tracking-wider">
            Requirements
          </h3>
          
          {/* Must-Have Skills */}
          {job.mustHaveSkills && job.mustHaveSkills.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-black-soft">Must-Have Skills</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {job.mustHaveSkills.map(skill => (
                  <Badge key={skill} variant="default" className="bg-green-600 text-white text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Nice-to-Have Skills */}
          {job.niceToHaveSkills && job.niceToHaveSkills.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-black-soft">Nice-to-Have Skills</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {job.niceToHaveSkills.map(skill => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Non-Requirements */}
          {job.non_requirements && job.non_requirements.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-xs font-medium text-black-soft">Non-Requirements</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {job.non_requirements.map((item, i) => (
                  <Badge key={i} variant="outline" className="text-xs text-red-600 border-red-200">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Job Info */}
        <section className="space-y-3 pt-4 border-t border-border">
          <h3 className="text-xs font-semibold text-black-soft uppercase tracking-wider">
            Job Info
          </h3>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-black-soft">
              <MapPin className="w-4 h-4 text-muted" />
              <span>Remote</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-black-soft">
              <Briefcase className="w-4 h-4 text-muted" />
              <span>{exp.level || 'Mid-Senior'} Level</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-black-soft">
              <Clock className="w-4 h-4 text-muted" />
              <span>{exp.minYears || 3}+ Years Experience</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-black-soft">
              <Calendar className="w-4 h-4 text-muted" />
              <span>Created {new Date(job.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
