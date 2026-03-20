'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { AddToFavoritesButton } from '@/app/favorites/AddToFavoritesButton'
import { Favorite } from '@/app/favorites/actions'

interface SortableActivityCardProps {
  id: string
  activity: any
  isEditing: boolean
  onUpdate: (field: string, value: string) => void
  onDelete: () => void
  isSelected?: boolean
  onSelect?: () => void
  isOverlay?: boolean
  userFavorites?: Favorite[]
  onToggleFavorite?: () => void
}

export function SortableActivityCard({ 
  id, 
  activity, 
  isEditing, 
  onUpdate, 
  onDelete, 
  isSelected, 
  onSelect,
  isOverlay,
  userFavorites = [],
  onToggleFavorite
}: SortableActivityCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const favorite = userFavorites.find(f => f.name === activity.activity && f.type === 'spot')

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`relative bg-white border rounded-md p-3 shadow-sm mb-2 group transition-all cursor-pointer ${isSelected ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'}`}
      onClick={(e) => {
        if ((e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
          onSelect?.()
        }
      }}
    >
      {/* Favorite Button - Always visible on hover, or always if isFavorite */}
      <div className={`absolute top-2 right-2 z-10 transition-opacity ${(favorite || isEditing) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <div className="flex items-center gap-2">
          <AddToFavoritesButton 
            name={activity.activity} 
            type="spot" 
            description={activity.description}
            size="icon"
            className="h-5 w-5"
            isFavorite={!!favorite}
            favoriteId={favorite?.id}
            onToggle={onToggleFavorite}
          />
          {isEditing && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              aria-label="刪除活動"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2">
        {isEditing && (
          <div {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing shrink-0">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        )}
        
        <div className="flex-1 min-w-0 space-y-2">
          {isEditing ? (
            <>
              <Input 
                value={activity.activity} 
                onChange={(e) => onUpdate('activity', e.target.value)}
                placeholder="活動名稱"
                className="font-medium h-8 pr-12"
              />
              <Textarea 
                value={activity.description} 
                onChange={(e) => onUpdate('description', e.target.value)}
                placeholder="描述"
                className="text-sm min-h-[60px]"
              />
            </>
          ) : (
            <>
              <div className="font-semibold text-sm truncate pr-6">{activity.activity}</div>
              <div className="text-xs text-muted-foreground whitespace-pre-wrap">{activity.description}</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
