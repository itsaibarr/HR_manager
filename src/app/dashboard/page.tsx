"use client"

import * as React from "react"
import Link from "next/link"
import { Briefcase, Plus, MoreVertical } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreateJobModal } from "@/components/organisms/CreateJobModal"
import { createClient } from "@/lib/supabase/client"

// We define a local interface that matches what we expect from the API/DB
// This might differ slightly from the Schema if we don't map keys perfectly yet,
// but for now we look for snake_case or camelCase.
interface JobData {
  id: string
  title: string
  created_at: string
  candidatesCount?: number // We might need to fetch this separately or use a join
}

export default function JobsPage() {
  const [jobs, setJobs] = React.useState<JobData[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
  const supabase = createClient()

  const fetchJobs = React.useCallback(async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('job_contexts')
      .select('*, evaluations(count)') // We can count evaluations as proxy for candidates
      .order('created_at', { ascending: false })
    
    if (data) {
        // Transform for display
        const mapped = (data as any[]).map((j: any) => ({
            id: j.id,
            title: j.title,
            created_at: j.created_at,
            candidatesCount: j.evaluations?.[0]?.count || 0 // evaluations(count) returns array of objects
        }))
        setJobs(mapped)
    }
    setIsLoading(false)
  }, [supabase])

  React.useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleCreateJob = async (data: { title: string, description?: string }) => {
    // Call API to create job
    // Then refresh list
    try {
        const res = await fetch('/api/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                title: data.title,
                responsibilities: ["Standard responsibilities"], // Default for MVP quick create
                mustHaveSkills: ["General"], // Default
                niceToHaveSkills: [], 
                nonRequirements: []
             })
        })
        if (res.ok) {
            fetchJobs()
        }
    } catch (e) {
        console.error("Failed to create job", e)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Job Contexts"
        subtitle="Manage your open roles and screening criteria."
        action={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Job Context
          </Button>
        }
      />

      {isLoading ? (
          <div className="p-12 text-center text-muted">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <EmptyState onCreate={() => setIsCreateModalOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      <CreateJobModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCreate={handleCreateJob}
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

function JobCard({ job }: { job: JobData }) {
  return (
    <Link href={`/dashboard/${job.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full group">
        <CardContent className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <h3 className="font-sora font-semibold text-lg text-black-soft group-hover:text-navy transition-colors">
              {job.title}
            </h3>
            <MoreVertical className="w-4 h-4 text-muted" />
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xl font-medium text-black-soft">
                {job.candidatesCount}
              </span>
              <span className="text-xs text-muted font-sora">Candidates</span>
            </div>
             {/* Strong fit count would require more complex query, hiding for simple MVP listing */}
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-border/50">
            <Badge variant="fit-strong" className="bg-green-100 text-green-800">
              Active
            </Badge>
            <span className="text-xs text-muted font-sora">
                {new Date(job.created_at).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
