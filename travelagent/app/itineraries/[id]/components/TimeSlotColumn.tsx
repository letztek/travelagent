'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableActivityCard } from './SortableActivityCard'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface TimeSlotColumnProps {
  id: string // e.g., "day-1-Morning"
  title: string
  activities: any[]
  isEditing: boolean
  onActivityUpdate: (activityId: string, field: string, value: string) => void
  onActivityDelete: (activityId: string) => void
  onAddActivity: () => void
}

export function TimeSlotColumn({ 
  id, 
  title, 
  activities, 
  isEditing, 
  onActivityUpdate, 
  onActivityDelete,
  onAddActivity
}: TimeSlotColumnProps) {
  const { setNodeRef } = useDroppable({ id })

  return (
    <div className="flex-1 min-w-[250px] bg-gray-50/50 rounded-lg p-2 flex flex-col h-full border">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1 flex justify-between items-center">
        {title}
        {isEditing && (
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={onAddActivity}>
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      <div ref={setNodeRef} className={cn("flex-1 space-y-2 min-h-[100px]", activities.length === 0 && "border-2 border-dashed border-gray-200 rounded-md bg-gray-50")}>
        <SortableContext 
          id={id}
          items={activities.map(a => a.id)}
          strategy={verticalListSortingStrategy}
        >
          {activities.map((activity) => (
            <SortableActivityCard
              key={activity.id}
              id={activity.id}
              activity={activity}
              isEditing={isEditing}
              onUpdate={(field, value) => onActivityUpdate(activity.id, field, value)}
              onDelete={() => onActivityDelete(activity.id)}
            />
          ))}
        </SortableContext>
        {activities.length === 0 && !isEditing && (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">
            無活動
          </div>
        )}
      </div>
    </div>
  )
}
