'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CalendarDays, ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CollapsibleSidebarProps {
  days: { day: number; date: string }[]
}

export function CollapsibleSidebar({ days }: CollapsibleSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const scrollToDay = (dayNumber: number) => {
    const element = document.getElementById(`day-card-${dayNumber}`)
    if (element) {
      const yOffset = -130 // Header (64px) + Toolbar (56px) + buffer (10px)
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <div 
      className={cn(
        "sticky top-[7.5rem] h-[calc(100vh-7.5rem)] flex flex-col border-r bg-background/50 backdrop-blur-sm transition-all duration-300 ease-in-out z-10",
        isExpanded ? "w-48" : "w-14"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className={cn(
        "flex items-center p-4 border-b h-14",
        isExpanded ? "justify-between" : "justify-center"
      )}>
        {isExpanded ? (
          <>
            <span className="text-sm font-bold truncate">行程索引</span>
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </>
        ) : (
          <CalendarDays className="h-5 w-5 text-primary" />
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col p-2 gap-1">
          {days.map((day) => (
            <Button
              key={day.day}
              variant="ghost"
              size="sm"
              className={cn(
                "justify-start transition-all",
                isExpanded ? "px-3" : "px-0 justify-center"
              )}
              onClick={() => scrollToDay(day.day)}
              title={isExpanded ? undefined : `Day ${day.day} - ${day.date}`}
            >
              <span className={cn(
                "font-medium",
                isExpanded ? "w-12 text-left" : "text-xs"
              )}>
                {isExpanded ? `Day ${day.day}` : `D${day.day}`}
              </span>
              
              {isExpanded && (
                <span className="text-[10px] text-muted-foreground truncate ml-2">
                  {day.date}
                </span>
              )}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
