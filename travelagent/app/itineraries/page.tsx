import { getItineraries } from './actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Calendar, MapPin, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'

export default async function ItinerariesPage() {
  const result = await getItineraries()

  if (!result.success) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">讀取行程失敗</h1>
        <p className="text-slate-600">{result.error}</p>
      </div>
    )
  }

  const itineraries = result.data || []

  return (
    <div className="relative min-h-screen bg-white">
      {/* Aesthetic Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-50/50 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-50/50 blur-[120px]" />
      </div>

      <main className="relative z-10 container mx-auto py-12 px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">我的行程列表</h1>
            <p className="text-slate-500 mt-2">管理與查看您所有的慢遊計畫</p>
          </div>
          <Button asChild className="bg-slate-900 hover:bg-slate-800 rounded-full px-6 h-12 shadow-lg shadow-slate-200">
            <Link href="/requirements">
              <Plus className="mr-2 h-5 w-5" />
              立即規劃
            </Link>
          </Button>
        </div>
        
        {itineraries.length === 0 ? (
          <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden">
            <CardContent className="py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                <MapPin size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">目前沒有任何行程。</h2>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">
                開始您的第一次探索吧！填寫旅遊需求，讓我們為您量身打造專屬行程。
              </p>
              <Button asChild variant="outline" className="rounded-full px-8 h-12 border-slate-200 hover:bg-slate-50">
                <Link href="/requirements">
                  立即規劃
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {itineraries.map((itinerary: any) => {
              const firstDay = itinerary.content.days[0]
              const lastDay = itinerary.content.days[itinerary.content.days.length - 1]
              
              return (
                <Card key={itinerary.id} className="group border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold text-slate-900 line-clamp-1">
                      {itinerary.content.title || '精彩旅程'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 text-slate-600">
                        <Calendar size={18} className="text-slate-400" />
                        <span className="text-sm font-medium">
                          {firstDay?.date} ~ {lastDay?.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400 text-xs italic">
                        建立於 {format(new Date(itinerary.created_at), 'yyyy/MM/dd HH:mm', { locale: zhTW })}
                      </div>
                    </div>

                    <div className="mt-auto">
                      <Button asChild className="w-full bg-slate-900 hover:bg-slate-800 rounded-xl h-12 group-hover:translate-y-[-2px] transition-all shadow-md">
                        <Link href={`/itineraries/${itinerary.id}`}>
                          查看詳情 <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      <footer className="relative z-10 py-12">
        <div className="container mx-auto px-6 text-center text-slate-400 text-sm">
          © 2026 Taiwan Scenic Slow Travel. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
