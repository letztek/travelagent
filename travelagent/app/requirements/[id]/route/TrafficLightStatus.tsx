'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle } from 'lucide-react'

interface TrafficLightStatusProps {
  status: 'green' | 'red'
  message: string
}

export function TrafficLightStatus({ status, message }: TrafficLightStatusProps) {
  return (
    <Alert variant={status === 'red' ? 'destructive' : 'default'} className={status === 'green' ? 'border-green-500 text-green-700 bg-green-50 dark:bg-green-900/20' : ''}>
      {status === 'green' ? (
        <CheckCircle2 className="h-4 w-4" color="currentColor" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <AlertTitle>{status === 'green' ? '路線順暢' : '邏輯警告'}</AlertTitle>
      <AlertDescription>
        {message}
      </AlertDescription>
    </Alert>
  )
}
