'use client'

import { useState } from 'react'
import { GapAnalysis, GapItem } from '@/schemas/gap-analysis'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ArrowRight, CheckCircle2, Info, SkipForward } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface GapWizardProps {
  analysis: GapAnalysis
  onComplete: (answers: Record<string, string>) => void
  onCancel: () => void
}

export function GapWizard({ analysis, onComplete, onCancel }: GapWizardProps) {
  const issues = [...analysis.missing_info, ...analysis.logic_issues]
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentInput, setCurrentInput] = useState('')

  const currentIssue = issues[currentIndex]
  const totalSteps = issues.length

  const handleNext = () => {
    // Save current answer
    const newAnswers = { ...answers }
    if (currentInput.trim()) {
      // Use issue field as key, or index if field is duplicate (unlikely but possible)
      // Actually, we might have multiple issues for same field.
      // Let's use a composite key or just append to notes later.
      // For now, let's map by field. If multiple issues on same field, last one wins?
      // Better: map by index or ID. But onComplete expects Record<string, string>.
      // The Spec said: "系統將答案自動附加到需求的 `notes` 或更新對應欄位。"
      // So mapping by field is good if we want to update field.
      // But user answer is likely free text.
      // Let's use `field` as key.
      newAnswers[currentIssue.field] = currentInput.trim()
    }
    setAnswers(newAnswers)
    
    if (currentIndex < totalSteps - 1) {
      setCurrentIndex(currentIndex + 1)
      setCurrentInput('')
    } else {
      onComplete(newAnswers)
    }
  }

  const handleSkip = () => {
    if (currentIndex < totalSteps - 1) {
      setCurrentIndex(currentIndex + 1)
      setCurrentInput('')
    } else {
      onComplete(answers)
    }
  }

  if (issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <h3 className="text-lg font-semibold">需求資料完整！</h3>
        <p className="text-muted-foreground text-sm">AI 未偵測到明顯的資訊缺口或邏輯衝突。</p>
        <Button onClick={() => onComplete({})}>繼續</Button>
      </div>
    )
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <Badge variant="outline">
            問題 {currentIndex + 1} / {totalSteps}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {Math.round(((currentIndex) / totalSteps) * 100)}% 完成
          </span>
        </div>
        <CardTitle className="flex items-start gap-2 text-lg">
          {currentIssue.severity === 'high' ? (
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-1" />
          ) : (
            <Info className="h-5 w-5 text-blue-500 shrink-0 mt-1" />
          )}
          {currentIssue.issue}
        </CardTitle>
        <CardDescription className="text-base font-medium text-foreground mt-2">
          {currentIssue.suggestion}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="請在此輸入您的回答..."
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          className="min-h-[100px]"
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" onClick={onCancel}>
          取消並返回
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSkip}>
            <SkipForward className="mr-2 h-4 w-4" />
            跳過此題
          </Button>
          <Button onClick={handleNext}>
            {currentIndex === totalSteps - 1 ? '完成診斷' : '確認並下一題'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
