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

  // 👁️ Profielview registreren
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

  if (loading)
    return (
      <main className="p-8 text-center">
        <p>Profiel laden...</p>
      </main>
    )

  if (!profile)
    return (
      <main className="p-8 text-center">
        <Button onClick={() => router.push('/spelers')} className="mb-6">
          ← Terug naar spelerslijst
        </Button>
        <p>❌ Geen speler gevonden.</p>
      </main>
    )

  if (!profile.visibility) {
    return (
      <main className="p-8 text-center">
        <Button onClick={() => router.push('/spelers')} className="mb-6">
          ← Terug naar spelerslijst
        </Button>
        <p className="text-gray-600">
          🔒 Dit profiel is privé en niet openbaar zichtbaar.
        </p>
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

  // 🔹 Leeftijd berekenen
  let age_calculated = null
  if (profile.birth_date) {
    const birth = new Date(profile.birth_date)
    const diff = Date.now() - birth.getTime()
    age_calculated = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
  }

  return (
    <main className="relative p-8 w-full min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0B1220] text-white">
      <div className="flex justify-between items-center max-w-7xl mx-auto mb-10">
        <Button
          onClick={() => router.push('/spelers')}
          className="bg-gray-700 hover:bg-gray-600 text-white"
        >
          ← Terug naar spelerslijst
        </Button>
        <h1 className="text-3xl font-bold text-[#F59E0B]">Spelersprofiel</h1>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        {/* ---------- BOVENSTE PROFIELKADER ---------- */}
        <section className="relative overflow-hidden bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-[#1E293B] border border-white/10 rounded-3xl shadow-2xl p-10 flex flex-col md:flex-row items-start gap-10">
          <div className="absolute inset-0 bg-gradient-to-b from-[#F59E0B]/5 to-transparent pointer-events-none" />

          {/* Linkerzijde: Avatar + naam */}
          <div className="relative z-10 flex flex-col items-center text-center gap-4 w-full md:w-[300px] flex-shrink-0">
            <div className="relative w-36 h-36 flex items-center justify-center text-5xl font-bold rounded-full 
                            bg-gradient-to-br from-[#F59E0B]/20 to-[#F59E0B]/5 border-2 border-[#F59E0B]/40 
                            text-[#F59E0B] shadow-lg hover:scale-105 transition-transform duration-300">
              {getProfileAvatar()}

              {age_calculated && (
                <div className="absolute bottom-1 right-2 bg-[#F59E0B] text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-md">
                  {age_calculated}
                </div>
              )}
            </div>

            <div className="w-full">
              <h2 className="text-2xl font-bold text-white tracking-wide truncate max-w-[260px] mx-auto">
                {profile.is_anonymous ? 'Anonieme speler' : profile.display_name || '-'}
              </h2>
            </div>
          </div>

          {/* Rechterzijde info */}
          <div className="relative z-10 flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-5">
              <InfoFancy icon="📍" label="Provincie" value={profile.province} />
              <InfoFancy icon="🏆" label="Niveau" value={profile.level} />
              <InfoFancy icon="🎯" label="Gewenst niveau" value={profile.level_pref} />
              <InfoFancy icon="🦶" label="Voet" value={profile.foot} />
              <InfoFancy
                icon="📅"
                label="Beschikbaar vanaf"
                value={
                  profile.available_from
                    ? new Date(profile.available_from).toLocaleDateString('nl-BE')
                    : '-'
                }
              />
              <InfoFancy
                icon="🎂"
                label="Geboortedatum"
                value={
                  profile.birth_date
                    ? new Date(profile.birth_date).toLocaleDateString('nl-BE')
                    : '-'
                }
              />
              <div className="col-span-2 sm:col-span-2 lg:col-span-2">
                <InfoFancy
                  icon="⚽"
                  label="Posities"
                  value={`${profile.position_primary || '-'}${
                    profile.position_secondary ? ` & ${profile.position_secondary}` : ''
                  }`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ---------- INFO + VELD ---------- */}
        <section className="grid md:grid-cols-[2fr_1fr] gap-10 items-start w-full">
          <div className="flex flex-col gap-8">
            {currentTeamData && (
              <section className="bg-[#1E293B]/60 border border-white/20 rounded-2xl p-6 flex items-center gap-4 shadow-lg">
                <Image
                  src={currentTeamData.logo}
                  alt={currentTeamData.name}
                  width={48}
                  height={48}
                  className="rounded-full border border-white/30"
                />
                <div>
                  <h3 className="text-lg font-semibold text-[#F59E0B]">
                    Huidige / Laatste club
                  </h3>
                  <p className="text-white text-base font-medium">
                    {currentTeamData.name}
                  </p>
                </div>
              </section>
            )}

            <Section
              title="Over mij"
              content={profile.bio}
              fallback="Nog geen beschrijving toegevoegd."
            />

            <Section
              title="Sterktes"
              content={
                profile.strengths
                  ? profile.strengths.split(',').map((s: string) => (
                      <span
                        key={s.trim()}
                        className="inline-block bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 px-4 py-2 rounded-full text-sm font-medium shadow mr-2 mb-2"
                      >
                        {s.trim()}
                      </span>
                    ))
                  : 'Nog geen sterktes ingevuld.'
              }
            />

            <section className="bg-[#1E293B]/60 border border-white/20 rounded-3xl p-8 shadow-lg">
              <h2 className="text-xl font-semibold text-[#F59E0B] mb-4">Loopbaan / Carrière</h2>

              {career.length > 0 ? (
                <ul className="divide-y divide-white/10 space-y-1">
                  {career.map((c) => {
                    const team = belgianTeams.find(
                      (t) => t.name.toLowerCase() === c.team_name?.toLowerCase()
                    )

                    const periode = c.is_youth
                      ? `${c.youth_from || '?'} → ${c.youth_to || '?'} (jeugd)`
                      : `${c.start_date ? new Date(c.start_date).getFullYear() : '?'} - ${
                          c.end_date ? new Date(c.end_date).getFullYear() : 'heden'
                        }`

                    return (
                      <li
                        key={c.id}
                        className="flex items-center justify-between py-3 gap-4 hover:bg-white/5 rounded-xl transition-colors px-2"
                      >
                        <div className="flex items-center gap-3">
                          {team ? (
                            <Image
                              src={team.logo}
                              alt={team.name}
                              width={36}
                              height={36}
                              className="object-contain"
                            />
                          ) : (
                            <div className="w-9 h-9 bg-gray-600/30 rounded-md" />
                          )}
                          <span className="text-white font-medium">{c.team_name}</span>
                        </div>
                        <span className="text-gray-400 text-sm font-light">{periode}</span>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="text-gray-400">Nog geen loopbaaninformatie toegevoegd.</p>
              )}
            </section>
          </div>

          {/* Veld rechts */}
          <div className="flex justify-center md:justify-end sticky top-20">
            <div className="w-full max-w-[400px] aspect-[2/3] min-h-[500px]">
              <FootballField positionsSelected={selectedPositions} />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function Section({ title, content, fallback }: any) {
  return (
    <section className="bg-[#1E293B]/60 border border-white/20 rounded-3xl p-8 shadow-lg">
      <h2 className="text-xl font-semibold text-[#F59E0B] mb-4">{title}</h2>
      <div className="text-gray-100 whitespace-pre-line">{content || fallback}</div>
    </section>
  )
}

function InfoFancy({
  icon,
  label,
  value,
}: {
  icon: string
  label: string
  value: string | number | null
}) {
  return (
    <div className="flex flex-col bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-colors duration-200">
      <div className="flex items-center gap-2 text-[#F59E0B] font-medium mb-1">
        <span>{icon}</span>
        <span className="text-sm text-gray-300">{label}</span>
      </div>
      <p className="text-base text-gray-100 font-semibold">
        {value && value !== '' ? value : '-'}
      </p>
    </div>
  )
}