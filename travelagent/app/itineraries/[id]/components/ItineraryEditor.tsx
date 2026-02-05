'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { updateItinerary } from '../../actions'
import { Itinerary, ItineraryDay } from '@/schemas/itinerary'
import { Loader2, Pencil, Save, X, FileDown, Undo2, Redo2 } from 'lucide-react'
import { saveAs } from 'file-saver'
import { generateItineraryDoc } from '@/lib/utils/export-word'
import { useHistory } from '@/lib/hooks/use-history'
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

type SelectedContext = {
  dayIndex: number
  itemId?: string
  type: 'activity' | 'meal' | 'accommodation' | 'day'
} | null

export default function ItineraryEditor({ itinerary, itineraryId }: ItineraryEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedContext, setSelectedContext] = useState<SelectedContext>(null)
  const router = useRouter()
  const [activeId, setActiveId] = useState<string | null>(null)

  // Initialize history with stable IDs
  // We use useHistory to manage the main state 'data'
  const initialData: ItineraryWithIds = {
    ...itinerary,
    days: itinerary.days.map((day, dIdx) => ({
      ...day,
      activities: day.activities.map((act, aIdx) => ({
        ...act,
        id: `act-${dIdx}-${aIdx}-${Math.random().toString(36).substr(2, 5)}`
      }))
    }))
  }

  const { 
    state: data, 
    setState: setData, 
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useHistory(initialData)

  // Transient state for drag operations to avoid flooding history
  const [transientData, setTransientData] = useState<ItineraryWithIds | null>(null)
  
  // Use transient data if available (during drag), otherwise use history data
  const currentData = transientData || data

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Prevent accidental drags
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Find container (Day + TimeSlot) for an item ID
  const findContainer = (id: string) => {
    // If id is a container ID (e.g., "day-0-Morning"), return it
    if (id.startsWith('day-')) return id

    // Otherwise find which day/slot contains the activity
    for (let d = 0; d < currentData.days.length; d++) {
      const activity = currentData.days[d].activities.find(a => a.id === id)
      if (activity) {
        return `day-${d}-${activity.time_slot}`
      }
    }
    return undefined
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    setTransientData(data) // Start transient state from current valid state
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

    const activeDayIndex = parseInt(activeContainer.split('-')[1])
    const overDayIndex = parseInt(overContainer.split('-')[1])
    const overTimeSlot = overContainer.split('-')[2] as 'Morning' | 'Afternoon' | 'Evening'

    // Use currentData (transient) for calculations
    const activeItems = currentData.days[activeDayIndex].activities
    const overItems = currentData.days[overDayIndex].activities

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

    // Clone days from currentData
    const newDays = currentData.days.map(d => ({ ...d, activities: [...d.activities] }))
    
    // Remove from old
    const [movedItem] = newDays[activeDayIndex].activities.splice(activeIndex, 1)
    
    // Update time slot
    movedItem.time_slot = overTimeSlot
    
    // Add to new
    newDays[overDayIndex].activities.push(movedItem)
    
    // Update transient state only
    setTransientData({ ...currentData, days: newDays })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    const activeId = active.id as string
    const overId = over.id as string

    if (!over) {
      setActiveId(null)
      setTransientData(null) // Cancel drag
      return
    }

    const activeContainer = findContainer(activeId)
    const overContainer = findContainer(overId)

    if (activeContainer && overContainer && activeContainer === overContainer) {
      // Sorting within same container (Day + Slot)
      const dayIndex = parseInt(activeContainer.split('-')[1])
      
      const newDays = currentData.days.map(d => ({ ...d, activities: [...d.activities] }))
      const items = newDays[dayIndex].activities
      
      const oldIndex = items.findIndex(i => i.id === activeId)
      const newIndex = items.findIndex(i => i.id === overId)

      if (oldIndex !== newIndex) {
         newDays[dayIndex].activities = arrayMove(items, oldIndex, newIndex)
         // Commit to history
         setData({ ...data, days: newDays })
      } else {
         // No change, just reset transient
         setTransientData(null)
      }
    } else {
      // Cross-container move (DragOver handled the structure, DragEnd commits it)
      // Since DragOver updated transientData, we take that result and commit to history
      if (transientData) {
        setData(transientData)
      }
    }
    
    setActiveId(null)
    setTransientData(null)
  }

  // CRUD Handlers
  const handleUpdateActivity = (dayIdx: number, actId: string, field: string, value: string) => {
    const newDays = [...data.days]
    newDays[dayIdx] = {
      ...newDays[dayIdx],
      activities: newDays[dayIdx].activities.map(a => 
        a.id === actId ? { ...a, [field]: value } : a
      )
    }
    setData({ ...data, days: newDays })
  }

  const handleDeleteActivity = (dayIdx: number, actId: string) => {
    if (!confirm('確定要刪除此活動嗎？')) return
    const newDays = [...data.days]
    newDays[dayIdx] = {
      ...newDays[dayIdx],
      activities: newDays[dayIdx].activities.filter(a => a.id !== actId)
    }
    setData({ ...data, days: newDays })
  }

  const handleAddActivity = (dayIdx: number, timeSlot: 'Morning' | 'Afternoon' | 'Evening') => {
    const newAct: ActivityWithId = {
      id: `new-${dayIdx}-${timeSlot}-${Math.random().toString(36).substr(2, 9)}`,
      time_slot: timeSlot,
      activity: '新活動',
      description: ''
    }
    const newDays = [...data.days]
    newDays[dayIdx] = {
      ...newDays[dayIdx],
      activities: [...newDays[dayIdx].activities, newAct]
    }
    setData({ ...data, days: newDays })
  }

  const handleUpdateAccommodation = (dayIdx: number, value: string) => {
    const newDays = [...data.days]
    newDays[dayIdx] = { ...newDays[dayIdx], accommodation: value }
    setData({ ...data, days: newDays })
  }

  const handleUpdateMeals = (dayIdx: number, type: 'breakfast' | 'lunch' | 'dinner', value: string) => {
    const newDays = [...data.days]
    newDays[dayIdx] = { 
      ...newDays[dayIdx], 
      meals: { ...newDays[dayIdx].meals, [type]: value } 
    }
    setData({ ...data, days: newDays })
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

  const handleCancel = () => {
    setIsEditing(false)
    // We don't reset data here because useHistory keeps the state.
    // If we want to revert to initial props, we'd need to reset the history stack,
    // but the hook doesn't expose a reset.
    // For now, toggling isEditing off is sufficient as the user can just reload to reset if they haven't saved.
  }

  const handleSelectContext = (ctx: SelectedContext) => {
    setSelectedContext(ctx)
  }

  const activeItem = activeId 
    ? currentData.days.flatMap(d => d.activities).find(a => a.id === activeId)
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
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={undo} disabled={!canUndo} aria-label="Undo">
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={redo} disabled={!canRedo} aria-label="Redo">
              <Redo2 className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-2" />
            <Button variant="ghost" onClick={handleCancel} disabled={loading}>
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
        {currentData.days.map((day, dayIndex) => (
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
                    dayIndex={dayIndex}
                    selectedContext={selectedContext}
                    onSelectContext={handleSelectContext}
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
