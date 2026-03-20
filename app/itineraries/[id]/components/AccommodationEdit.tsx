'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Home } from 'lucide-react'
import { AddToFavoritesButton } from '@/app/favorites/AddToFavoritesButton'

interface AccommodationEditProps {
  value: string
  isEditing: boolean
  onChange: (value: string) => void
  dayIndex: number
  selectedContext: { dayIndex: number; itemId?: string; type: string } | null
  onSelectContext: (ctx: { dayIndex: number; itemId?: string; type: 'activity' | 'meal' | 'accommodation' | 'day' }) => void
}

export function AccommodationEdit({ value, isEditing, onChange, dayIndex, selectedContext, onSelectContext }: AccommodationEditProps) {
  const isSelected = selectedContext?.dayIndex === dayIndex && selectedContext?.type === 'accommodation'

  return (
    <div 
      className={`flex items-center gap-2 text-sm p-1 rounded transition-all cursor-pointer group ${
        isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-primary/5'
      }`}
      onClick={() => onSelectContext({ dayIndex, type: 'accommodation' })}
    >
      <Home className="h-4 w-4 text-blue-500" />
      <span className="font-semibold text-muted-foreground w-12 shrink-0">住宿：</span>
      <div className="flex-grow flex items-center gap-1">
        {isEditing ? (
          <Input 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            className="h-8 flex-1"
            placeholder="住宿地點"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="font-medium">{value}</span>
        )}
        <AddToFavoritesButton 
          name={value} 
          type="accommodation" 
          className="h-6 w-6 opacity-0 group-hover:opacity-100" 
        />
      </div>
    </div>
  )
}
