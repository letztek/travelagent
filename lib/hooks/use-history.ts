import { useState, useCallback } from 'react'

export function useHistory<T>(initialState: T | (() => T)) {
  const [state, setInternalState] = useState(() => {
    const initial = typeof initialState === 'function' ? (initialState as () => T)() : initialState
    return {
      history: [initial],
      index: 0
    }
  })

  const { history, index } = state
  const currentState = history[index]

  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    setInternalState((prev) => {
      const current = prev.history[prev.index]
      const next = typeof newState === 'function' ? (newState as (prev: T) => T)(current) : newState
      const newHistory = prev.history.slice(0, prev.index + 1)
      return {
        history: [...newHistory, next],
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

  const clear = useCallback((newState: T) => {
    setInternalState({
      history: [newState],
      index: 0
    })
  }, [])

  const canUndo = index > 0
  const canRedo = index < history.length - 1

  return {
    state: currentState,
    setState,
    undo,
    redo,
    clear,
    canUndo,
    canRedo,
    history
  }
}
