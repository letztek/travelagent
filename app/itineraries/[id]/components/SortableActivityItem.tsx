'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface SortableActivityItemProps {
  id: string
  activity: any
  dayIndex: number
  activityIndex: number
  isEditing: boolean
  onActivityChange: (dayIndex: number, activityIndex: number, field: string, value: string) => void
}

export function SortableActivityItem({ id, activity, dayIndex, activityIndex, isEditing, onActivityChange }: SortableActivityItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="border p-4 rounded-md flex items-start gap-4 bg-white">
      {isEditing && (
        <div {...attributes} {...listeners} className="mt-2 cursor-move">
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
      )}
      
      <div className="flex-1 space-y-2">
        {isEditing ? (
          <>
            <div className="flex gap-2">
              <Input 
                value={activity.time_slot} 
                onChange={(e) => onActivityChange(dayIndex, activityIndex, 'time_slot', e.target.value)}
                placeholder="時段"
                className="w-1/3"
              />
              <Input 
                value={activity.activity} 
                onChange={(e) => onActivityChange(dayIndex, activityIndex, 'activity', e.target.value)}
                placeholder="活動名稱"
                className="w-2/3"
              />
            </div>
            <Input 
              value={activity.description} 
              onChange={(e) => onActivityChange(dayIndex, activityIndex, 'description', e.target.value)}
              placeholder="描述"
            />
          </>
        ) : (
          <div>
            <div className="flex gap-2 items-center mb-1">
              <span className="text-sm font-semibold bg-gray-100 px-2 py-0.5 rounded">{activity.time_slot}</span>
              <span className="font-bold">{activity.activity}</span>
            </div>
            <div className="text-muted-foreground text-sm">{activity.description}</div>
          </div>
        )}
      </div>
    </div>
  )
}
