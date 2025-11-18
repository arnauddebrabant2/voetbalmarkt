'use client'

import { useAuth } from '@/components/ui/AuthProvider'
import LandingPage from '@/components/ui/LandingPage'
import HomePage from '@/components/ui/HomePage'

export default function RootPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0B1220]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F59E0B]"></div>
      </div>
    )
  }

  // Als niet ingelogd: toon landingspagina
  if (!user) {
    return <LandingPage />
  }

  // Als ingelogd: toon tijdslijn/homepage
  return <HomePage />
}