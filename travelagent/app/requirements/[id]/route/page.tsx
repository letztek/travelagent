import { getRequirement } from '../../actions'
import { planRoute } from '../../route-actions'
import { RouteFlow } from './RouteFlow'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ConfirmRouteButton } from './ConfirmRouteButton'

interface RoutePreviewPageProps {
  params: Promise<{ id: string }>
}

export default async function RoutePreviewPage({ params }: RoutePreviewPageProps) {
  const { id } = await params
  const reqResult = await getRequirement(id)

  if (!reqResult.success || !reqResult.data) {
    return <div>讀取需求失敗：{reqResult.error}</div>
  }

  const requirement = reqResult.data
  const routeResult = await planRoute(requirement)

  if (!routeResult.success || !routeResult.data) {
    return <div>路線規劃失敗：{routeResult.error}</div>
  }

  const concept = routeResult.data

  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="ghost" size="icon">
          <Link href="/requirements">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">路線初步規劃預覽</h1>
      </div>

      <div className="space-y-10">
        <RouteFlow concept={concept} />

        <div className="flex flex-col gap-4 border-t pt-8">
          <p className="text-sm text-muted-foreground text-center">
            如果您對此路線大方向滿意，請點擊下方按鈕生成詳細行程（包含每日活動、餐廳與住宿）。
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild variant="outline">
              <Link href={`/requirements/new`}>重新調整需求</Link>
            </Button>
            <ConfirmRouteButton 
              requirement={requirement} 
              requirementId={id} 
              routeConcept={concept} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}
