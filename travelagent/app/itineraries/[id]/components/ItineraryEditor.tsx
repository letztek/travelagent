'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { updateItinerary } from '../../actions'
import { Itinerary, ItineraryDay } from '@/schemas/itinerary'
import { Loader2, Pencil, Save, X, FileDown, Undo2, Redo2, Check, Sparkles } from 'lucide-react'
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
import { ItineraryAgentChat } from './ItineraryAgentChat'
import { ItineraryAgentResponse, AgentContext } from '../../itinerary-agent'
import { generatePresentationPrompt } from '../../presentation-generator'
import { PresentationPromptDialog } from './PresentationPromptDialog'

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

type SelectedContext = AgentContext | null

export default function ItineraryEditor({ itinerary, itineraryId }: ItineraryEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedContext, setSelectedContext] = useState<SelectedContext>(null)
  const router = useRouter()
  const [activeId, setActiveId] = useState<string | null>(null)

  // Presentation Prompt State with Cache
  const [presentationPrompts, setPresentationPrompts] = useState<{ zh: string | null; en: string | null }>({ zh: null, en: null })
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false)
  const [promptLanguage, setPromptLanguage] = useState<'zh' | 'en'>('zh')

  // Initialize history with stable IDs
  const initialData = useMemo(() => ({
    ...itinerary,
    days: itinerary.days.map((day, dIdx) => ({
      ...day,
      activities: day.activities.map((act, aIdx) => ({
        ...act,
        id: act.id || `act-${dIdx}-${aIdx}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
      }))
    }))
  }), [itinerary])

  const { 
    state: data, 
    setState: setData, 
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useHistory(initialData)

  // AI Proposal State
  const [proposal, setProposal] = useState<ItineraryWithIds | null>(null)

  // Transient state for drag operations
  const [transientData, setTransientData] = useState<ItineraryWithIds | null>(null)
  
  // Use proposal if in proposal mode, else transient if dragging, else history data
  const currentData = proposal || transientData || data

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const findContainer = (id: string) => {
    if (id.startsWith('day-')) return id
    for (let d = 0; d < currentData.days.length; d++) {
      const activity = currentData.days[d].activities.find(a => a.id === id)
      if (activity) {
        return `day-\${d}-\${activity.time_slot}`
      }
    }
    return undefined
  }

  const handleDragStart = (event: DragStartEvent) => {
    if (proposal) return // Disable drag in proposal mode
    setActiveId(event.active.id as string)
    setTransientData(data)
  }

  const handleDragOver = (event: DragOverEvent) => {
    if (proposal) return
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeContainer = findContainer(activeId)
    const overContainer = findContainer(overId)

    if (!activeContainer || !overContainer || activeContainer === overContainer) return

    const activeDayIndex = parseInt(activeContainer.split('-')[1])
    const overDayIndex = parseInt(overContainer.split('-')[1])
    const overTimeSlot = overContainer.split('-')[2] as 'Morning' | 'Afternoon' | 'Evening'

    const activeItems = currentData.days[activeDayIndex].activities
    const overItems = currentData.days[overDayIndex].activities

    const activeIndex = activeItems.findIndex(i => i.id === activeId)
    const overIndex = overItems.findIndex(i => i.id === overId)

    let newIndex: number
    if (overId.startsWith('day-')) {
      newIndex = overItems.length + 1
    } else {
      const isBelowOverItem = over && active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height;
      const modifier = isBelowOverItem ? 1 : 0;
      newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
    }

    const newDays = currentData.days.map(d => ({ ...d, activities: [...d.activities] }))
    const [movedItem] = newDays[activeDayIndex].activities.splice(activeIndex, 1)
    movedItem.time_slot = overTimeSlot
    newDays[overDayIndex].activities.push(movedItem)
    
    setTransientData({ ...currentData, days: newDays })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    if (proposal) return
    const { active, over } = event
    const activeId = active.id as string
    const overId = over.id as string

    if (!over) {
      setActiveId(null)
      setTransientData(null)
      return
    }

    const activeContainer = findContainer(activeId)
    const overContainer = findContainer(overId)

    if (activeContainer && overContainer && activeContainer === overContainer) {
      const dayIndex = parseInt(activeContainer.split('-')[1])
      const newDays = currentData.days.map(d => ({ ...d, activities: [...d.activities] }))
      const items = newDays[dayIndex].activities
      const oldIndex = items.findIndex(i => i.id === activeId)
      const newIndex = items.findIndex(i => i.id === overId)

      if (oldIndex !== newIndex) {
         newDays[dayIndex].activities = arrayMove(items, oldIndex, newIndex)
         setData({ ...data, days: newDays })
      } else {
         setTransientData(null)
      }
    } else if (transientData) {
      setData(transientData)
    }
    
    setActiveId(null)
    setTransientData(null)
  }

  const handleUpdateActivity = (dayIdx: number, actId: string, field: string, value: string) => {
    const newDays = [...data.days]
    newDays[dayIdx] = {
      ...newDays[dayIdx],
      activities: newDays[dayIdx].activities.map(a => a.id === actId ? { ...a, [field]: value } : a)
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
      id: `new-\${dayIdx}-\${timeSlot}-\${Math.random().toString(36).substr(2, 9)}`,
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
    newDays[dayIdx] = { ...newDays[dayIdx], meals: { ...newDays[dayIdx].meals, [type]: value } }
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
      saveAs(blob, `itinerary-\${itineraryId.slice(0, 8)}.docx`)
    } catch (e) {
      console.error(e)
      alert('匯出失敗')
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setProposal(null)
  }

  const handleSelectContext = (ctx: SelectedContext) => {
    setSelectedContext(ctx)
  }

  const handleAIProposal = (response: ItineraryAgentResponse) => {
    const proposedData: ItineraryWithIds = {
      ...response.proposed_itinerary,
      days: response.proposed_itinerary.days.map((day, dIdx) => ({
        ...day,
        activities: day.activities.map((act, aIdx) => ({
          ...act,
          id: `ai-\${dIdx}-\${aIdx}-\${Math.random().toString(36).substr(2, 5)}`
        }))
      }))
    }
    setProposal(proposedData)
  }

  const acceptProposal = () => {
    if (proposal) {
      setData(proposal)
      setProposal(null)
    }
  }

  const rejectProposal = () => {
    setProposal(null)
  }

  const handleGeneratePresentationPrompt = async (lang: 'zh' | 'en' = promptLanguage) => {
    setPromptLanguage(lang)
    setIsPromptDialogOpen(true)

    if (presentationPrompts[lang]) {
      return
    }

    setIsGeneratingPrompt(true)
    try {
      const result = await generatePresentationPrompt(data, lang)
      if (result.success) {
        setPresentationPrompts(prev => ({ ...prev, [lang]: result.data }))
      } else {
        alert('生成失敗: ' + result.error)
      }
    } catch (e) {
      console.error(e)
      alert('發生錯誤')
    } finally {
      setIsGeneratingPrompt(false)
    }
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
      <div className="container mx-auto py-10 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">行程詳情編輯器</h1>
          <div className="flex gap-2">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={undo} disabled={!canUndo || !!proposal} aria-label="Undo">
                  <Undo2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={redo} disabled={!canRedo || !!proposal} aria-label="Redo">
                  <Redo2 className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-2" />
                <Button variant="ghost" onClick={handleCancel} disabled={loading}>
                  <X className="mr-2 h-4 w-4" /> 取消
                </Button>
                <Button onClick={handleSave} disabled={loading || !!proposal}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  儲存變更
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleGeneratePresentationPrompt()} disabled={isGeneratingPrompt}>
                  <Sparkles className="mr-2 h-4 w-4" /> 簡報 Prompt
                </Button>
                <Button variant="outline" onClick={handleExport}>
                  <FileDown className="mr-2 h-4 w-4" /> 匯出 Word
                </Button>
                <Button onClick={() => setIsEditing(true)}>
                  <Pencil className="mr-2 h-4 w-4" /> 編輯行程
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-6 items-start">
          <div className="flex-1 space-y-8 min-w-0">
            {proposal && (
              <div className="sticky top-4 z-20 bg-primary/10 backdrop-blur border-2 border-primary p-4 rounded-lg shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2 mb-6">
                <div className="flex items-center gap-2 font-semibold text-primary">
                  <Sparkles className="h-5 w-5" />
                  <span>AI 建議了一份新的細節規劃</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={rejectProposal}>
                    <X className="mr-2 h-4 w-4" /> 捨棄
                  </Button>
                  <Button size="sm" onClick={acceptProposal} className="bg-green-600 hover:bg-green-700 text-white">
                    <Check className="mr-2 h-4 w-4" /> 套用建議
                  </Button>
                </div>
              </div>
            )}

            <div className={`space-y-8 \${proposal ? 'opacity-80' : ''}`}>
              {currentData.days.map((day, dayIndex) => (
                <Card key={day.day} className={`overflow-hidden transition-all \${proposal ? 'border-primary/30' : ''}`}>
                  <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle className="flex justify-between items-center mb-2">
                      <span>Day {day.day} - {day.date}</span>
                    </CardTitle>
                    <AccommodationEdit 
                      value={day.accommodation} 
                      isEditing={isEditing} 
                      onChange={(val) => handleUpdateAccommodation(dayIndex, val)} 
                      dayIndex={dayIndex}
                      selectedContext={selectedContext}
                      onSelectContext={handleSelectContext}
                    />
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {(['Morning', 'Afternoon', 'Evening'] as const).map(slot => (
                        <TimeSlotColumn
                          key={slot}
                          id={`day-\${dayIndex}-\${slot}`}
                          title={slot}
                          activities={day.activities.filter(a => a.time_slot === slot)}
                          isEditing={isEditing && !proposal}
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
                      dayIndex={dayIndex}
                      selectedContext={selectedContext}
                      onSelectContext={handleSelectContext}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <ItineraryAgentChat 
            currentItinerary={data}
            focusedContext={selectedContext}
            onProposal={handleAIProposal}
            onAcceptProposal={acceptProposal}
            onRejectProposal={rejectProposal}
            isProposalMode={!!proposal}
          />
        </div>
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

      <PresentationPromptDialog 
        open={isPromptDialogOpen} 
        onOpenChange={setIsPromptDialogOpen} 
        prompt={presentationPrompts[promptLanguage]} 
        isLoading={isGeneratingPrompt} 
        language={promptLanguage}
        onLanguageChange={handleGeneratePresentationPrompt}
      />
    </DndContext>
  )
}