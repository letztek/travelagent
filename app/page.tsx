import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Map, Zap, Layout } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/itineraries');
  }

  return (
    <div className="relative min-h-screen bg-white overflow-hidden font-sans">
      {/* Aesthetic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-50/50 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-slate-50/50 blur-[120px]" />
      </div>

      <main className="relative z-10 container mx-auto px-6 pt-32 pb-24 flex flex-col items-center">
        <div className="max-w-4xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-sm font-medium mb-4">
            <Zap size={16} className="text-amber-500" />
            <span>AI 驅動的專業旅遊規劃助理</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            高效、精準、<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
              結構化行程管理。
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-slate-600 leading-relaxed">
            TravelAgent 結合生成式 AI 技術，協助旅遊顧問從碎片化需求快速產出高品質行程。
            透過人機協作模式，將繁瑣的排版與整理交給 AI，您專注於專業判斷。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 rounded-full bg-slate-900 hover:bg-slate-800 text-lg gap-2">
                進入系統 <ArrowRight size={20} />
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-32 w-full max-w-5xl">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Zap size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">AI 自動生成</h3>
            <p className="text-slate-500">根據客戶需求，數秒內產出包含交通、餐飲與活動的完整行程草案。</p>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Layout size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">結構化編輯</h3>
            <p className="text-slate-500">視覺化調整天數、活動與路線，所有修改同步更新底層 JSON 數據。</p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600">
              <Map size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">專業導出</h3>
            <p className="text-slate-500">支援一鍵導出為 Word 文件或簡報 Prompt，快速對接客戶提案流程。</p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-slate-100 py-12">
        <div className="container mx-auto px-6 text-center text-slate-400 text-sm">
          © 2026 TravelAgent. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
