'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { FootballField } from '@/components/ui/FootballField'
import { useAuth } from '@/components/ui/AuthProvider'
import belgianTeams from '@/public/data/belgian_teams_simple.json'
import Image from 'next/image'

export default function PubliekSpelerProfiel() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const id = params?.id as string
  const [profile, setProfile] = useState<any>(null)
  const [career, setCareer] = useState<any[]>([])
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
        .single()

      if (error) console.error('❌ Fout bij ophalen profiel:', error)
      else setProfile(data)

      setLoading(false)
    }
    fetchProfile()
  }, [id])

  useEffect(() => {
    const fetchCareer = async () => {
      if (!id) return
      const { data, error } = await supabase
        .from('player_career')
        .select('*')
        .eq('player_id', id)

      if (error) console.error('Fout bij ophalen carrière:', error)
      else {
        const sorted = data.sort((a, b) => {
          if (a.is_youth && !b.is_youth) return -1
          if (!a.is_youth && b.is_youth) return 1

          const aYear = a.is_youth ? parseInt(a.youth_from || 0) : new Date(a.start_date).getFullYear()
          const bYear = b.is_youth ? parseInt(b.youth_from || 0) : new Date(b.start_date).getFullYear()

          return aYear - bYear
        })
        setCareer(sorted)
      }
    }

    fetchCareer()
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

  // 🔹 Smart terug functie
  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back() // Ga terug naar vorige pagina
    } else {
      router.push('/') // Fallback naar homepage
    }
  }

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
          <Button onClick={handleGoBack} className="mb-6 bg-[#F59E0B] hover:bg-[#D97706]">
            ← Terug
          </Button>
          <p className="text-white">❌ Geen speler gevonden.</p>
        </div>
      </main>
    )
  }

  if (!profile.visibility) {
    return (
      <main className="relative w-full min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0B1220] flex items-center justify-center">
        <div className="text-center">
          <Button onClick={handleGoBack} className="mb-6 bg-[#F59E0B] hover:bg-[#D97706]">
            ← Terug
          </Button>
          <p className="text-white">🔒 Dit profiel is privé en niet openbaar zichtbaar.</p>
        </div>
      </main>
    )
  }

  const selectedPositions = [
    ...(profile.position_primary ? [profile.position_primary] : []),
    ...(profile.position_secondary ? [profile.position_secondary] : []),
  ]

  const currentTeamData = profile.current_team
    ? belgianTeams.find((t) => t.name === profile.current_team)
    : null

  const getProfileAvatar = () => {
    if (profile.is_anonymous) return '❓'
    if (profile.display_name) return profile.display_name.charAt(0).toUpperCase()
    return '👤'
  }

  // Leeftijd berekenen
  let age_calculated = null
  if (profile.birth_date) {
    const birth = new Date(profile.birth_date)
    age_calculated = Math.floor((Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
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
                  {getProfileAvatar()}
                </div>
                {age_calculated && (
                  <div className="absolute -bottom-2 -right-2 bg-white text-[#F59E0B] text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                    {age_calculated} jaar
                  </div>
                )}
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {profile.is_anonymous ? 'Anonieme speler' : profile.display_name || '-'}
                  </h1>
                  {currentTeamData && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Image src={currentTeamData.logo} alt={currentTeamData.name} width={24} height={24} className="rounded-full" />
                      <span className="font-medium">{currentTeamData.name}</span>
                    </div>
                  )}
                </div>
                <Button onClick={handleGoBack} className="bg-gray-700 hover:bg-gray-600 text-white shadow-lg">
                  ← Terug
                </Button>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatItem icon="📍" label="Provincie" value={profile.province} />
                <StatItem icon="🏆" label="Niveau" value={profile.level} />
                <StatItem icon="🎯" label="Gewenst" value={profile.level_pref} />
                <StatItem icon="🦶" label="Voet" value={profile.foot} />
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Over mij */}
            <ContentCard title="Over mij" icon="👤">
              <p className="text-gray-300 leading-relaxed">
                {profile.bio || 'Nog geen beschrijving toegevoegd.'}
              </p>
            </ContentCard>

            {/* Posities & Veld */}
            <ContentCard title="Posities" icon="⚽">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1">
                  <div className="space-y-3">
                    {profile.position_primary && (
                      <div className="flex items-center gap-3">
                        <span className="text-[#F59E0B] font-semibold">Primair:</span>
                        <span className="text-white bg-[#F59E0B]/20 px-4 py-2 rounded-lg border border-[#F59E0B]/30">
                          {profile.position_primary}
                        </span>
                      </div>
                    )}
                    {profile.position_secondary && (
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 font-semibold">Secundair:</span>
                        <span className="text-white bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                          {profile.position_secondary}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full md:w-[280px] h-[420px] flex-shrink-0">
                  <FootballField positionsSelected={selectedPositions} />
                </div>
              </div>
            </ContentCard>

            {/* Sterktes */}
            {profile.strengths && (
              <ContentCard title="Sterktes" icon="💪">
                <div className="flex flex-wrap gap-2">
                  {profile.strengths.split(',').map((s: string) => (
                    <span
                      key={s.trim()}
                      className="px-4 py-2 bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 rounded-full text-sm font-medium"
                    >
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </ContentCard>
            )}

            {/* Carrière */}
            <ContentCard title="Loopbaan" icon="📜">
              {career.length > 0 ? (
                <div className="space-y-3">
                  {career.map((c) => {
                    const team = belgianTeams.find(
                      (t) => t.name.toLowerCase() === c.team_name?.toLowerCase()
                    )
                    const periode = c.is_youth
                      ? `${c.youth_from || '?'} → ${c.youth_to || '?'}`
                      : `${c.start_date ? new Date(c.start_date).getFullYear() : '?'} - ${
                          c.end_date ? new Date(c.end_date).getFullYear() : 'heden'
                        }`

                    return (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5"
                      >
                        <div className="flex items-center gap-4">
                          {team ? (
                            <Image src={team.logo} alt={team.name} width={40} height={40} className="rounded-lg" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-600/30 rounded-lg" />
                          )}
                          <div>
                            <p className="text-white font-semibold">{c.team_name}</p>
                            {c.is_youth && <span className="text-xs text-gray-400">Jeugd</span>}
                          </div>
                        </div>
                        <span className="text-gray-400 text-sm font-medium">{periode}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-400">Nog geen loopbaaninformatie toegevoegd.</p>
              )}
            </ContentCard>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            <ContentCard title="Details" icon="📋">
              <div className="space-y-4">
                <DetailRow label="Geboortedatum" value={profile.birth_date ? new Date(profile.birth_date).toLocaleDateString('nl-BE') : '-'} />
                <DetailRow label="Leeftijd" value={age_calculated ? `${age_calculated} jaar` : '-'} />
                <DetailRow label="Beschikbaar vanaf" value={profile.available_from ? new Date(profile.available_from).toLocaleDateString('nl-BE') : '-'} />
                <DetailRow label="Provincie" value={profile.province} />
                <DetailRow label="Huidig niveau" value={profile.level} />
                <DetailRow label="Gewenst niveau" value={profile.level_pref} />
                <DetailRow label="Voorkeursvoet" value={profile.foot} />
              </div>
            </ContentCard>
          </div>
        </div>
      </div>
    </main>
  )
}

// Helper components blijven hetzelfde...
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
      <p className="text-sm font-semibold text-white">{value || '-'}</p>
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