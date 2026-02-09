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
  jobIds: string[]
  sortBy: 'score' | 'name' | 'date'
}

interface CandidateFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  availableSkills: string[]
  availableJobs: { id: string, title: string }[]
  totalCount: number
  filteredCount: number
}

const SCORE_BANDS = [
  { value: 'strong', label: 'Force Multiplier', color: 'bg-green-600 hover:bg-green-700' },
  { value: 'good', label: 'Solid Contributor', color: 'bg-blue-600 hover:bg-blue-700' },
  { value: 'borderline', label: 'Baseline Capable', color: 'bg-yellow-600 hover:bg-yellow-700' },
  { value: 'reject', label: 'Do Not Proceed', color: 'bg-gray-600 hover:bg-gray-700' }
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
  availableJobs,
  totalCount,
  filteredCount
}: CandidateFiltersProps) {
  const [skillsDropdownOpen, setSkillsDropdownOpen] = useState(false)
  const [jobsDropdownOpen, setJobsDropdownOpen] = useState(false)
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

  const toggleJob = (jobId: string) => {
    const newJobs = filters.jobIds.includes(jobId)
      ? filters.jobIds.filter(id => id !== jobId)
      : [...filters.jobIds, jobId]
    onFiltersChange({ ...filters, jobIds: newJobs })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      scoreBands: [],
      skills: [],
      jobIds: [],
      sortBy: 'score'
    })
  }

  const activeFilterCount = 
    (filters.search ? 1 : 0) +
    filters.scoreBands.length +
    filters.skills.length +
    filters.jobIds.length +
    (filters.sortBy !== 'score' ? 1 : 0)

  return (
    <div className="space-y-3">
      {/* Filter Bar */}
      <div className="flex items-center gap-3 p-2 bg-paper border border-border/80 rounded-sm">
        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-muted/60" strokeWidth={2.4} />
          <Input
            placeholder="Search candidates..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-9 h-8 text-[13px] bg-transparent border-border/60"
          />
        </div>

        <div className="h-4 w-px bg-border/60 mx-1" />

        {/* Score Band Chips */}
        <div className="flex items-center gap-1.5">
          {SCORE_BANDS.map((band) => {
            const isActive = filters.scoreBands.includes(band.value)
            const colorClass = 
              band.value === 'strong' ? 'bg-strong-fit hover:bg-strong-fit/90' :
              band.value === 'good' ? 'bg-good-fit hover:bg-good-fit/90' :
              band.value === 'borderline' ? 'bg-borderline hover:bg-borderline/90' :
              'bg-muted hover:bg-muted/90'

            return (
              <button
                key={band.value}
                onClick={() => toggleScoreBand(band.value)}
                className={cn(
                  "px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-all",
                  isActive
                    ? `${colorClass} text-white`
                    : "border border-border/60 bg-transparent text-muted hover:bg-accent/50 hover:text-primary"
                )}
              >
                {band.label}
              </button>
            )
          })}
        </div>

        <div className="h-4 w-px bg-border/60 mx-1" />

        {/* Jobs Dropdown */}
        <div className="relative">
          <button
            onClick={() => setJobsDropdownOpen(!jobsDropdownOpen)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 border border-border/60 rounded-sm text-sm font-bold bg-transparent transition-all",
              filters.jobIds.length > 0 ? "border-primary/30 text-primary bg-primary/5" : "text-muted hover:bg-accent/50"
            )}
          >
            <span>Jobs</span>
            {filters.jobIds.length > 0 && (
              <span className="flex items-center justify-center w-5 h-5 bg-primary text-paper rounded-sm text-[12px] font-black px-1 min-w-[20px]">
                {filters.jobIds.length}
              </span>
            )}
            <ChevronDown className={cn("w-[14px] h-[14px] transition-transform", jobsDropdownOpen ? "rotate-180" : "")} strokeWidth={2.4} />
          </button>

          {jobsDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setJobsDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 mt-1 w-64 bg-popover border border-border rounded-sm shadow-lg z-20 max-h-64 overflow-y-auto">
                {availableJobs.length === 0 ? (
                  <div className="p-3 text-xs text-muted">No jobs available</div>
                ) : (
                  availableJobs.map((job) => (
                    <label
                      key={job.id}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.jobIds.includes(job.id)}
                        onChange={() => toggleJob(job.id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-xs text-card-foreground truncate font-medium">{job.title}</span>
                    </label>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Skills Dropdown */}
        <div className="relative">
          <button
            onClick={() => setSkillsDropdownOpen(!skillsDropdownOpen)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 border border-border/60 rounded-sm text-sm font-bold bg-transparent transition-all",
              filters.skills.length > 0 ? "border-primary/30 text-primary bg-primary/5" : "text-muted hover:bg-accent/50"
            )}
          >
            <span>Skills</span>
            {filters.skills.length > 0 && (
              <span className="flex items-center justify-center w-5 h-5 bg-primary text-paper rounded-sm text-[12px] font-black px-1 min-w-[20px]">
                {filters.skills.length}
              </span>
            )}
            <ChevronDown className={cn("w-[14px] h-[14px] transition-transform", skillsDropdownOpen ? "rotate-180" : "")} strokeWidth={2.4} />
          </button>

          {skillsDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setSkillsDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 mt-1 w-56 bg-paper border border-border rounded-sm shadow-xl z-20 max-h-64 overflow-y-auto">
                <div className="p-1">
                  {availableSkills.length === 0 ? (
                    <div className="p-3 text-xs text-muted">No skills available</div>
                  ) : (
                    availableSkills.map((skill) => (
                      <label
                        key={skill}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-accent rounded-sm cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={filters.skills.includes(skill)}
                          onChange={() => toggleSkill(skill)}
                          className="w-3.5 h-3.5 rounded-sm border-border text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-muted group-hover:text-primary font-medium transition-colors">{skill}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 border border-border/60 rounded-sm text-sm font-bold text-muted hover:bg-accent/50 transition-all"
          >
            Sort: {SORT_OPTIONS.find(o => o.value === filters.sortBy)?.label.split(' ')[0]}
            <ChevronDown className={cn("w-[14px] h-[14px] transition-transform", sortDropdownOpen ? "rotate-180" : "")} strokeWidth={2.4} />
          </button>

          {sortDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setSortDropdownOpen(false)}
              />
              <div className="absolute top-full right-0 mt-1 w-48 bg-paper border border-border rounded-sm shadow-xl z-20 p-1">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onFiltersChange({ ...filters, sortBy: option.value as FilterState['sortBy'] })
                      setSortDropdownOpen(false)
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm rounded-sm transition-all font-medium",
                      filters.sortBy === option.value 
                        ? "bg-accent text-primary font-bold" 
                        : "text-muted hover:bg-accent/60 hover:text-primary"
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
            className="h-8 px-2 text-[11px] text-muted hover:text-primary"
          >
            Clear
            <span className="ml-1.5 px-1 bg-accent text-[9px] font-bold rounded-sm border border-border/60">
              {activeFilterCount}
            </span>
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
