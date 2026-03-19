'use client'

import { useState } from 'react'
import FavoriteItemsList from './FavoriteItemsList'
import AddFavoriteDialog from './AddFavoriteDialog'
import { Button } from '@/components/ui/button'
import { Plus, BookHeart } from 'lucide-react'
import { Favorite } from './actions'

interface FavoritesPageClientProps {
  initialFavorites: Favorite[]
}

export default function FavoritesPageClient({ initialFavorites }: FavoritesPageClientProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <BookHeart className="text-pink-500" size={36} />
            私房最愛名單
          </h1>
          <p className="text-slate-500 mt-2">管理您的個人口袋名單，AI 將在規劃行程時主動參考</p>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 rounded-full px-6 h-12 shadow-lg shadow-slate-200"
        >
          <Plus className="mr-2 h-5 w-5" />
          新增名單
        </Button>
      </div>

      <FavoriteItemsList initialFavorites={initialFavorites} />
      
      <AddFavoriteDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </>
  )
}
