'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { BookHeart, Loader2 } from 'lucide-react'
import { createFavorite, FavoriteType } from './actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface AddToFavoritesButtonProps {
  name: string
  type: FavoriteType
  description?: string
  className?: string
  size?: 'sm' | 'default' | 'icon'
}

export function AddToFavoritesButton({
  name,
  type,
  description,
  className,
  size = 'icon'
}: AddToFavoritesButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!name || name === '未指定' || name === '待定') {
      toast.error('請先輸入有效的名稱')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createFavorite({
        name,
        type,
        description: description || '',
        tags: [],
        location_data: {}
      })

      if (result.success) {
        toast.success(`已將「${name}」加入口袋名單`)
      } else {
        toast.error(result.error || '加入失敗')
      }
    } catch (error) {
      toast.error('發生錯誤')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleAdd}
      disabled={isSubmitting}
      className={cn(
        "text-slate-400 hover:text-pink-500 hover:bg-pink-50 transition-colors",
        className
      )}
      title="加入口袋名單"
    >
      {isSubmitting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <BookHeart className="h-4 w-4" />
      )}
      {size !== 'icon' && <span className="ml-2">收藏</span>}
    </Button>
  )
}
