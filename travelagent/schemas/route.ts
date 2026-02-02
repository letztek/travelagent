import { z } from 'zod'

export const routeNodeSchema = z.object({
  day: z.number().int().min(1),
  location: z.string().min(1),
  description: z.string().optional(),
  transport: z.string().optional(),
})

export const routeConceptSchema = z.object({
  nodes: z.array(routeNodeSchema).min(1),
  rationale: z.string().min(1),
  total_days: z.number().int().min(1),
})

export type RouteConcept = z.infer<typeof routeConceptSchema>
export type RouteNode = z.infer<typeof routeNodeSchema>
