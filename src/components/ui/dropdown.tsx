"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: "left" | "right"
}

export function DropdownMenu({ trigger, children, align = "right" }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <div 
        className="inline-block cursor-pointer"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen) }}
      >
        {trigger}
      </div>
      {isOpen && (
        <div 
          className={cn(
            "absolute z-50 mt-1 min-w-[160px] bg-paper border border-border/80 rounded-sm shadow-[0_0_20px_rgba(0,0,0,0.08)] py-1.5",
            align === "right" ? "right-0" : "left-0"
          )}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  )
}

interface DropdownItemProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: "default" | "destructive"
  disabled?: boolean
}

export function DropdownItem({ children, onClick, variant = "default", disabled = false }: DropdownItemProps) {
  return (
    <button
      className={cn(
        "w-full text-left px-3 py-2 text-[13px] font-medium transition-colors",
        variant === "destructive" 
          ? "text-reject hover:bg-reject/5" 
          : "text-primary hover:bg-accent/60",
        disabled && "opacity-50 cursor-not-allowed text-muted"
      )}
      onClick={(e) => {
        e.preventDefault()
        if (!disabled && onClick) onClick()
      }}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export function DropdownSeparator() {
  return <div className="h-px bg-border my-1" />
}
