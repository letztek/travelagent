'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { generateItinerary } from '../itineraries/actions'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface GenerateButtonProps {
  requirement: any
}

export default function GenerateButton({ requirement }: GenerateButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleGenerate() {
    setLoading(true)
    try {
      const result = await generateItinerary(requirement, requirement.id)
      if (result.success) {
        alert('行程生成成功！')
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
    <Button 
      onClick={handleGenerate} 
      disabled={loading}
      variant="outline"
      size="sm"
    >
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      生成行程
    </Button>
  )
}
