import { getRequirements } from './actions'
import GenerateButton from './GenerateButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function RequirementsListPage() {
  const result = await getRequirements()

  if (!result.success) {
    return <div>讀取需求失敗：{result.error}</div>
  }

  const requirements = result.data || []

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">需求列表</h1>
      </div>
      
      {requirements.length === 0 ? (
        <p className="text-muted-foreground">目前沒有任何需求。</p>
      ) : (
        <div className="grid gap-4">
          {requirements.map((req: any) => (
            <Card key={req.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>{req.travel_dates.start} ~ {req.travel_dates.end}</span>
                  <GenerateButton requirement={req} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-semibold">人數：</span>
                    {req.travelers.adult} 成人, {req.travelers.senior} 長輩
                  </div>
                  <div>
                    <span className="font-semibold">預算：</span>
                    {req.budget_range}
                  </div>
                  <div className="col-span-2">
                    <span className="font-semibold">備註：</span>
                    {req.notes || '無'}
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