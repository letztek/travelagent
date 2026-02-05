'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Copy, Check, Loader2 } from 'lucide-react'

interface PresentationPromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prompt: string | null
  isLoading: boolean
}

export function PresentationPromptDialog({ 
  open, 
  onOpenChange, 
  prompt, 
  isLoading 
}: PresentationPromptDialogProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!prompt) return
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy!', err)
      alert('複製失敗，請手動選取複製')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>簡報 Prompt 已生成</DialogTitle>
          <DialogDescription>
            請複製下方 Markdown 內容，貼入 Gamma 或其他簡報工具中。
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 relative bg-muted/50 rounded-md border">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/50 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">正在撰寫提案故事...</p>
            </div>
          ) : (
            <ScrollArea className="h-full w-full p-4">
              <pre className="text-xs font-mono whitespace-pre-wrap break-words leading-relaxed">
                {prompt || '無內容'}
              </pre>
            </ScrollArea>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleCopy} disabled={isLoading || !prompt} className="w-32">
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" /> 已複製
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" /> 複製內容
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
