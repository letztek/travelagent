'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Home } from 'lucide-react'

interface AccommodationEditProps {
  value: string
  isEditing: boolean
  onChange: (value: string) => void
}

export function AccommodationEdit({ value, isEditing, onChange }: AccommodationEditProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Home className="h-4 w-4 text-blue-500" />
      <span className="font-semibold text-muted-foreground w-12 shrink-0">住宿：</span>
      {isEditing ? (
        <Input 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          className="h-8 flex-1"
          placeholder="住宿地點"
        />
      ) : (
        <span className="font-medium">{value}</span>
      )}
    </div>
  )
}
