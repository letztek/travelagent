import { expect, test, vi, beforeEach, afterEach } from 'vitest'
import { logger } from './logger'

test('logger outputs to console in development', () => {
  const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  
  vi.stubEnv('NODE_ENV', 'development')
  
  logger.info('test info', { key: 'value' })
  expect(infoSpy).toHaveBeenCalledWith(
    expect.stringContaining('[INFO] test info'),
    expect.stringContaining('"key": "value"')
  )
  
  logger.error('test error')
  expect(errorSpy).toHaveBeenCalledWith(
    expect.stringContaining('[ERROR] test error'),
    ''
  )
  
  vi.unstubAllEnvs()
  infoSpy.mockRestore()
  errorSpy.mockRestore()
})
