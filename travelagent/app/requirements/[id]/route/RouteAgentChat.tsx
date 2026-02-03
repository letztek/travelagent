'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { refineRouteWithAI, AgentResponse } from '../../route-agent'
import { RouteConcept } from '@/schemas/route'
import { Bot, User, Loader2, Sparkles } from 'lucide-react'
import { TrafficLightStatus } from './TrafficLightStatus'

interface RouteAgentChatProps {
  currentRoute: RouteConcept
  onProposal: (response: AgentResponse) => void
}

type Message = {
  role: 'user' | 'assistant'
  content: string
  thought?: string
  status?: { type: 'green' | 'red'; message: string }
}

export function RouteAgentChat({ currentRoute, onProposal }: RouteAgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMsg: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const result = await refineRouteWithAI(currentRoute, userMsg.content)
      
      if (result.success && result.data) {
        const aiResponse = result.data
        const aiMsg: Message = {
          role: 'assistant',
          content: '我已根據您的需求重新規劃了路線，請確認右側的變更建議。',
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

  return (
    <Card className="h-[600px] flex flex-col w-80 shrink-0">
      <CardHeader className="py-3 border-b">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          Route Architect
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col min-h-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <p className="text-xs text-muted-foreground text-center my-4">
                我是您的路線架構師。您可以告訴我：「把 Day 3 改去京都」或「行程太趕了，幫我多加一天」。
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
                思考路線邏輯中...
              </div>
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2">
          <Input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="輸入調整指令..."
            className="text-xs"
            disabled={isLoading}
          />
          <Button size="icon" type="submit" disabled={isLoading}>
            <Sparkles className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
