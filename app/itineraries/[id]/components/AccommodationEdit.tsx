'use client'

import { Input } from '@/components/ui/input'
import { Home } from 'lucide-react'
import { AddToFavoritesButton } from '@/app/favorites/AddToFavoritesButton'
import { Favorite } from '@/app/favorites/actions'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'

interface AccommodationEditProps {
  value: string
  isEditing: boolean
  onChange: (value: string) => void
  dayIndex: number
  selectedContext: { dayIndex: number; itemId?: string; type: string } | null
  onSelectContext: (ctx: { dayIndex: number; itemId?: string; type: 'activity' | 'meal' | 'accommodation' | 'day' }) => void
  userFavorites?: Favorite[]
  onToggleFavorite?: () => void
}

export function AccommodationEdit({ 
  value, 
  isEditing, 
  onChange, 
  dayIndex, 
  selectedContext, 
  onSelectContext,
  userFavorites = [],
  onToggleFavorite
}: AccommodationEditProps) {
  const isSelected = selectedContext?.dayIndex === dayIndex && selectedContext?.type === 'accommodation'
  const favorite = userFavorites.find(f => f.name === value && f.type === 'accommodation')
  
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${dayIndex}-accommodation`,
    data: {
      type: 'accommodation',
      dayIndex
    }
  })

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "flex items-center gap-2 text-sm p-1 rounded transition-all cursor-pointer group relative",
        isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-primary/5',
        isOver && "ring-2 ring-blue-500 bg-blue-50 scale-[1.02]"
      )}
      onClick={() => onSelectContext({ dayIndex, type: 'accommodation' })}
    >
      <Home className="h-4 w-4 text-blue-500 shrink-0" />
      <span className="font-semibold text-muted-foreground w-12 shrink-0">住宿：</span>
      <div className="flex-grow min-w-0 pr-2">
        {isEditing ? (
          <Input 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            className="h-8 w-full bg-white"
            placeholder="住宿地點"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="font-medium truncate block">{value || '未指定'}</span>
        )}
      </div>
      <div className={`transition-opacity ${favorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <AddToFavoritesButton 
          name={value} 
          type="accommodation" 
          className="h-5 w-5 p-0" 
          isFavorite={!!favorite}
          favoriteId={favorite?.id}
          onToggle={onToggleFavorite}
        />
      </div>
    </div>
  )
}
