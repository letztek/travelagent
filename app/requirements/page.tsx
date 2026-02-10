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

      <div className="relative min-h-screen bg-white">

        {/* Aesthetic Background Elements */}

        <div className="absolute inset-0 z-0 pointer-events-none">

          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-50/50 blur-[120px]" />

          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-yellow-50/50 blur-[120px]" />

        </div>

  

        <main className="relative z-10 container mx-auto py-12 px-6">

          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">

            <div>

              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">需求列表</h1>

              <p className="text-slate-500 mt-2">查看並管理您的旅遊初步需求</p>

            </div>

            <Button asChild className="bg-slate-900 hover:bg-slate-800 rounded-full px-6 h-12 shadow-lg shadow-slate-200">

              <Link href="/requirements/new">

                <Plus className="mr-2 h-5 w-5" />

                新增旅遊需求

              </Link>

            </Button>

          </div>

        

        {requirements.length === 0 ? (

          <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden">

            <CardContent className="py-20 text-center">

              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">

                <Plus size={40} />

              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-2">目前沒有任何需求。</h2>

              <p className="text-slate-500 mb-8 max-w-md mx-auto">

                開始您的旅程規劃吧！點擊下方按鈕填寫第一份需求單。

              </p>

              <Button asChild variant="outline" className="rounded-full px-8 h-12 border-slate-200 hover:bg-slate-50">

                <Link href="/requirements/new">

                  立即新增

                </Link>

              </Button>

            </CardContent>

          </Card>

        ) : (

          <div className="grid gap-6">

            {requirements.map((req: any) => (

              <Card key={req.id} className="group border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden hover:shadow-2xl transition-all duration-300">

                <CardHeader className="pb-4">

                  <CardTitle className="text-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                    <div className="flex flex-col">

                      <span className="font-extrabold text-2xl text-slate-900">{getTripTitle(req)}</span>

                      <span className="text-sm font-medium text-slate-400 mt-1 flex items-center gap-2 italic">

                        <Calendar className="h-4 w-4" />

                        {req.travel_dates.start} ~ {req.travel_dates.end}

                      </span>

                    </div>

                    <div className="group-hover:translate-x-[-4px] transition-transform">

                      <GenerateButton requirement={req} />

                    </div>

                  </CardTitle>

                </CardHeader>

                <CardContent className="pt-2">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">

                    <div className="flex items-start gap-4">

                      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 shrink-0">

                        <Users className="h-5 w-5" />

                      </div>

                      <div>

                        <p className="font-bold text-slate-900 text-sm">旅客組成</p>

                        <p className="text-slate-500 mt-0.5">

                          {[

                            req.travelers.adult > 0 && `${req.travelers.adult} 成人`,

                            req.travelers.senior > 0 && `${req.travelers.senior} 長輩`,

                            req.travelers.child > 0 && `${req.travelers.child} 兒童`,

                            req.travelers.infant > 0 && `${req.travelers.infant} 嬰兒`

                          ].filter(Boolean).join(', ') || '未指定'}

                        </p>

                      </div>

                    </div>

                    <div className="flex items-start gap-4">

                      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 shrink-0">

                        <Wallet className="h-5 w-5" />

                      </div>

                      <div>

                        <p className="font-bold text-slate-900 text-sm">總預算範圍</p>

                        <p className="text-slate-500 mt-0.5">{req.budget_range}</p>

                      </div>

                    </div>

                    <div className="col-span-1 md:col-span-2 border-t border-slate-100 pt-4 mt-2">

                      <p className="font-bold text-slate-900 text-sm mb-1">備註需求</p>

                      <p className="text-slate-500 text-sm italic leading-relaxed whitespace-pre-wrap">

                        {req.notes || '無特別備註'}

                      </p>

                    </div>

                  </div>

                </CardContent>

              </Card>

            ))}

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

  