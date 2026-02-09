"use client"

import { useState, useRef } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UploadCloud, File, X, Check, Loader2, AlertCircle, Edit2, Trash2 } from "lucide-react"
import Papa from "papaparse"
import { cn } from "@/lib/utils"


type Step = 'UPLOAD' | 'MAPPING' | 'REVIEW' | 'PROCESSING'

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
  
  // CSV Mapping State
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [csvData, setCsvData] = useState<any[]>([])
  const [columnMapping, setColumnMapping] = useState({
      name: '',
      email: '',
      cv: ''
  })
  const [additionalColumns, setAdditionalColumns] = useState<string[]>([])

  const [candidates, setCandidates] = useState<CandidateToImport[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const reset = () => {
      setStep('UPLOAD')
      setFiles([])
      setCandidates([])
      setCsvHeaders([])
      setCsvData([])
      setCsvData([])
      setColumnMapping({ name: '', email: '', cv: '' })
      setAdditionalColumns([])
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
    // Only handle the first CSV file for mapping simplicity in this version
    const csvFile = files.find(f => f.name.endsWith('.csv'))
    
    if (csvFile) {
        const text = await csvFile.text()
        const result = Papa.parse(text, { header: true, skipEmptyLines: true })
        
        if (result.meta.fields && result.meta.fields.length > 0) {
            setCsvHeaders(result.meta.fields)
            setCsvData(result.data as any[])
            
            // Smart Pre-selection
            const lowerHeaders = result.meta.fields.map(h => h.toLowerCase())
            
            const findBestMatch = (terms: string[], exclusions: string[] = []) => {
                // 1. Exact match
                for (const term of terms) {
                    const idx = lowerHeaders.indexOf(term)
                    if (idx !== -1) return result.meta.fields![idx]
                }
                // 2. Contains match
                for (const term of terms) {
                    const idx = lowerHeaders.findIndex(h => h.includes(term) && !exclusions.some(e => h.includes(e)))
                    if (idx !== -1) return result.meta.fields![idx]
                }
                return ''
            }

            setColumnMapping({
                name: findBestMatch(['name', 'candidate', 'applicant', 'full name'], ['file', 'company', 'project', 'recruiter', 'summary', 'desc']),
                email: findBestMatch(['email', 'e-mail', 'mail'], ['id', 'date', 'name', 'recruiter']),
                cv: findBestMatch(['cv', 'resume', 'summary', 'profile', 'content', 'about'], ['name', 'email', 'date', 'id'])
            })
            
            setStep('MAPPING')
            return
        }
    }
    
    // Fallback for non-CSV or empty CSV
    processNonCsvFiles()
  }

  const processNonCsvFiles = () => {
      const list: CandidateToImport[] = []
      files.forEach((file, i) => {
         if (!file.name.endsWith('.csv')) {
            list.push({
                id: `file-${Date.now()}-${i}`,
                name: file.name.replace(/\.[^/.]+$/, ""),
                rawText: "File content will be extracted on upload...",
                status: 'pending'
            })
         }
      })
      setCandidates(list)
      setStep('REVIEW')
  }

  const handleMappingConfirm = () => {
      const list: CandidateToImport[] = []
      
      csvData.forEach((row, i) => {
          const name = columnMapping.name ? row[columnMapping.name] : `Candidate ${i + 1}`
          const email = columnMapping.email ? row[columnMapping.email] : undefined
          const rawText = columnMapping.cv ? row[columnMapping.cv] : "" // Only map if column selected
          
          if (name || email || rawText) {
             let finalRawText = rawText || ""
             
             // Append additional columns data if selected
             if (additionalColumns.length > 0) {
                 const extras = additionalColumns.map(col => {
                     const val = row[col]
                     return val ? `${col}: ${val}` : null
                 }).filter(Boolean)
                 
                 if (extras.length > 0) {
                     finalRawText += `\n\n--- ADDITIONAL DATA ---\n${extras.join('\n')}`
                 }
             }

             if (!finalRawText) finalRawText = "No content mapped"

             list.push({
                id: `csv-${i}-${Date.now()}`,
                name: name || "Unknown Candidate",
                email,
                rawText: finalRawText,
                status: 'pending'
             })
          }
      })

      // Add non-CSV files if any
      files.forEach((file, i) => {
         if (!file.name.endsWith('.csv')) {
            list.push({
                id: `file-${Date.now()}-${list.length + i}`,
                name: file.name.replace(/\.[^/.]+$/, ""),
                rawText: "File content will be extracted on upload...",
                status: 'pending'
            })
         }
      })
      
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
      title={step === 'UPLOAD' ? 'Upload Candidates' : step === 'MAPPING' ? 'Map CSV Columns' : step === 'REVIEW' ? `Review Candidates (${candidates.length})` : 'Processing...'}
      className={cn((step === 'REVIEW' || step === 'MAPPING') && "max-w-6xl")}
      footer={
        <div className="flex justify-between w-full">
            <div>
                {(step === 'REVIEW' || step === 'MAPPING') && (
                    <Button variant="ghost" onClick={() => setStep('UPLOAD')}>Back</Button>
                )}
            </div>
            <div className="flex gap-2">
                <Button 
                    variant="outline" 
                    onClick={onClose} 
                    disabled={isProcessing}
                    className="h-10 px-6 font-bold uppercase tracking-widest text-[11px]"
                >
                    Cancel
                </Button>
                {step === 'UPLOAD' ? (
                    <Button onClick={parseFiles} disabled={files.length === 0}>
                        Continue to Mapping
                    </Button>
                ) : step === 'MAPPING' ? (
                    <Button onClick={handleMappingConfirm} className="bg-primary hover:bg-primary/90 text-paper px-8 h-10 font-bold uppercase tracking-widest text-[11px]">
                        Review Candidates
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
                        <UploadCloud className="w-[14px] h-[14px]" strokeWidth={2.4} />
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
                                        <File className="w-[14px] h-[14px] text-primary shrink-0" strokeWidth={2.4} />
                                        <span className="text-sm font-medium text-primary truncate">{file.name}</span>
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFiles(prev => prev.filter((_, i) => i !== idx));
                                        }} 
                                        className="text-muted hover:text-red-500 p-1"
                                    >
                                        <X className="w-[14px] h-[14px]" strokeWidth={2.4} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </>
        )}

        {step === 'MAPPING' && (
            <div className="space-y-6">
                <div className="bg-accent/10 p-4 rounded-sm border border-accent/20">
                    <p className="text-sm text-primary/80">
                        Map the columns from your CSV to the candidate fields below. We've auto-detected likely matches, but you can adjust them.
                    </p>
                </div>
                
                <div className="grid gap-6">
                    {/* Name Mapping */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted">Candidate Name (Optional)</label>
                        <div className="flex gap-4">
                            <select 
                                className="h-10 w-1/3 rounded-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={columnMapping.name}
                                onChange={(e) => setColumnMapping(prev => ({ ...prev, name: e.target.value }))}
                            >
                                <option value="">Do not import</option>
                                {csvHeaders.map(h => (
                                    <option key={h} value={h}>{h}</option>
                                ))}
                            </select>
                            {columnMapping.name && csvData.length > 0 && (
                                <div className="flex-1 flex items-center px-3 py-2 bg-paper border border-border/60 rounded-sm text-sm text-muted italic truncate">
                                    <span className="truncate w-full block">Preview: {csvData[0][columnMapping.name]}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Email Mapping */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted">Email Address (Optional)</label>
                        <div className="flex gap-4">
                            <select 
                                className="h-10 w-1/3 rounded-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={columnMapping.email}
                                onChange={(e) => setColumnMapping(prev => ({ ...prev, email: e.target.value }))}
                            >
                                <option value="">Do not import</option>
                                {csvHeaders.map(h => (
                                    <option key={h} value={h}>{h}</option>
                                ))}
                            </select>
                            {columnMapping.email && csvData.length > 0 && (
                                <div className="flex-1 flex items-center px-3 py-2 bg-paper border border-border/60 rounded-sm text-sm text-muted italic truncate">
                                    <span className="truncate w-full block">Preview: {csvData[0][columnMapping.email]}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CV Content Mapping */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted">CV / Resume Content (Optional)</label>
                        <div className="flex gap-4">
                            <select 
                                className="h-10 w-1/3 rounded-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={columnMapping.cv}
                                onChange={(e) => setColumnMapping(prev => ({ ...prev, cv: e.target.value }))}
                            >
                                <option value="">Do not import</option>
                                {csvHeaders.map(h => (
                                    <option key={h} value={h}>{h}</option>
                                ))}
                            </select>
                            {columnMapping.cv && csvData.length > 0 && (
                                <div className="flex-1 px-3 py-2 bg-paper border border-border/60 rounded-sm text-sm text-muted italic max-h-20 overflow-hidden relative">
                                    <p className="line-clamp-2">Preview: {csvData[0][columnMapping.cv]}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    </div>

                    {/* Additional Columns Selection */}
                    <div className="space-y-3 pt-4 border-t border-border/50">
                         <div className="flex items-center justify-between">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted">Include Additional Data</label>
                            <div className="flex gap-2">
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => {
                                        const mapped = Object.values(columnMapping).filter(Boolean)
                                        const available = csvHeaders.filter(h => !mapped.includes(h))
                                        setAdditionalColumns(available)
                                    }}
                                    className="h-6 text-[10px]"
                                >
                                    Select All
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setAdditionalColumns([])}
                                    className="h-6 text-[10px]"
                                >
                                    Clear
                                </Button>
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-border/40 rounded-sm bg-accent/5">
                            {csvHeaders.filter(h => !Object.values(columnMapping).includes(h)).map(header => (
                                <div key={header} className="flex items-center space-x-2">
                                    <input 
                                        type="checkbox" 
                                        id={`col-${header}`}
                                        className="h-4 w-4 rounded-sm border-input text-primary focus:ring-primary"
                                        checked={additionalColumns.includes(header)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setAdditionalColumns(prev => [...prev, header])
                                            } else {
                                                setAdditionalColumns(prev => prev.filter(h => h !== header))
                                            }
                                        }}
                                    />
                                    <label htmlFor={`col-${header}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate cursor-pointer select-none">
                                        {header}
                                    </label>
                                </div>
                            ))}
                            {csvHeaders.filter(h => !Object.values(columnMapping).includes(h)).length === 0 && (
                                <div className="col-span-2 text-center text-xs text-muted py-2 italic">
                                    All columns are already mapped above.
                                </div>
                            )}
                         </div>
                         <p className="text-[10px] text-muted">
                            Selected columns will be appended to the CV text so the AI can read them.
                         </p>
                    </div>
                </div>

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
                                            <Trash2 className="w-[14px] h-[14px]" strokeWidth={2.4} />
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
