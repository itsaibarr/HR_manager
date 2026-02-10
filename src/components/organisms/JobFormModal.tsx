"use client"

import { useState, useEffect } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface JobFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (jobData: { title: string, description?: string }) => void
  editingJob?: {
    id: string
    title: string
    original_description?: string
  } | null
}

const JOB_TITLES = [
  "Frontend Engineer", "Backend Engineer", "Full Stack Developer", 
  "Product Manager", "UI/UX Designer", "DevOps Engineer", 
  "Data Scientist", "QA Engineer", "Engineering Manager", 
  "Technical Writer", "Mobile Developer", "iOS Developer", 
  "Android Developer", "System Administrator", "Cloud Architect",
  "Security Engineer", "Machine Learning Engineer", "Blockchain Developer",
  "Game Developer", "Embedded Systems Engineer", "Software Engineer", "Software Architect", "Solutions Architect", 
  "Site Reliability Engineer", "Platform Engineer", "Infrastructure Engineer", 
  "Database Administrator", "Data Engineer", "Data Analyst", 
  "Business Intelligence Analyst", "AI Engineer", "Prompt Engineer", 
  "Computer Vision Engineer", "NLP Engineer", "Robotics Engineer", 
  "AR/VR Developer", "Graphics Engineer", "Firmware Engineer", 
  "Hardware Engineer", "Network Engineer", "IT Support Specialist", 
  "Help Desk Technician", "Scrum Master", "Agile Coach", 
  "Technical Project Manager", "Program Manager", "Release Manager", 
  "Build Engineer", "Automation Engineer", "Performance Engineer", 
  "Test Automation Engineer", "Security Analyst", "Penetration Tester", 
  "Ethical Hacker", "Cybersecurity Consultant", "IT Auditor", 
  "Compliance Engineer", "Risk Analyst", "Cloud Engineer", 
  "Kubernetes Administrator", "Site Operations Engineer", "Data Architect", 
  "Solutions Engineer", "API Developer", "Integration Engineer", 
  "CRM Developer", "ERP Consultant", "Salesforce Developer", 
  "SAP Consultant", "IT Consultant", "Digital Transformation Manager", 
  "Innovation Manager", "Research Engineer", "R&D Engineer", 
  "Bioinformatics Engineer", "Quantitative Analyst", "FinTech Engineer", 
  "PropTech Developer", "EdTech Specialist", "HealthTech Engineer", 
  "Technical Recruiter", "Developer Advocate", "Community Manager", 
  "Growth Engineer", "SEO Specialist", "Marketing Technologist", 
  "Content Strategist", "Technical Support Engineer", "Customer Success Manager", 
  "Solutions Consultant", "Pre-Sales Engineer", "Post-Sales Engineer", 
  "Technical Account Manager", "IT Operations Manager", "Chief Technology Officer", 
  "Chief Information Officer", "Chief Information Security Officer", "Chief Product Officer", 
  "Chief Data Officer", "Head of Engineering", "Head of Product", 
  "Director of Engineering", "Director of Technology", "Director of Data", 
  "Director of Security", "Data Privacy Officer", "AI Research Scientist", 
  "Systems Analyst", "Business Systems Analyst", "Information Architect", 
  "UX Researcher", "Interaction Designer", "Service Designer", 
  "Technical Illustrator", "Localization Engineer", "IT Trainer", 
  "Open Source Maintainer", "Game Designer", "Level Designer", 
  "Technical Artist","Cloud Security Engineer", "Infrastructure Architect", "Big Data Engineer", 
  "Data Governance Specialist", "Data Quality Analyst", "MLOps Engineer", 
  "AI Product Manager", "AI Solutions Architect", "Generative AI Engineer", 
  "Edge Computing Engineer", "IoT Engineer", "Telecommunications Engineer", 
  "5G Network Engineer", "Systems Integration Engineer", "Application Support Engineer", 
  "IT Service Manager", "Release Train Engineer", "Configuration Manager", 
  "Change Management Specialist", "Technical Program Manager", "Enterprise Architect", 
  "Business Analyst", "Product Designer", "UX Writer", 
  "UI Engineer", "Design Systems Engineer", "Accessibility Specialist", 
  "Cloud Consultant", "Cloud Solutions Engineer", "DevSecOps Engineer", 
  "Reliability Engineer", "Observability Engineer", "Incident Response Engineer", 
  "Threat Intelligence Analyst", "Malware Analyst", "Digital Forensics Analyst", 
  "Privacy Engineer", "Governance Risk and Compliance Analyst", "IT Risk Manager", 
  "Virtualization Engineer", "Storage Engineer", "Backup Administrator", 
  "High Performance Computing Engineer", "Simulation Engineer", "Control Systems Engineer", 
  "Mechatronics Engineer", "Autonomous Systems Engineer", "Drone Engineer", 
  "Satellite Systems Engineer", "Aerospace Software Engineer", "Automotive Software Engineer", 
  "ADAS Engineer", "Battery Systems Engineer", "Energy Systems Engineer", 
  "Renewable Energy Engineer", "Smart Grid Engineer", "Power Systems Engineer", 
  "Technical Evangelist", "Solutions Delivery Manager", "Implementation Consultant", 
  "Customer Solutions Engineer", "Partner Engineer", "Channel Manager", 
  "Revenue Operations Analyst", "Growth Product Manager", "Monetization Manager", 
  "Technical Content Developer", "Instructional Designer", "Learning Experience Designer", 
  "IT Asset Manager", "Procurement Specialist", "Vendor Manager", 
  "Digital Product Owner", "Platform Product Manager", "Infrastructure Product Manager", 
  "Chief Innovation Officer", "VP of Engineering", "VP of Product", 
  "VP of Technology", "VP of Data", "Head of AI", 
  "Head of Security", "Head of Infrastructure", "Head of Platform", 
  "Chief AI Officer", "Chief Digital Officer", "Chief Analytics Officer", 
  "Chief Cloud Officer", "Chief Security Officer", "Chief Innovation Strategist", 
  "Technical Strategist", "AI Ethics Specialist", "Responsible AI Engineer", 
  "Human Computer Interaction Researcher", "Quantum Computing Researcher", "Quantum Software Engineer"
]

