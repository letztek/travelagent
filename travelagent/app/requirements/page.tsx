import { getRequirements } from './actions'
import GenerateButton from './GenerateButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Users, Wallet, Calendar } from 'lucide-react'
import { differenceInDays, parseISO } from 'date-fns'

export default async function RequirementsListPage() {
  const result = await getRequirements()

  if (!result.success) {
    return <div>讀取需求失敗：{result.error}</div>
  }

  const requirements = result.data || []

  const getTripTitle = (req: any) => {
    const destinations = req.destinations && req.destinations.length > 0 
      ? req.destinations.join('、') 
      : '未定地點'
    
    let days = 0
    if (req.travel_dates.start && req.travel_dates.end) {
      days = differenceInDays(parseISO(req.travel_dates.end), parseISO(req.travel_dates.start)) + 1
    }

    return `${destinations} ${days > 0 ? `${days}日遊` : ''}`
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">需求列表</h1>
        <Button asChild>
          <Link href="/requirements/new">
            <Plus className="mr-2 h-4 w-4" />
            新增旅遊需求
          </Link>
        </Button>
      </div>
      
      {requirements.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">目前沒有任何需求。</p>
          <Button asChild variant="outline">
            <Link href="/requirements/new">
              <Plus className="mr-2 h-4 w-4" />
              立即新增
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {requirements.map((req: any) => (
            <Card key={req.id} className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-bold text-xl">{getTripTitle(req)}</span>
                    <span className="text-xs font-normal text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {req.travel_dates.start} ~ {req.travel_dates.end}
                    </span>
                  </div>
                  <GenerateButton requirement={req} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 p-3 rounded-md">
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">旅客組成</p>
                      <p>
                        {[
                          req.travelers.adult > 0 && `${req.travelers.adult} 成人`,
                          req.travelers.senior > 0 && `${req.travelers.senior} 長輩`,
                          req.travelers.child > 0 && `${req.travelers.child} 兒童`,
                          req.travelers.infant > 0 && `${req.travelers.infant} 嬰兒`
                        ].filter(Boolean).join(', ') || '未指定'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Wallet className="h-4 w-4 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">總預算範圍</p>
                      <p>{req.budget_range}</p>
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-2 border-t pt-2 mt-1">
                    <span className="font-semibold text-foreground">備註需求：</span>
                    <span className="whitespace-pre-wrap">{req.notes || '無'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}