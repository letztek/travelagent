'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface MoveDayDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentDay: number
  totalDays: number
  onMove: (targetIndex: number) => void
}

export function MoveDayDialog({
  open,
  onOpenChange,
  currentDay,
  totalDays,
  onMove,
}: MoveDayDialogProps) {
  const [targetDay, setTargetDay] = useState<string>(
    currentDay.toString()
  )

  const handleConfirm = () => {
    const targetIndex = parseInt(targetDay) - 1
    onMove(targetIndex)
    onOpenChange(false)
  }

  // Generate options like "Day 1", "Day 2", etc.
  const options = Array.from({ length: totalDays }, (_, i) => ({
    value: (i + 1).toString(),
    label: `第 ${i + 1} 天`,
  }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>重排行程天數</DialogTitle>
          <DialogDescription>
            您可以將「第 {currentDay} 天」移動到行程中的其他位置。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="target-day" className="text-right">
              移動至
            </Label>
            <div className="col-span-3">
              <Select
                value={targetDay}
                onValueChange={setTargetDay}
              >
                <SelectTrigger id="target-day">
                  <SelectValue placeholder="選擇目標天數" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm}>確認移動</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
