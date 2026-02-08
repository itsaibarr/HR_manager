"use client"

import * as React from "react"
import Link from "next/link"
import { Briefcase, Plus, MoreVertical, Edit2, Trash2, Power } from "lucide-react"
import { motion } from "framer-motion"

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
    if (!confirm('Are you sure you want to delete this job context? This will also remove all candidate evaluations.')) {
      return
    }
    
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
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
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
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
    </div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-border text-center space-y-4 min-h-[400px]">
      <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mb-2">
        <Briefcase className="w-8 h-8 text-black-soft/20" />
      </div>
      <h3 className="text-xl font-sora font-semibold text-black-soft">No Jobs Yet</h3>
      <p className="text-muted text-sm max-w-sm">
        Create your first job context to start screening candidates.
      </p>
      <Button className="mt-4" onClick={onCreate}>
        <Plus className="w-4 h-4 mr-2" />
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
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
    <Card className={`hover:shadow-lg transition-all duration-300 h-full group ${!job.is_active ? 'opacity-60' : ''}`}>
      <CardContent className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <Link href={`/dashboard/${job.id}`} className="flex-1">
            <h3 className="font-sora font-semibold text-lg text-black-soft group-hover:text-navy transition-colors">
              {job.title}
            </h3>
          </Link>
          <DropdownMenu
            trigger={
              <button className="p-2 hover:bg-accent rounded-md transition-colors group-hover:block">
                <MoreVertical className="w-5 h-5 text-muted-foreground hover:text-accent-foreground" />
              </button>
            }
          >
            <DropdownItem onClick={onEdit}>
              <span className="flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                Edit
              </span>
            </DropdownItem>
            <DropdownItem onClick={onToggleStatus}>
              <span className="flex items-center gap-2">
                <Power className="w-4 h-4" />
                {job.is_active ? 'Set Inactive' : 'Set Active'}
              </span>
            </DropdownItem>
            <DropdownSeparator />
            <DropdownItem onClick={onDelete} variant="destructive">
              <span className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete
              </span>
            </DropdownItem>
          </DropdownMenu>
        </div>

        <Link href={`/dashboard/${job.id}`} className="block">
          <div className="flex gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xl font-medium text-black-soft">
                {job.candidatesCount}
              </span>
              <span className="text-xs text-muted font-sora">Candidates</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-border/50 mt-4">
            <Badge 
              variant={job.is_active ? "fit-strong" : "outline"}
            >
              {job.is_active ? 'Active' : 'Inactive'}
            </Badge>
            <span className="text-xs text-muted font-sora">
              {new Date(job.created_at).toLocaleDateString()}
            </span>
          </div>
        </Link>
      </CardContent>
    </Card>
    </motion.div>
  )
}
