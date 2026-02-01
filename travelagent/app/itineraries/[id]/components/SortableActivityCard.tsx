'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface SortableActivityCardProps {
  id: string
  activity: any
  isEditing: boolean
  onUpdate: (field: string, value: string) => void
  onDelete: () => void
}

export function SortableActivityCard({ id, activity, isEditing, onUpdate, onDelete }: SortableActivityCardProps) {
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

  return (
    <div ref={setNodeRef} style={style} className="bg-white border rounded-md p-3 shadow-sm mb-2 group">
      <div className="flex items-start gap-2">
        {isEditing && (
          <div {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        )}
        
        <div className="flex-1 space-y-2">
          {isEditing ? (
            <>
              <Input 
                value={activity.activity} 
                onChange={(e) => onUpdate('activity', e.target.value)}
                placeholder="活動名稱"
                className="font-medium h-8"
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
              <div className="font-semibold text-sm">{activity.activity}</div>
              <div className="text-xs text-muted-foreground whitespace-pre-wrap">{activity.description}</div>
            </>
          )}
        </div>

        {isEditing && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  )
}
