"use client"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UploadCloud, File, X, Check, Loader2, AlertCircle, Edit2, Trash2, ArrowRight } from "lucide-react"
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
  const [csvData, setCsvData] = useState<Record<string, any>[]>([])
  const [columnMapping, setColumnMapping] = useState({
      name: '',
      email: '',
      cv: ''
  })
  const [additionalColumns, setAdditionalColumns] = useState<string[]>([])
  const [columnLabels, setColumnLabels] = useState<Record<string, string>>({})

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
      setColumnMapping({ name: '', email: '', cv: '' })
      setAdditionalColumns([])
      setColumnLabels({})
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
    const csvFile = files.find(f => f.name.endsWith('.csv'))
    
    if (csvFile) {
        const text = await csvFile.text()
        const result = Papa.parse(text, { header: true, skipEmptyLines: true })
        
        if (result.meta.fields && result.meta.fields.length > 0) {
            setCsvHeaders(result.meta.fields)
            setCsvData(result.data as any[])
            
            const lowerHeaders = result.meta.fields.map(h => h.toLowerCase())
            
            const findBestMatch = (terms: string[], exclusions: string[] = []) => {
                for (const term of terms) {
                    const idx = lowerHeaders.indexOf(term)
                    if (idx !== -1) return result.meta.fields![idx]
                }
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
          const rawText = columnMapping.cv ? row[columnMapping.cv] : ""
          
          if (name || email || rawText) {
             let finalRawText = rawText || ""
             
             if (additionalColumns.length > 0) {
                 const extras = additionalColumns.map(col => {
                     const val = row[col]
                     const label = columnLabels[col] || col
                     return val ? `${label}: ${val}` : null
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && (isProcessing ? null : onClose())}>
      <DialogContent className={cn(
          "transition-all duration-300 overflow-hidden flex flex-col",
          step === 'MAPPING' ? "sm:max-w-2xl" : step === 'REVIEW' ? "sm:max-w-4xl" : "sm:max-w-lg"
        )}>
        <DialogHeader>
          <DialogTitle>
             {step === 'UPLOAD' ? 'Upload Candidates' : 
              step === 'MAPPING' ? 'Map CSV Columns' : 
              step === 'REVIEW' ? `Review Candidates (${candidates.length})` : 
              'Processing...'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4 flex-1 overflow-y-auto overflow-x-hidden min-h-0">
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
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Selected Files</p>
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
                      <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Candidate Name (Optional)</label>
                          <div className="flex gap-4 items-start">
                              <select 
                                  className="h-10 w-[240px] shrink-0 rounded-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  value={columnMapping.name}
                                  onChange={(e) => setColumnMapping(prev => ({ ...prev, name: e.target.value }))}
                              >
                                  <option value="">Do not import</option>
                                  {csvHeaders.map(h => (
                                      <option key={h} value={h}>{h}</option>
                                  ))}
                              </select>
                              {columnMapping.name && csvData.length > 0 && (
                                  <div className="flex-1 min-w-0 h-10 flex items-center px-3 py-2 bg-paper border border-border/60 rounded-sm text-sm text-muted italic">
                                      <span className="truncate block w-full">Preview: {csvData[0][columnMapping.name]}</span>
                                  </div>
                              )}
                          </div>
                      </div>

                      <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Email Address (Optional)</label>
                          <div className="flex gap-4 items-start">
                              <select 
                                  className="h-10 w-[240px] shrink-0 rounded-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  value={columnMapping.email}
                                  onChange={(e) => setColumnMapping(prev => ({ ...prev, email: e.target.value }))}
                              >
                                  <option value="">Do not import</option>
                                  {csvHeaders.map(h => (
                                      <option key={h} value={h}>{h}</option>
                                  ))}
                              </select>
                              {columnMapping.email && csvData.length > 0 && (
                                  <div className="flex-1 min-w-0 h-10 flex items-center px-3 py-2 bg-paper border border-border/60 rounded-sm text-sm text-muted italic">
                                      <span className="truncate block w-full">Preview: {csvData[0][columnMapping.email]}</span>
                                  </div>
                              )}
                          </div>
                      </div>

                      <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">CV / Resume Content (Optional)</label>
                          <div className="flex gap-4 items-start">
                              <select 
                                  className="h-10 w-[240px] shrink-0 rounded-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  value={columnMapping.cv}
                                  onChange={(e) => setColumnMapping(prev => ({ ...prev, cv: e.target.value }))}
                              >
                                  <option value="">Do not import</option>
                                  {csvHeaders.map(h => (
                                      <option key={h} value={h}>{h}</option>
                                  ))}
                              </select>
                              {columnMapping.cv && csvData.length > 0 && (
                                  <div className="flex-1 min-w-0 h-10 flex items-center px-3 py-2 bg-paper border border-border/60 rounded-sm text-sm text-muted italic overflow-hidden relative">
                                      <span className="truncate block w-full">Preview: {csvData[0][columnMapping.cv]}</span>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border/50">
                       <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Include Additional Data</label>
                          <div className="flex gap-2">
                              <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                      const mapped = Object.values(columnMapping).filter(Boolean)
                                      const available = csvHeaders.filter(h => !mapped.includes(h))
                                      setAdditionalColumns(available)
                                  }}
                                  className="h-6 text-[9px] font-black uppercase tracking-widest"
                              >
                                  Select All
                              </Button>
                              <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setAdditionalColumns([])}
                                  className="h-6 text-[9px] font-black uppercase tracking-widest"
                              >
                                  Clear
                              </Button>
                          </div>
                       </div>
                                               <div className="space-y-3 max-h-[280px] overflow-y-auto overflow-x-hidden p-3 border border-border/40 rounded-sm bg-accent/5">
                           {csvHeaders.filter(h => !Object.values(columnMapping).includes(h)).map(header => (
                                <div key={header} className="flex flex-col gap-2 p-2 bg-paper/50 rounded-xs border border-border/20 w-full overflow-hidden">
                                   <div className="flex items-center justify-between gap-4 min-w-0 w-full">
                                       <div className="flex items-center space-x-3 min-w-0 flex-1 overflow-hidden">
                                           <input 
                                               type="checkbox" 
                                               id={`col-${header}`}
                                               className="h-5 w-5 shrink-0 rounded-sm border-input text-primary focus:ring-primary cursor-pointer"
                                               checked={additionalColumns.includes(header)}
                                               onChange={(e) => {
                                                   if (e.target.checked) {
                                                       setAdditionalColumns(prev => [...prev, header])
                                                   } else {
                                                       setAdditionalColumns(prev => prev.filter(h => h !== header))
                                                   }
                                               }}
                                           />
                                           <label 
                                               htmlFor={`col-${header}`} 
                                               className="text-sm font-bold truncate block w-full cursor-pointer select-none text-primary/80"
                                               title={header}
                                           >
                                               {header}
                                           </label>
                                       </div>
                                       {additionalColumns.includes(header) && (
                                           <span className="text-[9px] font-black uppercase tracking-widest text-brand shrink-0">Context Active</span>
                                       )}
                                   </div>
                                   
                                   {additionalColumns.includes(header) && (
                                       <div className="pl-8 pb-1">
                                           <Input 
                                               placeholder="Provide context (e.g. 'Portfolio Link', 'Notes')"
                                               value={columnLabels[header] || ""}
                                               onChange={(e) => setColumnLabels(prev => ({ ...prev, [header]: e.target.value }))}
                                               className="h-8 text-xs bg-background/50 border-border/40 focus:border-brand/40"
                                           />
                                       </div>
                                   )}
                               </div>
                           ))}
                           {csvHeaders.filter(h => !Object.values(columnMapping).includes(h)).length === 0 && (
                               <div className="col-span-2 text-center text-xs text-muted py-4 italic">
                                   All columns are already mapped above.
                               </div>
                           )}
                        </div>
                        <p className="text-[10px] text-muted italic flex items-center gap-2">
                           <AlertCircle className="w-3 h-3" />
                           Selected columns will be appended to the CV text with your custom context labels.
                        </p>
                  </div>
              </div>
          )}

          {step === 'REVIEW' && (
              <div className="border border-border rounded-sm overflow-hidden">
                  <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                          <thead className="bg-paper border-b border-border sticky top-0 z-10">
                              <tr>
                                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted w-[300px]">Candidate Name</th>
                                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted w-[300px]">Email</th>
                                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted">CV / Content Preview</th>
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
                                              className="h-8 text-sm border-transparent hover:border-border focus:border-primary bg-transparent rounded-none"
                                          />
                                      </td>
                                      <td className="px-4 py-3">
                                          <Input 
                                              value={c.email || ""} 
                                              placeholder="Enter email..."
                                              onChange={(e) => updateCandidate(c.id, { email: e.target.value })}
                                              className={cn(
                                                  "h-8 text-sm border-transparent hover:border-border focus:border-primary bg-transparent rounded-none",
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
                          <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="6"
                              className="text-paper"
                          />
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
                          <span className="text-xl font-bold text-primary">
                              {progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0}%
                          </span>
                      </div>
                  </div>
                  
                  <div className="space-y-3">
                      <h3 className="text-xl font-bold text-primary uppercase tracking-tight">Analyzing Candidates...</h3>
                      <p className="text-sm text-muted max-w-sm leading-relaxed px-4">
                          AI is reviewing skills, experience and cultural fit for <strong>{progress.total}</strong> candidates. 
                          This ensures high quality matches for your role.
                      </p>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                      <div className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">
                          Current Batch Progress
                      </div>
                      <div className="text-sm font-medium text-primary">
                          Processed {progress.current} of {progress.total}
                      </div>
                  </div>
              </div>
          )}
        </div>

        <DialogFooter className="flex justify-between w-full sm:justify-between items-center bg-accent/5 -mb-6 p-6 mt-4 border-t border-border/40">
            <div>
                {(step === 'REVIEW' || step === 'MAPPING') && (
                    <Button variant="ghost" onClick={() => setStep('UPLOAD')} className="text-[10px] font-black uppercase tracking-widest h-11">Back</Button>
                )}
            </div>
            <div className="flex gap-3 -mx-5">
                <Button 
                    variant="ghost" 
                    onClick={onClose} 
                    disabled={isProcessing}
                    className="h-11 px-8 rounded-sm font-black text-[10px] uppercase tracking-widest"
                >
                    Cancel
                </Button>
                {step === 'UPLOAD' ? (
                    <Button onClick={parseFiles} disabled={files.length === 0} className="h-11 px-8 gap-3 rounded-sm font-black text-[10px] uppercase tracking-widest bg-primary hover:bg-brand text-white transition-all">
                        Continue to Mapping
                        <ArrowRight className="w-[20px] h-[20px]" strokeWidth={3} />
                    </Button>
                ) : step === 'MAPPING' ? (
                    <Button onClick={handleMappingConfirm} className="h-11 px-8 gap-3 rounded-sm font-black text-[10px] uppercase tracking-widest bg-primary hover:bg-brand text-white transition-all">
                        Review Candidates
                        <ArrowRight className="w-[20px] h-[20px]" strokeWidth={3} />
                    </Button>
                ) : step === 'REVIEW' ? (
                    <Button onClick={handleStartImport} className="h-11 px-8 gap-3 rounded-sm font-black text-[10px] uppercase tracking-widest bg-primary hover:bg-brand text-white transition-all">
                        Confirm & Start Import
                        <Check className="w-[20px] h-[20px]" strokeWidth={3} />
                    </Button>
                ) : (
                    <Button onClick={() => { onClose(); reset(); }} disabled={isProcessing} className="h-11 px-8 rounded-sm font-black text-[10px] uppercase tracking-widest bg-primary hover:bg-brand text-white">
                        Finish
                    </Button>
                )}
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
