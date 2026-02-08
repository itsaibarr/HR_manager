"use client"

import { useState, useEffect, use } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { FileText, CheckCircle, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function CandidateDetailPage({ 
  params 
}: { 
  params: Promise<{ jobId: string, candidateId: string }> 
}) {
  const { jobId, candidateId } = use(params)
  // Simple data fetching for MVP
  // In a real app we'd use SWR or React Query
  // Or server components (async Page)
  
  // Convert to async component for server-side fetching?
  // But we have 'use client'. Sticking to client side fetch for consistency with other pages for now.
  const [data, setData] = useState<any>(null)
  const supabase = createClient()
  
  useEffect(() => {
    const fetchData = async () => {
        const { data: evaluation } = await (supabase as any)
            .from('evaluations')
            .select(`
                *,
                candidate_profiles (*)
            `)
            .eq('candidate_id', candidateId)
            .eq('job_context_id', jobId) // Ensure correct job context
            .single()
        
        if (evaluation) {
            setData(evaluation)
        }
    }
    fetchData()
  }, [candidateId, jobId, supabase])

  if (!data) return <div className="p-12 text-center">Loading candidate details...</div>

  const profile = data.candidate_profiles
  const scoreBand = data.score_band
  
  return (
    <div className="flex h-full min-h-screen">
      <div className="flex-1 flex flex-col min-w-0 p-8 space-y-8">
        
        {/* Back Nav */}
        <Link href={`/dashboard/${jobId}`} className="flex items-center text-sm text-muted hover:text-navy transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <Avatar className="w-16 h-16 bg-paper-blue bg-blue-100 text-blue-700 text-xl font-bold">
              <AvatarFallback>CA</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h1 className="text-2xl font-sora font-bold text-black-soft">Candidate {candidateId.substring(0,6)}</h1>
              <p className="text-muted text-sm">
                  {profile.experience?.[0]?.title} • {profile.experience?.length || 0} roles
              </p>
              <div className="flex gap-2 pt-1">
                {profile.skills?.slice(0,3).map((s: string) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
             <div className="flex items-center gap-2">
                <span className="text-lg font-mono font-bold text-strong-fit">{data.final_score}%</span>
                <Badge variant="fit-strong">{scoreBand}</Badge>
             </div>
             <div className="flex gap-2 mt-2">
                <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">Reject</Button>
                <Button className="bg-strong-fit hover:bg-green-600">Shortlist</Button>
             </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-3 gap-8">
            {/* Left: Analysis (2 cols) */}
            <div className="col-span-2 space-y-6">
                
                {/* AI Reasoning */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">AI Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm leading-relaxed text-black-soft">
                        <ul className="space-y-2">
                            {data.reasoning?.map((r: string, i: number) => (
                                <li key={i} className="flex gap-2 items-start">
                                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                                    <span>{r}</span>
                                </li>
                            ))}
                        </ul>
                         {data.potential_concern && (
                             <div className="mt-4 p-3 bg-red-50 text-red-800 rounded text-sm">
                                 <strong>Potential Concern:</strong> {data.potential_concern}
                             </div>
                         )}
                    </CardContent>
                </Card>

                {/* Score Breakdown */}
                <Card>
                     <CardHeader>
                        <CardTitle className="text-lg">Score Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <ScoreRow label="Core Competencies" score={data.core_competencies_score} max={10} />
                            <ScoreRow label="Experience Relevance" score={data.experience_results_score} max={10} />
                            <ScoreRow label="Collaboration Signals" score={data.collaboration_signals_score} max={10} />
                            <ScoreRow label="Cultural Fit" score={data.cultural_practical_fit_score} max={10} />
                            <ScoreRow label="Education & Other" score={data.education_other_score} max={10} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right: Source / Timeline (1 col) */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                         <CardTitle className="text-base">Source Documents</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-center gap-3 p-3 border border-border rounded-md hover:bg-paper cursor-pointer transition-colors">
                            <FileText className="w-8 h-8 text-navy" />
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-medium truncate">Resume</span>
                                <span className="text-xs text-muted">Original Text</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>

      </div>
    </div>
  )
}

function ScoreRow({ label, score, max }: { label: string, score: number, max: number }) {
    const fillPercent = (score / max) * 100
    
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-sm">
                <span className="font-medium text-black-soft">{label}</span>
                <span className="font-mono text-muted">{score}/{max}</span>
            </div>
            <div className="h-2 w-full bg-paper rounded-full overflow-hidden">
                <div 
                    className="h-full bg-navy rounded-full" 
                    style={{ width: `${fillPercent}%` }}
                />
            </div>
        </div>
    )
}
