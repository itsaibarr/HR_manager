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
  const triggerRef = React.useRef<HTMLDivElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 })

  const updatePosition = React.useCallback(() => {
    if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        let top = rect.bottom + 4 // 4px gap
        const left = align === "right" ? rect.right : rect.left
        
        // Flip if close to bottom
        if (dropdownRef.current) {
            const dropdownHeight = dropdownRef.current.offsetHeight
            if (top + dropdownHeight > window.innerHeight - 10) {
                top = rect.top - dropdownHeight - 4
            }
        }

        setPosition({
            top,
            left,
            width: rect.width
        })
    }
  }, [align])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is inside trigger (handled by toggle) or inside menu (handled by click propagation)
      // But since menu is portal, we need to check if target is distinct
      if (triggerRef.current && triggerRef.current.contains(event.target as Node)) {
        return
      }
      
      const menuEl = document.getElementById("dropdown-portal-content")
      if (menuEl && menuEl.contains(event.target as Node)) {
        return
      }

      setIsOpen(false)
    }

    if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside)
        // Recalculate position on scroll/resize
        window.addEventListener("scroll", updatePosition, true)
        window.addEventListener("resize", updatePosition)
    }
    
    return () => {
        document.removeEventListener("mousedown", handleClickOutside)
        window.removeEventListener("scroll", updatePosition, true)
        window.removeEventListener("resize", updatePosition)
    }
  }, [isOpen, updatePosition])

  React.useLayoutEffect(() => {
    if (isOpen) {
        updatePosition()
    }
  }, [isOpen, updatePosition])

  return (
    <>
      <div 
        ref={triggerRef}
        className="inline-block cursor-pointer"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen) }}
      >
        {trigger}
      </div>
      {isOpen && (
         <Portal>
            <div 
                ref={dropdownRef}
                id="dropdown-portal-content"
                className="fixed z-50 bg-paper border border-border/80 rounded-sm shadow-[0_0_20px_rgba(0,0,0,0.08)] py-1.5 min-w-[160px]"
                style={{
                    top: position.top,
                    left: align === "right" ? undefined : position.left,
                    right: align === "right" ? window.innerWidth - position.left : undefined,
                }}
                onClick={() => setIsOpen(false)}
            >
                {children}
            </div>
         </Portal>
      )}
    </>
  )
}

import { createPortal } from "react-dom"

function Portal({ children }: { children: React.ReactNode }) {
    if (typeof window === "undefined") return null
    return createPortal(children, document.body)
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
