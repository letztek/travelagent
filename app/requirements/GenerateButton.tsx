'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Map } from 'lucide-react'

interface GenerateButtonProps {
  requirement: any
}

export default function GenerateButton({ requirement }: GenerateButtonProps) {
  const router = useRouter()

  const handleGoToRoute = () => {
    router.push(`/requirements/${requirement.id}/route`)
  }

  return (
    <Button 
      onClick={handleGoToRoute} 
      variant="outline"
      size="sm"
    >
      <Map className="mr-2 h-4 w-4" />
      規劃路線
    </Button>
  )
}