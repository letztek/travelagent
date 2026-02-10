import { getItinerary } from '../actions'
import ItineraryEditor from './components/ItineraryEditor'

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

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">旅遊行程詳情</h1>
      
      <ItineraryEditor itinerary={itinerary} itineraryId={id} />
    </div>
  )
}
