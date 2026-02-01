import { getItinerary } from '../actions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ItineraryPageProps {
  params: Promise<{ id: string }>
}

export default async function ItineraryPage({ params }: ItineraryPageProps) {
  const { id } = await params
  const result = await getItinerary(id)

  if (!result.success) {
    return <div>讀取行程失敗：{result.error}</div>
  }

  const itinerary = result.data.content
  const days = itinerary.days || []

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">旅遊行程詳情</h1>
      
      {days.map((day: any) => (
        <Card key={day.day} className="mb-8">
          <CardHeader>
            <CardTitle className="flex justify-between items-center text-xl">
              <span>Day {day.day} - {day.date}</span>
              <span className="text-sm font-normal text-muted-foreground">{day.accommodation}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">時段</TableHead>
                  <TableHead>活動</TableHead>
                  <TableHead>描述</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {day.activities.map((activity: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{activity.time_slot}</TableCell>
                    <TableCell>{activity.activity}</TableCell>
                    <TableCell className="text-muted-foreground">{activity.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm bg-muted/50 p-3 rounded-md">
              <div><span className="font-semibold">早：</span>{day.meals.breakfast}</div>
              <div><span className="font-semibold">午：</span>{day.meals.lunch}</div>
              <div><span className="font-semibold">晚：</span>{day.meals.dinner}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
