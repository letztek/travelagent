import { z } from 'zod'

export const gapItemSchema = z.object({
  field: z.string(),
  issue: z.string(),
  suggestion: z.string(),
  severity: z.enum(['low', 'medium', 'high']),
})

export const gapAnalysisSchema = z.object({
  missing_info: z.array(gapItemSchema),
  logic_issues: z.array(gapItemSchema),
  overall_status: z.enum(['ready', 'needs_info', 'critical_issues']),
})

export type GapAnalysis = z.infer<typeof gapAnalysisSchema>
export type GapItem = z.infer<typeof gapItemSchema>
