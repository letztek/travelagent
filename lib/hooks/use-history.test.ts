import { renderHook, act } from '@testing-library/react'
import { expect, test } from 'vitest'
import { useHistory } from './use-history'

test('useHistory manages state', () => {
  const { result } = renderHook(() => useHistory(0))

  expect(result.current.state).toBe(0)

  act(() => {
    result.current.setState(1)
  })

  expect(result.current.state).toBe(1)
})

test('useHistory supports undo and redo', () => {
  const { result } = renderHook(() => useHistory(0))

  act(() => {
    result.current.setState(1)
    result.current.setState(2)
  })

  expect(result.current.state).toBe(2)
  expect(result.current.canUndo).toBe(true)

  act(() => {
    result.current.undo()
  })

  expect(result.current.state).toBe(1)
  expect(result.current.canRedo).toBe(true)

  act(() => {
    result.current.undo()
  })

  expect(result.current.state).toBe(0)
  expect(result.current.canUndo).toBe(false)

  act(() => {
    result.current.redo()
  })

  expect(result.current.state).toBe(1)
})
