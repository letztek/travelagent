import { z } from 'zod'

export const requirementSchema = z.object({
  travel_dates: z.object({
    start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid start date format'),
    end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid end date format'),
  }),
  travelers: z.object({
    adult: z.number().int().min(0),
    senior: z.number().int().min(0),
    child: z.number().int().min(0),
    infant: z.number().int().min(0),
  }).refine((data) => {
    return (data.adult + data.senior + data.child + data.infant) > 0
  }, {
    message: "At least one traveler is required",
    path: ["adult"], // Highlight adult field as the error source
  }),
  budget_range: z.string().min(1, 'Budget range is required'),
  preferences: z.object({
    dietary: z.array(z.string()).default([]),
    accommodation: z.array(z.string()).default([]),
  }).default({}),
  notes: z.string().optional(),
})

export type Requirement = z.infer<typeof requirementSchema>
