import { runItinerarySkill } from '../lib/skills/itinerary-generator'
import { runGapAnalyzerSkill } from '../lib/skills/gap-analyzer'
import dotenv from 'dotenv'
import path from 'path'

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

async function testExtremeScenario() {
  console.log('🧪 Testing Extreme Scenario: London -> Taipei with 10k TWD budget')
  
  const requirement: any = {
    origin: '倫敦 (LHR)',
    destinations: ['台北 (TPE)'],
    travel_dates: { start: '2026-08-01', end: '2026-08-05' },
    travelers: { adult: 1, senior: 0, child: 0, infant: 0 },
    budget_range: '30000_below', // 10k is in this range
    notes: '我想住五星級飯店，吃米其林，但我只有台幣 10,000 元預算。',
    preferences: { dietary: [], accommodation: ['resort'] }
  }

  console.log('\n--- Step 1: Gap Analysis ---')
  try {
    const gapResult = await runGapAnalyzerSkill(requirement)
    console.log('Status:', gapResult.overall_status)
    console.log('Gaps/Issues found:', gapResult.logic_issues.map(i => i.issue))
  } catch (err: any) {
    console.error('Gap Analysis Error:', err.message)
  }

  console.log('\n--- Step 2: Itinerary Generation ---')
  try {
    const aiResult = await runItinerarySkill(requirement)
    console.log('✅ Generation Successful!')
    console.log('Day 1 Sample:', JSON.stringify(aiResult.itinerary.days[0], null, 2))
    console.log('Meals Sample (Day 1):', JSON.stringify(aiResult.itinerary.days[0].meals, null, 2))
    console.log('Accommodation (Day 1):', aiResult.itinerary.days[0].accommodation)
  } catch (error: any) {
    console.error('❌ Generation Failed:', error.message)
  }
}

testExtremeScenario()
