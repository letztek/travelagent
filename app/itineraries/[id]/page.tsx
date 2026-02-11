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
    <div className="w-full">
      <ItineraryEditor itinerary={itinerary} itineraryId={id} />
    </div>
  )
}
