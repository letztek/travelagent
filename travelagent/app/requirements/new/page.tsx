'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { requirementSchema, type Requirement } from '@/schemas/requirement'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useRouter } from 'next/navigation'
import { createRequirement } from '../actions'
import { analyzeGaps } from '../gap-actions'
import { GapAnalysis } from '@/schemas/gap-analysis'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { GapWizard } from './components/GapWizard'
import { Loader2, Sparkles, PlaneTakeoff, MapPin, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const dietaryOptions = [
  { id: 'vegetarian', label: '素食' },
  { id: 'no_beef', label: '不吃牛' },
  { id: 'no_pork', label: '不吃豬' },
  { id: 'seafood_allergy', label: '海鮮過敏' },
]

const accommodationOptions = [
  { id: 'hotel', label: '飯店' },
  { id: 'homestay', label: '民宿' },
  { id: 'resort', label: '渡假村' },
]

const budgetOptions = [
  { value: '30000_below', label: '30,000 以下' },
  { value: '30000_50000', label: '30,000 - 50,000' },
  { value: '50000_100000', label: '50,000 - 100,000' },
  { value: '100000_above', label: '100,000 以上' },
]

export default function RequirementFormPage() {
  const router = useRouter()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [analysis, setAnalysis] = useState<GapAnalysis | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [pendingValues, setPendingValues] = useState<Requirement | null>(null)
  
  // Local state for destinations input
  const [destInput, setDestInput] = useState('')

  const form = useForm<Requirement>({
    resolver: zodResolver(requirementSchema),
    defaultValues: {
      origin: '',
      destinations: [],
      travel_dates: {
        start: '',
        end: '',
      },
      travelers: {
        adult: 1,
        senior: 0,
        child: 0,
        infant: 0,
      },
      budget_range: '',
      preferences: {
        dietary: [],
        accommodation: [],
      },
      notes: '',
    },
  })

  async function handleFinalSubmit(values: Requirement) {
    setIsSaving(true)
    const result = await createRequirement(values)
    setIsSaving(false)
    if (result.success) {
      alert('需求已成功儲存！')
      router.push('/requirements')
    } else {
      alert('儲存失敗：' + (typeof result.error === 'string' ? result.error : '格式錯誤'))
    }
  }

  async function onSubmit(values: Requirement) {
    setIsAnalyzing(true)
    const result = await analyzeGaps(values)
    setIsAnalyzing(false)

    if (result.success && result.data) {
      if (result.data.overall_status === 'ready' && result.data.missing_info.length === 0 && result.data.logic_issues.length === 0) {
        handleFinalSubmit(values)
      } else {
        setAnalysis(result.data)
        setPendingValues(values)
        setShowAnalysis(true)
      }
    } else {
      handleFinalSubmit(values)
    }
  }

  const handleWizardComplete = (answers: Record<string, string>) => {
    if (!pendingValues) return

    const newValues = { ...pendingValues }
    
    // Auto-fill logic: Append to notes
    const entries = Object.entries(answers)
    if (entries.length > 0) {
      const additionalNotes = entries.map(([field, answer]) => `- ${field}: ${answer}`).join('\n')
      newValues.notes = newValues.notes 
        ? `${newValues.notes}\n\n【補充資訊】\n${additionalNotes}`
        : `【補充資訊】\n${additionalNotes}`
    }

    setShowAnalysis(false)
    handleFinalSubmit(newValues)
  }

  const handleAddDestination = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (destInput.trim()) {
        const current = form.getValues('destinations') || []
        form.setValue('destinations', [...current, destInput.trim()])
        setDestInput('')
      }
    }
  }

  const removeDestination = (index: number) => {
    const current = form.getValues('destinations')
    form.setValue('destinations', current.filter((_, i) => i !== index))
  }

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">新增旅遊需求</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="origin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <PlaneTakeoff className="h-4 w-4" /> 出發地
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="例如：台北 (TPE)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="destinations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> 目的地
                  </FormLabel>
                  <div className="space-y-2">
                    <FormControl>
                      <Input 
                        placeholder="輸入後按 Enter 新增" 
                        value={destInput}
                        onChange={e => setDestInput(e.target.value)}
                        onKeyDown={handleAddDestination}
                      />
                    </FormControl>
                    <div className="flex flex-wrap gap-2">
                      {field.value?.map((dest, idx) => (
                        <Badge key={idx} variant="secondary" className="pl-2 pr-1 py-1">
                          {dest}
                          <button 
                            type="button"
                            onClick={() => removeDestination(idx)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="travel_dates.start"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>旅遊開始日期</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="travel_dates.end"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>旅遊結束日期</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="travelers.adult"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>成人</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="travelers.senior"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>長輩</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="travelers.child"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>兒童</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="travelers.infant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>嬰兒</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="budget_range"
            render={({ field }) => (
              <FormItem>
                <FormLabel>總預算範圍</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇預計總預算" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {budgetOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormLabel>飲食偏好</FormLabel>
            <div className="grid grid-cols-2 gap-2">
              {dietaryOptions.map((item) => (
                <FormField
                  key={item.id}
                  control={form.control}
                  name="preferences.dietary"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, item.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== item.id
                                    )
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {item.label}
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <FormLabel>住宿偏好</FormLabel>
            <div className="grid grid-cols-2 gap-2">
              {accommodationOptions.map((item) => (
                <FormField
                  key={item.id}
                  control={form.control}
                  name="preferences.accommodation"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, item.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== item.id
                                    )
                                  )
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {item.label}
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              ))}
            </div>
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>特殊需求 / 備註</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="例如：慶生、求婚、無障礙需求等"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isAnalyzing || isSaving}>
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                AI 正在診斷需求...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                進行 AI 診斷並儲存
              </>
            )}
          </Button>
        </form>
      </Form>

      <Dialog open={showAnalysis} onOpenChange={setShowAnalysis}>
        <DialogContent className="sm:max-w-[600px] sm:min-h-[400px]">
          <VisuallyHidden>
            <DialogTitle>AI 診斷精靈</DialogTitle>
          </VisuallyHidden>
          {/* Wizard handles its own header/content/footer */}
          {analysis && (
            <GapWizard 
              analysis={analysis} 
              onComplete={handleWizardComplete}
              onCancel={() => setShowAnalysis(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}