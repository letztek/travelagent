import { generateItinerary } from '../app/itineraries/actions'
import { getSupabase } from '../lib/supabase'
import dotenv from 'dotenv'
import path from 'path'

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

async function testEndToEnd() {
  console.log('🚀 Starting End-to-End Test for Itinerary Generation...')
  const supabase = getSupabase()

  try {
    // 1. Get or Create a Requirement
    console.log('🔍 Fetching latest requirement...')
    let { data: req, error } = await supabase
      .from('requirements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!req) {
      console.log('⚠️ No requirements found. Creating a test requirement...')
      const testReq = {
        travel_dates: { start: '2026-06-01', end: '2026-06-03' },
        travelers: { adult: 2, senior: 0, child: 0, infant: 0 },
        budget_range: '50000_100000',
        preferences: { dietary: ['Vegetarian'], accommodation: ['Hotel'] },
        notes: 'Automated Test Run'
      }
      
      const { data: newReq, error: insertError } = await supabase
        .from('requirements')
        .insert([testReq])
        .select()
        .single()
      
      if (insertError) throw new Error(`Failed to create requirement: ${insertError.message}`)
      req = newReq
      console.log('✅ Created test requirement:', req.id)
    } else {
      console.log('✅ Found existing requirement:', req.id)
    }

    // 2. Generate Itinerary
    console.log('🤖 Generating itinerary with AI (Gemini 3 Pro Preview)...')
    // Construct requirement object matching the Schema
    const requirementPayload = {
      travel_dates: req.travel_dates,
      travelers: req.travelers,
      budget_range: req.budget_range,
      preferences: req.preferences,
      notes: req.notes
    }

    const result = await generateItinerary(requirementPayload, req.id)

    if (result.success) {
      console.log('🎉 Success! Itinerary generated and saved.')
      console.log('📄 Itinerary ID:', result.data.id)
      console.log('-----------------------------------')
      console.log(JSON.stringify(result.data.content, null, 2))
      console.log('-----------------------------------')
    } else {
      console.error('❌ Generation Failed:', result.error)
    }

  } catch (err: any) {
    console.error('❌ Unexpected Error:', err.message)
  }
}

testEndToEnd()
