'use client'

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

import { useRouter } from 'next/navigation'
import { createRequirement } from '../actions'

export default function RequirementFormPage() {
  const router = useRouter()
  const form = useForm<Requirement>({
    resolver: zodResolver(requirementSchema),
    defaultValues: {
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

  async function onSubmit(values: Requirement) {
    const result = await createRequirement(values)
    if (result.success) {
      alert('需求已成功儲存！')
      router.push('/requirements')
    } else {
      alert('儲存失敗：' + (typeof result.error === 'string' ? result.error : '格式錯誤'))
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">新增旅遊需求</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                <FormLabel>預算範圍</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇人均預算" />
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

          <Button type="submit" className="w-full">儲存需求</Button>
        </form>
      </Form>
    </div>
  )
}
