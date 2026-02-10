"use client"

import { useState, useEffect, useCallback, use, useMemo } from "react"
import Papa from "papaparse"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Plus, Download, Trash2, Star } from "lucide-react"
import { PipelineVisual } from "@/components/organisms/PipelineVisual"
import { CandidateTable } from "@/components/organisms/CandidateTable"
import { JobContextPanel } from "@/components/organisms/JobContextPanel"
import { UploadCandidateModal } from "@/components/organisms/UploadCandidateModal"
import { TimeSavedMetric } from "@/components/organisms/TimeSavedMetric"
import { getScoreBand } from "@/lib/evaluation/framework"
import { CandidateDetailFrame } from "@/components/organisms/CandidateDetailFrame"
import { CandidateFilters, FilterState } from "@/components/organisms/CandidateFilters"
import { deleteCandidates, bulkUpdateCandidateStatus } from "@/app/actions/candidate-actions"
import { RoleSwitcher } from "@/components/organisms/RoleSwitcher"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/useToast"
import { ToastContainer } from "@/components/ui/toast"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { BulkShortlistDialog } from "@/components/organisms/BulkShortlistDialog"
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
  const [candidatesToDelete, setCandidatesToDelete] = useState<string[] | null>(null)
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([])
  const [isShortlistDialogOpen, setIsShortlistDialogOpen] = useState(false)
  const { toasts, showToast, dismissToast } = useToast()
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    scoreBands: [],
    skills: [],
    jobIds: [],
    sortBy: 'score'
  })
  const [shortlistMode, setShortlistMode] = useState<number | null>(null)
  const [sidePanelWidth, setSidePanelWidth] = useState(340)
  const [isResizing, setIsResizing] = useState(false)

  // Initialize side panel width from localStorage
  useEffect(() => {
    const savedWidth = localStorage.getItem('sidePanelWidth')
    if (savedWidth) {
      setSidePanelWidth(parseInt(savedWidth, 10))
    }
  }, [])

  const startResizing = useCallback(() => {
    setIsResizing(true)
  }, [])

  const stopResizing = useCallback(() => {
    setIsResizing(false)
    localStorage.setItem('sidePanelWidth', sidePanelWidth.toString())
  }, [sidePanelWidth])

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing) {
        // Calculate new width: viewport width - mouse X position
        // This assumes the panel is on the RIGHT side.
        const newWidth = window.innerWidth - mouseMoveEvent.clientX
        // Constrain width
        if (newWidth > 280 && newWidth < 600) {
          setSidePanelWidth(newWidth)
        }
      }
    },
    [isResizing]
  )

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize)
      window.addEventListener("mouseup", stopResizing)
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
    } else {
      window.removeEventListener("mousemove", resize)
      window.removeEventListener("mouseup", stopResizing)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
    return () => {
      window.removeEventListener("mousemove", resize)
      window.removeEventListener("mouseup", stopResizing)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [isResizing, resize, stopResizing])
  
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
            email: ev.candidate_profiles?.email || null, 
            initials: ev.candidate_profiles?.full_name ? ev.candidate_profiles.full_name.split(' ').map((n: string) => n[0]).join('').substring(0,2) : "CA",
            role: ev.candidate_profiles?.experience?.[0]?.title || "Applicant",
            experienceRaw: ev.candidate_profiles?.experience?.length ? `${ev.candidate_profiles.experience.length} roles` : "N/A",
            score: ev.final_score,
            // Calculate band on the fly to fix existing records with gaps
            scoreBand: getScoreBand(ev.final_score),
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

  const handleBulkDelete = () => {
      setCandidatesToDelete(selectedCandidateIds)
  }

  const confirmBulkDelete = async () => {
      if (!candidatesToDelete) return

      try {
          const res = await deleteCandidates(candidatesToDelete, jobId)
          
          if (res.success) {
              setCandidates(prev => prev.filter(c => !candidatesToDelete.includes(c.id)))
              setPipelineCounts(prev => ({ ...prev })) // Simplified update
              fetchJobData()
              setSelectedCandidateIds([])
              showToast(res.message, "success")
          } else {
              showToast(res.message, "error")
          }
      } catch (e) {
          console.error(e)
          showToast("Error deleting candidates", "error")
      } finally {
          setCandidatesToDelete(null)
      }
  }

  const handleBulkShortlist = async () => {
    if (selectedCandidateIds.length === 0) return

    // Prevent moving candidates backward from advanced stages
    const candidatesToUpdate = selectedCandidateIds.filter(id => {
        const candidate = candidates.find(c => c.id === id)
        // Only allow update if status is NOT 'interviewing' or 'offered'
        // We allow 'shortlisted' (no-op), 'pending', 'rejected'
        return candidate && !['interviewing', 'offered'].includes(candidate.status)
    })

    if (candidatesToUpdate.length === 0) {
        showToast("Selected candidates are already in advanced stages (Interviewing/Offered).", "info")
        return
    }

    const skippedCount = selectedCandidateIds.length - candidatesToUpdate.length

    try {
        const res = await bulkUpdateCandidateStatus(candidatesToUpdate, 'shortlisted', jobId)
        if (res.success) {
            const message = skippedCount > 0 
                ? `${res.message}. (${skippedCount} advanced candidates skipped)`
                : res.message
            
            showToast(message, "success")
            setSelectedCandidateIds([])
            fetchJobData()
        } else {
            showToast(res.message, "error")
        }
    } catch (e) {
        console.error(e)
        showToast("Error updating candidates", "error")
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
        showToast(`Import finished: ${successCount} success, ${failCount} failed. Check console.`, "warning")
    } else {
        showToast(`Successfully imported all ${successCount} candidates!`, "success")
    }
  }

  const downloadCSV = () => {
    if (candidates.length === 0) return
    
    const headers = ['Name', 'Email', 'Role', 'Experience', 'Score', 'Band', 'Top Skills', 'Applied At']
    const rows = candidates.map(c => [
        `"${c.name}"`,
        `"${c.email || ''}"`,
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

    // Apply Shortlist Limit
    if (shortlistMode) {
        // If sorting isn't score, we should probably sort by score first? 
        // Or respect current sort? 
        // "Shortlist" usually implies "Best". 
        // Let's force score sort if shortlist mode is active AND user hasn't explicitly sorted by something else?
        // Actually simplest is just slice the resulting list.
        return filtered.slice(0, shortlistMode)
    }

    return filtered
  }, [candidates, filters, shortlistMode])

  return (
    <div className="flex h-full min-h-screen bg-background">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-6 w-full space-y-6">
          <ToastContainer toasts={toasts} onDismiss={dismissToast} />
          <PageHeader
                title={jobTitle}
                subtitle={`${filteredCandidates.length} ${filteredCandidates.length === candidates.length ? '' : `of ${candidates.length} `}Candidates • Remote`}
                action={
                <div className="flex gap-2">
                    <RoleSwitcher currentJobId={jobId} />
                    <Button variant="outline" onClick={downloadCSV} disabled={candidates.length === 0} className="rounded-sm border-border/60">
                        <Download className="w-[14px] h-[14px] mr-2" strokeWidth={2.4} />
                        Export CSV
                    </Button>
                    <Button 
                        variant="brand" 
                        onClick={() => setIsUploadModalOpen(true)} 
                        disabled={isUploading} 
                        className="rounded-sm"
                    >
                        <Plus className="w-[14px] h-[14px] mr-2" strokeWidth={2.4} />
                        Add Candidates
                    </Button>
                </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3">
                    <div className="bg-paper border border-border/60 rounded-sm p-1 overflow-hidden">
                        <PipelineVisual counts={pipelineCounts} />
                    </div>
                </div>
                <div className="lg:col-span-1">
                     <div className="h-full bg-paper border border-border/60 rounded-sm p-4 hover:border-brand/20 transition-colors group">
                        <TimeSavedMetric candidateCount={candidates.length} />
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <div className="flex items-baseline gap-3">
                        <h2 className="text-lg font-sora font-semibold text-foreground">Active Candidates</h2>
                        <span className="text-xs font-mono text-muted">/{filteredCandidates.length}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-paper border border-border/40 rounded-sm p-0.5">
                            <Button 
                                variant={shortlistMode === 5 ? "brand" : "ghost"} 
                                size="sm" 
                                onClick={() => setShortlistMode(5)}
                                className={cn("h-7 text-[10px] font-bold uppercase tracking-widest rounded-xs px-3 transition-colors", shortlistMode === 5 ? "shadow-sm" : "text-muted var-hover")}
                            >
                                Top 5
                            </Button>
                            <Button 
                                variant={shortlistMode === 10 ? "brand" : "ghost"} 
                                size="sm" 
                                onClick={() => setShortlistMode(10)}
                                className={cn("h-7 text-[10px] font-bold uppercase tracking-widest rounded-xs px-3 transition-colors", shortlistMode === 10 ? "shadow-sm" : "text-muted var-hover")}
                            >
                                Top 10
                            </Button>
                            {shortlistMode && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setShortlistMode(null)}
                                    className="h-7 text-[10px] font-bold uppercase tracking-widest text-destructive hover:bg-destructive/10 rounded-xs px-3"
                                >
                                    Clear
                                </Button>
                            )}
                    </div>
                </div>
                
                <CandidateFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    availableSkills={availableSkills}
                    availableJobs={[]}
                    totalCount={candidates.length}
                    filteredCount={filteredCandidates.length}
                />
                
                <div className="rounded-sm border border-border/60 overflow-hidden bg-paper">
                    <CandidateTable 
                        data={filteredCandidates} 
                        onView={handleView}
                        onDelete={handleDelete}
                        selectedIds={selectedCandidateIds}
                        onSelectionChange={setSelectedCandidateIds}
                    />
                </div>

                <AnimatePresence>
                    {selectedCandidateIds.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="fixed bottom-[35px] left-1/2 transform -translate-x-1/2 bg-[#1A1D21] border border-white/10 shadow-2xl shadow-black/40 rounded-[15px] px-[10px] py-[10px] flex items-center gap-1 z-50"
                        >
                            <span className="text-sm font-medium text-muted-foreground mr-3 px-2">
                                <span className="text-white font-semibold mr-1">Selected:</span> 
                                {selectedCandidateIds.length}
                            </span>
                            
                            <div className="h-[10px] w-px bg-white/40 mx-1"></div>
                            
                            <Button 
                                variant="ghost" 
                                className="h-[30px] rounded-[10px] px-[14px] gap-2 text-white hover:bg-white/10 hover:text-white transition-all font-sora text-[11px] font-medium tracking-wide"
                                onClick={() => setIsShortlistDialogOpen(true)}
                            >
                                <Star className="w-3.5 h-3.5" strokeWidth={2} />
                                Shortlist
                            </Button>

                            <div className="h-[10px] w-px bg-white/40 mx-1"></div>

                            {/* Assuming an 'Email' or 'Assign' action might replace this if desired, but sticking to existing actions for now */}

                            <Button 
                                variant="ghost" 
                                className="h-[30px] rounded-[10px] px-[14px] gap-2 text-white hover:bg-white/10 hover:text-white transition-all font-sora text-[11px] font-medium tracking-wide"
                                onClick={() => setSelectedCandidateIds([])}
                            >
                                Discard
                            </Button>

                            <div className="h-[10px] w-px bg-white/40 mx-1"></div>

                            <Button 
                                variant="default" 
                                className="h-[30px] rounded-[10px] bg-white text-destructive border border-transparent hover:bg-destructive hover:text-white transition-all font-sora text-[11px] font-bold tracking-wide px-5 ml-2 shadow-sm"
                                onClick={handleBulkDelete}
                            >
                                <Trash2 className="w-3.5 h-3.5 mr-2" strokeWidth={2} />
                                Delete
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <BulkShortlistDialog 
                    isOpen={isShortlistDialogOpen}
                    onClose={() => setIsShortlistDialogOpen(false)}
                    onConfirm={async (shouldSendEmail) => {
                        setIsShortlistDialogOpen(false)

                        const candidatesToUpdate = selectedCandidateIds.filter(id => {
                            const candidate = candidates.find(c => c.id === id)
                            return candidate && !['interviewing', 'offered'].includes(candidate.status)
                        })

                        if (candidatesToUpdate.length === 0) {
                            showToast("Selected candidates are already in advanced stages (Interviewing/Offered).", "info")
                            return
                        }

                        const skippedCount = selectedCandidateIds.length - candidatesToUpdate.length

                        try {
                            const res = await bulkUpdateCandidateStatus(candidatesToUpdate, 'shortlisted', jobId, shouldSendEmail)
                            if (res.success) {
                                const message = skippedCount > 0 
                                    ? `${res.message}. (${skippedCount} advanced candidates skipped)`
                                    : res.message
                                
                                showToast(message, "success")
                                setSelectedCandidateIds([])
                                fetchJobData()
                            } else {
                                showToast(res.message, "error")
                            }
                        } catch (e) {
                            console.error(e)
                            showToast("Error updating candidates", "error")
                        }
                    }}
                    count={selectedCandidateIds.length}
                    skippedCount={selectedCandidateIds.filter(id => {
                        const candidate = candidates.find(c => c.id === id)
                        return candidate && ['interviewing', 'offered'].includes(candidate.status)
                    }).length}
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
            onStatusChange={(message, type) => {
                if (message) showToast(message, type || 'info')
                fetchJobData()
            }}
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

        <ConfirmDialog
          isOpen={!!candidatesToDelete}
          onClose={() => setCandidatesToDelete(null)}
          onConfirm={confirmBulkDelete}
          title={`Remove ${candidatesToDelete?.length} Candidates`}
          description={`Are you sure you want to remove these ${candidatesToDelete?.length} candidates? This will delete all evaluation data for them. This action cannot be undone.`}
          confirmText="Remove Candidates"
          variant="destructive"
        />
      </div>
      
      {/* Draggable Divider */}
      <div 
        className={cn(
          "w-3 px-1 h-full cursor-col-resize transition-all duration-150 shrink-0 z-40 group/resizer flex items-center justify-center",
          isResizing ? "opacity-100" : "opacity-0 hover:opacity-100"
        )}
        onMouseDown={startResizing}
      >
        <div className={cn(
          "w-[2px] h-full transition-colors",
          isResizing ? "bg-brand" : "bg-brand/20 group-hover/resizer:bg-brand/40"
        )} />
      </div>

      <JobContextPanel job={jobContext} width={sidePanelWidth} />
    </div>
  )
}
