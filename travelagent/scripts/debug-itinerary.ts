import { getSupabase } from '../lib/supabase'
import { runItinerarySkill } from '../lib/skills/itinerary-generator'
import dotenv from 'dotenv'
import path from 'path'

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

async function debugItineraryGeneration(itineraryId: string) {
  console.log(`🔍 Debugging Itinerary ID: ${itineraryId}`)
  const supabase = getSupabase()

  // 1. Fetch Itinerary to get Requirement ID
  const { data: itinerary, error: itinError } = await supabase
    .from('itineraries')
    .select('requirement_id')
    .eq('id', itineraryId)
    .single()

  if (itinError) {
    console.error('❌ Failed to fetch itinerary:', itinError.message)
    return
  }

  console.log(`✅ Found Requirement ID: ${itinerary.requirement_id}`)

  // 2. Fetch Requirement Data
  const { data: requirement, error: reqError } = await supabase
    .from('requirements')
    .select('*')
    .eq('id', itinerary.requirement_id)
    .single()

  if (reqError) {
    console.error('❌ Failed to fetch requirement:', reqError.message)
    return
  }

  console.log('--- Requirement Data (Input to AI) ---')
  console.log(JSON.stringify(requirement, null, 2))
  console.log('--------------------------------------')

  // 3. Dry Run AI Generation (Simulate)
  console.log('🤖 Re-running AI Generation (Dry Run)...')
  
  try {
    const aiResult = await runItinerarySkill(requirement)
    console.log('✅ AI Re-generation Successful!')
    console.log('--- AI Response Content (Sample) ---')
    console.log(JSON.stringify(aiResult.days[0], null, 2)) // Show only Day 1 to save space
    console.log('...')
  } catch (error: any) {
    console.error('❌ AI Generation Failed during debug:', error.message)
  }
}

// Execute with the problematic ID provided by user
const targetId = '39e82216-4c71-4435-96f5-39a28bc3bb2c'
debugItineraryGeneration(targetId)
