"use client"

import { useState } from "react"
import { Search, X, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface FilterState {
  search: string
  scoreBands: string[]
  skills: string[]
  sortBy: 'score' | 'name' | 'date'
}

interface CandidateFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  availableSkills: string[]
  totalCount: number
  filteredCount: number
}

const SCORE_BANDS = [
  { value: 'strong', label: 'Strong Fit', color: 'bg-green-600 hover:bg-green-700' },
  { value: 'good', label: 'Good Fit', color: 'bg-blue-600 hover:bg-blue-700' },
  { value: 'borderline', label: 'Borderline', color: 'bg-yellow-600 hover:bg-yellow-700' },
  { value: 'reject', label: 'Reject', color: 'bg-gray-600 hover:bg-gray-700' }
]

const SORT_OPTIONS = [
  { value: 'score', label: 'Score (High to Low)' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'date', label: 'Date (Recent First)' }
]

export function CandidateFilters({ 
  filters, 
  onFiltersChange, 
  availableSkills,
  totalCount,
  filteredCount
}: CandidateFiltersProps) {
  const [skillsDropdownOpen, setSkillsDropdownOpen] = useState(false)
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)

  const toggleScoreBand = (band: string) => {
    const newBands = filters.scoreBands.includes(band)
      ? filters.scoreBands.filter(b => b !== band)
      : [...filters.scoreBands, band]
    onFiltersChange({ ...filters, scoreBands: newBands })
  }

  const toggleSkill = (skill: string) => {
    const newSkills = filters.skills.includes(skill)
      ? filters.skills.filter(s => s !== skill)
      : [...filters.skills, skill]
    onFiltersChange({ ...filters, skills: newSkills })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      scoreBands: [],
      skills: [],
      sortBy: 'score'
    })
  }

  const activeFilterCount = 
    (filters.search ? 1 : 0) +
    filters.scoreBands.length +
    filters.skills.length +
    (filters.sortBy !== 'score' ? 1 : 0)

  return (
    <div className="space-y-3">
      {/* Filter Bar */}
      <div className="flex items-center gap-2 p-3 bg-white border border-border rounded-sm">
        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <Input
            placeholder="Search by name or role..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Score Band Chips */}
        <div className="flex items-center gap-2">
          {SCORE_BANDS.map((band) => {
            const isActive = filters.scoreBands.includes(band.value)
            return (
              <button
                key={band.value}
                onClick={() => toggleScoreBand(band.value)}
                className={cn(
                  "px-3 py-1.5 rounded text-xs font-medium transition-colors",
                  isActive
                    ? `${band.color} text-white`
                    : "border border-border bg-white text-muted hover:bg-gray-50"
                )}
              >
                {band.label}
              </button>
            )
          })}
        </div>

        {/* Skills Dropdown */}
        <div className="relative">
          <button
            onClick={() => setSkillsDropdownOpen(!skillsDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 border border-border rounded text-xs font-medium bg-white hover:bg-gray-50 transition-colors"
          >
            Skills
            {filters.skills.length > 0 && (
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-navy text-white">
                {filters.skills.length}
              </Badge>
            )}
            <ChevronDown className="w-3 h-3" />
          </button>

          {skillsDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setSkillsDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-border rounded-sm shadow-lg z-20 max-h-64 overflow-y-auto">
                {availableSkills.length === 0 ? (
                  <div className="p-3 text-xs text-muted">No skills available</div>
                ) : (
                  availableSkills.map((skill) => (
                    <label
                      key={skill}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.skills.includes(skill)}
                        onChange={() => toggleSkill(skill)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-xs text-black-soft">{skill}</span>
                    </label>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 border border-border rounded text-xs font-medium bg-white hover:bg-gray-50 transition-colors"
          >
            Sort: {SORT_OPTIONS.find(o => o.value === filters.sortBy)?.label.split(' ')[0]}
            <ChevronDown className="w-3 h-3" />
          </button>

          {sortDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setSortDropdownOpen(false)}
              />
              <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-border rounded-sm shadow-lg z-20">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onFiltersChange({ ...filters, sortBy: option.value as FilterState['sortBy'] })
                      setSortDropdownOpen(false)
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors",
                      filters.sortBy === option.value ? "bg-blue-50 text-navy font-medium" : "text-black-soft"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 px-3 text-xs text-muted hover:text-black-soft"
          >
            Clear
            <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-[10px]">
              {activeFilterCount}
            </Badge>
          </Button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Results Count */}
        {filteredCount !== totalCount && (
          <span className="text-xs text-muted">
            Showing {filteredCount} of {totalCount}
          </span>
        )}
      </div>
    </div>
  )
}
