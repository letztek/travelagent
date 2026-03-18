'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getRequirement, updateRequirement } from '../../actions'
import { analyzeGaps } from '../../gap-actions'
import { GapAnalysis } from '@/schemas/gap-analysis'
import { type Requirement } from '@/schemas/requirement'
import { GapWizard } from '../../new/components/GapWizard'
import { AIErrorFallback } from '@/components/ui/ai-error-fallback'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function GapAnalysisPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [requirement, setRequirement] = useState<Requirement | null>(null)
  const [analysis, setAnalysis] = useState<GapAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const performAnalysis = useCallback(async (reqData: Requirement) => {
    setIsAnalyzing(true)
    setError(null)
    try {
      const result = await analyzeGaps(reqData)
      if (result.success && result.data) {
        // If everything is ready and no issues, skip to route planning
        if (result.data.overall_status === 'ready' && 
            result.data.missing_info.length === 0 && 
            result.data.logic_issues.length === 0) {
          router.push(`/requirements/${id}/route`)
          return
        }
        setAnalysis(result.data)
      } else {
        setError(result.error || 'AI 診斷失敗')
      }
    } catch (err: any) {
      setError(err.message || '分析過程發生錯誤')
    } finally {
      setIsAnalyzing(false)
    }
  }, [id, router])

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const result = await getRequirement(id)
      if (result.success && result.data) {
        setRequirement(result.data)
        await performAnalysis(result.data)
      } else {
        setError('找不到該需求單，請確認 ID 是否正確。')
      }
      setLoading(false)
    }
    loadData()
  }, [id, performAnalysis])

  const handleWizardComplete = async (answers: Record<string, string>) => {
    if (!requirement) return

    setLoading(true)
    const entries = Object.entries(answers)
    let updatedNotes = requirement.notes || ''
    
    if (entries.length > 0) {
      const additionalNotes = entries.map(([field, answer]) => `- ${field}: ${answer}`).join('\n')
      updatedNotes = updatedNotes 
        ? `${updatedNotes}\n\n【顧問補充資訊】\n${additionalNotes}`
        : `【顧問補充資訊】\n${additionalNotes}`
    }

    const result = await updateRequirement(id, { notes: updatedNotes })
    
    if (result.success) {
      router.push(`/requirements/${id}/route`)
    } else {
      setError('儲存補充資訊失敗，請稍後再試。')
      setLoading(false)
    }
  }

  if (loading && !analysis) {
    return (
      <div className="container mx-auto py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-slate-500 text-lg">正在載入行程需求並啟動 AI 診斷...</p>
      </div>
    )
  }

  if (error && !analysis) {
    return (
      <div className="container mx-auto py-10 max-w-2xl">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">發生錯誤</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={() => window.location.reload()}>重新嘗試</Button>
            <Button variant="outline" onClick={() => router.push(`/requirements/${id}/route`)}>
              跳過診斷並直接進入規劃
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">AI 顧問診斷中</h1>
        <p className="text-slate-500">
          我們正在分析您的需求，以確保後續生成的行程符合邏輯且完整。
        </p>
      </div>

      {isAnalyzing ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4 border rounded-xl bg-slate-50/50">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="font-medium">AI 正在仔細閱讀您的行程細節...</p>
        </div>
      ) : analysis ? (
        <Card className="shadow-lg border-primary/10">
          <CardContent className="pt-6">
            <GapWizard 
              analysis={analysis} 
              onComplete={handleWizardComplete}
              onCancel={() => router.push('/requirements')}
            />
          </CardContent>
        </Card>
      ) : null}

      {error && analysis && (
        <div className="mt-6">
          <AIErrorFallback 
            error={error} 
            onRetry={() => performAnalysis(requirement!)} 
            title="診斷更新失敗"
          />
        </div>
      )}
    </div>
  )
}
