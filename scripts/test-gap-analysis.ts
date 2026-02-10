import { runGapAnalyzerSkill } from '../lib/skills/gap-analyzer'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const scenarios = [
  {
    name: 'Senior without accessibility info',
    req: {
      travel_dates: { start: '2026-06-01', end: '2026-06-10' },
      travelers: { adult: 2, senior: 2, child: 0, infant: 0 },
      budget_range: '50000_100000',
      preferences: { dietary: [], accommodation: ['hotel'] },
      notes: 'Going to Kyoto'
    }
  },
  {
    name: 'Infant without equipment info',
    req: {
      travel_dates: { start: '2026-06-01', end: '2026-06-10' },
      travelers: { adult: 2, senior: 0, child: 0, infant: 1 },
      budget_range: '50000_100000',
      preferences: { dietary: [], accommodation: ['hotel'] },
      notes: 'Tokyo Disneyland trip'
    }
  },
  {
    name: 'Budget mismatch (High end with low budget)',
    req: {
      travel_dates: { start: '2026-06-01', end: '2026-06-15' },
      travelers: { adult: 2, senior: 0, child: 0, infant: 0 },
      budget_range: '30000_below',
      preferences: { dietary: [], accommodation: ['resort'] },
      notes: 'Luxury trip to Hokkaido for 2 weeks'
    }
  }
]

async function runTests() {
  console.log('🚀 Starting AI Gap Analysis Scenario Tests...\n')

  for (const scenario of scenarios) {
    console.log(`--- Scenario: ${scenario.name} ---`)
    try {
      const result = await runGapAnalyzerSkill(scenario.req as any)
      console.log('Status:', result.overall_status)
      console.log('Gaps Found:', result.missing_info.length)
      result.missing_info.forEach(gap => {
        console.log(`  - [${gap.severity}] ${gap.issue}`)
        console.log(`    Suggestion: ${gap.suggestion}`)
      })
      console.log('Logic Issues:', result.logic_issues.length)
      result.logic_issues.forEach(issue => {
        console.log(`  - [${issue.severity}] ${issue.issue}`)
      })
    } catch (err: any) {
      console.error('❌ Failed:', err.message)
    }
    console.log('\n')
  }
}

runTests()
