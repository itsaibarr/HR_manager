export interface JobContext {
  id: string
  title: string
  status: 'active' | 'closed' | 'draft'
  candidatesCount: number
  strongFitCount: number
  createdAt: Date
}
