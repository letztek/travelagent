import { z } from 'zod'

export const activitySchema = z.object({
  time_slot: z.enum(['Morning', 'Afternoon', 'Evening']),
  activity: z.string().min(1),
  description: z.string().min(1),
})

export const itineraryDaySchema = z.object({
  day: z.number().int().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  activities: z.array(activitySchema),
  meals: z.object({
    breakfast: z.string().min(1),
    lunch: z.string().min(1),
    dinner: z.string().min(1),
  }),
  accommodation: z.string().min(1),
})

export const itinerarySchema = z.object({
  title: z.string().optional(),
  days: z.array(itineraryDaySchema).min(1),
})

export type Itinerary = z.infer<typeof itinerarySchema>
export type ItineraryDay = z.infer<typeof itineraryDaySchema>
export type Activity = z.infer<typeof activitySchema>
