'use client'

import React from 'react'
import { useGlobalLoader } from './GlobalLoaderContext'
import { Loader2 } from 'lucide-react'

export default function GlobalLoader() {
  const { isLoading, message } = useGlobalLoader()

  if (!isLoading) return null

  return (
    <div 
      data-testid="global-loader"
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-xl border border-slate-100 max-w-sm w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl animate-pulse"></div>
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin relative z-10" />
        </div>
        <h3 className="mt-6 text-lg font-bold text-slate-800 text-center">
          {message}
        </h3>
        <p className="mt-2 text-sm text-slate-500 text-center animate-pulse">
          請稍候，這可能需要幾秒鐘的時間...
        </p>
      </div>
    </div>
  )
}