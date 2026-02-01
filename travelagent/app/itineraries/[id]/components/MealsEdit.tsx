'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Utensils } from 'lucide-react'

interface MealsEditProps {
  meals: { breakfast: string; lunch: string; dinner: string }
  isEditing: boolean
  onChange: (type: 'breakfast' | 'lunch' | 'dinner', value: string) => void
}

export function MealsEdit({ meals, isEditing, onChange }: MealsEditProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-4 bg-orange-50/50 p-3 rounded-md border border-orange-100">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-orange-600 shrink-0">早餐：</span>
        {isEditing ? (
          <Input 
            value={meals.breakfast} 
            onChange={(e) => onChange('breakfast', e.target.value)} 
            className="h-8"
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
          />
        ) : (
          <span>{meals.dinner}</span>
        )}
      </div>
    </div>
  )
}
