import { getRequirement } from '../../actions'
import { planRoute } from '../../route-actions'
import { RouteEditor } from './RouteEditor'

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
    <RouteEditor 
      initialConcept={concept} 
      requirement={requirement} 
      requirementId={id} 
    />
  )
}
