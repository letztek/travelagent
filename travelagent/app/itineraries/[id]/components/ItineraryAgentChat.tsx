'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { refineItineraryWithAI, ItineraryAgentResponse, AgentContext } from '../../itinerary-agent'
import { Itinerary } from '@/schemas/itinerary'
import { Bot, Loader2, Sparkles, X, Check, Target } from 'lucide-react'
import { TrafficLightStatus } from './TrafficLightStatus'
import { Badge } from '@/components/ui/badge'

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || isProposalMode) return

    const userMsg: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

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
    <Card className="h-[calc(100vh-12rem)] flex flex-col w-80 sticky top-24 shrink-0">
      <CardHeader className="py-3 border-b">
        <CardTitle className="text-sm font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            Itinerary Planner
          </div>
          <Badge variant="outline" className="text-[10px] font-normal flex items-center gap-1">
            <Target className="h-2 w-2" />
            {getContextLabel(focusedContext)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col min-h-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <p className="text-xs text-muted-foreground text-center my-4">
                我是您的行程規劃師。您可以點擊任何活動卡片來建立上下文，然後問我：「推薦這附近的午餐」或「幫我調整這段時間」。
              </p>
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
              <Button variant="outline" className="flex-1 h-8 text-xs" onClick={onRejectProposal}>
                <X className="mr-1 h-3 w-3" /> 捨棄
              </Button>
              <Button className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700" onClick={onAcceptProposal}>
                <Check className="mr-1 h-3 w-3" /> 套用
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2">
            <Input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder={focusedContext ? `針對 ${getContextLabel(focusedContext)} 提問...` : "輸入調整指令..."}
              className="text-xs"
              disabled={isLoading}
            />
            <Button size="icon" type="submit" disabled={isLoading || !input.trim()}>
              <Sparkles className="h-4 w-4" />
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
