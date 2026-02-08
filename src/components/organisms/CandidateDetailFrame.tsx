"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { 
  X, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  Briefcase,
  FileText,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  XCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CandidateDetailFrameProps {
  candidateId: string | null
  jobId: string
  isOpen: boolean
  onClose: () => void
  onStatusChange?: () => void
}

export function CandidateDetailFrame({ candidateId, jobId, isOpen, onClose, onStatusChange }: CandidateDetailFrameProps) {
  const [data, setData] = useState<any>(null)
  const [jobContext, setJobContext] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [showJobRequirements, setShowJobRequirements] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (isOpen && candidateId) {
      const fetchData = async () => {
        setLoading(true)
        
        // Fetch evaluation and candidate data
        const { data: evaluation } = await (supabase as any)
          .from('evaluations')
          .select(`
            *,
            candidate_profiles (*)
          `)
          .eq('candidate_id', candidateId)
          .eq('job_context_id', jobId)
          .single()
        
        // Fetch job context
        const { data: job } = await (supabase as any)
          .from('job_contexts')
          .select('*')
          .eq('id', jobId)
          .single()
        
        if (evaluation) {
          setData(evaluation)
        }
        if (job) {
          setJobContext(job)
        }
        setLoading(false)
      }
      fetchData()
    } else {
      setData(null)
      setJobContext(null)
    }
  }, [candidateId, jobId, isOpen, supabase])

  // Generate personalized matching advice based on HR manager's requirements
  const matchingAdvice = useMemo(() => {
    if (!data || !jobContext) return null

    const candidateSkills = data.candidate_profiles?.skills || []
    const candidateExperience = data.candidate_profiles?.experience || []
    const cvText = data.candidate_profiles?.raw_cv_text || ''
    
    const responsibilities = jobContext.responsibilities || []
    const mustHaveSkills = jobContext.must_have_skills || []
    const niceToHaveSkills = jobContext.nice_to_have_skills || []
    const nonRequirements = jobContext.non_requirements || []

    // Match responsibilities from AI reasoning
    const matchedResponsibilities = responsibilities.filter((resp: string) => {
      // Check if any reasoning mentions this responsibility
      return data.reasoning?.some((r: string) => 
        r.toLowerCase().includes(resp.toLowerCase().substring(0, 20))
      ) || cvText.toLowerCase().includes(resp.toLowerCase().substring(0, 20))
    })

    // Match must-have requirements
    // Match must-have requirements
    const metRequirements = mustHaveSkills.filter((req: string) => {
      const reqLower = req.toLowerCase()
      // FIXED: Check if the requirement DESCRIPTION contains the candidate's skill (e.g. "Experience with Python" contains "Python")
      // instead of checking if "Python" contains "Experience with Python"
      const hasMatchingSkill = candidateSkills.some((cs: string) => {
        const skillLower = cs.toLowerCase()
        return reqLower.includes(skillLower) && skillLower.length > 2 // Avoid matching short words like "it", "go", "c" incorrectly if not careful context
      })

      // Also check if reasoning mentions search terms from the requirement
      const isMentionedInReasoning = data.reasoning?.some((r: string) => {
         const rLower = r.toLowerCase()
         // simplistic check: if reasoning contains significant words from requirement
         // This is heuristic.
         return rLower.includes(reqLower.substring(0, 15)) // Match start of requirement?
      })

      return hasMatchingSkill ||
             cvText.toLowerCase().includes(reqLower) ||
             // Fallback: Check if requirement is contained in reasoning (AI mentioned it)
             data.reasoning?.some((r: string) => r.toLowerCase().includes(reqLower))
    })

    // Missing must-have requirements
    const missingRequirements = mustHaveSkills.filter((req: string) => {
      return !metRequirements.includes(req) // Reuse the logic above
    })

    // Nice-to-have bonuses
    const bonusRequirements = niceToHaveSkills.filter((req: string) => {
      const reqLower = req.toLowerCase()
      return candidateSkills.some((cs: string) => cs.toLowerCase().includes(reqLower)) ||
             cvText.toLowerCase().includes(reqLower)
    })

    // Extract key strengths from AI reasoning
    const keyStrengths = data.reasoning?.slice(0, 3) || []

    return {
      matchedResponsibilities,
      metRequirements,
      missingRequirements,
      bonusRequirements,
      keyStrengths
    }
  }, [data, jobContext])

  const handleShortlist = async () => {
    if (!data) return
    
    setActionLoading(true)
    try {
      const { error } = await (supabase as any)
        .from('evaluations')
        .update({ status: 'shortlisted' })
        .eq('id', data.id)
      
      if (error) throw error
      
      onStatusChange?.()
      onClose()
    } catch (error) {
      console.error('Error shortlisting candidate:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!data) return
    if (!confirm('Are you sure you want to reject this candidate?')) return
    
    setActionLoading(true)
    try {
      const { error } = await (supabase as any)
        .from('evaluations')
        .update({ status: 'rejected' })
        .eq('id', data.id)
      
      if (error) throw error
      
      onStatusChange?.()
      onClose()
    } catch (error) {
      console.error('Error rejecting candidate:', error)
    } finally {
      setActionLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative w-full max-w-5xl bg-paper h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex flex-1 overflow-hidden">
          
          {/* Main Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted italic">Loading analysis...</p>
              </div>
            ) : data ? (
              <>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <Button variant="ghost" size="icon" onClick={onClose} className="mt-1">
                      <X className="w-5 h-5" />
                    </Button>
                    <div className="space-y-1">
                      <h1 className="text-2xl font-sora font-bold text-card-foreground">
                        {data.candidate_profiles?.full_name || `Candidate ${data.candidate_id.substring(0, 8)}`}
                      </h1>
                      <div className="flex items-center gap-3">
                         <div className="flex items-center gap-1.5 px-2 py-0.5 bg-strong-fit/10 text-strong-fit rounded text-xs font-bold border border-strong-fit/20">
                            {data.final_score}% Match
                         </div>
                         <Badge variant="fit-strong">{data.score_band}</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* View Job Requirements Button */}
                <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-800/30">
                  <CardHeader className="pb-3">
                    <button
                      onClick={() => setShowJobRequirements(!showJobRequirements)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <CardTitle className="text-base flex items-center gap-2 text-navy">
                        <FileText className="w-5 h-5" />
                        View Job Requirements
                      </CardTitle>
                      {showJobRequirements ? (
                        <ChevronUp className="w-5 h-5 text-navy" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-navy" />
                      )}
                    </button>
                  </CardHeader>
                  {showJobRequirements && jobContext && (
                    <CardContent className="space-y-4 pt-0">
                      {jobContext.original_description && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">Original Description</h4>
                          <p className="text-sm text-card-foreground leading-relaxed whitespace-pre-wrap bg-card p-3 rounded border border-border">
                            {jobContext.original_description}
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">Must-Have Skills</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {jobContext.must_have_skills?.map((skill: string) => (
                              <Badge key={skill} className="bg-green-600 text-white text-xs">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">Nice-to-Have</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {jobContext.nice_to_have_skills?.map((skill: string) => (
                              <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Why This Candidate Fits */}
                {matchingAdvice && (
                  <Card className="border-none shadow-sm bg-card">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-card-foreground">
                        <Target className="w-5 h-5 text-navy" />
                        Why This Candidate Fits Your Requirements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Matched Responsibilities */}
                      {matchingAdvice.matchedResponsibilities.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold flex items-center gap-2 text-purple-700">
                            <Briefcase className="w-4 h-4" />
                            Matches Your Responsibilities ({matchingAdvice.matchedResponsibilities.length})
                          </h4>
                          <div className="space-y-2">
                            {matchingAdvice.matchedResponsibilities.map((resp: string) => (
                              <div key={resp} className="flex gap-3 p-3 bg-purple-50 rounded border border-purple-100 dark:bg-purple-900/20 dark:border-purple-800/30">
                                <CheckCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5 dark:text-purple-400" />
                                <p className="text-sm text-card-foreground leading-relaxed">{resp}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Met Requirements */}
                      {matchingAdvice.metRequirements.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold flex items-center gap-2 text-green-700">
                            <CheckCircle className="w-4 h-4" />
                            Meets Your Requirements ({matchingAdvice.metRequirements.length})
                          </h4>
                          <div className="space-y-2">
                            {matchingAdvice.metRequirements.map((req: string) => (
                              <div key={req} className="flex gap-3 p-3 bg-green-50 rounded border border-green-100 dark:bg-green-900/20 dark:border-green-800/30">
                                <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5 dark:text-green-400" />
                                <p className="text-sm text-card-foreground">{req}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bonus Requirements */}
                      {matchingAdvice.bonusRequirements.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold flex items-center gap-2 text-blue-700">
                            <Lightbulb className="w-4 h-4" />
                            Bonus Strengths ({matchingAdvice.bonusRequirements.length})
                          </h4>
                          <div className="space-y-2">
                            {matchingAdvice.bonusRequirements.map((req: string) => (
                              <div key={req} className="flex gap-3 p-3 bg-blue-50 rounded border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/30">
                                <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 dark:text-blue-400" />
                                <p className="text-sm text-card-foreground">{req}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Missing Requirements */}
                      {matchingAdvice.missingRequirements.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold flex items-center gap-2 text-orange-700">
                            <AlertCircle className="w-4 h-4" />
                            Missing Requirements ({matchingAdvice.missingRequirements.length})
                          </h4>
                          <div className="space-y-2">
                            {matchingAdvice.missingRequirements.map((req: string) => (
                              <div key={req} className="flex gap-3 p-3 bg-orange-50 rounded border border-orange-100 dark:bg-orange-900/20 dark:border-orange-800/30">
                                <XCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5 dark:text-orange-400" />
                                <p className="text-sm text-card-foreground">{req}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Key Strengths from AI */}
                      {matchingAdvice.keyStrengths.length > 0 && (
                        <div className="space-y-2 pt-4 border-t border-border">
                          <h4 className="text-sm font-semibold text-card-foreground">Key Strengths (AI Analysis)</h4>
                          <div className="space-y-2">
                            {matchingAdvice.keyStrengths.map((strength: string, i: number) => (
                              <div key={i} className="flex gap-3 p-3 rounded border bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                                <CheckCircle className="w-4 h-4 text-gray-600 shrink-0 mt-0.5 dark:text-gray-400" />
                                <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{strength}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Score Breakdown */}
                <Card className="border-none shadow-sm bg-card">
                     <CardHeader>
                        <CardTitle className="text-lg text-card-foreground">Score Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            <ScoreRow label="Core Competencies" score={data.core_competencies_score} max={10} />
                            <ScoreRow label="Experience Relevance" score={data.experience_results_score} max={10} />
                            <ScoreRow label="Collaboration Signals" score={data.collaboration_signals_score} max={10} />
                            <ScoreRow label="Cultural Fit" score={data.cultural_practical_fit_score} max={10} />
                            <ScoreRow label="Education & Other" score={data.education_other_score} max={10} />
                        </div>
                    </CardContent>
                </Card>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted">No data found.</p>
              </div>
            )}
          </div>

           {/* Right Panel (Profile & Metadata) */}
          <div className="w-[360px] bg-card border-l border-border overflow-y-auto p-8 space-y-8 flex flex-col">
            {data && data.candidate_profiles ? (
              <>
                <div className="space-y-6 flex-1">
                  <div className="flex flex-col items-center text-center gap-3">
                    <Avatar className="w-20 h-20 bg-blue-100 text-blue-700 text-2xl font-bold border-4 border-blue-50 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900/50">
                        <AvatarFallback className="dark:bg-transparent">{data.candidate_profiles.full_name ? data.candidate_profiles.full_name.split(' ').map((n: string) => n[0]).join('').substring(0,2) : "CA"}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <h2 className="text-xl font-sora font-bold text-card-foreground">{data.candidate_profiles.full_name || 'Candidate Profile'}</h2>
                        <p className="text-xs text-muted font-mono">{data.candidate_profiles.email}</p>
                        <p className="text-sm text-muted">{data.candidate_profiles.experience?.[0]?.title || 'Professional'}</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <ProfileItem icon={MapPin} label="Location" value="Remote" />
                    <ProfileItem icon={Briefcase} label="Experience" value={`${data.candidate_profiles.experience?.length || 0} roles`} />
                  </div>

                  {/* Skills */}
                  <div className="space-y-3 pt-4 border-t border-border/50">
                     <h3 className="text-xs font-bold uppercase tracking-widest text-muted">Skills</h3>
                     <div className="flex flex-wrap gap-2">
                        {data.candidate_profiles.skills?.map((s: string) => (
                            <Badge key={s} variant="secondary" className="bg-blue-50 text-blue-700 border-none font-normal">
                                {s}
                            </Badge>
                        ))}
                     </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-6 border-t border-border">
                    <Button 
                      onClick={handleShortlist}
                      disabled={actionLoading}
                      className="w-full bg-strong-fit hover:bg-green-600 h-10"
                    >
                      {actionLoading ? 'Processing...' : 'Shortlist Candidate'}
                    </Button>
                    <Button 
                      onClick={handleReject}
                      disabled={actionLoading}
                      variant="outline" 
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 h-10"
                    >
                      Reject Application
                    </Button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function ScoreRow({ label, score, max }: { label: string, score: number, max: number }) {
    const fillPercent = (score / max) * 100
    
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
                <span className="font-medium text-card-foreground">{label}</span>
                <span className="font-mono text-muted">{score}/{max}</span>
            </div>
            <div className="h-1.5 w-full bg-paper rounded-full overflow-hidden">
                <div 
                    className="h-full bg-navy rounded-full transition-all duration-500" 
                    style={{ width: `${fillPercent}%` }}
                />
            </div>
        </div>
    )
}

function ProfileItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-paper flex items-center justify-center">
                <Icon className="w-4 h-4 text-muted" />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-muted font-bold leading-tight">{label}</span>
                <span className="text-sm font-medium text-card-foreground leading-tight">{value}</span>
            </div>
        </div>
    )
}
