import { useState } from "react"
import { submitFeedback } from "@/app/actions/feedback-actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"


interface FeedbackComponentProps {
  evaluationId: string
  existingFeedback?: {
    agreement: 'agree' | 'disagree'
    note: string | null
  } | null
  onStatusChange?: (message: string, type: 'success' | 'error') => void
}

export function FeedbackComponent({ evaluationId, existingFeedback, onStatusChange }: FeedbackComponentProps) {
  const [agreement, setAgreement] = useState<'agree' | 'disagree' | null>(existingFeedback?.agreement || null)
  const [note, setNote] = useState(existingFeedback?.note || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = async (selectedAgreement: 'agree' | 'disagree') => {
    setIsSubmitting(true)
    
    setAgreement(selectedAgreement)
    
    const result = await submitFeedback(evaluationId, selectedAgreement, note)
    
    if (result.success) {
      onStatusChange?.("Feedback submitted", "success")
    } else {
      onStatusChange?.("Failed to submit feedback", "error")
    }
    setIsSubmitting(false)
  }

  const handleSaveNote = async () => {
    if (!agreement) return
    setIsSubmitting(true)
    const result = await submitFeedback(evaluationId, agreement, note)
    if (result.success) {
      onStatusChange?.("Note saved", "success")
      setIsExpanded(false)
    } else {
        onStatusChange?.("Failed to save note", "error")
    }
    setIsSubmitting(false)
  }

  return (
    <div className="bg-accent/10 border border-border/60 rounded-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Human Feedback</h3>
          <p className="text-[11px] text-muted-foreground font-medium">Do you agree with this AI evaluation?</p>
        </div>
        <div className="flex gap-4">
          <Button
            variant={agreement === 'agree' ? 'default' : 'outline'}
            onClick={() => handleSubmit('agree')}
            className={cn(
                "h-11 px-8 min-w-[140px] gap-3 rounded-sm font-sora text-[13px] font-bold uppercase tracking-widest transition-all",
                agreement === 'agree' 
                    ? 'bg-good-fit hover:bg-good-fit/90 text-white border-transparent' 
                    : 'text-primary border-border/60 hover:border-good-fit/50 hover:text-good-fit'
            )}
            disabled={isSubmitting}
          >
            <ThumbsUp className="w-5 h-5" strokeWidth={2.4} />
            Agree
          </Button>
          <Button
            variant={agreement === 'disagree' ? 'default' : 'outline'}
            onClick={() => handleSubmit('disagree')}
            className={cn(
                "h-11 px-8 min-w-[140px] gap-3 rounded-sm font-sora text-[13px] font-bold uppercase tracking-widest transition-all",
                agreement === 'disagree' 
                    ? 'bg-reject hover:bg-reject/90 text-white border-transparent' 
                    : 'text-primary border-border/60 hover:border-reject/50 hover:text-reject'
            )}
            disabled={isSubmitting}
          >
            <ThumbsDown className="w-5 h-5" strokeWidth={2.4} />
            Disagree
          </Button>
        </div>
      </div>

      {agreement && (
        <div className="pt-2 animate-in fade-in slide-in-from-top-2">
            {!isExpanded && !note && (
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsExpanded(true)}
                    className="text-xs text-muted-foreground hover:text-primary h-auto p-0"
                >
                    <MessageSquare className="w-3 h-3 mr-1.5" />
                    Add a note (optional)
                </Button>
            )}

            {(isExpanded || note) && (
                <div className="space-y-6 pt-2">
                    <Textarea 
                        placeholder="Explain your technical reasoning or context..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="text-[13px] min-h-[120px] bg-paper rounded-sm border-border/60 focus:border-primary/40 focus:ring-2 focus:ring-primary/5 transition-all resize-none p-4 leading-relaxed"
                    />
                        <div className="flex justify-end items-center gap-4">
                             <Button 
                                variant="ghost" 
                                onClick={() => setIsExpanded(false)}
                                className="h-11 px-6 text-[13px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all"
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleSaveNote}
                                disabled={isSubmitting}
                                className="h-11 px-10 rounded-sm bg-primary text-paper font-sora text-[13px] font-bold uppercase tracking-widest transition-all paper-shadow active:scale-[0.98]"
                            >
                                {isSubmitting ? "Saving..." : "Save Note"}
                            </Button>
                        </div>
                </div>
            )}
        </div>
      )}
    </div>
  )
}
