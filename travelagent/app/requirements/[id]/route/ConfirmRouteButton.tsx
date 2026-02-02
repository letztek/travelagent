'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { generateItinerary } from '@/app/itineraries/actions'
import { useRouter } from 'next/navigation'
import { Loader2, Sparkles } from 'lucide-react'
import { RouteConcept } from '@/schemas/route'
import { Requirement } from '@/schemas/requirement'

interface ConfirmRouteButtonProps {
  requirement: Requirement
  requirementId: string
  routeConcept: RouteConcept
}

export function ConfirmRouteButton({ requirement, requirementId, routeConcept }: ConfirmRouteButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleConfirm = async () => {
    setLoading(true)
    try {
      const result = await generateItinerary(requirement, requirementId, routeConcept)
      if (result.success) {
        alert('詳細行程生成成功！')
        router.push(`/itineraries/${result.data.id}`)
      } else {
        alert('生成失敗: ' + result.error)
      }
    } catch (error) {
      console.error(error)
      alert('發生錯誤，請稍後再試。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button size="lg" className="px-10" onClick={handleConfirm} disabled={loading}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          正在生成細節...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          確認並生成詳細行程
        </>
      )}
    </Button>
  )
}
