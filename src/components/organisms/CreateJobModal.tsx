"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface CreateJobModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (jobData: any) => void
}

export function CreateJobModal({ isOpen, onClose, onCreate }: CreateJobModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isFullJd, setIsFullJd] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate({ title, description })
    setTitle("")
    setDescription("")
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Job Context"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title}>Create Context</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
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

            {isFullJd ? (
                <div className="space-y-2">
                <label className="text-sm font-medium text-primary">Job Description (Paste Full Text)</label>
                <div className="text-xs text-gray-500 mb-1">We'll extract skills & requirements automatically.</div>
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
