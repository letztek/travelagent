'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { updateItinerary } from '../../actions'
import { Itinerary, ItineraryDay } from '@/schemas/itinerary'
import { Loader2, Pencil, Save, X, FileDown } from 'lucide-react'
import { saveAs } from 'file-saver'
import { generateItineraryDoc } from '@/lib/utils/export-word'
import {
  DndContext, 
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DropAnimation
} from '@dnd-kit/core'
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { TimeSlotColumn } from './TimeSlotColumn'
import { SortableActivityCard } from './SortableActivityCard'
import { AccommodationEdit } from './AccommodationEdit'
import { MealsEdit } from './MealsEdit'

interface ItineraryEditorProps {
  itinerary: Itinerary
  itineraryId: string
}

// Helper types
type ActivityWithId = ItineraryDay['activities'][0] & { id: string }
type ItineraryWithIds = {
  days: (ItineraryDay & {
    activities: ActivityWithId[]
  })[]
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
}

export default function ItineraryEditor({ itinerary, itineraryId }: ItineraryEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [activeId, setActiveId] = useState<string | null>(null)

  // Initialize state with stable IDs
  const [data, setData] = useState<ItineraryWithIds>(() => ({
    ...itinerary,
    days: itinerary.days.map((day, dIdx) => ({
      ...day,
      activities: day.activities.map((act, aIdx) => ({
        ...act,
        id: `act-${dIdx}-${aIdx}-${Math.random().toString(36).substr(2, 5)}`
      }))
    }))
  }))

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Prevent accidental drags
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Find container (Day + TimeSlot) for an item ID
  const findContainer = (id: string) => {
    // If id is a container ID (e.g., "day-0-Morning"), return it
    if (id.startsWith('day-')) return id

    // Otherwise find which day/slot contains the activity
    for (let d = 0; d < data.days.length; d++) {
      const activity = data.days[d].activities.find(a => a.id === id)
      if (activity) {
        return `day-${d}-${activity.time_slot}`
      }
    }
    return undefined
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find the containers
    const activeContainer = findContainer(activeId)
    const overContainer = findContainer(overId)

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return
    }

    // Move item to new container
    setData((prev) => {
      const activeDayIndex = parseInt(activeContainer.split('-')[1])
      const overDayIndex = parseInt(overContainer.split('-')[1])
      const overTimeSlot = overContainer.split('-')[2] as 'Morning' | 'Afternoon' | 'Evening'

      const activeItems = prev.days[activeDayIndex].activities
      const overItems = prev.days[overDayIndex].activities

      const activeIndex = activeItems.findIndex(i => i.id === activeId)
      const overIndex = overItems.findIndex(i => i.id === overId)

      let newIndex: number
      if (overId.startsWith('day-')) {
        // Dropped on an empty container placeholder
        newIndex = overItems.length + 1
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      // Clone days
      const newDays = [...prev.days]
      
      // Remove from old
      const [movedItem] = newDays[activeDayIndex].activities.splice(activeIndex, 1)
      
      // Update time slot
      movedItem.time_slot = overTimeSlot
      
      // Add to new
      // If moving within same day but different slot, we just push/insert. 
      // But wait, the `activities` array is flat for the day.
      // So index in `activities` array doesn't strictly correspond to visual order if we filter by slot in UI.
      // Actually, for dnd-kit sortable to work across containers, we usually need separate arrays.
      // But here `activities` is one array per day.
      
      // FIX: Since we render 3 columns per day, each column filters the activities.
      // But dnd-kit expects us to move the item into the correct *data structure* that backs the container.
      // Since `TimeSlotColumn` renders `activities.filter(a => a.time_slot === 'Morning')`, 
      // changing `time_slot` effectively moves it to that "container".
      
      // However, to support specific ordering within that slot, we need to insert it at the right relative position among items of that slot.
      
      // Simplified approach for DragOver: just change the time_slot and day.
      // Ordering fine-tuning happens in DragEnd or if we split data structure.
      
      // For now, let's just insert it into the new day's array.
      newDays[overDayIndex].activities.push(movedItem)
      
      return { ...prev, days: newDays }
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    const activeId = active.id as string
    const overId = over.id as string

    if (!over) {
      setActiveId(null)
      return
    }

    const activeContainer = findContainer(activeId)
    const overContainer = findContainer(overId)

    if (activeContainer && overContainer && activeContainer === overContainer) {
      // Sorting within same container (Day + Slot)
      const dayIndex = parseInt(activeContainer.split('-')[1])
      const timeSlot = activeContainer.split('-')[2]
      
      setData((prev) => {
        const newDays = [...prev.days]
        const items = newDays[dayIndex].activities
        
        // We need indexes relative to the whole array, but arrayMove works on indexes.
        // BUT, visually we are sorting a subset (filtered by slot).
        // If we simply use arrayMove on the main array using indices from the subset, it might break.
        
        // This is tricky with a single flat array.
        // Alternative: Use `dnd-kit`'s approach: The `items` prop passed to `SortableContext` determines the order.
        // If we want to persist order, we need to reorder the main array such that the subset order is reflected.
        
        const oldIndex = items.findIndex(i => i.id === activeId)
        const newIndex = items.findIndex(i => i.id === overId)

        if (oldIndex !== newIndex) {
           newDays[dayIndex].activities = arrayMove(items, oldIndex, newIndex)
        }
        
        return { ...prev, days: newDays }
      })
    }
    setActiveId(null)
  }

  // CRUD Handlers
  const handleUpdateActivity = (dayIdx: number, actId: string, field: string, value: string) => {
    setData(prev => {
      const newDays = [...prev.days]
      const act = newDays[dayIdx].activities.find(a => a.id === actId)
      if (act) {
        // @ts-ignore
        act[field] = value
      }
      return { ...prev, days: newDays }
    })
  }

  const handleDeleteActivity = (dayIdx: number, actId: string) => {
    if (!confirm('確定要刪除此活動嗎？')) return
    setData(prev => {
      const newDays = [...prev.days]
      newDays[dayIdx].activities = newDays[dayIdx].activities.filter(a => a.id !== actId)
      return { ...prev, days: newDays }
    })
  }

  const handleAddActivity = (dayIdx: number, timeSlot: 'Morning' | 'Afternoon' | 'Evening') => {
    const newAct: ActivityWithId = {
      id: `new-${Date.now()}`,
      time_slot: timeSlot,
      activity: '新活動',
      description: ''
    }
    setData(prev => {
      const newDays = [...prev.days]
      newDays[dayIdx].activities.push(newAct)
      return { ...prev, days: newDays }
    })
  }

  const handleUpdateAccommodation = (dayIdx: number, value: string) => {
    setData(prev => {
      const newDays = [...prev.days]
      newDays[dayIdx].accommodation = value
      return { ...prev, days: newDays }
    })
  }

  const handleUpdateMeals = (dayIdx: number, type: 'breakfast' | 'lunch' | 'dinner', value: string) => {
    setData(prev => {
      const newDays = [...prev.days]
      newDays[dayIdx].meals[type] = value
      return { ...prev, days: newDays }
    })
  }

  const handleSave = async () => {
    setLoading(true)
    const cleanData: Itinerary = {
      days: data.days.map(day => ({
        ...day,
        activities: day.activities.map(({ id, ...rest }) => rest)
      }))
    }
    const result = await updateItinerary(itineraryId, cleanData)
    setLoading(false)
    if (result.success) {
      setIsEditing(false)
      router.refresh()
    } else {
      alert('儲存失敗: ' + result.error)
    }
  }

  const handleExport = async () => {
    try {
      const cleanData: Itinerary = {
        days: data.days.map(day => ({
          ...day,
          activities: day.activities.map(({ id, ...rest }) => rest)
        }))
      }
      const blob = await generateItineraryDoc(cleanData)
      saveAs(blob, `itinerary-${itineraryId.slice(0, 8)}.docx`)
    } catch (e) {
      console.error(e)
      alert('匯出失敗')
    }
  }

  const activeItem = activeId 
    ? data.days.flatMap(d => d.activities).find(a => a.id === activeId)
    : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex justify-end mb-4 gap-2 sticky top-4 z-10 bg-background/80 backdrop-blur-sm p-2 rounded-lg border shadow-sm">
        {isEditing ? (
          <div className="space-x-2">
            <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={loading}>
              <X className="mr-2 h-4 w-4" /> 取消
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              儲存變更
            </Button>
          </div>
        ) : (
          <>
            <Button variant="outline" onClick={handleExport}>
              <FileDown className="mr-2 h-4 w-4" /> 匯出 Word
            </Button>
            <Button onClick={() => setIsEditing(true)}>
              <Pencil className="mr-2 h-4 w-4" /> 編輯行程
            </Button>
          </>
        )}
      </div>

      <div className="space-y-8">
        {data.days.map((day, dayIndex) => (
          <Card key={day.day} className="overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="flex justify-between items-center">
                <span>Day {day.day} - {day.date}</span>
              </CardTitle>
              <AccommodationEdit 
                value={day.accommodation} 
                isEditing={isEditing} 
                onChange={(val) => handleUpdateAccommodation(dayIndex, val)} 
              />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['Morning', 'Afternoon', 'Evening'] as const).map(slot => (
                  <TimeSlotColumn
                    key={slot}
                    id={`day-${dayIndex}-${slot}`}
                    title={slot}
                    activities={day.activities.filter(a => a.time_slot === slot)}
                    isEditing={isEditing}
                    onActivityUpdate={(actId, f, v) => handleUpdateActivity(dayIndex, actId, f, v)}
                    onActivityDelete={(actId) => handleDeleteActivity(dayIndex, actId)}
                    onAddActivity={() => handleAddActivity(dayIndex, slot)}
                  />
                ))}
              </div>
              <MealsEdit 
                meals={day.meals} 
                isEditing={isEditing} 
                onChange={(type, val) => handleUpdateMeals(dayIndex, type, val)}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeItem ? (
          <div className="w-[300px]">
             <SortableActivityCard 
               id={activeItem.id} 
               activity={activeItem} 
               isEditing={true} 
               onUpdate={() => {}} 
               onDelete={() => {}} 
             />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}