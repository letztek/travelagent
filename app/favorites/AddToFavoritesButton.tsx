'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Heart, Loader2 } from 'lucide-react'
import { createFavorite, deleteFavorite, FavoriteType } from './actions'
import { createFavoriteWithGrounding } from './grounding-actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface AddToFavoritesButtonProps {
  name: string
  type: FavoriteType
  description?: string
  className?: string
  size?: 'sm' | 'default' | 'icon'
  isFavorite?: boolean
  favoriteId?: string
  onToggle?: () => void
}

export function AddToFavoritesButton({
  name,
  type,
  description,
  className,
  size = 'icon',
  isFavorite = false,
  favoriteId,
  onToggle
}: AddToFavoritesButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const cleanName = name?.trim()
    if (!cleanName || cleanName === '未指定' || cleanName === '待定') {
      toast.error('請先輸入有效的名稱')
      return
    }

    setIsSubmitting(true)
    try {
      if (isFavorite && favoriteId) {
        const result = await deleteFavorite(favoriteId)
        if (result.success) {
          toast.success(`已從口袋名單移除`)
          onToggle?.()
        } else {
          toast.error(result.error || '移除失敗')
        }
      } else {
        const result = await createFavoriteWithGrounding({
          name: cleanName,
          type,
          description: description || '',
        })

        if (result.success) {
          toast.success(`已將「${cleanName}」加入口袋名單`)
          onToggle?.()
        } else {
          toast.error(result.error || '加入失敗')
        }
      }
    } catch (error) {
      toast.error('發生錯誤')
    } finally {
      setIsSubmitting(false)
    }
  }

  const cleanName = name?.trim()
  if (!cleanName || cleanName === '未指定' || cleanName === '待定') return null

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleToggle}
      disabled={isSubmitting}
      className={cn(
        "transition-all duration-200 p-0 h-auto w-auto hover:bg-transparent",
        isFavorite 
          ? "text-pink-500 hover:text-pink-600" 
          : "text-slate-300 hover:text-pink-400",
        className
      )}
      title={isFavorite ? "從口袋名單移除" : "加入口袋名單"}
    >
      {isSubmitting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart 
          className={cn(
            "h-4 w-4 transition-colors", 
            isFavorite ? "fill-current" : "fill-none"
          )} 
        />
      )}
      {size !== 'icon' && <span className="ml-2 text-xs">{isFavorite ? '取消收藏' : '收藏'}</span>}
    </Button>
  )
}
