'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { FootballField } from '@/components/ui/FootballField'
import { useAuth } from '@/components/ui/AuthProvider'

export default function PubliekClubProfiel() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const id = params?.id as string
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Redirect naar eigen profiel als je je eigen pagina bekijkt
  useEffect(() => {
    if (user && id && user.id === id) {
      router.push('/profiel')
    }
  }, [user, id, router])

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return
      const { data, error } = await supabase
        .from('profiles_player')
        .select('*')
        .eq('user_id', id)
        .eq('role', 'club')
        .single()

      if (error) console.error('❌ Fout bij ophalen profiel:', error)
      else setProfile(data)

      setLoading(false)
    }
    fetchProfile()
  }, [id])

  // Profielview registreren
  useEffect(() => {
    const logProfileView = async () => {
      if (!user || !id) return
      if (user.id === id) return

      const { error } = await supabase.from('profile_views_player').insert([
        {
          profile_id: id,
          viewer_id: user.id,
        },
      ])

      if (error && error.code !== '23505') {
        console.error('❌ Fout bij registreren profielview:', error)
      }
    }

    logProfileView()
  }, [user, id])

  if (loading) {
    return (
      <main className="relative w-full min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0B1220] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F59E0B] mx-auto mb-4"></div>
          <p className="text-white">Profiel laden...</p>
        </div>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="relative w-full min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0B1220] flex items-center justify-center">
        <div className="text-center">
          <Button onClick={() => router.push('/clubs')} className="mb-6 bg-[#F59E0B] hover:bg-[#D97706]">
            ← Terug naar clublijst
          </Button>
          <p className="text-white">❌ Geen club gevonden.</p>
        </div>
      </main>
    )
  }

  if (!profile.visibility) {
    return (
      <main className="relative w-full min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0B1220] flex items-center justify-center">
        <div className="text-center">
          <Button onClick={() => router.push('/clubs')} className="mb-6 bg-[#F59E0B] hover:bg-[#D97706]">
            ← Terug naar clublijst
          </Button>
          <p className="text-white">🔒 Dit profiel is privé en niet openbaar zichtbaar.</p>
        </div>
      </main>
    )
  }

  const selectedPositions: string[] = profile?.positions_needed
    ? (profile.positions_needed as string).split(',').map((p: string) => p.trim())
    : []

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/clubs')
    }
  }

  return (
    <main className="relative w-full min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0B1220]">
      {/* Header met cover */}
      <div className="relative h-48 bg-gradient-to-r from-[#F59E0B] via-[#D97706] to-[#F59E0B] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0F172A]/50" />
      </div>

      {/* Main content container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-12">
        {/* Profile Header Card */}
        <div className="bg-[#1E293B]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar Section */}
            <div className="flex flex-col items-center md:items-start gap-4 flex-shrink-0">
              <div className="relative">
                <div className="w-32 h-32 flex items-center justify-center text-5xl font-bold rounded-2xl 
                                bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white shadow-xl">
                  {profile.is_anonymous ? '?' : profile.display_name?.charAt(0).toUpperCase() || '🏢'}
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {profile.is_anonymous ? 'Anonieme club' : profile.display_name || '-'}
                  </h1>
                </div>
                <Button onClick={handleGoBack} className="bg-gray-700 hover:bg-gray-600 text-white shadow-lg">
                  ← Terug
                </Button>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatItem icon="📍" label="Provincie" value={profile.province} />
                <StatItem icon="🏆" label="Niveau" value={profile.level} />
                <StatItem icon="📧" label="Contact" value={profile.contact_email} />
                <StatItem icon="⚽" label="Zoekt" value={`${selectedPositions.length} posities`} />
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Over de club */}
            <ContentCard title="Over onze club" icon="🏢">
              <p className="text-gray-300 leading-relaxed">
                {profile.bio || 'Nog geen beschrijving toegevoegd.'}
              </p>
            </ContentCard>

            {/* Gezochte posities & Veld */}
            <ContentCard title="Gezochte posities" icon="⚽">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1">
                  {selectedPositions.length > 0 ? (
                    <div className="space-y-2">
                      {selectedPositions.map((pos) => (
                        <div
                          key={pos}
                          className="flex items-center gap-3 bg-[#F59E0B]/10 border border-[#F59E0B]/30 px-4 py-2 rounded-lg"
                        >
                          <span className="text-[#F59E0B]">⚽</span>
                          <span className="text-white font-medium">{pos}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">Nog geen posities geselecteerd.</p>
                  )}
                </div>
                <div className="w-full md:w-[280px] h-[420px] flex-shrink-0">
                  <FootballField positionsSelected={selectedPositions} />
                </div>
              </div>
            </ContentCard>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            <ContentCard title="Details" icon="📋">
              <div className="space-y-4">
                <DetailRow label="Provincie" value={profile.province} />
                <DetailRow label="Niveau" value={profile.level} />
                <DetailRow label="Contact e-mail" value={profile.contact_email} />
                <DetailRow 
                  label="Laatst bijgewerkt" 
                  value={profile.updated_at ? new Date(profile.updated_at).toLocaleDateString('nl-BE') : '-'} 
                />
              </div>
            </ContentCard>

            <ContentCard title="Statistieken" icon="📊">
              <div className="space-y-4">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <p className="text-3xl font-bold text-[#F59E0B]">{selectedPositions.length}</p>
                  <p className="text-sm text-gray-400 mt-1">Gezochte posities</p>
                </div>
              </div>
            </ContentCard>
          </div>
        </div>
      </div>
    </main>
  )
}

// Helper components
function ContentCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#1E293B]/60 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function StatItem({ icon, label, value }: { icon: string; label: string; value: string | null }) {
  return (
    <div className="text-center p-3 bg-white/5 rounded-xl border border-white/5">
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-white truncate">{value || '-'}</p>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-medium text-white">{value || '-'}</span>
    </div>
  )
}