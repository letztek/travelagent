'use server'

import { runRoutePlannerSkill } from '@/lib/skills/route-planner'
import { type Requirement } from '@/schemas/requirement'

export async function planRoute(requirement: Requirement) {
  try {
    const concept = await runRoutePlannerSkill(requirement)
    return { success: true, data: concept }
  } catch (error: any) {
    console.error('Route Planning Error:', error)
    return { success: false, error: error.message || 'Failed to plan route' }
  }
}
