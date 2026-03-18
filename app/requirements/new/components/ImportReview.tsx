import { useState } from 'react'
import { ImportParserResult } from '@/lib/skills/import-parser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ImportReviewProps {
  data: ImportParserResult
  onConfirm: (formData: any) => void
  onCancel: () => void
}

export function ImportReview({ data, onConfirm, onCancel }: ImportReviewProps) {
  const [formData, setFormData] = useState({
    origin: data.extracted_metadata.origin || '',
    destinations: data.extracted_metadata.destinations?.join(', ') || '',
    budget: data.extracted_metadata.budget_range || '',
    startDate: data.extracted_metadata.travel_dates?.start || '',
    endDate: data.extracted_metadata.travel_dates?.end || '',
    adults: data.extracted_metadata.travelers?.adult || 2,
    children: data.extracted_metadata.travelers?.child || 0,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm({
      ...formData,
      destinations: formData.destinations.split(',').map(d => d.trim()).filter(Boolean)
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
      {/* Left: Itinerary Preview */}
      <Card className="h-[800px] flex flex-col">
        <CardHeader>
          <CardTitle>行程預覽</CardTitle>
          <CardDescription>AI 從檔案中萃取出的行程草稿</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold">{data.itinerary.title}</h3>
              </div>
              {data.itinerary.days.map((day) => (
                <div key={day.day} className="border-l-2 border-primary/30 pl-4 pb-6 space-y-4">
                  <div className="font-semibold text-lg">
                    Day {day.day} <span className="text-muted-foreground text-sm font-normal ml-2">{day.date}</span>
                  </div>
                  
                  <div className="space-y-3">
                    {day.activities.map((activity, idx) => (
                      <div key={idx} className="bg-muted/30 p-3 rounded-md">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded">
                            {activity.time_slot}
                          </span>
                          <span className="font-medium">{activity.activity}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      </div>
                    ))}
                  </div>

                  <div className="text-sm grid grid-cols-1 gap-1 text-muted-foreground bg-muted/10 p-3 rounded-md border border-border/50">
                    <div><span className="font-medium text-foreground">早餐：</span>{day.meals.breakfast}</div>
                    <div><span className="font-medium text-foreground">午餐：</span>{day.meals.lunch}</div>
                    <div><span className="font-medium text-foreground">晚餐：</span>{day.meals.dinner}</div>
                    <div><span className="font-medium text-foreground">住宿：</span>{day.accommodation}</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Right: Requirement Form */}
      <Card>
        <CardHeader>
          <CardTitle>專案必填資訊</CardTitle>
          <CardDescription>請核對並補齊建立專案所需的必填資訊</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origin">出發地</Label>
                  <Input id="origin" name="origin" value={formData.origin} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destinations">目的地</Label>
                  <Input id="destinations" name="destinations" value={formData.destinations} onChange={handleChange} placeholder="用逗號分隔" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">出發日期</Label>
                  <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">回程日期</Label>
                  <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adults">成行人數 (大人)</Label>
                  <Input id="adults" name="adults" type="number" min="1" value={formData.adults} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">總預算</Label>
                  <Input id="budget" name="budget" value={formData.budget} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-3 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>取消並重新上傳</Button>
              <Button type="submit">確認匯入並建檔</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
