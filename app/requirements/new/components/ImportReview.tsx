import { useState } from 'react'
import { ImportParserResult } from '@/lib/skills/import-parser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { budgetOptions } from '../page'
interface ImportReviewProps {
  data: ImportParserResult
  onConfirm: (formData: any) => void
  onCancel: () => void
}

interface ImportFormData {
  origin: string;
  destinations: string;
  budget: string;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  run_gap_analysis: boolean;
  auto_add_to_favorites: boolean;
  direct_generate: boolean;
}

export function ImportReview({ data, onConfirm, onCancel }: ImportReviewProps) {
  const [formData, setFormData] = useState<ImportFormData>({
    origin: data.extracted_metadata.origin || '',
    destinations: data.extracted_metadata.destinations?.join(', ') || '',
    budget: data.extracted_metadata.budget_range || '',
    startDate: data.extracted_metadata.travel_dates?.start || '',
    endDate: data.extracted_metadata.travel_dates?.end || '',
    adults: data.extracted_metadata.travelers?.adult || 2,
    children: data.extracted_metadata.travelers?.child || 0,
    run_gap_analysis: true,
    auto_add_to_favorites: false,
    direct_generate: false,
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
          <div className="h-full pr-4 overflow-y-auto">
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
          </div>
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
                  <Label htmlFor="budget">{Number(formData.adults) + Number(formData.children) >= 2 ? '每人預算' : '總預算範圍'}</Label>
                  <Select value={formData.budget} onValueChange={(val) => setFormData({ ...formData, budget: val })}>
                    <SelectTrigger id="budget">
                      <SelectValue placeholder="選擇預計預算" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">
                    跳過路線規劃，直接生成詳細行程
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    若檔案中已包含完整的行程順序與時間，可開啟此選項直接產生最終結果
                  </p>
                </div>
                <Switch
                  checked={formData.direct_generate}
                  onCheckedChange={(val) => setFormData({ ...formData, direct_generate: val, run_gap_analysis: val ? false : formData.run_gap_analysis })}
                />
              </div>

              {!formData.direct_generate && (
                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold">
                      執行 AI 需求診斷 (Gap Analysis)
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      由 AI 幫您找出行程需求中的不合理處與潛在問題
                    </p>
                  </div>
                  <Switch
                    checked={formData.run_gap_analysis}
                    onCheckedChange={(val) => setFormData({ ...formData, run_gap_analysis: val })}
                  />
                </div>
              )}

              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">
                    將結果自動加入我的最愛
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    行程產出後，地點與餐廳會一併收錄至您的最愛清單
                  </p>
                </div>
                <Switch
                  checked={formData.auto_add_to_favorites}
                  onCheckedChange={(val) => setFormData({ ...formData, auto_add_to_favorites: val })}
                />
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
