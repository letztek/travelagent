'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Loader2, X, Plus } from 'lucide-react'
import { createFavorite, suggestTags, FavoriteType } from './actions'
import { createFavoriteWithGrounding } from './grounding-actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface AddFavoriteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AddFavoriteDialog({
  open,
  onOpenChange,
}: AddFavoriteDialogProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<FavoriteType>('spot')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSuggestTags = async () => {
    if (!name) {
      toast.error('請先輸入名稱')
      return
    }
    setIsSuggesting(true)
    const result = await suggestTags(name, description, type)
    setIsSuggesting(false)
    if (result.success && result.data) {
      // Filter out tags already selected
      const newSuggestions = result.data.filter((t: string) => !selectedTags.includes(t))
      setSuggestedTags(newSuggestions)
    } else {
      toast.error('AI 推薦失敗')
    }
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
      setSuggestedTags(suggestedTags.filter(t => t !== tag))
    }
  }

  const handleSubmit = async () => {
    if (!name) return
    setIsSubmitting(true)
    const result = await createFavoriteWithGrounding({
      name,
      description,
      type
    })
    setIsSubmitting(false)
    if (result.success) {
      toast.success('已加入口袋名單')
      onOpenChange(false)
      // Reset form
      setName('')
      setDescription('')
      setType('spot')
      setSelectedTags([])
      setSuggestedTags([])
      router.refresh()
    } else {
      toast.error(result.error || '新增失敗')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>新增口袋名單</DialogTitle>
          <DialogDescription>
            儲存您的私房景點、美食或住宿，讓 AI 在規劃行程時為您推薦。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">名稱</Label>
            <Input
              id="name"
              placeholder="例如：台北 101"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">類型</Label>
            <Select value={type} onValueChange={(v) => setType(v as FavoriteType)}>
              <SelectTrigger id="type">
                <SelectValue placeholder="選擇類型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spot">景點</SelectItem>
                <SelectItem value="food">餐食</SelectItem>
                <SelectItem value="accommodation">住宿</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">描述 (選填)</Label>
            <Textarea
              id="description"
              placeholder="簡單描述這個地方..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label>標籤</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs gap-1.5 border-slate-200"
                onClick={handleSuggestTags}
                disabled={isSuggesting || !name}
              >
                {isSuggesting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="text-amber-500" />}
                AI 推薦標籤
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 min-h-[32px] p-2 rounded-lg bg-slate-50 border border-slate-100">
              {selectedTags.length === 0 && suggestedTags.length === 0 && (
                <span className="text-xs text-slate-400 py-1">點擊 AI 推薦或手動新增標籤</span>
              )}
              {selectedTags.map(tag => (
                <Badge key={tag} className="bg-slate-900 text-white gap-1 pl-2 pr-1 h-7">
                  {tag}
                  <button onClick={() => toggleTag(tag)} className="hover:bg-slate-700 rounded-full p-0.5">
                    <X size={12} />
                  </button>
                </Badge>
              ))}
              {suggestedTags.map(tag => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-colors gap-1 h-7 border-slate-200 text-slate-500"
                  onClick={() => toggleTag(tag)}
                >
                  <Plus size={12} />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !name}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            確認新增
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
