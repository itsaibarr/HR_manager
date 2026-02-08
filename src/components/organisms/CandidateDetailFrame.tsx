"use client"

import { useState, useEffect } from "react"
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
  DollarSign, 
  Briefcase, 
  GraduationCap,
  History,
  FileText
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CandidateDetailFrameProps {
  candidateId: string | null
  jobId: string
  isOpen: boolean
  onClose: () => void
}

export function CandidateDetailFrame({ candidateId, jobId, isOpen, onClose }: CandidateDetailFrameProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (isOpen && candidateId) {
      const fetchData = async () => {
        setLoading(true)
        const { data: evaluation } = await (supabase as any)
          .from('evaluations')
          .select(`
            *,
            candidate_profiles (*)
          `)
          .eq('candidate_id', candidateId)
          .eq('job_context_id', jobId)
          .single()
        
        if (evaluation) {
          setData(evaluation)
        }
        setLoading(false)
      }
      fetchData()
    } else {
      setData(null)
    }
  }, [candidateId, jobId, isOpen, supabase])

  const handleShortlist = async () => {
    if (!data) return
    
    setActionLoading(true)
    try {
      const { error } = await (supabase as any)
        .from('evaluations')
        .update({ status: 'shortlisted' })
        .eq('id', data.id)
      
      if (error) throw error
      
      alert('Candidate shortlisted successfully!')
      onClose()
    } catch (error) {
      console.error('Error shortlisting candidate:', error)
      alert('Failed to shortlist candidate')
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
      
      alert('Candidate rejected')
      onClose()
    } catch (error) {
      console.error('Error rejecting candidate:', error)
      alert('Failed to reject candidate')
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
      <div className="relative w-full max-w-5xl bg-paper-bg h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex flex-1 overflow-hidden">
          
          {/* Main Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
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
                      <h1 className="text-2xl font-sora font-bold text-black-soft">
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

                {/* AI Analysis Cards */}
                <div className="grid grid-cols-1 gap-6">
                    <Card className="border-none shadow-sm bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="w-5 h-5 text-navy" />
                                Deep AI Evaluation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="space-y-4">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted opacity-80">Reasoning</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {data.reasoning?.map((r: string, i: number) => (
                                        <div key={i} className="flex gap-3 p-4 bg-paper rounded-sm border border-border/50">
                                            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                            <p className="text-sm text-black-soft leading-relaxed">{r}</p>
                                        </div>
                                    ))}
                                </div>
                             </div>

                             {data.potential_concern && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-sm flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-bold text-red-900">Potential Concern</h3>
                                        <p className="text-sm text-red-800 leading-relaxed">{data.potential_concern}</p>
                                    </div>
                                </div>
                             )}
                        </CardContent>
                    </Card>

                    {/* Score Breakdown */}
                    <Card className="border-none shadow-sm bg-white">
                         <CardHeader>
                            <CardTitle className="text-lg">Score Breakdown</CardTitle>
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
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted">No data found.</p>
              </div>
            )}
          </div>

          {/* Right Panel (Profile & Metadata) */}
          <div className="w-[360px] bg-white border-l border-border overflow-y-auto p-8 space-y-8 flex flex-col">
            {data && data.candidate_profiles ? (
              <>
                <div className="space-y-6 flex-1">
                  <div className="flex flex-col items-center text-center gap-3">
                    <Avatar className="w-20 h-20 bg-blue-100 text-blue-700 text-2xl font-bold border-4 border-blue-50">
                        <AvatarFallback>{data.candidate_profiles.full_name ? data.candidate_profiles.full_name.split(' ').map((n: string) => n[0]).join('').substring(0,2) : "CA"}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <h2 className="text-xl font-sora font-bold text-black-soft">{data.candidate_profiles.full_name || 'Candidate Profile'}</h2>
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
                <span className="font-medium text-black-soft">{label}</span>
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
                <span className="text-sm font-medium text-black-soft leading-tight">{value}</span>
            </div>
        </div>
    )
}
