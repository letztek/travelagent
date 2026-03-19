import { getFavorites } from './actions'
import FavoriteItemsList from './FavoriteItemsList'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import FavoritesPageClient from './FavoritesPageClient'

export default async function FavoritesPage() {
  const result = await getFavorites()
  const favorites = result.success ? result.data || [] : []

  return (
    <div className="relative min-h-screen bg-white">
      <Header />
      
      {/* Aesthetic Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-50/50 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-50/50 blur-[120px]" />
      </div>

      <main className="relative z-10 container mx-auto py-12 px-6">
        <FavoritesPageClient initialFavorites={favorites} />
      </main>

      <footer className="relative z-10 py-12">
        <div className="container mx-auto px-6 text-center text-slate-400 text-sm">
          © 2026 TravelAgent. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
