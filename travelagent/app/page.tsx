import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Compass, Clock } from "lucide-react";
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
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-50/50 blur-[120px]" />
      </div>

      <main className="relative z-10 container mx-auto px-6 pt-32 pb-24 flex flex-col items-center">
        <div className="max-w-4xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-sm font-medium mb-4">
            <MapPin size={16} />
            <span>探索台灣最動人的慢旅時光</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            慢遊台灣，<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              重新定義旅程。
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-slate-600 leading-relaxed">
            我們結合 AI 技術與在地深度洞察，為您打造獨一無二的慢節奏行程。
            不再是走馬看花，而是與土地建立真實的連結。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/requirements">
              <Button size="lg" className="h-14 px-8 rounded-full bg-slate-900 hover:bg-slate-800 text-lg gap-2">
                開始規劃我的行程 <ArrowRight size={20} />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-lg border-slate-200 hover:bg-slate-50">
                登入帳號
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-32 w-full max-w-5xl">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Compass size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">在地深度</h3>
            <p className="text-slate-500">挖掘鮮為人知的私房景點，體驗正宗的在地生活文化。</p>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Clock size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">自在節奏</h3>
            <p className="text-slate-500">拒絕趕鴨子行程，為每個景點保留充分的呼吸與沉思空間。</p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
              <MapPin size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">精準規劃</h3>
            <p className="text-slate-500">透過智慧演算法，確保交通動線最優化，不浪費任何一秒。</p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-slate-100 py-12">
        <div className="container mx-auto px-6 text-center text-slate-400 text-sm">
          © 2026 Taiwan Scenic Slow Travel. All rights reserved.
        </div>
      </footer>
    </div>
  );
}