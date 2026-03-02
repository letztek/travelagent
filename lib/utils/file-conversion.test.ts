import { expect, test, describe } from 'vitest'
import { fileToBase64 } from './file-conversion'

describe('file-conversion', () => {
  test('fileToBase64 converts a file to base64 string', async () => {
    const content = 'hello world'
    const file = new File([content], 'test.txt', { type: 'text/plain' })
    
    const result = await fileToBase64(file)
    
    // Check if result is a valid base64 data URL
    expect(result).toContain('data:text/plain;base64,')
    const base64Content = result.split(',')[1]
    expect(atob(base64Content)).toBe(content)
  })

  test('fileToBase64 handles empty file', async () => {
    const file = new File([], 'empty.txt', { type: 'text/plain' })
    const result = await fileToBase64(file)
    expect(result).toContain('data:text/plain;base64,')
  })
})
