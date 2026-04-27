'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface GlobalLoaderContextProps {
  isLoading: boolean
  message: string
  showLoader: (message?: string) => void
  hideLoader: () => void
}

const GlobalLoaderContext = createContext<GlobalLoaderContextProps | undefined>(undefined)

export function GlobalLoaderProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const showLoader = (msg: string = '載入中...') => {
    setMessage(msg)
    setIsLoading(true)
  }

  const hideLoader = () => {
    setIsLoading(false)
    setMessage('')
  }

  return (
    <GlobalLoaderContext.Provider value={{ isLoading, message, showLoader, hideLoader }}>
      {children}
    </GlobalLoaderContext.Provider>
  )
}

export function useGlobalLoader() {
  const context = useContext(GlobalLoaderContext)
  if (context === undefined) {
    throw new Error('useGlobalLoader must be used within a GlobalLoaderProvider')
  }
  return context
}