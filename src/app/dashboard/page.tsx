"use client"

import * as React from "react"
import Link from "next/link"
import { Briefcase, Plus, MoreVertical, Edit2, Trash2, Power } from "lucide-react"
import { motion } from "framer-motion"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown"
import { JobFormModal } from "@/components/organisms/JobFormModal"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/useToast"
import { ToastContainer } from "@/components/ui/toast"

interface JobData {
  id: string
  title: string
  created_at: string
  is_active: boolean
  candidatesCount?: number
  original_description?: string
  responsibilities?: string[]
  must_have_skills?: string[]
  nice_to_have_skills?: string[]
  non_requirements?: string[]
}

export default function JobsPage() {
  const [jobs, setJobs] = React.useState<JobData[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [editingJob, setEditingJob] = React.useState<JobData | null>(null)
  const [jobToDelete, setJobToDelete] = React.useState<string | null>(null) // Added state for jobToDelete
  const supabase = createClient()
  const { toasts, showToast, dismissToast } = useToast()

  const fetchJobs = React.useCallback(async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('job_contexts')
      .select('*, evaluations(count)')
      .order('created_at', { ascending: false })
    
    if (data) {
      const mapped = (data as any[]).map((j: any) => ({
        id: j.id,
        title: j.title,
        created_at: j.created_at,
        is_active: j.is_active !== false,
        candidatesCount: j.evaluations?.[0]?.count || 0,
        original_description: j.original_description,
        responsibilities: j.responsibilities,
        must_have_skills: j.must_have_skills,
        nice_to_have_skills: j.nice_to_have_skills,
        non_requirements: j.non_requirements
      }))
      setJobs(mapped)
    }
    setIsLoading(false)
  }, [supabase])

  React.useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleCreateJob = async (data: { title: string, description?: string }) => {
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: data.title,
          description: data.description
        })
      })
      if (res.ok) {
        showToast('Job context created successfully', 'success')
        fetchJobs()
      } else {
        const errorData = await res.json().catch(() => ({}))
        console.error("Job creation failed:", errorData)
        const errorMessage = typeof errorData.details === 'object' 
          ? JSON.stringify(errorData.details) 
          : (errorData.details || errorData.error || 'Unknown error')
        showToast(`Failed to create job: ${errorMessage}`, 'error')
      }
    } catch (e) {
      console.error("Failed to create job", e)
      showToast('Failed to create job context', 'error')
    }
  }

  const handleUpdateJob = async (data: { title: string, description?: string }) => {
    if (!editingJob) return
    
    try {
      const res = await fetch(`/api/jobs/${editingJob.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: data.title,
          original_description: data.description
        })
      })
      if (res.ok) {
        showToast('Job context updated successfully', 'success')
        fetchJobs()
      } else {
        showToast('Failed to update job context', 'error')
      }
    } catch (e) {
      console.error("Failed to update job", e)
      showToast('Failed to update job context', 'error')
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    // Open confirmation dialog
    setJobToDelete(jobId)
  }

  const confirmDeleteJob = async () => {
    if (!jobToDelete) return

    try {
      const res = await fetch(`/api/jobs/${jobToDelete}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        showToast('Job context deleted', 'success')
        fetchJobs()
      } else {
        showToast('Failed to delete job context', 'error')
      }
    } catch (e) {
      console.error("Failed to delete job", e)
      showToast('Failed to delete job context', 'error')
    } finally {
      setJobToDelete(null)
    }
  }

  const handleToggleStatus = async (job: JobData) => {
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !job.is_active })
      })
      if (res.ok) {
        showToast(job.is_active ? 'Job set to inactive' : 'Job set to active', 'success')
        fetchJobs()
      } else {
        showToast('Failed to update job status', 'error')
      }
    } catch (e) {
      console.error("Failed to toggle status", e)
      showToast('Failed to update job status', 'error')
    }
  }

  const openEditModal = (job: JobData) => {
    setEditingJob(job)
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    setEditingJob(null)
    setIsModalOpen(true)
  }

  const handleModalSubmit = (data: { title: string, description?: string }) => {
    if (editingJob) {
      handleUpdateJob(data)
    } else {
      handleCreateJob(data)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      
      <PageHeader
        title="Job Contexts"
        subtitle="Manage your open roles and screening criteria."
        action={
          <Button onClick={openCreateModal} variant="brand" className="h-[40px] px-5 rounded-sm font-semibold text-[13px] tracking-tight">
            <Plus className="w-[14px] h-[14px] mr-1" strokeWidth={2.4} />
            New Job Context
          </Button>
        }
      />

      {isLoading ? (
        <div className="p-12 text-center text-muted">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <EmptyState onCreate={openCreateModal} />
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {jobs.map((job) => (
            <motion.div key={job.id} variants={item}>
              <JobCard 
                job={job} 
                onEdit={() => openEditModal(job)}
                onDelete={() => handleDeleteJob(job.id)}
                onToggleStatus={() => handleToggleStatus(job)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      <JobFormModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingJob(null) }} 
        onSubmit={handleModalSubmit}
        editingJob={editingJob}
      />

      <ConfirmDialog
        isOpen={!!jobToDelete}
        onClose={() => setJobToDelete(null)}
        onConfirm={confirmDeleteJob}
        title="Delete Job Context"
        description="Are you sure you want to delete this job context? This will also remove all candidate evaluations. This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-paper rounded-sm border border-border/80 text-center space-y-4 min-h-[400px]">
      <div className="w-14 h-14 bg-accent/40 rounded-sm flex items-center justify-center mb-2">
        <Briefcase className="w-[14px] h-[14px] text-muted/60" strokeWidth={2.4} />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-sora font-semibold text-primary">No Jobs Yet</h3>
        <p className="text-muted text-sm max-w-[280px] mx-auto leading-relaxed">
          Create your first job context to start screening candidates with AI.
        </p>
      </div>
      <Button variant="brand" className="mt-2 h-10 px-6 rounded-sm font-semibold text-[13px] tracking-tight" onClick={onCreate}>
        <Plus className="w-4 h-4 mr-2" strokeWidth={2.4} />
        Create Job Context
      </Button>
    </div>
  )
}

interface JobCardProps {
  job: JobData
  onEdit: () => void
  onDelete: () => void
  onToggleStatus: () => void
}

function JobCard({ job, onEdit, onDelete, onToggleStatus }: JobCardProps) {
  return (
    <motion.div>
      <div className={`
        group relative flex flex-col h-full bg-paper border border-border/60 rounded-sm
        transition-all duration-200 hover:border-primary/40 hover:shadow-sm overflow-hidden
        ${!job.is_active ? 'opacity-70' : ''}
      `}>
        {/* Active Indicator Line */}
        {job.is_active && (
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand group-hover:bg-brand/80 transition-colors" />
        )}

        <div className="p-5 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <Link href={`/dashboard/${job.id}`} className="flex-1 pr-4">
              <h3 className="font-sora font-semibold text-[15px] leading-snug text-foreground group-hover:text-brand transition-colors">
                {job.title}
              </h3>
            </Link>
            
            <DropdownMenu
              trigger={
                <button className="h-6 w-6 flex items-center justify-center -mr-1 text-muted hover:text-brand transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              }
            >
              <DropdownItem onClick={onEdit}>
                <span className="flex items-center gap-2">
                  <Edit2 className="w-[14px] h-[14px]" strokeWidth={2.4} />
                  Edit Context
                </span>
              </DropdownItem>
              <DropdownItem onClick={onToggleStatus}>
                <span className="flex items-center gap-2">
                  <Power className="w-[14px] h-[14px]" strokeWidth={2.4} />
                  {job.is_active ? 'Set Inactive' : 'Set Active'}
                </span>
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem onClick={onDelete} variant="destructive">
                <span className="flex items-center gap-2">
                  <Trash2 className="w-[14px] h-[14px]" strokeWidth={2.4} />
                  Delete
                </span>
              </DropdownItem>
            </DropdownMenu>
          </div>

          {/* Metrics - Technical Layout */}
          <Link href={`/dashboard/${job.id}`} className="flex-1">
            <div className="flex items-end gap-3 mb-6">
              <span className="font-mono text-3xl font-medium tracking-tight text-brand">
                {String(job.candidatesCount).padStart(2, '0')}
              </span>
              <span className="text-[11px] uppercase tracking-wider font-bold text-muted mb-1.5 font-mono">
                Candidates
              </span>
            </div>
          </Link>

          {/* Footer Meta */}
          <div className="mt-auto pt-4 border-t border-border/40 flex items-center justify-between">
            <div className={`
              inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wide border
              ${job.is_active 
                ? 'bg-brand/10 text-brand border-brand/20' 
                : 'bg-muted/10 text-muted border-muted/20'}
            `}>
              {job.is_active ? 'Active' : 'Archived'}
            </div>
            
            <span className="text-[11px] font-mono text-muted/60">
              {new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
