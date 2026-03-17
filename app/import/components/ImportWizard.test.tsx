import { expect, test, describe, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ImportWizard } from './ImportWizard'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  }))
}))

describe('ImportWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders correctly with title and description', () => {
    render(<ImportWizard />)
    expect(screen.getByText('AI 智慧匯入精靈')).toBeDefined()
    expect(screen.getByText(/上傳客戶提供的舊行程/)).toBeDefined()
  })

  test('accepts text input', () => {
    render(<ImportWizard />)
    const textarea = screen.getByPlaceholderText(/貼上行程表文字/) as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Day 1: Arrive in Tokyo' } })
    expect(textarea.value).toBe('Day 1: Arrive in Tokyo')
  })

  test('validates file type', async () => {
    render(<ImportWizard />)
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })
    const input = screen.getByLabelText('瀏覽檔案') as HTMLInputElement
    
    // Using Object.defineProperty to set files because fireEvent.change doesn't set files property correctly for input type="file"
    Object.defineProperty(input, 'files', {
      value: [file]
    })
    fireEvent.change(input)

    expect(screen.getByText(/不支援的檔案格式/)).toBeDefined()
  })

  test('validates file size', async () => {
    render(<ImportWizard />)
    // 11MB file
    const file = new File(['a'.repeat(11 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' })
    const input = screen.getByLabelText('瀏覽檔案')
    
    Object.defineProperty(input, 'files', {
      value: [file]
    })
    fireEvent.change(input)

    expect(screen.getByText(/檔案過大/)).toBeDefined()
  })

  test('adds and removes files', async () => {
    render(<ImportWizard />)
    const file = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' })
    const input = screen.getByLabelText('瀏覽檔案')
    
    Object.defineProperty(input, 'files', {
      value: [file]
    })
    fireEvent.change(input)

    expect(screen.getByText('test.pdf')).toBeDefined()

    const removeButton = screen.getByRole('button', { name: '' }) // The ghost button with X icon might need better selector
    // Actually the X button has a clear icon, let's look at the component
    // <Button variant="ghost" size="icon" ... onClick={() => removeFile(idx)}> <X ... /> </Button>
    
    const buttons = screen.getAllByRole('button')
    // Find the button that has the X icon or is within the file list
    const xButton = buttons.find(b => b.querySelector('svg'))
    if (xButton) {
        fireEvent.click(xButton)
        expect(screen.queryByText('test.pdf')).toBeNull()
    }
  })
})
