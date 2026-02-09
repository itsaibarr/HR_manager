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
      <div className={cn("relative bg-paper w-full max-w-lg rounded-sm shadow-[0_0_40px_rgba(0,0,0,0.12)] border border-border animate-in fade-in zoom-in-95 duration-200", className)}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
          <h2 className="text-lg font-sora font-extrabold text-primary tracking-tight">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-sm hover:bg-accent/50">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="px-6 py-5">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/60">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
