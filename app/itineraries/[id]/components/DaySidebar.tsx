'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CalendarDays } from 'lucide-react'

interface DaySidebarProps {
  days: { day: number; date: string }[]
}

export function DaySidebar({ days }: DaySidebarProps) {
  const scrollToDay = (dayNumber: number) => {
    const element = document.getElementById(`day-card-${dayNumber}`)
    if (element) {
      const yOffset = -100 // Leave some space for the header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <div className="w-48 sticky top-24 shrink-0 hidden lg:block">
      <div className="flex items-center gap-2 mb-4 px-2">
        <CalendarDays className="h-4 w-4 text-primary" />
        <span className="text-sm font-bold">行程索引</span>
      </div>
      <ScrollArea className="h-[calc(100vh-12rem)] px-2">
        <div className="flex flex-col gap-1">
          {days.map((day) => (
            <Button
              key={day.day}
              variant="ghost"
              size="sm"
              className="justify-start text-xs font-normal hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => scrollToDay(day.day)}
            >
              <span className="w-12 shrink-0">Day {day.day}</span>
              <span className="text-[10px] text-muted-foreground truncate">{day.date}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
