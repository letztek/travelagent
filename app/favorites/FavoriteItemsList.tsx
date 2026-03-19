'use client'

import { useState } from 'react'
import { Favorite, FavoriteType } from './actions'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Utensils, Home, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const [filter, setFilter] = useState<FavoriteType | 'all'>('all')

  const filteredFavorites = initialFavorites.filter(fav => 
    filter === 'all' ? true : fav.type === filter
  )

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
            <Card key={fav.id} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardContent className="p-4 flex items-start gap-4">
                <div className={cn(
                  "p-3 rounded-xl",
                  fav.type === 'spot' ? "bg-blue-50 text-blue-600" :
                  fav.type === 'food' ? "bg-orange-50 text-orange-600" :
                  "bg-indigo-50 text-indigo-600"
                )}>
                  {TYPE_ICONS[fav.type]}
                </div>
                <div className="flex-grow space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">{fav.name}</h3>
                    <span className="text-xs text-slate-400">
                      {TYPE_LABELS[fav.type]}
                    </span>
                  </div>
                  {fav.description && (
                    <p className="text-sm text-slate-500 line-clamp-2">{fav.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {fav.tags?.map(tag => (
                      <Badge key={tag} variant="secondary" className="bg-slate-50 text-slate-600 border-none flex items-center gap-1 text-[10px] px-2">
                        <Tag size={10} />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
