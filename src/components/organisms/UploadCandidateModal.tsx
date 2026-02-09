"use client"

import { useState, useRef } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UploadCloud, File, X, Check, Loader2, AlertCircle, Edit2, Trash2 } from "lucide-react"
import Papa from "papaparse"
import { cn } from "@/lib/utils"

type Step = 'UPLOAD' | 'REVIEW' | 'PROCESSING'

interface CandidateToImport {
    id: string
    name: string
    email?: string
    rawText: string
    status: 'pending' | 'processing' | 'success' | 'error'
    error?: string
}

interface UploadCandidateModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (candidates: CandidateToImport[], onProgress?: (current: number, total: number) => void) => Promise<void>
}

export function UploadCandidateModal({ isOpen, onClose, onUpload }: UploadCandidateModalProps) {
  const [step, setStep] = useState<Step>('UPLOAD')
  const [files, setFiles] = useState<File[]>([])
  const [candidates, setCandidates] = useState<CandidateToImport[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const reset = () => {
      setStep('UPLOAD')
      setFiles([])
      setCandidates([])
      setIsProcessing(false)
      setProgress({ current: 0, total: 0 })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const parseFiles = async () => {
    const list: CandidateToImport[] = []
    
    for (const file of files) {
        if (file.name.endsWith('.csv')) {
            const text = await file.text()
            const result = Papa.parse(text, { header: true, skipEmptyLines: true })
            const rows = result.data as any[]
            rows.forEach((row, i) => {
                list.push({
                    id: `csv-${i}-${Date.now()}`,
                    name: row.name || row.full_name || row.candidate || `Candidate ${list.length + 1}`,
                    email: row.email || "",
                    rawText: row.cv_text || row.resume || row.content || JSON.stringify(row),
                    status: 'pending'
                })
            })
        } else {
            // Non-CSV files will be handled as individual candidates
            list.push({
                id: `file-${Date.now()}-${list.length}`,
                name: file.name.replace(/\.[^/.]+$/, ""),
                rawText: "File content will be extracted on upload...",
                status: 'pending'
            })
        }
    }
    setCandidates(list)
    setStep('REVIEW')
  }

  const handleStartImport = async () => {
    setStep('PROCESSING')
    setIsProcessing(true)
    setProgress({ current: 0, total: candidates.length })
    
    // We pass the candidates to the parent handler which will do the sequential API calls
    await onUpload(candidates, (current, total) => {
        setProgress({ current, total })
    })
    
    setIsProcessing(false)
  }

  const updateCandidate = (id: string, updates: Partial<CandidateToImport>) => {
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const removeCandidate = (id: string) => {
      setCandidates(prev => prev.filter(c => c.id !== id))
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={isProcessing ? () => {} : onClose}
      title={step === 'UPLOAD' ? 'Upload Candidates' : step === 'REVIEW' ? `Review Candidates (${candidates.length})` : 'Processing...'}
      className={cn(step === 'REVIEW' && "max-w-6xl")}
      footer={
        <div className="flex justify-between w-full">
            <div>
                {step === 'REVIEW' && (
                    <Button variant="ghost" onClick={() => setStep('UPLOAD')}>Back</Button>
                )}
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} disabled={isProcessing}>Cancel</Button>
                {step === 'UPLOAD' ? (
                    <Button onClick={parseFiles} disabled={files.length === 0}>
                        Continue to Review
                    </Button>
                ) : step === 'REVIEW' ? (
                    <Button onClick={handleStartImport} className="bg-primary hover:bg-primary/90 text-paper px-8 h-10 font-bold uppercase tracking-widest text-[11px]">
                        Confirm & Start Import
                    </Button>
                ) : (
                    <Button onClick={() => { onClose(); reset(); }} disabled={isProcessing}>
                        Finish
                    </Button>
                )}
            </div>
        </div>
      }
    >
      <div className="space-y-6">
        {step === 'UPLOAD' && (
            <>
                <div 
                    className="border-2 border-dashed border-border/60 rounded-sm p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-accent/30 transition-colors relative"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input 
                        type="file" 
                        multiple
                        ref={fileInputRef}
                        className="hidden" 
                        accept=".pdf,.doc,.docx,.txt,.csv"
                        onChange={handleFileChange}
                    />
                    <div className="w-16 h-16 bg-accent/50 text-primary rounded-sm flex items-center justify-center mb-4 border border-border/40">
                        <UploadCloud className="w-8 h-8" />
                    </div>
                    
                    <div className="space-y-2">
                        <p className="text-lg font-semibold text-primary">Drop files here or click to upload</p>
                        <p className="text-sm text-muted">Upload CSV for bulk import or individual PDF/DOCX resumes</p>
                    </div>
                </div>

                {files.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted">Selected Files</p>
                        <div className="grid grid-cols-2 gap-2">
                            {files.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-paper rounded-sm border border-border/60">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <File className="w-4 h-4 text-primary shrink-0" />
                                        <span className="text-sm font-medium text-primary truncate">{file.name}</span>
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFiles(prev => prev.filter((_, i) => i !== idx));
                                        }} 
                                        className="text-muted hover:text-red-500 p-1"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </>
        )}

        {step === 'REVIEW' && (
            <div className="border border-border rounded overflow-hidden">
                <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-paper border-b border-border sticky top-0">
                            <tr>
                                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted w-[300px]">Candidate Name</th>
                                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted w-[300px]">Email</th>
                                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted">CV / Content Preview</th>
                                <th className="px-4 py-3 w-[80px]"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {candidates.map((c) => (
                                <tr key={c.id} className="hover:bg-paper/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <Input 
                                            value={c.name} 
                                            onChange={(e) => updateCandidate(c.id, { name: e.target.value })}
                                            className="h-8 text-sm border-transparent hover:border-border focus:border-primary bg-transparent"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Input 
                                            value={c.email || ""} 
                                            placeholder="Enter email..."
                                            onChange={(e) => updateCandidate(c.id, { email: e.target.value })}
                                            className={cn(
                                                "h-8 text-sm border-transparent hover:border-border focus:border-primary bg-transparent",
                                                c.email && "border-primary bg-primary/5"
                                            )}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-xs text-muted max-h-12 overflow-hidden overflow-ellipsis line-clamp-2 italic">
                                            {c.rawText}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button 
                                            onClick={() => removeCandidate(c.id)}
                                            className="p-1.5 text-muted hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {step === 'PROCESSING' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-8">
                <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        {/* Background Circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="6"
                            className="text-paper"
                        />
                        {/* Progress Circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="6"
                            strokeDasharray={251.32}
                            strokeDashoffset={251.32 - (251.32 * (progress.total > 0 ? progress.current / progress.total : 0))}
                            strokeLinecap="round"
                            className="text-primary transition-all duration-500 ease-out"
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-xl font-sora font-bold text-primary">
                            {progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0}%
                        </span>
                    </div>
                </div>
                
                <div className="space-y-3">
                    <h3 className="text-xl font-sora font-bold text-primary">Analyzing Candidates...</h3>
                    <p className="text-sm text-muted max-w-sm leading-relaxed px-4">
                        AI is reviewing skills, experience and cultural fit for <strong>{progress.total}</strong> candidates. 
                        This ensures high quality matches for your role.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <div className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">
                        Current Batch Progress
                    </div>
                    <div className="text-sm font-medium text-primary">
                        Processed {progress.current} of {progress.total}
                    </div>
                </div>
            </div>
        )}
      </div>
    </Modal>
  )
}
