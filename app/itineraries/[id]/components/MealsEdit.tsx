'use client'

import { Input } from '@/components/ui/input'
import { AddToFavoritesButton } from '@/app/favorites/AddToFavoritesButton'
import { Favorite } from '@/app/favorites/actions'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'

interface MealsEditProps {
  meals: { breakfast: string; lunch: string; dinner: string }
  isEditing: boolean
  onChange: (type: 'breakfast' | 'lunch' | 'dinner', value: string) => void
  dayIndex: number
  selectedContext: { dayIndex: number; itemId?: string; type: string } | null
  onSelectContext: (ctx: { dayIndex: number; itemId?: string; type: 'activity' | 'meal' | 'accommodation' | 'day' }) => void
  userFavorites?: Favorite[]
  onToggleFavorite?: () => void
}

function DroppableMeal({ 
  type, 
  value, 
  isEditing, 
  onChange, 
  dayIndex, 
  favorite, 
  onToggleFavorite 
}: { 
  type: 'breakfast' | 'lunch' | 'dinner', 
  value: string, 
  isEditing: boolean, 
  onChange: (type: 'breakfast' | 'lunch' | 'dinner', value: string) => void, 
  dayIndex: number,
  favorite: Favorite | undefined,
  onToggleFavorite?: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${dayIndex}-meal-${type}`,
    data: {
      type: 'meal',
      mealType: type,
      dayIndex
    }
  })

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "flex flex-col gap-1 group relative p-1 rounded transition-all",
        isOver && "ring-2 ring-orange-400 bg-orange-100 scale-[1.05] z-10 shadow-sm"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold text-orange-600 shrink-0">
          {type === 'breakfast' ? '早餐' : type === 'lunch' ? '午餐' : '晚餐'}：
        </span>
        <div className={cn("transition-opacity", favorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}>
          <AddToFavoritesButton 
            name={value} 
            type="food" 
            className="h-5 w-5 p-0"
            isFavorite={!!favorite}
            favoriteId={favorite?.id}
            onToggle={onToggleFavorite}
          />
        </div>
      </div>
      <div className="min-w-0">
        {isEditing ? (
          <Input 
            value={value} 
            onChange={(e) => onChange(type, e.target.value)} 
            className="h-8 w-full bg-white"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate block py-1">{value || '未指定'}</span>
        )}
      </div>
    </div>
  )
}

export function MealsEdit({ 
  meals, 
  isEditing, 
  onChange, 
  dayIndex, 
  selectedContext, 
  onSelectContext,
  userFavorites = [],
  onToggleFavorite
}: MealsEditProps) {
  const isSelected = selectedContext?.dayIndex === dayIndex && selectedContext?.type === 'meal'

  return (
    <div 
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-4 p-3 rounded-md border transition-all cursor-pointer",
        isSelected ? 'ring-2 ring-orange-500 bg-orange-50 border-orange-200' : 'bg-orange-50/50 border-orange-100 hover:border-orange-200'
      )}
      onClick={() => onSelectContext({ dayIndex, type: 'meal' })}
    >
      {(['breakfast', 'lunch', 'dinner'] as const).map((type) => {
        const favorite = userFavorites.find(f => f.name === meals[type] && f.type === 'food')
        
        return (
          <DroppableMeal 
            key={type}
            type={type}
            value={meals[type]}
            isEditing={isEditing}
            onChange={onChange}
            dayIndex={dayIndex}
            favorite={favorite}
            onToggleFavorite={onToggleFavorite}
          />
        )
      })}
    </div>
  )
}
