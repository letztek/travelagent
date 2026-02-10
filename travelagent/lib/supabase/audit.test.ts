import { expect, test, vi, beforeEach } from 'vitest'
import { logAiAudit } from './audit'
import * as serverClient from './server'

vi.mock('./server', () => ({
  createClient: vi.fn()
}))

test('logAiAudit inserts record to supabase', async () => {
  const mockInsert = vi.fn().mockResolvedValue({ error: null })
  const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert })
  const mockGetUser = vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } })
  const mockSupabase = {
    from: mockFrom,
    auth: { getUser: mockGetUser }
  } as any

  vi.mocked(serverClient.createClient).mockResolvedValue(mockSupabase)

  await logAiAudit({
    prompt: 'test prompt',
    response: 'test response',
    model: 'gemini-pro'
  })

  expect(mockFrom).toHaveBeenCalledWith('ai_audit_logs')
  expect(mockInsert).toHaveBeenCalledWith([
    expect.objectContaining({
      prompt: 'test prompt',
      user_id: 'user-123'
    })
  ])
})
