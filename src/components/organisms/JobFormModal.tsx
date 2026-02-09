"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface JobFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (jobData: { title: string, description?: string }) => void
  editingJob?: {
    id: string
    title: string
    original_description?: string
  } | null
}

export function JobFormModal({ isOpen, onClose, onSubmit, editingJob }: JobFormModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isFullJd, setIsFullJd] = useState(false)

  // Reset form when modal opens/closes or editing job changes
  useEffect(() => {
    if (isOpen) {
      if (editingJob) {
        setTitle(editingJob.title)
        setDescription(editingJob.original_description || "")
        setIsFullJd(!!editingJob.original_description)
      } else {
        setTitle("")
        setDescription("")
        setIsFullJd(false)
      }
    }
  }, [isOpen, editingJob])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ title, description })
    onClose()
  }

  const isEditing = !!editingJob

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Job Context" : "Create New Job Context"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title}>
            {isEditing ? "Save Changes" : "Create Context"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {!isEditing && (
          <div className="flex gap-4 border-b border-gray-100 mb-4">
            <button 
              type="button"
              className={`pb-2 text-sm font-medium ${!isFullJd ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
              onClick={() => setIsFullJd(false)}
            >
              Quick Create
            </button>
            <button 
              type="button"
              className={`pb-2 text-sm font-medium ${isFullJd ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
              onClick={() => setIsFullJd(true)}
            >
              Paste Full JD
            </button>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary">Job Title</label>
            <Input 
              placeholder="e.g. Senior Product Designer" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {(isFullJd || isEditing) ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">
                {isEditing ? "Job Description" : "Job Description (Paste Full Text)"}
              </label>
              <div className="text-xs text-gray-500 mb-1">
                {isEditing 
                  ? "Original description that was used to generate requirements."
                  : "We'll extract skills & requirements automatically."
                }
              </div>
              <Textarea 
                placeholder="Paste the full job description here..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[200px] font-sora text-sm leading-relaxed"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">Short Summary</label>
              <div className="text-xs text-gray-500 mb-1">We'll generate requirements based on the title and this summary.</div>
              <Input 
                placeholder="e.g. Looking for a senior designer with Fintech experience..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          )}
        </div>
      </form>
    </Modal>
  )
}
