'use client'

import { RouteConcept } from '@/schemas/route'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plane, Train, Car, ArrowRight, Lightbulb } from 'lucide-react'

interface RouteFlowProps {
  concept: RouteConcept
}

export function RouteFlow({ concept }: RouteFlowProps) {
  const getTransportIcon = (transport?: string) => {
    if (!transport) return null
    if (transport.toLowerCase().includes('flight') || transport.includes('飛機')) return <Plane className="h-4 w-4" />
    if (transport.toLowerCase().includes('shinkansen') || transport.includes('火車') || transport.includes('高鐵')) return <Train className="h-4 w-4" />
    if (transport.toLowerCase().includes('car') || transport.includes('車')) return <Car className="h-4 w-4" />
    return null
  }

  return (
    <div className="space-y-6">
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            AI 規劃理由
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">
            {concept.rationale}
          </p>
        </CardContent>
      </Card>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted-foreground/20" />
        <div className="space-y-8 relative">
          {concept.nodes.map((node, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="relative z-10 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shadow-md">
                {node.day}
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg">{node.location}</h3>
                  {node.transport && (
                    <Badge variant="secondary" className="flex items-center gap-1 text-[10px] h-5">
                      {getTransportIcon(node.transport)}
                      {node.transport}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{node.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
