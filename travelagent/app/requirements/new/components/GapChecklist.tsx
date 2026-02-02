'use client'

import { GapAnalysis } from '@/schemas/gap-analysis'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Info, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GapChecklistProps {
  analysis: GapAnalysis
}

export function GapChecklist({ analysis }: GapChecklistProps) {
  const { missing_info, logic_issues, overall_status } = analysis

  if (overall_status === 'ready' && missing_info.length === 0 && logic_issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <h3 className="text-lg font-semibold">需求資料完整！</h3>
        <p className="text-muted-foreground text-sm">AI 未偵測到明顯的資訊缺口或邏輯衝突。</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
      {missing_info.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold flex items-center gap-2 text-orange-600">
            <Info className="h-4 w-4" /> 建議補充資訊
          </h3>
          {missing_info.map((item, idx) => (
            <Alert key={idx} variant={item.severity === 'high' ? 'destructive' : 'default'} className={cn(item.severity !== 'high' && "border-orange-200 bg-orange-50")}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-sm font-semibold">{item.issue}</AlertTitle>
              <AlertDescription className="text-xs mt-1">
                <p className="font-medium text-muted-foreground italic">建議問法：{item.suggestion}</p>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {logic_issues.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" /> 邏輯衝突提醒
          </h3>
          {logic_issues.map((item, idx) => (
            <Alert key={idx} variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-sm font-semibold">{item.issue}</AlertTitle>
              <AlertDescription className="text-xs mt-1">
                {item.suggestion}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  )
}
