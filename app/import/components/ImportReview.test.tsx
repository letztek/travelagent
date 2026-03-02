import { expect, test, describe, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ImportReview } from './ImportReview'
import { ImportParserResult } from '@/lib/skills/import-parser'

const mockData: ImportParserResult = {
  extracted_metadata: {
    destinations: ['東京', '大阪'],
    origin: '台北',
    travel_dates: { start: '2026-04-01', end: '2026-04-05' },
    travelers: { adult: 2, child: 0, infant: 0, senior: 0 },
    budget_range: '50000'
  },
  itinerary: {
    title: '日本櫻花季五日遊',
    days: [
      {
        day: 1,
        date: '2026-04-01',
        activities: [
          { time_slot: 'Morning', activity: '抵達關西機場', description: '辦理入境手續' }
        ],
        meals: { breakfast: '機上', lunch: '機場', dinner: '拉麵' },
        accommodation: '大阪飯店'
      }
    ]
  }
}

describe('ImportReview', () => {
  const mockOnConfirm = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders itinerary preview and pre-filled form', () => {
    render(<ImportReview data={mockData} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />)
    
    // Check Itinerary Preview
    expect(screen.getByText('日本櫻花季五日遊')).toBeDefined()
    expect(screen.getByText('抵達關西機場')).toBeDefined()

    // Check pre-filled form values
    const originInput = screen.getByLabelText('出發地') as HTMLInputElement
    expect(originInput.value).toBe('台北')

    const destInput = screen.getByLabelText('目的地') as HTMLInputElement
    expect(destInput.value).toBe('東京, 大阪')

    const budgetInput = screen.getByLabelText('總預算') as HTMLInputElement
    expect(budgetInput.value).toBe('50000')
  })

  test('calls onConfirm with form data when submitted', () => {
    render(<ImportReview data={mockData} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />)
    
    const submitButton = screen.getByRole('button', { name: '確認匯入並建檔' })
    fireEvent.click(submitButton)

    expect(mockOnConfirm).toHaveBeenCalled()
    // Extract the form data passed to mock
    const passedData = mockOnConfirm.mock.calls[0][0]
    expect(passedData.origin).toBe('台北')
    expect(passedData.destinations).toEqual(['東京', '大阪'])
  })

  test('calls onCancel when cancel button clicked', () => {
    render(<ImportReview data={mockData} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />)
    
    const cancelButton = screen.getByRole('button', { name: '取消並重新上傳' })
    fireEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })
})
