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
            "absolute z-50 mt-1 min-w-[160px] bg-popover border border-border rounded-md shadow-lg py-1 text-popover-foreground",
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
        "w-full text-left px-3 py-2 text-sm transition-colors",
        variant === "destructive" 
          ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" 
          : "text-black-soft hover:bg-accent hover:text-accent-foreground",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
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
