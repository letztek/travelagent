'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Utensils } from 'lucide-react'
import { AddToFavoritesButton } from '@/app/favorites/AddToFavoritesButton'
import { Favorite } from '@/app/favorites/actions'

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
      className={`grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-4 p-3 rounded-md border transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-orange-500 bg-orange-50 border-orange-200' : 'bg-orange-50/50 border-orange-100 hover:border-orange-200'
      }`}
      onClick={() => onSelectContext({ dayIndex, type: 'meal' })}
    >
      {(['breakfast', 'lunch', 'dinner'] as const).map((type) => {
        const favorite = userFavorites.find(f => f.name === meals[type] && f.type === 'food')
        
        return (
          <div key={type} className="flex flex-col gap-1 group relative">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-orange-600 shrink-0">
                {type === 'breakfast' ? '早餐' : type === 'lunch' ? '午餐' : '晚餐'}：
              </span>
              <div className={`transition-opacity ${favorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <AddToFavoritesButton 
                  name={meals[type]} 
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
                  value={meals[type]} 
                  onChange={(e) => onChange(type, e.target.value)} 
                  className="h-8 w-full bg-white"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="truncate block py-1">{meals[type] || '未指定'}</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
