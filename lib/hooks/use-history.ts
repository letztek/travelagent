import { useState, useCallback, useEffect, useRef } from 'react'

export function useHistory<T>(initialState: T | (() => T)) {
  const getInitial = useCallback(() => {
    return typeof initialState === 'function' ? (initialState as () => T)() : initialState
  }, [initialState])

  const [state, setInternalState] = useState(() => {
    return {
      history: [getInitial()],
      index: 0
    }
  })

  // Use ref to track initial value to prevent redundant resets
  const prevInitialJson = useRef(JSON.stringify(getInitial()))

  useEffect(() => {
    const currentInitial = getInitial()
    const currentInitialJson = JSON.stringify(currentInitial)
    
    if (currentInitialJson !== prevInitialJson.current) {
      prevInitialJson.current = currentInitialJson
      setInternalState({
        history: [currentInitial],
        index: 0
      })
    }
  }, [getInitial])

  const { history, index } = state
  const currentState = history[index]

  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    setInternalState((prev) => {
      const current = prev.history[prev.index]
      const next = typeof newState === 'function' ? (newState as (prev: T) => T)(current) : newState
      
      // If no actual change, don't push to history
      if (JSON.stringify(current) === JSON.stringify(next)) {
        return prev
      }

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
