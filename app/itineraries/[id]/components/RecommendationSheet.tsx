'use client'

import { useState, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Utensils, Home, Plus, Loader2, Sparkles, GripVertical } from 'lucide-react'
import { getFavorites, Favorite } from '@/app/favorites/actions'
import { cn } from '@/lib/utils'
import { useDraggable } from '@dnd-kit/core'
import {
  Sheet as ShadcnSheet,
  SheetContent as ShadcnSheetContent,
  SheetDescription as ShadcnSheetDescription,
  SheetHeader as ShadcnSheetHeader,
  SheetTitle as ShadcnSheetTitle,
} from '@/components/ui/sheet'

interface RecommendationSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (item: Favorite, dayIndex: number, slot?: string) => void
  totalDays: number
}

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function FavoriteItemWithPicker({ 
  fav, 
  onAdd, 
  totalDays 
}: { 
  fav: Favorite, 
  onAdd: (item: Favorite, dayIndex: number, slot?: string) => void,
  totalDays: number
}) {
  const [selectedDay, setSelectedDay] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState(
    fav.type === 'food' ? 'lunch' : 
    fav.type === 'spot' ? 'Afternoon' : ''
  )
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `fav-${fav.id}`,
    data: fav,
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  const handleAdd = () => {
    onAdd(fav, selectedDay, selectedSlot)
    setIsPopoverOpen(false)
  }

  const slotOptions = fav.type === 'food' 
    ? [
        { value: 'breakfast', label: '早餐' },
        { value: 'lunch', label: '午餐' },
        { value: 'dinner', label: '晚餐' }
      ]
    : [
        { value: 'Morning', label: '上午' },
        { value: 'Afternoon', label: '下午' },
        { value: 'Evening', label: '晚上' }
      ]

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={cn(
        "group border-slate-100 hover:border-slate-200 shadow-none transition-all bg-slate-50/50 relative overflow-hidden",
        isDragging && "opacity-50 ring-2 ring-blue-500 z-50 shadow-xl"
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div 
            {...attributes} 
            {...listeners}
            className="p-1 -ml-1 mt-1 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing transition-colors"
          >
            <GripVertical size={16} />
          </div>
          <div className={cn(
            "p-2 rounded-lg shrink-0",
            fav.type === 'spot' ? "bg-blue-100 text-blue-600" :
            fav.type === 'food' ? "bg-orange-100 text-orange-600" :
            "bg-indigo-100 text-indigo-600"
          )}>
            {fav.type === 'spot' ? <MapPin size={16} /> :
             fav.type === 'food' ? <Utensils size={16} /> :
             <Home size={16} />}
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-bold text-slate-900 truncate">{fav.name}</h4>
              
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7 rounded-full bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-slate-900"
                  >
                    <Plus size={14} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-3" align="end" side="top">
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                      <Plus size={12} /> 加入至行程
                    </h5>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] font-bold text-slate-400 w-10 shrink-0">天數</label>
                        <Select value={selectedDay.toString()} onValueChange={(v) => setSelectedDay(parseInt(v))}>
                          <SelectTrigger className="h-7 text-[11px] flex-grow">
                            <SelectValue placeholder="選擇天數" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: totalDays }).map((_, i) => (
                              <SelectItem key={i} value={i.toString()} className="text-[11px]">Day {i + 1}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {fav.type !== 'accommodation' && (
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-bold text-slate-400 w-10 shrink-0">時段</label>
                          <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                            <SelectTrigger className="h-7 text-[11px] flex-grow">
                              <SelectValue placeholder="選擇時段" />
                            </SelectTrigger>
                            <SelectContent>
                              {slotOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value} className="text-[11px]">{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    <Button size="sm" className="w-full h-7 text-[11px] bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAdd}>
                      確認加入
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            {fav.description && (
              <p className="text-xs text-slate-500 line-clamp-2 mt-1">{fav.description}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {fav.tags?.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-white text-[10px] h-5 px-1.5 text-slate-500 font-normal border-slate-100">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function RecommendationSheet({
  open,
  onOpenChange,
  onAdd,
  totalDays,
}: RecommendationSheetProps) {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'spot' | 'food' | 'accommodation'>('all')

  useEffect(() => {
    if (open) {
      loadFavorites()
    }
  }, [open])

  const loadFavorites = async () => {
    setIsLoading(true)
    const result = await getFavorites()
    if (result.success) {
      setFavorites(result.data || [])
    }
    setIsLoading(false)
  }

  const filtered = favorites.filter(f => filter === 'all' ? true : f.type === filter)

  return (
    <ShadcnSheet open={open} onOpenChange={onOpenChange}>
      <ShadcnSheetContent className="sm:max-w-md flex flex-col h-full pointer-events-auto">
        <ShadcnSheetHeader className="pb-4 border-b">
          <ShadcnSheetTitle className="flex items-center gap-2">
            <Sparkles className="text-amber-500" size={20} />
            私房推薦名單
          </ShadcnSheetTitle>
          <ShadcnSheetDescription>
            從您的口袋名單中選擇項目加入此行程。您也可以直接拖拉至行程中。
          </ShadcnSheetDescription>
        </ShadcnSheetHeader>

        <div className="flex gap-1 py-4 border-b overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: '全部' },
            { id: 'spot', label: '景點' },
            { id: 'food', label: '餐食' },
            { id: 'accommodation', label: '住宿' }
          ].map(t => (
            <Button
              key={t.id}
              variant={filter === t.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter(t.id as any)}
              className="rounded-full h-8 text-xs whitespace-nowrap"
            >
              {t.label}
            </Button>
          ))}
        </div>

        <ScrollArea className="flex-grow py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <Loader2 className="animate-spin" size={24} />
              <p className="text-sm">讀取名單中...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <p className="text-sm">尚無匹配的推薦名單</p>
            </div>
          ) : (
            <div className="space-y-4 pr-4">
              {filtered.map((fav) => (
                <FavoriteItemWithPicker key={fav.id} fav={fav} onAdd={onAdd} totalDays={totalDays} />
              ))}
            </div>
          )}
        </ScrollArea>
      </ShadcnSheetContent>
    </ShadcnSheet>
  )
}
