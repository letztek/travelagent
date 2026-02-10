'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { RouteNode } from '@/schemas/route'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plane, Train, Car, GripVertical, Trash2 } from 'lucide-react'

interface SortableRouteNodeProps {
  id: string
  node: RouteNode
  onDelete: () => void
}

export function SortableRouteNode({ id, node, onDelete }: SortableRouteNodeProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
    position: 'relative' as const,
  }

  const getTransportIcon = (transport?: string) => {
    if (!transport) return null
    if (transport.toLowerCase().includes('flight') || transport.includes('飛機')) return <Plane className="h-4 w-4" />
    if (transport.toLowerCase().includes('shinkansen') || transport.includes('火車') || transport.includes('高鐵')) return <Train className="h-4 w-4" />
    if (transport.toLowerCase().includes('car') || transport.includes('車')) return <Car className="h-4 w-4" />
    return null
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="flex gap-4 group bg-card p-3 rounded-lg border border-transparent hover:border-border transition-all items-start"
    >
      {/* Drag Handle & Day Indicator */}
      <div 
        className="flex flex-col items-center gap-2 cursor-grab active:cursor-grabbing pt-1"
        {...attributes} 
        {...listeners}
      >
        <div className="relative z-10 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shadow-md shrink-0">
          {node.day}
        </div>
        <GripVertical className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      
      {/* Content */}
      <div className="flex-1 pt-1 min-w-0">
        <div className="flex items-center justify-between mb-1 gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-lg">{node.location}</h3>
            {node.transport && (
              <Badge variant="secondary" className="flex items-center gap-1 text-[10px] h-5 shrink-0">
                {getTransportIcon(node.transport)}
                {node.transport}
              </Badge>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{node.description}</p>
      </div>
    </div>
  )
}
