'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { refineItineraryWithAI, ItineraryAgentResponse, AgentContext } from '../../itinerary-agent'
import { Itinerary } from '@/schemas/itinerary'
import { Bot, Loader2, Sparkles, X, Check, Target, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { TrafficLightStatus } from './TrafficLightStatus'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ItineraryAgentChatProps {
  currentItinerary: Itinerary
  focusedContext: AgentContext | null
  onProposal: (response: ItineraryAgentResponse) => void
  onAcceptProposal: () => void
  onRejectProposal: () => void
  isProposalMode: boolean
}

type Message = {
  role: 'user' | 'assistant'
  content: string
  thought?: string
  status?: { type: 'green' | 'red'; message: string }
}

export function ItineraryAgentChat({ 
  currentItinerary, 
  focusedContext, 
  onProposal,
  onAcceptProposal,
  onRejectProposal,
  isProposalMode
}: ItineraryAgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [lastRequest, setLastRequest] = useState<{ itinerary: Itinerary, context: AgentContext | null, instruction: string } | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || isProposalMode) return

    const userMsg: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)
    setLastRequest({ itinerary: currentItinerary, context: focusedContext, instruction: input })

    try {
      const result = await refineItineraryWithAI(currentItinerary, focusedContext, userMsg.content)
      
      if (result.success && result.data) {
        const aiResponse = result.data
        const aiMsg: Message = {
          role: 'assistant',
          content: '我已根據您的需求提供了調整建議，請查看主畫面中的預覽。',
          thought: aiResponse.thought,
          status: { type: aiResponse.analysis.status, message: aiResponse.analysis.message }
        }
        setMessages(prev => [...prev, aiMsg])
        onProposal(aiResponse)
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，處理您的請求時發生錯誤。' }])
      }
    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，發生未知錯誤。' }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerate = async () => {
    if (!lastRequest || isLoading) return
    
    setIsLoading(true)
    // Remove last assistant message to replace it
    setMessages(prev => prev.slice(0, -1))

    try {
      const result = await refineItineraryWithAI(lastRequest.itinerary, lastRequest.context, lastRequest.instruction)
      
      if (result.success && result.data) {
        const aiResponse = result.data
        const aiMsg: Message = {
          role: 'assistant',
          content: '我已重新生成了調整建議，請查看主畫面中的預覽。',
          thought: aiResponse.thought,
          status: { type: aiResponse.analysis.status, message: aiResponse.analysis.message }
        }
        setMessages(prev => [...prev, aiMsg])
        onProposal(aiResponse)
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，重新生成時發生錯誤。' }])
      }
    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，發生未知錯誤。' }])
    } finally {
      setIsLoading(false)
    }
  }

  const getContextLabel = (ctx: AgentContext | null) => {
    if (!ctx) return '全域規劃'
    const dayLabel = `Day ${ctx.dayIndex + 1}`
    const typeLabel = {
      activity: '活動',
      meal: '餐食',
      accommodation: '住宿',
      day: '全天'
    }[ctx.type]
    return `${dayLabel} ${typeLabel}`
  }

  return (
    <div 
      className={cn(
        "h-[calc(100vh-3.5rem)] sticky top-14 flex flex-col border-l bg-background/50 backdrop-blur-sm transition-all duration-300 ease-in-out shrink-0",
        isCollapsed ? "w-12" : "w-80"
      )}
    >
      <div className={cn(
        "flex items-center border-b h-14",
        isCollapsed ? "justify-center" : "justify-between px-4"
      )}>
        {!isCollapsed && (
          <div className="flex items-center gap-2 font-bold text-sm">
            <Bot className="h-4 w-4 text-primary" />
            <span>AI Planner</span>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      {!isCollapsed && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-4 py-2 border-b bg-muted/20">
            <Badge variant="outline" className="w-full justify-center text-[10px] font-normal flex items-center gap-1">
              <Target className="h-3 w-3" />
              {getContextLabel(focusedContext)}
            </Badge>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center my-8 text-muted-foreground">
                  <div className="p-3 bg-primary/10 rounded-full mb-3">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-xs">
                    我是您的行程規劃師。您可以點擊任何活動卡片來建立上下文，然後問我：「推薦這附近的午餐」或「幫我調整這段時間」。
                  </p>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`rounded-lg p-3 text-sm max-w-[90%] ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    {msg.content}
                  </div>
                  {msg.thought && (
                    <div className="text-xs text-muted-foreground italic ml-1">
                      Thinking: {msg.thought}
                    </div>
                  )}
                  {msg.status && (
                    <div className="w-full mt-1">
                      <TrafficLightStatus status={msg.status.type} message={msg.status.message} />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  正在為您優化行程...
                </div>
              )}
            </div>
          </ScrollArea>

          {isProposalMode ? (
            <div className="p-3 border-t bg-primary/5 space-y-2">
              <p className="text-[10px] font-bold text-center uppercase tracking-wider text-primary">檢視提案中</p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 h-8 text-[10px] px-1 border-amber-200 text-amber-600 hover:bg-amber-50" 
                  onClick={handleRegenerate}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="mr-1 h-3 w-3" />}
                  重產
                </Button>
                <Button variant="outline" className="flex-1 h-8 text-[10px] px-1" onClick={onRejectProposal} disabled={isLoading}>
                  <X className="mr-1 h-3 w-3" /> 捨棄
                </Button>
                <Button className="flex-1 h-8 text-[10px] px-1 bg-green-600 hover:bg-green-700 text-white border-0" onClick={onAcceptProposal} disabled={isLoading}>
                  <Check className="mr-1 h-3 w-3" /> 套用
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2 bg-background">
              <Input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder="輸入指令..."
                className="text-xs h-9"
                disabled={isLoading}
              />
              <Button size="icon" type="submit" disabled={isLoading || !input.trim()} className="h-9 w-9">
                <Sparkles className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
