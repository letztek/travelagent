'use client'

import { useState, useEffect } from 'react'
import { RouteConcept, RouteNode } from '@/schemas/route'
import { Requirement } from '@/schemas/requirement'
import { ConfirmRouteButton } from './ConfirmRouteButton'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Lightbulb, Plus, Undo2, Redo2, Check, X } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useHistory } from '@/lib/hooks/use-history'
import { RouteAgentChat } from './RouteAgentChat'
import { AgentResponse } from '../../route-agent'

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
  // Initial items with IDs
  const initialItems: RouteNodeWithId[] = initialConcept.nodes.map(node => ({ ...node, id: generateId() }))
  
  // History management for items
  const { 
    state: items, 
    setState: setItems, 
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useHistory(initialItems)
  
  const [concept, setConcept] = useState<RouteConcept>(initialConcept)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newNodeData, setNewNodeData] = useState({ location: '', description: '', transport: '' })
  
  // AI Proposal State
  const [proposal, setProposal] = useState<{ items: RouteNodeWithId[], rationale: string } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Sync items (either current or proposed) to concept for display/submission
  useEffect(() => {
    const activeItems = proposal ? proposal.items : items
    const updatedNodes = activeItems.map((item, index) => ({
      day: index + 1,
      location: item.location,
      description: item.description,
      transport: item.transport,
    }))
    
    setConcept(prev => ({
      ...prev,
      nodes: updatedNodes,
      rationale: proposal ? proposal.rationale : prev.rationale,
      total_days: updatedNodes.length
    }))
  }, [items, proposal])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)
      setItems(arrayMove(items, oldIndex, newIndex))
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除此行程節點嗎？')) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  const handleAddNode = () => {
    if (!newNodeData.location) return

    const newNode: RouteNodeWithId = {
      id: generateId(),
      day: items.length + 1,
      location: newNodeData.location,
      description: newNodeData.description,
      transport: newNodeData.transport || undefined,
    }

    setItems([...items, newNode])
    setNewNodeData({ location: '', description: '', transport: '' })
    setIsAddDialogOpen(false)
  }

  const handleAIProposal = (response: AgentResponse) => {
    const proposedItems: RouteNodeWithId[] = response.proposed_route.nodes.map(node => ({
      ...node,
      id: generateId() // Assign new IDs for the proposal
    }))
    setProposal({
      items: proposedItems,
      rationale: response.proposed_route.rationale
    })
  }

  const acceptProposal = () => {
    if (proposal) {
      setItems(proposal.items)
      setProposal(null)
    }
  }

  const rejectProposal = () => {
    setProposal(null)
  }

  const displayItems = proposal ? proposal.items : items

  return (
    <div className="container mx-auto py-10 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/requirements">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">路線初步規劃預覽</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={undo} disabled={!canUndo || !!proposal}>
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={redo} disabled={!canRedo || !!proposal}>
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* Main Editor Area */}
        <div className="flex-1 space-y-10 min-w-0">
          <Card className={`transition-colors ${proposal ? 'border-primary border-2 bg-primary/5' : 'bg-primary/5 border-primary/20'}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                {proposal ? 'AI 建議規劃理由 (預覽中)' : 'AI 規劃理由'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground italic">
                {concept.rationale}
              </p>
            </CardContent>
          </Card>

          {proposal && (
            <div className="sticky top-4 z-20 bg-background/95 backdrop-blur border p-4 rounded-lg shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 font-semibold">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <span>AI 建議了一份新路線</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={rejectProposal} className="text-muted-foreground hover:text-destructive">
                  <X className="mr-2 h-4 w-4" /> 放棄
                </Button>
                <Button size="sm" onClick={acceptProposal} className="bg-green-600 hover:bg-green-700 text-white">
                  <Check className="mr-2 h-4 w-4" /> 套用變更
                </Button>
              </div>
            </div>
          )}

          <div className={`relative pl-4 transition-opacity ${proposal ? 'opacity-80 pointer-events-none' : ''}`}>
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-muted-foreground/20" />
            
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={displayItems}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4 relative">
                  {displayItems.map((item, index) => (
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

          <div className="flex justify-center">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full max-w-sm border-dashed" disabled={!!proposal}>
                  <Plus className="mr-2 h-4 w-4" /> 新增行程節點
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>新增行程節點</DialogTitle>
                  <DialogDescription>
                    請輸入新的地點資訊。日期將自動接續在最後一天。
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="location">地點名稱</Label>
                    <Input
                      id="location"
                      value={newNodeData.location}
                      onChange={(e) => setNewNodeData({ ...newNodeData, location: e.target.value })}
                      placeholder="例如：箱根溫泉"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="transport">交通方式 (選填)</Label>
                    <Input
                      id="transport"
                      value={newNodeData.transport}
                      onChange={(e) => setNewNodeData({ ...newNodeData, transport: e.target.value })}
                      placeholder="例如：浪漫特快"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">活動描述</Label>
                    <Textarea
                      id="description"
                      value={newNodeData.description}
                      onChange={(e) => setNewNodeData({ ...newNodeData, description: e.target.value })}
                      placeholder="簡述在此地的活動..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddNode} disabled={!newNodeData.location}>加入行程</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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

        {/* AI Chat Sidebar */}
        <RouteAgentChat currentRoute={concept} onProposal={handleAIProposal} />
      </div>
    </div>
  )
}

