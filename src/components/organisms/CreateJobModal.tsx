"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create New Job Context</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="py-4">
          <div className="flex gap-6 border-b border-border/40 mb-6">
            <button 
              type="button"
              className={cn(
                "pb-3 text-[11px] font-bold uppercase tracking-wider transition-all relative border-b-2",
                !isFullJd ? "text-primary border-primary" : "text-muted border-transparent"
              )}
              onClick={() => setIsFullJd(false)}
            >
              Quick Create
            </button>
            <button 
              type="button"
              className={cn(
                "pb-3 text-[11px] font-bold uppercase tracking-wider transition-all relative border-b-2",
                isFullJd ? "text-primary border-primary" : "text-muted border-transparent"
              )}
              onClick={() => setIsFullJd(true)}
            >
              Paste Full JD
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Job Title</label>
              <Input 
                placeholder="e.g. Senior Product Designer" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                className="h-11 border-border/80 focus:border-brand/40 focus:ring-0 rounded-sm"
              />
            </div>

            {isFullJd ? (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Job Description (Paste Full Text)</label>
                <div className="text-[11px] text-muted/60 mb-2">We'll extract skills & requirements automatically.</div>
                <Textarea 
                  placeholder="Paste the full job description here..." 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[200px] font-mono text-xs leading-relaxed bg-accent/5 border-border/80 focus:border-brand/40 focus:ring-0 rounded-sm p-4"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Short Summary</label>
                <div className="text-[11px] text-muted/60 mb-2">We'll generate requirements based on the title and this summary.</div>
                <Input 
                  placeholder="e.g. Looking for a senior designer with Fintech experience..." 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-11 border-border/80 focus:border-brand/40 focus:ring-0 rounded-sm"
                />
              </div>
            )}
          </div>
        </form>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="h-11 px-8 rounded-sm font-black text-[10px] uppercase tracking-widest border-2">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!title}
            className="h-11 px-8 rounded-sm font-black text-[10px] uppercase tracking-widest bg-primary hover:bg-brand"
          >
            Create Context
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
