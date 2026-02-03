import { useState, useCallback } from 'react'

export function useHistory<T>(initialState: T) {
  const [state, setInternalState] = useState({
    history: [initialState],
    index: 0
  })

  const { history, index } = state
  const currentState = history[index]

  const setState = useCallback((newState: T) => {
    setInternalState((prev) => {
      const newHistory = prev.history.slice(0, prev.index + 1)
      return {
        history: [...newHistory, newState],
        index: prev.index + 1
      }
    })
  }, [])

  const undo = useCallback(() => {
    setInternalState((prev) => ({
      ...prev,
      index: Math.max(0, prev.index - 1)
    }))
  }, [])

  const redo = useCallback(() => {
    setInternalState((prev) => ({
      ...prev,
      index: Math.min(prev.history.length - 1, prev.index + 1)
    }))
  }, [])

  const canUndo = index > 0
  const canRedo = index < history.length - 1

  return {
    state: currentState,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    history
  }
}
