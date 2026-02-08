"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, footer, className }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Content */}
      <div className={cn("relative bg-card w-full max-w-lg rounded-lg shadow-xl border border-border animate-in fade-in zoom-in-95 duration-200", className)}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-sora font-semibold text-card-foreground">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-6">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-2 p-6 bg-muted/20 border-t border-border rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
