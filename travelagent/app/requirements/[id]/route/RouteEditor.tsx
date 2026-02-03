'use client'

import { useState, useEffect } from 'react'
import { RouteConcept, RouteNode } from '@/schemas/route'
import { Requirement } from '@/schemas/requirement'
import { ConfirmRouteButton } from './ConfirmRouteButton'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Lightbulb } from 'lucide-react'
import Link from 'next/link'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { SortableRouteNode } from './SortableRouteNode'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface RouteEditorProps {
  initialConcept: RouteConcept
  requirement: Requirement
  requirementId: string
}

type RouteNodeWithId = RouteNode & { id: string }

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function RouteEditor({ initialConcept, requirement, requirementId }: RouteEditorProps) {
  const [items, setItems] = useState<RouteNodeWithId[]>(() => 
    initialConcept.nodes.map(node => ({ ...node, id: generateId() }))
  )
  
  const [concept, setConcept] = useState<RouteConcept>(initialConcept)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    const updatedNodes = items.map((item, index) => ({
      day: index + 1,
      location: item.location,
      description: item.description,
      transport: item.transport,
    }))
    
    setConcept(prev => ({
      ...prev,
      nodes: updatedNodes,
      total_days: updatedNodes.length
    }))
  }, [items])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除此行程節點嗎？')) {
      setItems(items => items.filter(item => item.id !== id))
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="ghost" size="icon">
          <Link href="/requirements">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">路線初步規劃預覽</h1>
      </div>

      <div className="space-y-10">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              AI 規劃理由
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground italic">
              {concept.rationale}
            </p>
          </CardContent>
        </Card>

        <div className="relative pl-4">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-muted-foreground/20" />
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4 relative">
                {items.map((item, index) => (
                  <SortableRouteNode 
                    key={item.id} 
                    id={item.id} 
                    node={{ ...item, day: index + 1 }} 
                    onDelete={() => handleDelete(item.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <div className="flex flex-col gap-4 border-t pt-8">
          <p className="text-sm text-muted-foreground text-center">
            如果您對此路線大方向滿意，請點擊下方按鈕生成詳細行程（包含每日活動、餐廳與住宿）。
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild variant="outline">
              <Link href={`/requirements/new`}>重新調整需求</Link>
            </Button>
            <ConfirmRouteButton 
              requirement={requirement} 
              requirementId={requirementId} 
              routeConcept={concept} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}