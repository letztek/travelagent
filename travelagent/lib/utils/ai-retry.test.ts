import { expect, test, vi } from 'vitest'
import { withRetry } from './ai-retry'

test('withRetry returns result on first success', async () => {
  const fn = vi.fn().mockResolvedValue('success')
  const result = await withRetry(fn)
  expect(result).toBe('success')
  expect(fn).toHaveBeenCalledTimes(1)
})

test('withRetry retries on 503 error and eventually succeeds', async () => {
  const fn = vi.fn()
    .mockRejectedValueOnce({ status: 503, message: 'Overloaded' })
    .mockResolvedValueOnce('success')
  
  // Use shorter delay for testing
  const result = await withRetry(fn, { initialDelay: 10 })
  
  expect(result).toBe('success')
  expect(fn).toHaveBeenCalledTimes(2)
})

test('withRetry fails after max retries', async () => {
  const error = { status: 503, message: 'Overloaded' }
  const fn = vi.fn().mockRejectedValue(error)
  
  await expect(withRetry(fn, { maxRetries: 1, initialDelay: 10 }))
    .rejects.toMatchObject({ status: 503 })
    
  expect(fn).toHaveBeenCalledTimes(2) // Initial attempt + 1 retry
})

test('withRetry does not retry on non-retryable error (e.g. 400)', async () => {
  const error = { status: 400, message: 'Bad Request' }
  const fn = vi.fn().mockRejectedValue(error)
  
  await expect(withRetry(fn, { initialDelay: 10 }))
    .rejects.toMatchObject({ status: 400 })
    
  expect(fn).toHaveBeenCalledTimes(1)
})
