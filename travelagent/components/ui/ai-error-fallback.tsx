'use client'

import React from 'react'
import { Button } from './button'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface AIErrorFallbackProps {
  error: string;
  onRetry: () => void;
  title?: string;
  resetErrorBoundary?: () => void; // For integration with react-error-boundary if needed
}

export function AIErrorFallback({ 
  error, 
  onRetry, 
  title = "AI 服務暫時無法回應" 
}: AIErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-destructive/30 rounded-lg bg-destructive/5 space-y-4 text-center">
      <div className="p-3 bg-destructive/10 rounded-full">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {error || "系統在嘗試多次後仍無法完成請求。這可能是由於 AI 服務負載過重或網路問題所致。"}
        </p>
      </div>
      <Button 
        variant="outline" 
        onClick={onRetry}
        className="flex items-center gap-2 border-destructive/50 hover:bg-destructive/10 text-destructive hover:text-destructive"
      >
        <RefreshCw className="w-4 h-4" />
        點此手動重試
      </Button>
    </div>
  )
}
