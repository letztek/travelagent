'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { updateItinerary, regenerateItinerary, getFavorites as getFavs } from '../../actions'
import { Itinerary, ItineraryDay } from '@/schemas/itinerary'
import { Loader2, Pencil, Save, X, FileDown, Undo2, Redo2, Check, Sparkles, ArrowLeft, RefreshCw, Plus, Trash2, BookHeart } from 'lucide-react'
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
import { RecommendationSheet } from './RecommendationSheet'
import { Favorite, getFavorites } from '@/app/favorites/actions'
import { toast } from 'sonner'

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
  const [isRecommendationOpen, setIsRecommendationOpen] = useState(false)
  const [userFavorites, setUserFavorites] = useState<Favorite[]>([])
  
  const loadUserFavorites = async () => {
    const result = await getFavorites()
    if (result.success) setUserFavorites(result.data || [])
  }

  useEffect(() => {
    loadUserFavorites()
  }, [])

  const router = useRouter()
  const [activeId, setActiveId] = useState<string | null>(null)

  // Stabilize the initial state to prevent useHistory loop
  const initialItineraryWithIds = useMemo(() => {
    return {
      days: (itinerary.days || []).map((day) => ({
        ...day,
        activities: (day.activities || []).map((activity) => ({
          ...activity,
          id: Math.random().toString(36).substr(2, 9)
        }))
      }))
    }
  }, [itineraryId]) // Only recompute if the itinerary ID changes

  // Use history hook for undo/redo
  const { 
    state: data, 
    setState: setData, 
    undo, 
    redo, 
    canUndo, 
    canRedo,
    clear: clearHistory,
    push: pushToHistory
  } = useHistory<ItineraryWithIds>(initialItineraryWithIds)

  // Proposal state
  const [proposal, setProposal] = useState<ItineraryAgentResponse | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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
        // Correctly update local state and history
        const newData = {
          days: (result.data.content.days || []).map((day: any) => ({
            ...day,
            activities: (day.activities || []).map((activity: any) => ({
              ...activity,
              id: Math.random().toString(36).substr(2, 9)
            }))
          }))
        }
        setData(newData)
        setIsEditing(false)
        router.refresh()
      } else {
        setRegenerationError(result.error || '重產行程失敗')
      }
    } catch (error: any) {
      setRegenerationError(error.message || '發生未知錯誤')
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    const cleanData: Itinerary = {
      days: (data.days || []).map(day => ({
        ...day,
        activities: (day.activities || []).map(({ id, ...rest }) => rest)
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

  const handleAddFavorite = (fav: Favorite) => {
    const targetDayIndex = selectedContext?.dayIndex ?? 0
    const newData = { ...data }
    
    if (fav.type === 'accommodation') {
      newData.days[targetDayIndex].accommodation = fav.name
      toast.success(`已將 ${fav.name} 設為第 ${targetDayIndex + 1} 天的住宿`)
    } else if (fav.type === 'food') {
      newData.days[targetDayIndex].meals.lunch = fav.name
      toast.success(`已將 ${fav.name} 加入第 ${targetDayIndex + 1} 天的午餐`)
    } else {
      const newActivity: ActivityWithId = {
        id: Math.random().toString(36).substr(2, 9),
        time_slot: 'Afternoon',
        activity: fav.name,
        description: fav.description || ''
      }
      newData.days[targetDayIndex].activities.push(newActivity)
      toast.success(`已將 ${fav.name} 加入第 ${targetDayIndex + 1} 天的活動`)
    }
    
    setData(newData)
    setIsRecommendationOpen(false)
  }

  const handleCancel = () => {
    if (confirm('確定要取消所有未儲存的變更嗎？')) {
      setIsEditing(false)
      router.refresh()
    }
  }

  const handleExport = async () => {
    try {
      const blob = await generateItineraryDoc(itinerary)
      saveAs(blob, `${itinerary.content?.title || '行程'}.docx`)
    } catch (error) {
      console.error('Export error:', error)
      alert('匯出失敗')
    }
  }

  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)
  const [presentationPrompt, setPresentationPrompt] = useState<string | null>(null)
  const [isPresentationDialogOpen, setIsPresentationDialogOpen] = useState(false)

  const handleGeneratePresentationPrompt = async () => {
    setIsGeneratingPrompt(true)
    try {
      const prompt = await generatePresentationPrompt(itinerary)
      setPresentationPrompt(prompt)
      setIsPresentationDialogOpen(true)
    } catch (error) {
      console.error('Presentation prompt generation failed:', error)
      alert('產生簡報提示詞失敗')
    } finally {
      setIsGeneratingPrompt(false)
    }
  }

  const handleDeleteActivity = (dayIndex: number, activityId: string) => {
    const newData = { ...data }
    newData.days[dayIndex].activities = newData.days[dayIndex].activities.filter(a => a.id !== activityId)
    setData(newData)
  }

  const handleAddDay = () => {
    const lastDay = data.days[data.days.length - 1]
    const lastDate = new Date(lastDay.date)
    const nextDate = new Date(lastDate)
    nextDate.setDate(lastDate.getDate() + 1)
    
    const newDay: ItineraryWithIds['days'][0] = {
      day: data.days.length + 1,
      date: nextDate.toISOString().split('T')[0],
      activities: [],
      meals: { breakfast: '', lunch: '', dinner: '' },
      accommodation: ''
    }
    
    setData({
      ...data,
      days: [...data.days, newDay]
    })
  }

  const handleDeleteDay = (index: number) => {
    if (data.days.length <= 1) {
      alert('行程至少需保留一天')
      return
    }

    if (!confirm(`確定要刪除第 ${index + 1} 天行程嗎？此操作無法撤銷。`)) return

    const startDate = data.days[0].date
    const newDays = data.days.filter((_, i) => i !== index)

    const syncedDays = syncItineraryDates(newDays, startDate)
    setData({ ...data, days: syncedDays as any })
  }

  const acceptProposal = () => {
    if (!proposal) return
    
    const newData: ItineraryWithIds = {
      days: (proposal.proposed_itinerary.days || []).map(day => ({
        ...day,
        activities: (day.activities || []).map(a => ({
          ...a,
          id: Math.random().toString(36).substr(2, 9)
        }))
      }))
    }
    
    setData(newData)
    setProposal(null)
  }

  const rejectProposal = () => {
    setProposal(null)
  }

  // DND Handlers
  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // If dragging a favorite, we don't do sorting previews
    if (activeId.startsWith('fav-')) return

    if (activeId === overId) return

    const activeContainer = findContainer(activeId)
    const overContainer = findContainer(overId)

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return
    }

    setData((prev) => {
      const activeItems = prev.days[activeContainer.dayIndex].activities
      const overItems = prev.days[overContainer.dayIndex].activities

      const activeIndex = activeItems.findIndex((item) => item.id === activeId)
      const overIndex = overItems.findIndex((item) => item.id === overId)

      let newIndex
      if (overId in prev.days) {
        newIndex = overItems.length + 1
      } else {
        const isBelowLastItem =
          over &&
          overIndex === overItems.length - 1 &&
          event.delta.y > 0

        const modifier = isBelowLastItem ? 1 : 0
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1
      }

      const newDays = [...prev.days]
      const [movedItem] = newDays[activeContainer.dayIndex].activities.splice(activeIndex, 1)
      
      movedItem.time_slot = overContainer.timeSlot as any
      
      newDays[overContainer.dayIndex].activities.splice(newIndex, 0, movedItem)

      return { ...prev, days: newDays }
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) {
      setActiveId(null)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    // Case 1: Dragging a favorite item
    if (activeId.startsWith('fav-')) {
      const fav = active.data.current as Favorite
      const overData = over.data.current as any
      
      if (!overData) {
        setActiveId(null)
        return
      }

      const newData = { ...data }
      const dayIndex = overData.dayIndex

      // Logic based on drop target type
      if (overData.type === 'accommodation') {
        if (fav.type !== 'accommodation') {
          toast.error('只能將住宿類型的口袋名單拖入住宿區塊')
        } else {
          newData.days[dayIndex].accommodation = fav.name
          setData(newData)
          toast.success(`已更新第 ${dayIndex + 1} 天住宿為 ${fav.name}`)
        }
      } else if (overData.type === 'meal') {
        if (fav.type !== 'food') {
          toast.error('只能將餐食類型的口袋名單拖入用餐區塊')
        } else {
          const mealType = overData.mealType as 'breakfast' | 'lunch' | 'dinner'
          newData.days[dayIndex].meals[mealType] = fav.name
          setData(newData)
          const mealLabel = mealType === 'breakfast' ? '早餐' : mealType === 'lunch' ? '午餐' : '晚餐'
          toast.success(`已更新第 ${dayIndex + 1} 天${mealLabel}為 ${fav.name}`)
        }
      } else {
        // Assume dropping into activity column or specific activity
        const container = findContainer(overId)
        if (container) {
          const newActivity: ActivityWithId = {
            id: Math.random().toString(36).substr(2, 9),
            time_slot: container.timeSlot as any,
            activity: fav.name,
            description: fav.description || ''
          }
          newData.days[container.dayIndex].activities.push(newActivity)
          setData(newData)
          toast.success(`已將 ${fav.name} 加入第 ${container.dayIndex + 1} 天的活動`)
        }
      }

      setActiveId(null)
      return
    }

    // Case 2: Sorting existing activities
    const activeContainer = findContainer(activeId)
    const overContainer = findContainer(overId)

    if (activeContainer && overContainer && activeContainer.dayIndex === overContainer.dayIndex && activeContainer.timeSlot === overContainer.timeSlot) {
      const activeIndex = data.days[activeContainer.dayIndex].activities.findIndex((item) => item.id === activeId)
      const overIndex = data.days[overContainer.dayIndex].activities.findIndex((item) => item.id === overId)

      if (activeIndex !== overIndex) {
        setData((prev) => {
          const newDays = [...prev.days]
          newDays[activeContainer.dayIndex].activities = arrayMove(
            newDays[activeContainer.dayIndex].activities,
            activeIndex,
            overIndex
          )
          return { ...prev, days: newDays }
        })
      }
    }

    setActiveId(null)
  }

  function findContainer(id: string) {
    // If it's a direct column drop zone ID like "0-Morning"
    if (id.includes('-') && !id.startsWith('day-')) {
      const [dIdx, slot] = id.split('-')
      return { dayIndex: parseInt(dIdx), timeSlot: slot }
    }
    
    // If it's a special drop zone ID like "day-0-accommodation"
    if (id.startsWith('day-')) {
      const parts = id.split('-')
      return { dayIndex: parseInt(parts[1]), type: parts[2] }
    }

    // If it's an activity ID
    for (let d = 0; d < data.days.length; d++) {
      const day = data.days[d]
      if (day.activities.some(a => a.id === id)) {
        const activity = day.activities.find(a => a.id === id)
        return { dayIndex: d, timeSlot: activity?.time_slot }
      }
    }
    return null
  }

  const activeItem = useMemo(() => {
    if (!activeId) return null
    // If it's a favorite being dragged, it won't be in the itinerary yet
    if (activeId.startsWith('fav-')) {
      // We could render a special favorite overlay here if we wanted
      return null
    }
    for (const day of data.days) {
      const item = day.activities.find(a => a.id === activeId)
      if (item) return item
    }
    return null
  }, [activeId, data])

  const currentData = proposal ? {
    days: (proposal.proposed_itinerary.days || []).map(day => ({
      ...day,
      activities: (day.activities || []).map(a => ({ ...a, id: Math.random().toString() }))
    }))
  } : data

  return (
    <div className="flex flex-col w-full">
      {/* Top Action Bar */}
      <div className="sticky top-16 z-40 w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto max-w-7xl h-14 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="h-8 text-slate-500">
              <Link href="/itineraries">
                <ArrowLeft className="mr-2 h-4 w-4" /> 返回
              </Link>
            </Button>
            <div className="w-px h-4 bg-slate-200" />
            <h2 className="text-sm font-bold text-slate-900 truncate max-w-[200px] md:max-w-md">
              {itinerary.content?.title || '精彩旅程'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="ghost" size="sm" onClick={undo} disabled={!canUndo || !!proposal} className="h-8 px-2" aria-label="Undo">
                  <Undo2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={redo} disabled={!canRedo || !!proposal} className="h-8 px-2" aria-label="Redo">
                  <Redo2 className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-border mx-1" />
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsRecommendationOpen(true)}
                  className="h-8 text-xs border-pink-100 text-pink-600 hover:bg-pink-50"
                >
                  <BookHeart className="mr-2 h-3 w-3" /> 私房推薦
                </Button>

                <Button variant="ghost" size="sm" onClick={handleCancel} disabled={loading} className="h-8 text-xs">
                  取消
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={loading || !!proposal}
                  className="h-8 text-xs bg-sky-500 hover:bg-sky-600 text-white border-0"
                >
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
                <Button 
                  size="sm" 
                  onClick={() => setIsEditing(true)} 
                  className="h-8 text-xs bg-orange-500 hover:bg-orange-600 text-white border-0"
                >
                  <Pencil className="mr-2 h-3 w-3" /> 編輯
                </Button>
              </>
            )}
          </div>
        </div>

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
        
        <main className="flex-grow bg-slate-50/50 p-4 md:p-8 overflow-y-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="max-w-5xl mx-auto space-y-12">
              {currentData.days.map((day, dayIndex) => (
                <Card key={day.day} id={`day-card-${day.day}`} className="border-none shadow-sm overflow-hidden scroll-mt-32">
                  <CardHeader className="bg-white border-b py-4 px-6">
                    <div className="flex items-center justify-between group">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-baseline gap-4">
                          <h3 className="text-xl font-bold text-slate-900">
                            Day {day.day}
                          </h3>
                          <span className="text-slate-400 font-medium text-sm">{day.date}</span>
                        </div>
                        <AccommodationEdit 
                          value={day.accommodation} 
                          isEditing={isEditing}
                          onChange={(val) => {
                            const newData = { ...data }
                            newData.days[dayIndex].accommodation = val
                            setData(newData)
                          }}
                          dayIndex={dayIndex}
                          selectedContext={selectedContext}
                          onSelectContext={(ctx) => setSelectedContext(ctx as any)}
                          userFavorites={userFavorites}
                          onToggleFavorite={loadUserFavorites}
                        />
                      </div>
                      {isEditing && (
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMoveDialog({ open: true, dayIndex })}
                            className="h-8 text-xs text-slate-500"
                          >
                            <RefreshCw className="mr-2 h-3 w-3" /> 重排
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDay(dayIndex)}
                            className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="mr-2 h-3 w-3" /> 刪除
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6 bg-white space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {(['Morning', 'Afternoon', 'Evening'] as const).map((slot) => (
                        <TimeSlotColumn
                          key={`${day.day}-${slot}`}
                          id={`${dayIndex}-${slot}`}
                          title={slot === 'Morning' ? '上午' : slot === 'Afternoon' ? '下午' : '晚上'}
                          activities={day.activities.filter(a => a.time_slot === slot)}
                          isEditing={isEditing}
                          onActivityUpdate={(id, updates) => {
                            const newData = { ...data }
                            const activity = newData.days[dayIndex].activities.find(a => a.id === id)
                            if (activity) {
                              Object.assign(activity, updates)
                              setData(newData)
                            }
                          }}
                          onActivityDelete={(id) => handleDeleteActivity(dayIndex, id)}
                          onAddActivity={() => {
                            const newData = { ...data }
                            const newActivity: ActivityWithId = {
                              id: Math.random().toString(36).substr(2, 9),
                              time_slot: slot,
                              activity: '新活動',
                              description: ''
                            }
                            newData.days[dayIndex].activities.push(newActivity)
                            setData(newData)
                          }}
                          onSelectContext={(activityId) => {
                            setSelectedContext({
                              dayIndex,
                              type: 'activity',
                              itemId: activityId
                            })
                          }}
                          isSelected={(activityId) => 
                            selectedContext?.dayIndex === dayIndex && 
                            selectedContext?.type === 'activity' && 
                            selectedContext?.itemId === activityId
                          }
                          dayIndex={dayIndex}
                          userFavorites={userFavorites}
                          onToggleFavorite={loadUserFavorites}
                        />
                      ))}
                    </div>

                    <MealsEdit 
                      meals={day.meals} 
                      isEditing={isEditing}
                      onChange={(type, value) => {
                        const newData = { ...data }
                        newData.days[dayIndex].meals[type] = value
                        setData(newData)
                      }}
                      dayIndex={dayIndex}
                      selectedContext={selectedContext}
                      onSelectContext={(ctx) => setSelectedContext(ctx as any)}
                      userFavorites={userFavorites}
                      onToggleFavorite={loadUserFavorites}
                    />
                  </CardContent>
                </Card>
              ))}
              
              {isEditing && (
                <Button
                  variant="outline"
                  className="w-full h-16 border-dashed border-2 text-slate-400 hover:text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  onClick={handleAddDay}
                >
                  <Plus className="mr-2 h-5 w-5" /> 新增一天
                </Button>
              )}
            </div>

            <DragOverlay dropAnimation={dropAnimation}>
              {activeId?.startsWith('fav-') ? (
                <div className="opacity-80 scale-105 shadow-2xl bg-white border rounded-lg p-3 w-64 pointer-events-none">
                   <div className="flex items-center gap-2 mb-1">
                     <Sparkles className="text-amber-500" size={14} />
                     <span className="font-bold text-sm">口袋名單: {userFavorites.find(f => `fav-${f.id}` === activeId)?.name}</span>
                   </div>
                </div>
              ) : activeItem ? (
                <SortableActivityCard
                  id={activeItem.id}
                  activity={activeItem}
                  isEditing={isEditing}
                  isOverlay
                />
              ) : null}
            </DragOverlay>

            <RecommendationSheet 
              open={isRecommendationOpen}
              onOpenChange={setIsRecommendationOpen}
              onAdd={handleAddFavorite}
            />
          </DndContext>
        </main>

        <ItineraryAgentChat 
          currentItinerary={data as any} 
          onProposal={setProposal} 
          focusedContext={selectedContext}
          onAcceptProposal={acceptProposal}
          onRejectProposal={rejectProposal}
          isProposalMode={!!proposal}
        />
      </div>

      <MoveDayDialog 
        open={moveDialog.open}
        onOpenChange={(open) => setMoveDialog(prev => ({ ...prev, open }))}
        currentDay={moveDialog.dayIndex + 1}
        totalDays={data.days.length}
        onMove={handleMoveDay}
      />

      <PresentationPromptDialog 
        open={isPresentationDialogOpen} 
        onOpenChange={setIsPresentationDialogOpen} 
        prompt={presentationPrompt || ''} 
      />
    </div>
  )
}