export function JobFormModal({ isOpen, onClose, onSubmit, editingJob }: JobFormModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isFullJd, setIsFullJd] = useState(false)
  const [suggestion, setSuggestion] = useState("")

  // Reset form when modal opens/closes or editing job changes
  useEffect(() => {
    if (isOpen) {
      if (editingJob) {
        setTitle(editingJob.title)
        setDescription(editingJob.original_description || "")
        setIsFullJd(!!editingJob.original_description)
      } else {
        setTitle("")
        setDescription("")
        setIsFullJd(false)
        setSuggestion("")
      }
    }
  }, [isOpen, editingJob])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTitle(value)
    
    if (value.length > 0) {
      const match = JOB_TITLES.find(t => t.toLowerCase().startsWith(value.toLowerCase()))
      if (match) {
        setSuggestion(match)
      } else {
        setSuggestion("")
      }
    } else {
      setSuggestion("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && suggestion && suggestion.toLowerCase().startsWith(title.toLowerCase())) {
      e.preventDefault()
      setTitle(suggestion)
      setSuggestion("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ title, description })
    onClose()
  }

  const isEditing = !!editingJob

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Job Context" : "Create New Job Context"}
      footer={
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="h-11 px-8 rounded-sm font-sora text-[11px] font-bold uppercase tracking-wider">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!title}
            variant="brand"
            className="h-11 px-8 rounded-sm font-sora text-[11px] font-bold uppercase tracking-wider"
          >
            {isEditing ? "Save Changes" : "Create Context"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        {!isEditing && (
          <div className="flex gap-6 border-b border-border/40 mb-6">
            <button 
              type="button"
              className={cn(
                "pb-3 text-[11px] font-bold uppercase tracking-wider transition-all relative border-b-2",
                !isFullJd ? "text-primary border-primary" : "text-muted border-transparent"
              )}
              onClick={() => setIsFullJd(false)}
            >
              Quick Create
            </button>
            <button 
              type="button"
              className={cn(
                "pb-3 text-[11px] font-bold uppercase tracking-wider transition-all relative border-b-2",
                isFullJd ? "text-primary border-primary" : "text-muted border-transparent"
              )}
              onClick={() => setIsFullJd(true)}
            >
              Paste Full JD
            </button>
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Job Title</label>
            <div className="relative">
              {suggestion && title && suggestion.toLowerCase().startsWith(title.toLowerCase()) && (
                <div className="absolute inset-0 flex items-center px-4 py-2 text-sm pointer-events-none select-none z-0">
                  <span className="invisible whitespace-pre">{title}</span>
                  <span className="text-muted/40">{suggestion.slice(title.length)}</span>
                </div>
              )}
              <Input 
                placeholder="e.g. Senior Product Designer" 
                value={title}
                onChange={handleTitleChange}
                onKeyDown={handleKeyDown}
                autoFocus
                className="relative z-10 bg-transparent h-11 border-border/80 focus:border-brand/40 focus:ring-0 rounded-sm"
              />
            </div>
          </div>

          {(isFullJd || isEditing) ? (
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                {isEditing ? "Job Description" : "Paste Full JD"}
              </label>
              <div className="text-[11px] text-muted/60 mb-2">
                {isEditing 
                  ? "Original description used for requirements generation."
                  : "We'll extract requirements and skills automatically from this text."
                }
              </div>
              <Textarea 
                placeholder="Paste the full job description here..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[200px] font-mono text-xs leading-relaxed bg-accent/5 border-border/80 focus:border-brand/40 focus:ring-0 rounded-sm p-4"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Short Summary</label>
              <div className="text-[11px] text-muted/60 mb-2">We'll generate requirements based on the title and this summary.</div>
              <Input 
                placeholder="e.g. Looking for a senior designer with Fintech experience..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-11 border-border/80 focus:border-brand/40 focus:ring-0 rounded-sm"
              />
            </div>
          )}
        </div>
      </form>
    </Modal>
  )
}
