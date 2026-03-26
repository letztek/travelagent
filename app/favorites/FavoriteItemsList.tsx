'use client'

import { useState, useEffect } from 'react'
import { Favorite, FavoriteType, updateFavorite, suggestTags } from './actions'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Utensils, Home, Tag, Pencil, X, Plus, Check, Loader2, Sparkles, Star, ExternalLink, Clock, Globe, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface FavoriteItemsListProps {
  initialFavorites: Favorite[]
}

const TYPE_LABELS: Record<FavoriteType, string> = {
  spot: '景點',
  food: '餐食',
  accommodation: '住宿',
}

const TYPE_ICONS: Record<FavoriteType, React.ReactNode> = {
  spot: <MapPin className="w-4 h-4" />,
  food: <Utensils className="w-4 h-4" />,
  accommodation: <Home className="w-4 h-4" />,
}

export default function FavoriteItemsList({ initialFavorites }: FavoriteItemsListProps) {
  const [favorites, setFavorites] = useState(initialFavorites)

  // Sync state when props change (e.g., after router.refresh())
  useEffect(() => {
    setFavorites(initialFavorites)
  }, [initialFavorites])

  const [filter, setFilter] = useState<FavoriteType | 'all'>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editTags, setEditTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isSuggesting, setIsSuggesting] = useState(false)

  const filteredFavorites = favorites.filter(fav => 
    filter === 'all' ? true : fav.type === filter
  )

  const startEditing = (fav: Favorite) => {
    setEditingId(fav.id)
    setEditName(fav.name)
    setEditDescription(fav.description || '')
    setEditTags([...(fav.tags || [])])
    setNewTag('')
  }

  const addTag = () => {
    if (newTag && !editTags.includes(newTag)) {
      setEditTags([...editTags, newTag])
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setEditTags(editTags.filter(t => t !== tag))
  }

  const handleSuggestTags = async (fav: Favorite) => {
    setIsSuggesting(true)
    const result = await suggestTags(editName, editDescription, fav.type)
    setIsSuggesting(false)
    if (result.success && result.data) {
      setEditTags(result.data)
      toast.success('已更新推薦標籤')
    } else {
      toast.error(result.error || '推薦失敗')
    }
  }

  const handleSave = async (id: string) => {
    if (!editName.trim()) {
      toast.error('名稱不能為空')
      return
    }
    setIsSaving(true)
    const result = await updateFavorite(id, { 
      name: editName,
      description: editDescription,
      tags: editTags 
    })
    setIsSaving(false)
    if (result.success) {
      setFavorites(favorites.map(f => f.id === id ? { ...f, name: editName, description: editDescription, tags: editTags } : f))
      setEditingId(null)
      toast.success('儲存成功')
    } else {
      toast.error(result.error || '更新失敗')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit" role="tablist">
        {(['all', 'spot', 'food', 'accommodation'] as const).map((type) => (
          <button
            key={type}
            role="tab"
            aria-selected={filter === type}
            onClick={() => setFilter(type)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all",
              filter === type 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {type === 'all' ? '全部' : TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredFavorites.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-slate-500">尚無任何收藏項目</p>
          </div>
        ) : (
          filteredFavorites.map((fav) => (
            <Card key={fav.id} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden">
              <CardContent className="p-4 flex items-start gap-4">
                <div className={cn(
                  "p-3 rounded-xl shrink-0",
                  fav.type === 'spot' ? "bg-blue-50 text-blue-600" :
                  fav.type === 'food' ? "bg-orange-50 text-orange-600" :
                  "bg-indigo-50 text-indigo-600"
                )}>
                  {TYPE_ICONS[fav.type]}
                </div>
                <div className="flex-grow space-y-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 truncate">{fav.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-300">
                        {TYPE_LABELS[fav.type]}
                      </span>
                      {editingId !== fav.id && (
                        <button 
                          onClick={() => startEditing(fav)}
                          aria-label="編輯"
                          className="p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  {editingId !== fav.id && fav.description && (
                    <p className="text-sm text-slate-500 line-clamp-2">{fav.description}</p>
                  )}

                  {/* Google Places Info */}
                  {editingId !== fav.id && fav.metadata && (
                    <div className="pt-2 space-y-2">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                        {fav.metadata.rating && (
                          <div className="flex items-center gap-1 text-amber-500 font-medium">
                            <Star size={12} className="fill-current" />
                            <span>{fav.metadata.rating}</span>
                            {fav.metadata.userRatingCount && (
                              <span className="text-slate-300 font-normal">({fav.metadata.userRatingCount.toLocaleString()})</span>
                            )}
                          </div>
                        )}
                        {fav.metadata.formattedAddress && (
                          <div className="flex items-center gap-1 min-w-0">
                            <MapPin size={12} className="shrink-0 text-slate-300" />
                            <span className="truncate">{fav.metadata.formattedAddress}</span>
                          </div>
                        )}
                      </div>

                      {/* Opening Hours Display */}
                      {fav.metadata.regularOpeningHours?.weekdayDescriptions && (
                        <div className="bg-slate-50/50 rounded-lg p-2 space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mb-1">
                            <Clock size={12} className="text-slate-300" />
                            營業時間參考
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5">
                            {fav.metadata.regularOpeningHours.weekdayDescriptions.map((desc: string, i: number) => (
                              <div key={i} className="text-[10px] text-slate-500 leading-relaxed">
                                {desc}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3">
                        {fav.metadata.websiteUri && (
                          <a 
                            href={fav.metadata.websiteUri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] flex items-center gap-1 text-blue-500 hover:text-blue-600 transition-colors"
                          >
                            <Globe size={10} /> 官方網站
                          </a>
                        )}
                        {fav.metadata.nationalPhoneNumber && (
                          <div className="text-[10px] flex items-center gap-1 text-slate-400">
                            <Phone size={10} /> {fav.metadata.nationalPhoneNumber}
                          </div>
                        )}
                        {fav.google_place_id && (
                          <a 
                            href={
                              fav.metadata?.location 
                                ? `https://www.google.com/maps/search/?api=1&query=${fav.metadata.location.latitude},${fav.metadata.location.longitude}&query_place_id=${fav.google_place_id}`
                                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fav.name)}&query_place_id=${fav.google_place_id}`
                            }
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors ml-auto"
                          >
                            Google 地圖 <ExternalLink size={10} />
                          </a>
                        )}                      </div>
                    </div>
                  )}
                  
                  {editingId === fav.id ? (
                    <div className="pt-3 space-y-3 animate-in fade-in slide-in-from-top-1">
                      <div className="space-y-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="項目名稱"
                          className="h-8 text-sm font-bold"
                        />
                        <Textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="項目描述"
                          className="text-xs min-h-[60px]"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {editTags.map(tag => (
                          <Badge key={tag} className="bg-slate-900 text-white gap-1 pl-2 pr-1 h-6">
                            {tag}
                            <button onClick={() => removeTag(tag)} className="hover:bg-slate-700 rounded-full">
                              <X size={12} />
                            </button>
                          </Badge>
                        ))}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSuggestTags(fav)}
                          disabled={isSuggesting}
                          className="h-6 text-[10px] px-2 border-dashed border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          {isSuggesting ? <Loader2 size={10} className="animate-spin mr-1" /> : <Sparkles size={10} className="mr-1" />}
                          重新推薦
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <div className="relative flex-grow">
                          <Input 
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                            placeholder="新增標籤..."
                            className="h-8 text-xs pr-8"
                          />
                          <button 
                            onClick={addTag}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => setEditingId(null)}
                          className="h-8 px-2 text-slate-500"
                        >
                          取消
                        </Button>
                        <Button 
                          size="sm" 
                          disabled={isSaving}
                          onClick={() => handleSave(fav.id)}
                          className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} className="mr-1" />}
                          儲存
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {fav.tags && fav.tags.length > 0 ? (
                        fav.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="bg-slate-50 text-slate-600 border-none flex items-center gap-1 text-[10px] px-2 py-0.5">
                            <Tag size={10} />
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-300 italic">尚無標籤</span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
