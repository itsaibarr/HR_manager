"use client"

import { useState, useEffect, useCallback, use, useMemo } from "react"
import Papa from "papaparse"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Plus, Download } from "lucide-react"
import { PipelineVisual } from "@/components/organisms/PipelineVisual"
import { CandidateTable } from "@/components/organisms/CandidateTable"
import { JobContextPanel } from "@/components/organisms/JobContextPanel"
import { UploadCandidateModal } from "@/components/organisms/UploadCandidateModal"
import { CandidateDetailFrame } from "@/components/organisms/CandidateDetailFrame"
import { CandidateFilters, FilterState } from "@/components/organisms/CandidateFilters"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/useToast"
import { ToastContainer } from "@/components/ui/toast"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { motion, AnimatePresence } from "framer-motion"

export default function JobDashboardPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [candidates, setCandidates] = useState<any[]>([])
  const [jobTitle, setJobTitle] = useState("Loading...")
  const [jobContext, setJobContext] = useState<any>(null)
  const [pipelineCounts, setPipelineCounts] = useState({ new: 0, screening: 0, interview: 0, offer: 0, unfit: 0 })
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [candidateToDelete, setCandidateToDelete] = useState<string | null>(null)
  const { toasts, showToast, dismissToast } = useToast()
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    scoreBands: [],
    skills: [],
    jobIds: [],
    sortBy: 'score'
  })
  
  const supabase = createClient()

  const fetchJobData = useCallback(async () => {
    // 1. Fetch Job Full Data
    const { data: job } = await (supabase as any).from('job_contexts').select('*').eq('id', jobId).single()
    if (job) {
        setJobTitle(job.title)
        setJobContext({
            ...job,
            mustHaveSkills: job.must_have_skills,
            niceToHaveSkills: job.nice_to_have_skills,
            original_description: job.original_description
        })
    }

        const { data: evaluations, error } = await (supabase as any)
        .from('evaluations')
        .select(`
            *,
            candidate_profiles (
                id,
                full_name,
                email,
                education,
                experience,
                skills,
                raw_cv_text
            )
        `)
        .eq('job_context_id', jobId)
        .order('created_at', { ascending: false })

    if (evaluations) {
        const mapped = evaluations.map((ev: any) => ({
            id: ev.candidate_id,
            evaluationId: ev.id,
            name: ev.candidate_profiles?.full_name || `Candidate ${ev.candidate_id.substring(0,6)}`, 
            initials: ev.candidate_profiles?.full_name ? ev.candidate_profiles.full_name.split(' ').map((n: string) => n[0]).join('').substring(0,2) : "CA",
            role: ev.candidate_profiles?.experience?.[0]?.title || "Applicant",
            experienceRaw: ev.candidate_profiles?.experience?.length ? `${ev.candidate_profiles.experience.length} roles` : "N/A",
            score: ev.final_score,
            scoreBand: ev.score_band === 'Strong Fit' ? 'strong' : ev.score_band === 'Good Fit' ? 'good' : ev.score_band === 'Borderline' ? 'borderline' : 'reject',
            status: ev.status || 'pending',
            topSkills: ev.candidate_profiles?.skills?.slice(0,3) || [],
            appliedAt: new Date(ev.created_at).toLocaleDateString()
        }))
        setCandidates(mapped)
        
        // Compute pipeline counts from actual statuses
        const counts = {
          new: evaluations.filter((e: any) => !e.status || e.status === 'pending').length,
          screening: evaluations.filter((e: any) => e.status === 'shortlisted').length,
          interview: evaluations.filter((e: any) => e.status === 'interviewing').length,
          offer: evaluations.filter((e: any) => e.status === 'offered').length,
          unfit: evaluations.filter((e: any) => e.status === 'rejected').length
        }
        setPipelineCounts(counts)
    }
  }, [supabase, jobId])

  const handleDelete = async (candidateId: string) => {
    setCandidateToDelete(candidateId)
  }

  const confirmDeleteCandidate = async () => {
    if (!candidateToDelete) return

    try {
        const res = await fetch(`/api/candidates?jobId=${jobId}&candidateId=${candidateToDelete}`, {
            method: 'DELETE'
        })
        if (res.ok) {
            // Optimistic update or refetch
            setCandidates(prev => prev.filter(c => c.id !== candidateToDelete))
            setPipelineCounts(prev => ({ ...prev })) // Trigger re-render, though ideally we'd recalc counts
            fetchJobData() // Full refresh to be safe
            showToast("Candidate removed successfully", "success")
        } else {
            console.error("Delete failed")
            showToast("Failed to delete candidate.", "error")
        }
    } catch (e) {
        console.error(e)
        showToast("Error deleting candidate.", "error")
    } finally {
        setCandidateToDelete(null)
    }
  }

  const handleView = (candidateId: string) => {
    setSelectedCandidateId(candidateId)
    setIsDetailOpen(true)
  }

  const recentActivity = candidates.slice(0, 3).map(c => ({
      text: `New applicant evaluated: ${c.score}% Match`,
      time: c.appliedAt
  }))

  const handleUpload = async (candidatesToProcess: any[], onProgress?: (current: number, total: number) => void) => {
    if (isUploading) return
    setIsUploading(true)
    let successCount = 0
    let failCount = 0
    const total = candidatesToProcess.length

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (let i = 0; i < total; i++) {
        const candidate = candidatesToProcess[i]
        
        const formData = new FormData()
        formData.append("rawText", candidate.rawText)
        formData.append("jobId", jobId)
        if (candidate.email) formData.append("email", candidate.email)
        if (candidate.name) formData.append("name", candidate.name)

        try {
            // Introduce a small delay to prevent overwhelming the server/LLM rate limits
            if (i > 0) await sleep(100);

            const res = await fetch('/api/candidates/upload', {
                method: 'POST',
                body: formData
            })
            if (res.ok) {
                successCount++
            } else {
                const errorData = await res.json().catch(() => ({}))
                console.error(`Upload failed for ${candidate.name}:`, errorData.error || res.statusText)
                failCount++
            }
        } catch (e) {
            console.error(`Network or critical error for ${candidate.name}:`, e)
            failCount++
        }
        
        onProgress?.(i + 1, total)
    }

    setIsUploading(false)
    await fetchJobData() 
    
    if (failCount > 0) {
        alert(`Import process finished with mixed results.\n\n✅ Successfully imported: ${successCount}\n❌ Failed: ${failCount}\n\nPlease check the console for details on failed candidates.`)
    } else {
        alert(`Successfully imported all ${successCount} candidates!`)
    }
  }

  const downloadCSV = () => {
    if (candidates.length === 0) return
    
    const headers = ['Name', 'Role', 'Experience', 'Score', 'Band', 'Top Skills', 'Applied At']
    const rows = candidates.map(c => [
        `"${c.name}"`,
        `"${c.role}"`,
        `"${c.experienceRaw}"`,
        c.score,
        c.scoreBand,
        `"${c.topSkills.join(', ')}"`,
        c.appliedAt
    ])
    
    const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n")
        
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `candidates-${jobId}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    fetchJobData()
  }, [fetchJobData])

  // Extract unique skills from all candidates
  const availableSkills = useMemo(() => {
    const skillsSet = new Set<string>()
    candidates.forEach(candidate => {
      candidate.topSkills?.forEach((skill: string) => skillsSet.add(skill))
    })
    return Array.from(skillsSet).sort()
  }, [candidates])

  // Filter and sort candidates
  const filteredCandidates = useMemo(() => {
    let filtered = [...candidates]

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchLower) ||
        c.role.toLowerCase().includes(searchLower)
      )
    }

    // Apply score band filter
    if (filters.scoreBands.length > 0) {
      filtered = filtered.filter(c => filters.scoreBands.includes(c.scoreBand))
    }

    // Apply skills filter
    if (filters.skills.length > 0) {
      filtered = filtered.filter(c => 
        filters.skills.some(skill => c.topSkills?.includes(skill))
      )
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'score':
        filtered.sort((a, b) => b.score - a.score)
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'date':
        filtered.sort((a, b) => 
          new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
        )
        break
    }

    return filtered
  }, [candidates, filters])

  return (
    <div className="flex h-full min-h-screen">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-8 max-w-7xl mx-auto space-y-8">
          <ToastContainer toasts={toasts} onDismiss={dismissToast} />
          <PageHeader
                title={jobTitle}
                subtitle={`${filteredCandidates.length} ${filteredCandidates.length === candidates.length ? '' : `of ${candidates.length} `}Candidates • Remote`}
                action={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={downloadCSV} disabled={candidates.length === 0}>
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                    <Button onClick={() => setIsUploadModalOpen(true)} disabled={isUploading}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Candidates
                    </Button>
                </div>
                }
            />

            <PipelineVisual counts={pipelineCounts} />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-sora font-semibold text-primary">Active Candidates</h2>
                </div>
                
                <CandidateFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    availableSkills={availableSkills}
                    availableJobs={[]}
                    totalCount={candidates.length}
                    filteredCount={filteredCandidates.length}
                />
                
                <CandidateTable 
                    data={filteredCandidates} 
                    onView={handleView}
                    onDelete={handleDelete}
                />
            </div>
        </div>
        
        <UploadCandidateModal 
            isOpen={isUploadModalOpen} 
            onClose={() => setIsUploadModalOpen(false)}
            onUpload={handleUpload}
        />

        {isDetailOpen && selectedCandidateId && (
          <CandidateDetailFrame
            candidateId={selectedCandidateId}
            jobId={jobId}
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            onStatusChange={fetchJobData}
          />
        )}

        <ConfirmDialog
          isOpen={!!candidateToDelete}
          onClose={() => setCandidateToDelete(null)}
          onConfirm={confirmDeleteCandidate}
          title="Remove Candidate"
          description="Are you sure you want to remove this candidate? This will delete all evaluation data for this candidate. This action cannot be undone."
          confirmText="Remove"
          variant="destructive"
        />
      </div>

      <JobContextPanel job={jobContext} />
    </div>
  )
}
