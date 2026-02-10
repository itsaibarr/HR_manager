"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
// @ts-ignore
import { Checkbox } from "@/components/ui/checkbox"
// @ts-ignore
import { Label } from "@/components/ui/label"

interface BulkShortlistDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (shouldSendEmail: boolean) => void
  count: number
  skippedCount: number
  isLoading?: boolean
}

export function BulkShortlistDialog({
  isOpen,
  onClose,
  onConfirm,
  count,
  skippedCount,
  isLoading = false,
}: BulkShortlistDialogProps) {
  const [sendEmail, setSendEmail] = useState(false)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Shortlist Candidates"
      className="max-w-md"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="default" // Primary action
            onClick={() => onConfirm(sendEmail)}
            disabled={isLoading}
          >
            Shortlist {count} Candidates
          </Button>
        </>
      }
    >
      <div className="pt-4 space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          You are about to move <strong>{count}</strong> candidates to the <strong>Shortlisted</strong> stage.
        </p>

        {skippedCount > 0 && (
            <div className="bg-accent/30 p-3 rounded-sm border border-accent">
                <p className="text-xs text-muted-foreground">
                    Note: <strong>{skippedCount}</strong> candidates were skipped because they are already in advanced stages (Interviewing/Offered).
                </p>
            </div>
        )}

        <div className="flex items-start space-x-3 pt-2">
          <Checkbox 
            id="sendEmail" 
            checked={sendEmail} 
            onCheckedChange={(checked: boolean) => setSendEmail(checked)} 
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="sendEmail"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Send email notification
            </Label>
            <p className="text-[11px] text-muted-foreground">
              If checked, candidates will receive an email notifying them that they have been shortlisted.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  )
}
