'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Utensils } from 'lucide-react'

interface MealsEditProps {
  meals: { breakfast: string; lunch: string; dinner: string }
  isEditing: boolean
  onChange: (type: 'breakfast' | 'lunch' | 'dinner', value: string) => void
  dayIndex: number
  selectedContext: { dayIndex: number; itemId?: string; type: string } | null
  onSelectContext: (ctx: { dayIndex: number; itemId?: string; type: 'activity' | 'meal' | 'accommodation' | 'day' }) => void
}

export function MealsEdit({ meals, isEditing, onChange, dayIndex, selectedContext, onSelectContext }: MealsEditProps) {
  const isSelected = selectedContext?.dayIndex === dayIndex && selectedContext?.type === 'meal'

  return (
    <div 
      className={`grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-4 p-3 rounded-md border transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-orange-500 bg-orange-100/50 border-orange-200' : 'bg-orange-50/50 border-orange-100 hover:border-orange-200'
      }`}
      onClick={() => onSelectContext({ dayIndex, type: 'meal' })}
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold text-orange-600 shrink-0">早餐：</span>
        {isEditing ? (
          <Input 
            value={meals.breakfast} 
            onChange={(e) => onChange('breakfast', e.target.value)} 
            className="h-8"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span>{meals.breakfast}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-orange-600 shrink-0">午餐：</span>
        {isEditing ? (
          <Input 
            value={meals.lunch} 
            onChange={(e) => onChange('lunch', e.target.value)} 
            className="h-8"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span>{meals.lunch}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-orange-600 shrink-0">晚餐：</span>
        {isEditing ? (
          <Input 
            value={meals.dinner} 
            onChange={(e) => onChange('dinner', e.target.value)} 
            className="h-8"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span>{meals.dinner}</span>
        )}
      </div>
    </div>
  )
}
