'use client'
import { useAuth } from '@/components/ui/AuthProvider'
import SpelerProfiel from './components/SpelerProfiel'
import ClubProfiel from './components/ClubProfiel'
import TrainerProfiel from './components/TrainerProfiel'

export default function ProfielPage() {
  const { profile } = useAuth()

  if (!profile) return <p className="text-center mt-10 text-gray-400">Laden...</p>

  switch (profile.role) {
    case 'club':
      return <ClubProfiel />
    case 'trainer':
      return <TrainerProfiel />
    default:
      return <SpelerProfiel />
  }
}
