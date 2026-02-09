
import { updateCandidateStatus } from "@/app/actions/candidate-actions"

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
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  XCircle,
  FileText as FileTextIcon,
  Copy,
  Check
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { FeedbackComponent } from "@/components/organisms/FeedbackComponent"

interface CandidateDetailFrameProps {
  candidateId: string | null
  jobId: string
  isOpen: boolean
  onClose: () => void
  onStatusChange?: (message?: string, type?: 'success' | 'error') => void
}


export function CandidateDetailFrame({ candidateId, jobId, isOpen, onClose, onStatusChange }: CandidateDetailFrameProps) {
  const [data, setData] = useState<any>(null)
  const [jobContext, setJobContext] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [showJobRequirements, setShowJobRequirements] = useState(false)
  const [isCvOpen, setIsCvOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const [showRejectConfirm, setShowRejectConfirm] = useState(false)
  const [emailNotification, setEmailNotification] = useState(true)
  const supabase = createClient()



  const handleCopyCv = async () => {
    const text = data?.candidate_profiles?.raw_cv_text
    if (text) {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  useEffect(() => {
    if (isOpen && candidateId) {
      const fetchData = async () => {
        setLoading(true)
        
        // Placeholder - checking files firstvaluation and candidate data
        const { data: evaluation } = await (supabase as any)
          .from('evaluations')
          .select(`
            *,
            candidate_profiles (*),
            candidate_feedback (agreement, note)
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

  // Reasoning points from AI
  const reasoning = useMemo(() => data?.reasoning || [], [data])



  const handleReject = async () => {
    setShowRejectConfirm(true)
  }

  const confirmRejectCandidate = async () => {
    if (!data) return
    
    setActionLoading(true)
    try {
      const result = await updateCandidateStatus(data.id, 'rejected', jobId, emailNotification)
      
      if (result.success) {
        onStatusChange?.(result.message, 'success')
        onClose()
      } else {
        onStatusChange?.(result.message, 'error')
      }
    } catch (error) {
      console.error('Error rejecting candidate:', error)
      onStatusChange?.('An unexpected error occurred', 'error')
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
      <div className="relative w-full max-w-5xl bg-paper h-full border-l border-border flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex flex-1 overflow-hidden">
          
          {/* Main Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-10 space-y-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-sm animate-spin" />
                <p className="text-muted text-sm font-mono uppercase tracking-widest animate-pulse">Analyzing CV...</p>
              </div>
            ) : data ? (
              <>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex gap-5">
                    <Button variant="ghost" size="icon" onClick={onClose} className="mt-1 -ml-2 rounded-sm hover:bg-accent/50">
                      <X className="w-[14px] h-[14px]" strokeWidth={2.4} />
                    </Button>
                    <div className="space-y-1.5">
                      <h1 className="text-2xl font-sora font-extrabold text-primary tracking-tight">
                        {data.candidate_profiles?.full_name || `Candidate ${data.candidate_id.substring(0, 8)}`}
                      </h1>
                      <div className="flex items-center gap-3">
                         <div className="flex items-center gap-1.5 px-2 py-0.5 bg-strong-fit/5 text-strong-fit rounded-sm text-[10px] font-bold uppercase tracking-wider border border-strong-fit/20">
                            {data.final_score}% Match
                         </div>
                         <Badge variant={data.final_score >= 80 ? 'fit-strong' : (data.final_score >= 60 ? 'fit-good' : 'fit-borderline')}>{data.score_band}</Badge>
                         {data.confidence_score !== undefined && (
                            <ConfidenceBadge score={data.confidence_score} reason={data.confidence_reason} />
                         )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* View Job Requirements Button */}
                <div className="subtle-border rounded-sm bg-accent/20 overflow-hidden transition-all duration-200">
                  <button
                    onClick={() => setShowJobRequirements(!showJobRequirements)}
                    className="flex items-center justify-between w-full p-4 text-left hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-[14px] h-[14px] text-primary/60" strokeWidth={2.4} />
                      <span className="text-[11px] font-bold uppercase tracking-widest text-primary/80">Reference Job Requirements</span>
                    </div>
                    {showJobRequirements ? (
                      <ChevronUp className="w-[14px] h-[14px] text-muted" strokeWidth={2.4} />
                    ) : (
                      <ChevronDown className="w-[14px] h-[14px] text-muted" strokeWidth={2.4} />
                    )}
                  </button>
                  {showJobRequirements && jobContext && (
                    <div className="p-5 pt-0 space-y-5 border-t border-border/40">
                      {jobContext.original_description && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-primary/80">Core Context</h4>
                          <p className="text-[13px] text-primary/80 leading-relaxed whitespace-pre-wrap bg-paper/50 p-4 rounded-sm border border-border/40 font-mono">
                            {jobContext.original_description}
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-primary/80">Must-Have Precision</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {jobContext.must_have_skills?.map((skill: string) => (
                              <Badge key={skill} variant="secondary" className="bg-accent/50 text-primary border-border/60">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-primary/80">Bonus Signals</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {jobContext.nice_to_have_skills?.map((skill: string) => (
                              <Badge key={skill} variant="outline" className="text-muted">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Reasoning / Observations */}
                {reasoning.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-border/60">
                      <Target className="w-[14px] h-[14px] text-primary" strokeWidth={2.4} />
                      <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Assessment Reasoning</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {reasoning.map((point: string, i: number) => (
                        <div key={i} className="flex gap-3 p-4 bg-accent/20 rounded-sm border border-border/40 hover:bg-accent/30 transition-all group">
                          <Lightbulb className="w-[14px] h-[14px] text-good-fit shrink-0 mt-0.5" strokeWidth={2.4} />
                          <p className="text-[13px] text-primary/80 group-hover:text-primary leading-relaxed font-medium">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Score Breakdown */}
                <Card className="subtle-border rounded-sm bg-paper p-6 space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Data-Driven Scoring</h3>
                        <span className="text-[11px] font-mono text-muted uppercase tracking-widest">Weighted Analysis</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <ScoreRow label="Core Competencies" score={data.core_competencies_score} max={10} />
                        <ScoreRow label="Experience Relevance" score={data.experience_results_score} max={10} />
                        <ScoreRow label="Collaboration Signals" score={data.collaboration_signals_score} max={10} />
                        <ScoreRow label="Cultural Fit" score={data.cultural_practical_fit_score} max={10} />
                        <ScoreRow label="Education & Other" score={data.education_other_score} max={10} />
                    </div>
                </Card>

                {/* Human Feedback */}
                <FeedbackComponent 
                  evaluationId={data.id} 
                  existingFeedback={data.candidate_feedback?.[0] || null} 
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted font-mono uppercase text-xs tracking-[0.2em]">Zero Records Found</p>
              </div>
            )}
          </div>

           {/* Right Panel (Profile & Metadata) */}
          <div className="w-[340px] bg-paper border-l border-border/80 overflow-y-auto p-10 space-y-8 flex flex-col">
            {data && data.candidate_profiles ? (
              <>
                <div className="space-y-8 flex-1">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-24 h-24 rounded-sm bg-accent/40 border border-primary/5 flex items-center justify-center relative overflow-hidden group">
                    <span className="text-3xl font-sora font-extrabold text-primary tracking-tighter drop-shadow-sm">
                      {data.candidate_profiles.full_name 
                        ? data.candidate_profiles.full_name.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase()
                        : "CA"}
                    </span>
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="text-xl font-sora font-extrabold text-primary tracking-tight leading-tight">
                      {data.candidate_profiles.full_name || 'Candidate Profile'}
                    </h2>
                    <div className="flex flex-col gap-1 items-center">
                      <p className="text-sm text-muted font-mono uppercase tracking-wider">{data.candidate_profiles.email}</p>
                      <p className="text-[11px] font-bold text-primary/70 bg-accent/50 px-2 py-1 rounded-sm uppercase tracking-widest border border-border/60">
                        {data.candidate_profiles.experience?.[0]?.title || 'Senior Professional'}
                      </p>
                    </div>
                  </div>
                </div>

                  <div className="space-y-5 pt-8 border-t border-border/60">
                    <ProfileItem icon={MapPin} label="Home Office" value="Remote / Flexible" />
                    <ProfileItem icon={Briefcase} label="Career Span" value={`${data.candidate_profiles.experience?.length || 0} Registered Roles`} />
                  </div>

                  {/* Skills */}
                  <div className="space-y-4 pt-8 border-t border-border/60">
                     <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-primary/80 mb-4">Technical Skills</h3>
                     <div className="flex flex-wrap gap-1.5">
                        {data.candidate_profiles.skills?.map((s: string) => (
                            <Badge key={s} variant="secondary" className="bg-accent/40 text-primary border-border/40 font-bold py-1 px-2.5 lowercase">
                                {s}
                            </Badge>
                        ))}
                     </div>
                  </div>
                </div>

                {/* CV Action */}
                <div className="pt-8 border-t border-border/60">
                    <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full justify-center gap-2 font-bold text-[11px] uppercase tracking-widest h-10 border-border/80 hover:bg-accent/50 hover:border-primary/30 text-muted hover:text-primary transition-all"
                        onClick={() => setIsCvOpen(true)}
                    >
                        <FileTextIcon className="w-[14px] h-[14px]" strokeWidth={2.4} />
                        Original Document
                    </Button>
                </div>

                {/* Actions */}
                <div className="space-y-4 pt-6 border-t border-border/60">
                    <div className="flex items-center space-x-2 px-1">
                        <input 
                            type="checkbox" 
                            id="email-notify" 
                            checked={emailNotification}
                            onChange={(e) => setEmailNotification(e.target.checked)}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary"
                        />
                        <label 
                            htmlFor="email-notify" 
                            className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground select-none cursor-pointer"
                        >
                            Notify candidate via email
                        </label>
                    </div>

                    {(() => {
                      const status = data.status || 'pending'
                      
                      if (status === 'rejected') {
                        return (
                          <Button 
                            onClick={async () => {
                              setActionLoading(true)
                              try {
                                const result = await updateCandidateStatus(data.id, 'pending', jobId, false) // No email to "restore"
                                if (result.success) {
                                  onStatusChange?.(result.message, 'success')
                                  onClose()
                                } else {
                                  onStatusChange?.(result.message, 'error')
                                }
                              } catch (e) { console.error(e) } finally { setActionLoading(false) }
                            }}
                            disabled={actionLoading}
                            variant="outline"
                            className="w-full h-11 font-bold rounded-sm uppercase tracking-widest text-xs"
                          >
                             Restore to New
                          </Button>
                        )
                      }
                      
                      if (status === 'offered') {
                         return (
                            <div className="p-3 bg-good-fit/10 border border-good-fit/20 rounded-sm text-center">
                                <p className="text-[11px] font-bold text-good-fit uppercase tracking-widest">Offer Extended</p>
                            </div>
                         )
                      }

                      return (
                        <>
                          <Button 
                             onClick={async () => {
                                setActionLoading(true)
                                try {
                                    let nextStatus: 'shortlisted' | 'interviewing' | 'offered' = 'shortlisted'
                                    if (status === 'shortlisted') nextStatus = 'interviewing'
                                    if (status === 'interviewing') nextStatus = 'offered'
                                    
                                    const result = await updateCandidateStatus(data.id, nextStatus, jobId, emailNotification)
                                    
                                    if (result.success) {
                                      onStatusChange?.(result.message, 'success')
                                      onClose()
                                    } else {
                                      // If failure, keep dialog open but show error (or maybe close and show error via parent?)
                                      // Actually if we call onStatusChange with error, parent will show toast.
                                      // But we might want to keep dialog open. 
                                      // For now, let's close on success, and just log on error unless we pass a callback to show toast without closing?
                                      // The current pattern relies on parent toast.
                                      // Let's assume onStatusChange handles toast.
                                      onStatusChange?.(result.message, 'error')
                                    }

                                } catch (e) { 
                                  console.error(e)
                                  onStatusChange?.('An unexpected error occurred', 'error')
                                } finally { 
                                  setActionLoading(false) 
                                }
                            }}
                            disabled={actionLoading}
                            className={cn(
                                "w-full h-11 font-bold rounded-sm uppercase tracking-widest text-[11px] text-white transition-all",
                                status === 'pending' ? "bg-primary hover:bg-primary/90" :
                                status === 'shortlisted' ? "bg-purple-600 hover:bg-purple-700" :
                                status === 'interviewing' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-primary"
                            )}
                          >
                            {actionLoading ? 'Updating...' : 
                             status === 'pending' ? 'Shortlist Candidate' :
                             status === 'shortlisted' ? 'Move to Interview' :
                             status === 'interviewing' ? 'Extend Offer' : 'Next Step'}
                          </Button>
                          
                          <Button 
                            onClick={handleReject}
                            disabled={actionLoading}
                            variant="ghost" 
                            className="w-full text-reject hover:text-reject hover:bg-reject/5 h-11 font-bold rounded-sm uppercase tracking-widest text-xs"
                          >
                            Reject Application
                          </Button>
                        </>
                      )
                    })()}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <Dialog open={isCvOpen} onOpenChange={setIsCvOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0 bg-paper/95 backdrop-blur-xl border-border/60 shadow-2xl sm:rounded-lg overflow-hidden">
          
          {/* Header: Clean & Functional */}
          <div className="h-14 px-6 flex items-center justify-between border-b border-border/60 bg-paper/50 sticky top-0 z-50 backdrop-blur-sm">
             <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-sm bg-primary/10 text-primary">
                   <FileTextIcon className="w-[14px] h-[14px]" strokeWidth={2.4} />
                </div>
                <div>
                   <h2 className="text-sm font-bold font-sora text-primary tracking-tight">Original CV</h2>
                   <p className="text-[10px] font-mono text-muted uppercase tracking-wider">Raw Text Extraction</p>
                </div>
             </div>
             <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCopyCv}
                  className="h-8 text-[11px] font-bold uppercase tracking-wider text-muted hover:text-primary gap-2"
                >
                   {isCopied ? <Check className="w-[14px] h-[14px] text-good-fit" strokeWidth={2.4} /> : <Copy className="w-[14px] h-[14px]" strokeWidth={2.4} />}
                   {isCopied ? "Copied" : "Copy"}
                </Button>
                <div className="w-px h-4 bg-border/60 mx-1" />
                <Button variant="ghost" size="icon" onClick={() => setIsCvOpen(false)} className="h-8 w-8 text-muted hover:text-primary rounded-sm">
                   <X className="w-[14px] h-[14px]" strokeWidth={2.4} />
                </Button>
             </div>
          </div>

          {/* Content: "The Document" */}
          <div className="flex-1 overflow-y-auto bg-accent/5 relative scroll-smooth">
             <div className="max-w-3xl mx-auto my-12 bg-paper shadow-sm border border-border/40 min-h-[60vh] rounded-sm p-12 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Subtle decorative header on the paper itself */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10 opacity-60" />
                
                <pre className="font-mono text-[13px] leading-7 text-primary/80 whitespace-pre-wrap selection:bg-primary/10">
                   {data?.candidate_profiles?.raw_cv_text || "No CV content available."}
                </pre>
             </div>
             
             {/* Footer hint */}
             <div className="pb-12 text-center">
                <p className="text-[10px] font-mono text-muted/60 uppercase tracking-widest">End of Document</p>
             </div>
          </div>

        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        onConfirm={confirmRejectCandidate}
        title="Reject Application"
        description="Are you sure you want to reject this candidate? Their status will be updated to rejected in the pipeline. This action can be reversed by manually changing the status later."
        confirmText="Reject"
        variant="destructive"
        isLoading={actionLoading}
      />
    </div>
  )
}

function ScoreRow({ label, score, max }: { label: string, score: number, max: number }) {
    const fillPercent = (score / max) * 100
    
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold uppercase tracking-widest text-primary/80">{label}</span>
                <span className="font-mono text-xs font-bold text-primary">{score} / {max}</span>
            </div>
            <div className="h-1 w-full bg-accent/40 rounded-sm overflow-hidden">
                <div 
                    className="h-full bg-primary rounded-sm transition-all duration-700 ease-out" 
                    style={{ width: `${fillPercent}%` }}
                />
            </div>
        </div>
    )
}

function ProfileItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-sm bg-accent/30 flex items-center justify-center border border-border/40">
                <Icon className="w-[14px] h-[14px] text-primary/60" strokeWidth={2.4} />
            </div>
            <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-[0.12em] text-muted font-bold leading-none">{label}</span>
                <span className="text-[13px] font-bold text-primary/90 leading-tight">{value}</span>
            </div>
        </div>
    )
}

function ConfidenceBadge({ score, reason }: { score: number, reason?: string }) {
    return (
        <div className="flex items-center gap-2 px-2 py-0.5 rounded-sm bg-accent/30 border border-border/40 text-[10px] font-mono font-medium text-muted">
            <span className="uppercase tracking-wider">Confidence {score}%</span>
            {reason && <span className="text-[9px] opacity-70 font-sans italic">— {reason}</span>}
        </div>
    )
}

