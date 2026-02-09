"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronsUpDown, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { createClient } from "@/lib/supabase/client"

interface Job {
    id: string
    title: string
}

export function RoleSwitcher({ currentJobId }: { currentJobId: string }) {
  const [open, setOpen] = React.useState(false)
  const [jobs, setJobs] = React.useState<Job[]>([])
  const router = useRouter()
  const supabase = createClient()

  React.useEffect(() => {
    const fetchJobs = async () => {
        const { data } = await supabase.from('job_contexts').select('id, title').order('created_at', { ascending: false })
        if (data) setJobs(data)
    }
    fetchJobs()
  }, [supabase])

  const currentJob = jobs.find((job) => job.id === currentJobId)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[220px] h-9 justify-between rounded-sm border-border/60 bg-paper font-sora text-[11px] font-bold uppercase tracking-wider text-primary/80 hover:text-primary transition-all paper-shadow"
        >
          <div className="flex items-center truncate">
            <Briefcase className="mr-2 h-3.5 w-3.5 shrink-0 opacity-40" strokeWidth={2.4} />
            <span className="truncate">{currentJob?.title || "Context..."}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-40" strokeWidth={2.4} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0 rounded-sm border-border/60 shadow-xl" align="start">
        <Command className="rounded-sm">
          <CommandInput placeholder="Switch context..." className="h-9 font-sora text-xs" />
          <CommandList className="max-h-[300px]">
            <CommandEmpty className="py-4 text-xs font-mono">No results.</CommandEmpty>
            <CommandGroup heading="Recent Roles" className="**:[[cmdk-group-heading]]:font-bold **:[[cmdk-group-heading]]:tracking-widest **:[[cmdk-group-heading]]:uppercase">
              {jobs.map((job) => (
                <CommandItem
                  key={job.id}
                  value={job.title}
                  onSelect={() => {
                    if (job.id !== currentJobId) {
                        router.push(`/dashboard/${job.id}`)
                    }
                    setOpen(false)
                  }}
                  className="cursor-pointer font-sora text-[11px] font-bold py-2"
                >
                  <Check
                    className={cn(
                      "mr-2 h-3.5 w-3.5 text-primary",
                      currentJobId === job.id ? "opacity-100" : "opacity-0"
                    )}
                    strokeWidth={2.4}
                  />
                  {job.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
