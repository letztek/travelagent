'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { updateItinerary, regenerateItinerary } from '../../actions'
import { Itinerary, ItineraryDay } from '@/schemas/itinerary'
import { Loader2, Pencil, Save, X, FileDown, Undo2, Redo2, Check, Sparkles, ArrowLeft, RefreshCw, Plus, Trash2 } from 'lucide-react'
import { saveAs } from 'file-saver'
import { generateItineraryDoc } from '@/lib/utils/export-word'
import { useHistory } from '@/lib/hooks/use-history'
import { AIErrorFallback } from '@/components/ui/ai-error-fallback'
import { syncItineraryDates, reorderArray } from '@/lib/utils/itinerary-utils'
import { MoveDayDialog } from './MoveDayDialog'
import { CollapsibleSidebar } from './CollapsibleSidebar'
import Link from 'next/link'
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
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [regenerationError, setRegenerationError] = useState<string | null>(null)
  const [moveDialog, setMoveDialog] = useState<{ open: boolean, dayIndex: number }>({ open: false, dayIndex: 0 })
  const [selectedContext, setSelectedContext] = useState<SelectedContext>(null)
  const router = useRouter()
  const [activeId, setActiveId] = useState<string | null>(null)

  const handleMoveDay = (targetIndex: number) => {
    const startIndex = moveDialog.dayIndex
    if (startIndex === targetIndex) return
    
    const startDate = data.days[0].date
    const reorderedDays = reorderArray(data.days, startIndex, targetIndex)
    
    // Auto sync all dates and day numbers
    const syncedDays = syncItineraryDates(reorderedDays, startDate)
    setData({ ...data, days: syncedDays as any })
  }

  const handleRegenerate = async () => {
    if (!confirm('確定要捨棄目前所有手動編輯並讓 AI 重新產生一份全新的行程嗎？')) return
    
    setIsRegenerating(true)
    setRegenerationError(null)
    
    try {
      const result = await regenerateItinerary(itineraryId)
      if (result.success) {
        // Since we got new content from DB, we should refresh the page or update state
        router.refresh()
        // Force state update if necessary (though refresh might be cleaner)
        setData(result.data.content)
        setIsEditing(false)
      } else {
        setRegenerationError(result.error || '重新產生失敗')
      }
    } catch (e: any) {
      setRegenerationError(e.message || '發生未知錯誤')
    } finally {
      setIsRegenerating(false)
    }
  }

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
      activities: day.activities.map((act: any, aIdx) => ({
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
      const activity = currentData.days[d].activities.find((a: any) => a.id === id)
      if (activity) {
        return `day-${d}-${activity.time_slot}`
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

    const activeIndex = activeItems.findIndex((i: any) => i.id === activeId)
    const overIndex = overItems.findIndex((i: any) => i.id === overId)

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
    const overId = over?.id as string

    if (!over) {
      setActiveId(null)
      setTransientData(null)
      return
    }

    const activeContainer = findContainer(activeId)
    const overContainer = findContainer(overId)

    if (activeContainer && overContainer && activeContainer === overContainer) {
      const dayIndexStr = activeContainer.split('-')[1]
      const dayIndex = parseInt(dayIndexStr)
      
      if (isNaN(dayIndex) || !currentData.days[dayIndex]) {
        console.error('Invalid dayIndex from container:', activeContainer)
        setActiveId(null)
        setTransientData(null)
        return
      }

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
    newDays[dayIdx] = { ...newDays[dayIdx], meals: { ...newDays[dayIdx].meals, [type]: value } }
    setData({ ...data, days: newDays })
  }

  const handleAddDay = (index: number) => {
    const startDate = data.days[0].date
    const newDay: ItineraryDay = {
      day: 0, // Will be synced
      date: '', // Will be synced
      activities: [],
      meals: { breakfast: '飯店早餐', lunch: '自理', dinner: '自理' },
      accommodation: '請選擇飯店'
    }
    
    const newDays = [...data.days]
    newDays.splice(index, 0, newDay)
    
    // Auto sync all dates
    const syncedDays = syncItineraryDates(newDays, startDate)
    setData({ ...data, days: syncedDays as any })
  }

  const handleDeleteDay = (index: number) => {
    if (data.days.length <= 1) {
      alert('行程至少需保留一天')
      return
    }
    
    if (!confirm(`確定要刪除第 ${index + 1} 天行程嗎？此操作無法撤銷。`)) return
    
    const startDate = data.days[0].date
    const newDays = data.days.filter((_, i) => i !== index)
    
    // Auto sync all dates
    const syncedDays = syncItineraryDates(newDays, startDate)
    setData({ ...data, days: syncedDays as any })
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
          id: `ai-${dIdx}-${aIdx}-${Math.random().toString(36).substr(2, 5)}`
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
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b transition-all">
        <div className="container mx-auto max-w-7xl h-14 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="rounded-full h-8 w-8">
              <Link href="/itineraries">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-lg font-semibold truncate">行程詳情編輯器</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="ghost" size="sm" onClick={undo} disabled={!canUndo || !!proposal} className="h-8 px-2">
                  <Undo2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={redo} disabled={!canRedo || !!proposal} className="h-8 px-2">
                  <Redo2 className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-border mx-1" />
                <Button variant="ghost" size="sm" onClick={handleCancel} disabled={loading} className="h-8 text-xs">
                  取消
                </Button>
                <Button size="sm" onClick={handleSave} disabled={loading || !!proposal} className="h-8 text-xs">
                  {loading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Save className="mr-2 h-3 w-3" />}
                  儲存
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRegenerate} 
                  disabled={isRegenerating}
                  className="h-8 text-xs text-amber-600 border-amber-200 hover:bg-amber-50"
                >
                  {isRegenerating ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <RefreshCw className="mr-2 h-3 w-3" />}
                  重產
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleGeneratePresentationPrompt()} disabled={isGeneratingPrompt} className="h-8 text-xs">
                  <Sparkles className="mr-2 h-3 w-3" /> 簡報
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport} className="h-8 text-xs">
                  <FileDown className="mr-2 h-3 w-3" /> 匯出
                </Button>
                <Button size="sm" onClick={() => setIsEditing(true)} className="h-8 text-xs">
                  <Pencil className="mr-2 h-3 w-3" /> 編輯
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Secondary AI Proposal Bar */}
        {proposal && (
          <div className="bg-primary/10 border-b border-primary/20 animate-in slide-in-from-top-2">
            <div className="container mx-auto max-w-7xl h-10 flex items-center justify-between px-4">
              <div className="flex items-center gap-2 text-xs font-medium text-primary">
                <Sparkles className="h-3 w-3" />
                <span>AI 建議了一份新的細節規劃</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={rejectProposal} className="h-7 text-xs hover:text-destructive">
                  捨棄
                </Button>
                <Button size="sm" onClick={acceptProposal} className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white border-0">
                  <Check className="mr-1 h-3 w-3" /> 套用
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <CollapsibleSidebar days={currentData.days.map(d => ({ day: d.day, date: d.date }))} />
        
        <div className="flex-1 min-w-0 p-6">
          {regenerationError && (
            <div className="mb-6">
              <AIErrorFallback 
                error={regenerationError} 
                onRetry={handleRegenerate} 
                title="重新規劃失敗"
              />
            </div>
          )}

          <div className="flex gap-6 items-start">
            <div className="flex-1 space-y-8 min-w-0">
            <div className={`space-y-8 ${proposal ? 'opacity-80' : ''}`}>
              {isEditing && (
                <div className="flex justify-center -mb-4 relative z-10">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full h-8 w-8 p-0 border-dashed"
                    onClick={() => handleAddDay(0)}
                    title="在第一天前插入一天"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {currentData.days.map((day, dayIndex) => (
                <div key={day.day} id={`day-card-${day.day}`} className="space-y-8">
                  <Card className={`overflow-hidden transition-all ${proposal ? 'border-primary/30' : ''}`}>
                    <CardHeader className="bg-muted/30 pb-4">
                      <CardTitle className="flex justify-between items-center mb-2">
                        <span>Day {day.day} - {day.date}</span>
                        {isEditing && !proposal && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs text-muted-foreground hover:text-primary"
                              onClick={() => setMoveDialog({ open: true, dayIndex: dayIndex })}
                              title="移動此天位置"
                            >
                              <Undo2 className="h-3 w-3 rotate-90 mr-1" />
                              移動
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteDay(dayIndex)}
                              title="刪除此天行程"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
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
                            id={`day-${dayIndex}-${slot}`}
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
                  
                  {isEditing && !proposal && (
                    <div className="flex justify-center -my-4 relative z-10">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-full h-8 w-8 p-0 border-dashed"
                        onClick={() => handleAddDay(dayIndex + 1)}
                        title={`在 Day ${day.day} 後插入一天`}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
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
        
              <MoveDayDialog 
                open={moveDialog.open}
                onOpenChange={(open) => setMoveDialog(prev => ({ ...prev, open }))}
                currentDay={moveDialog.dayIndex + 1}
                totalDays={data.days.length}
                onMove={handleMoveDay}
              />
            </DndContext>
          )
        }
        