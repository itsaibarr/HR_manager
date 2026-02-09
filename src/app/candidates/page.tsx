"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { CandidateTable } from "@/components/organisms/CandidateTable"
import { CandidateDetailFrame } from "@/components/organisms/CandidateDetailFrame"
import { CandidateFilters, FilterState } from "@/components/organisms/CandidateFilters"
import { createClient } from "@/lib/supabase/client"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { useToast } from "@/hooks/useToast"
import { ToastContainer } from "@/components/ui/toast"

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([])
  const [jobContexts, setJobContexts] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    scoreBands: [],
    skills: [],
    jobIds: [],
    sortBy: 'score'
  })
  const [candidateToDelete, setCandidateToDelete] = useState<string | null>(null)
  const { toasts, showToast, dismissToast } = useToast()
  
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    
    // Fetch all job contexts for name mapping
    const { data: jobs } = await supabase
      .from('job_contexts')
      .select('id, title')
    
    if (jobs) {
      const jobMap: Record<string, string> = {}
      jobs.forEach((j: any) => { jobMap[j.id] = j.title })
      setJobContexts(jobMap)
    }

    // Fetch all evaluations with candidate profiles
    const { data: evaluations } = await (supabase as any)
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
      .order('created_at', { ascending: false })

    if (evaluations) {
      const mapped = evaluations.map((ev: any) => ({
        id: ev.candidate_id,
        evaluationId: ev.id,
        jobContextId: ev.job_context_id,
        name: ev.candidate_profiles?.full_name || `Candidate ${ev.candidate_id.substring(0,6)}`, 
        initials: ev.candidate_profiles?.full_name 
          ? ev.candidate_profiles.full_name.split(' ').map((n: string) => n[0]).join('').substring(0,2) 
          : "CA",
        role: ev.candidate_profiles?.experience?.[0]?.title || "Applicant",
        experienceRaw: ev.candidate_profiles?.experience?.length 
          ? `${ev.candidate_profiles.experience.length} roles` 
          : "N/A",
        score: ev.final_score,
        scoreBand: ev.final_score >= 85 ? 'strong' 
          : ev.final_score >= 70 ? 'good' 
          : ev.final_score >= 60 ? 'borderline' 
          : 'reject',
        status: ev.status || 'pending',
        topSkills: ev.candidate_profiles?.skills?.slice(0,3) || [],
        appliedAt: new Date(ev.created_at).toLocaleDateString()
      }))
      setCandidates(mapped)
    }
    
    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleView = (candidateId: string) => {
    const candidate = candidates.find(c => c.id === candidateId)
    if (candidate) {
      setSelectedCandidateId(candidateId)
      setSelectedJobId(candidate.jobContextId)
      setIsDetailOpen(true)
    }
  }

  const handleDelete = async (candidateId: string) => {
    setCandidateToDelete(candidateId)
  }

  const confirmDeleteCandidate = async () => {
    if (!candidateToDelete) return
    const candidate = candidates.find(c => c.id === candidateToDelete)
    if (!candidate) return

    try {
      const res = await fetch(`/api/candidates?jobId=${candidate.jobContextId}&candidateId=${candidateToDelete}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        showToast("Candidate removed successfully", "success")
        fetchData()
      } else {
        showToast("Failed to delete candidate.", "error")
      }
    } catch (e) {
      console.error(e)
      showToast("Error deleting candidate.", "error")
    } finally {
      setCandidateToDelete(null)
    }
  }

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
        c.role.toLowerCase().includes(searchLower) ||
        jobContexts[c.jobContextId]?.toLowerCase().includes(searchLower)
      )

    }

    // Apply job filter
    if (filters.jobIds.length > 0) {
      filtered = filtered.filter(c => filters.jobIds.includes(c.jobContextId))
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
  }, [candidates, filters, jobContexts])

  const downloadCSV = () => {
    if (candidates.length === 0) return
    
    const headers = ['Name', 'Job', 'Role', 'Experience', 'Score', 'Band', 'Status', 'Top Skills', 'Applied At']
    const rows = candidates.map(c => [
      `"${c.name}"`,
      `"${jobContexts[c.jobContextId] || 'Unknown'}"`,
      `"${c.role}"`,
      `"${c.experienceRaw}"`,
      c.score,
      c.scoreBand,
      c.status,
      `"${c.topSkills.join(', ')}"`,
      c.appliedAt
    ])
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n")
        
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `all-candidates.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <PageHeader
        title="All Candidates"
        subtitle={`${filteredCandidates.length} ${filteredCandidates.length === candidates.length ? '' : `of ${candidates.length} `}candidates across all jobs`}
        action={
          <Button variant="outline" onClick={downloadCSV} disabled={candidates.length === 0}>
            <Download className="w-[14px] h-[14px] mr-2" strokeWidth={2.4} />
            Export CSV
          </Button>
        }
      />

      {isLoading ? (
        <div className="p-12 text-center text-muted">Loading candidates...</div>
      ) : candidates.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-muted">No candidates found. Start by creating a job and uploading candidates.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <CandidateFilters
            filters={filters}
            onFiltersChange={setFilters}
            availableSkills={availableSkills}
            availableJobs={Object.entries(jobContexts).map(([id, title]) => ({ id, title }))}
            totalCount={candidates.length}
            filteredCount={filteredCandidates.length}
          />
          
          <CandidateTable 
            data={filteredCandidates.map(c => ({
              ...c,
              jobContextName: jobContexts[c.jobContextId] || 'Unknown Job'
            }))}
            onView={handleView}
            onDelete={handleDelete}
            showJobColumn={true}
          />
        </div>
      )}

      {selectedJobId && (
        <CandidateDetailFrame
          candidateId={selectedCandidateId}
          jobId={selectedJobId}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onStatusChange={fetchData}
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
  )
}
