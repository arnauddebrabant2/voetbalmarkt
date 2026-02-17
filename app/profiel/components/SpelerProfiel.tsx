'use client'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/ui/AuthProvider'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams } from 'next/navigation'
import { FootballField } from '@/components/ui/FootballField'
import belgianTeams from '@/public/data/belgium_football_teams_flat.json'
import Image from 'next/image'
import CareerEditor from '@/components/ui/CareerEditor'


export default function SpelerProfielPage() {
  const { user, refreshProfile } = useAuth()
  const params = useParams()
  const profielID = (params as any)?.id || user?.id
  const [viewCount, setViewCount] = useState<number>(0)
  const [profile, setProfile] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return
      const { data, error } = await supabase
        .from('profiles_player')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (error && error.code !== 'PGRST116') console.error(error)
      setProfile(data)
    }
    fetchProfile()
  }, [user, isEditing])

  const [career, setCareer] = useState<any[]>([])

useEffect(() => {
  const fetchCareer = async () => {
    if (!profielID) return
    const { data, error } = await supabase
      .from('player_career')
      .select('*')
      .eq('player_id', profielID)

    if (error) console.error('Fout bij ophalen carrière:', error)
    else {
      // 🔹 Sorteer jeugd eerst, daarna eerste ploeg, chronologisch per categorie
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
}, [profielID, isEditing])



  useEffect(() => {
    const fetchViewCount = async () => {
      if (!profielID) return
      const { count, error } = await supabase
        .from('profile_views_player')
        .select('id', { count: 'exact' })
        .eq('profile_id', profielID)
      if (error) console.error(error)
      setViewCount(count || 0)
    }
    fetchViewCount()
  }, [profielID])

  // Block body scroll wanneer modal open is
  useEffect(() => {
    if (isEditing) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isEditing])

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(''), 3000)
    return () => clearTimeout(t)
  }, [message])

    if (!user) return <p className="p-8 text-center">Log eerst in om je profiel te bekijken.</p>

      // 🔹 Loading state toevoegen
    if (!profile) {
      return (
        <main className="relative w-full min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0B1220] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F59E0B] mx-auto mb-4"></div>
            <p className="text-white">Profiel laden...</p>
          </div>
        </main>
      )
    }

  const selectedPositions = [
    ...(profile?.position_primary ? [profile.position_primary] : []),
    ...(profile?.position_secondary ? [profile.position_secondary] : []),
  ]

  const currentTeamData = profile?.current_team
    ? belgianTeams.find((t) => t.name === profile.current_team)
    : null

  const getProfileAvatar = () => {
    if (profile?.is_anonymous) return '❓'
    if (profile?.display_name) return profile.display_name.charAt(0).toUpperCase()
    return '👤'
  }

  // Leeftijd berekenen
  let age_calculated = null
  if (profile?.birth_date) {
    const birth = new Date(profile.birth_date)
    age_calculated = Math.floor((Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
  }

  return (
    <main className="relative w-full min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0B1220]">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-2 rounded-full shadow-lg z-50"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header met cover */}
      <div className="relative h-48 bg-gradient-to-r from-[#F59E0B] via-[#D97706] to-[#F59E0B] overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/topography.svg')] opacity-10" />
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
                      <Image src={currentTeamData.logo_url} alt={currentTeamData.name} width={24} height={24} className="rounded-full" />
                      <span className="font-medium">{currentTeamData.name}</span>
                    </div>
                  )}
                </div>
                {profile && (
                  <Button onClick={() => setIsEditing(true)} className="bg-[#F59E0B] hover:bg-[#D97706] text-white shadow-lg">
                    Profiel bewerken
                  </Button>
                )}
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
                {/* 🔹 Fixed container voor het veld */}
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
                            <Image src={team.logo_url} alt={team.name} width={40} height={40} className="rounded-lg" />
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

            <ContentCard title="Statistieken" icon="📊">
              <div className="space-y-4">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <p className="text-3xl font-bold text-[#F59E0B]">{viewCount}</p>
                  <p className="text-sm text-gray-400 mt-1">Profielweergaves</p>
                </div>
              </div>
            </ContentCard>
          </div>
        </div>
      </div>

      {/* Edit Modal - blijft hetzelfde */}
      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-[#0F172A]/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl 
                         max-w-5xl w-full max-h-[90vh] overflow-hidden text-white flex flex-col"
            >
              {/* Sticky Header */}
              <div className="sticky top-0 z-10 bg-[#0F172A]/95 backdrop-blur-xl border-b border-white/10 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#F59E0B]">Spelersprofiel bewerken</h2>
                  <p className="text-sm text-gray-400 mt-1">Update je profiel informatie</p>
                </div>
                <button
                  onClick={() => setIsEditing(false)}
                  type="button"
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Scrollable content */}
              <div className="overflow-y-auto flex-1 p-10">
                <EditForm
                  user={user}
                  initial={profile}
                  onClose={() => setIsEditing(false)}
                  onSaved={() => {
                    refreshProfile()
                    setIsEditing(false)
                    setMessage('✅ Profiel bijgewerkt!')
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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


/* ---------- Bewerken formulier ---------- */
function EditForm({
  user,
  initial,
  onClose,
  onSaved,
}: {
  user: any
  initial: any
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    display_name: initial?.display_name || '',
    is_anonymous: !!initial?.is_anonymous,
    province: initial?.province || '',
    level: initial?.level || '',
    bio: initial?.bio || '',
    strengths: initial?.strengths || '',
    visibility: initial?.visibility ?? true,
    position_primary: initial?.position_primary || '',
    position_secondary: initial?.position_secondary || '',
    level_pref: initial?.level_pref || '',
    foot: initial?.foot || '',
    birth_date: initial?.birth_date || '', // 🔹 Nieuw: geboortedatum
    available_from: initial?.available_from || '',
    current_team: initial?.current_team || '',
  })
  const [careerList, setCareerList] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
  const fetchCareer = async () => {
    const { data, error } = await supabase
      .from('player_career')
      .select('*')
      .eq('player_id', user.id)
      .order('start_date', { ascending: true })

    if (error) console.error('❌ Fout bij ophalen carrière:', error)
    else setCareerList(data || [])
  }

  fetchCareer()
}, [user])

  const update = (key: string, val: any) => setForm((p) => ({ ...p, [key]: val }))

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    // 🔹 Alle lege strings vervangen door null
    const cleanedForm = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v === '' ? null : v])
    )

    const { error } = await supabase
    .from('profiles_player')
    .update({
      role: 'speler',
      ...cleanedForm,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

    // 🔹 Carrière opslaan
    const cleanedCareer = careerList
      .filter((c) => c.team_name)
      .map((c) => ({
        player_id: user.id,
        team_name: c.team_name,
        team_logo: c.team_logo || null,
        start_date: c.start_date || null,
        end_date: c.end_date || null,
        is_youth: c.is_youth || false,
        youth_from: c.youth_from || null,
        youth_to: c.youth_to || null,
      }))

    // 🔸 Oude carrière wissen
    await supabase.from('player_career').delete().eq('player_id', user.id)

    // 🔸 Nieuwe carrière invoegen
    if (cleanedCareer.length > 0) {
      const { error: insertError } = await supabase
        .from('player_career')
        .insert(cleanedCareer)

      if (insertError) {
        console.error('❌ Fout bij opslaan carrière:', insertError)
        alert('❌ Fout bij opslaan carrière')
      }
    }

    setSaving(false)

    if (error) {
      console.error('❌ Update fout:', error)
      alert('❌ Fout bij opslaan')
    } else {
      onSaved()
    }

  }

  return (
    <form onSubmit={save} className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-4 text-[#F59E0B]">
        Spelersprofiel bewerken
      </h2>

      {/* Naam + checkboxen rechts */}
      <div className="md:col-span-2 grid md:grid-cols-[1fr_auto] gap-6 items-start">
        <InputField
          label="Weergavenaam"
          value={form.display_name}
          onChange={(v) => update('display_name', v)}
          disabled={form.is_anonymous}
        />
        <div className="flex flex-col justify-start mt-[1.9rem] gap-1">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="w-4 h-4 accent-[#F59E0B]"
              checked={form.is_anonymous}
              onChange={(e) => update('is_anonymous', e.target.checked)}
            />
            <span>Anoniem blijven</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="w-4 h-4 accent-[#F59E0B]"
              checked={form.visibility}
              onChange={(e) => update('visibility', e.target.checked)}
            />
            <span>Maak mijn profiel zichtbaar voor clubs</span>
          </label>
        </div>
      </div>

      {/* Overige velden */}
      <div className="grid md:grid-cols-2 gap-6 mt-2">
        <Select
          label="Provincie"
          value={form.province}
          onChange={(v) => update('province', v)}
          options={[
            'Antwerpen',
            'Limburg',
            'Oost-Vlaanderen',
            'West-Vlaanderen',
            'Vlaams-Brabant',
            'Brussel',
          ]}
        />
        <Select
          label="Niveau"
          value={form.level}
          onChange={(v) => update('level', v)}
          options={[
            'Recreatief / Vriendenploeg',
            '4e Provinciale',
            '3e Provinciale',
            '2e Provinciale',
            '1e Provinciale',
            '3e Afdeling',
            '2e Afdeling',
            '1e Afdeling',
          ]}
        />
        <Select
          label="Favoriete positie"
          value={form.position_primary}
          onChange={(v) => update('position_primary', v)}
          options={[
            'Doelman',
            'Rechtsachter',
            'Centrale verdediger links',
            'Centrale verdediger rechts',
            'Linksachter',
            'Centrale middenvelder links',
            'Centrale middenvelder rechts',
            'Aanvallende middenvelder',
            'Linksbuiten',
            'Rechtsbuiten',
            'Spits',
          ]}
        />
        <Select
          label="Tweede positie"
          value={form.position_secondary}
          onChange={(v) => update('position_secondary', v)}
          options={[
            'Doelman',
            'Rechtsachter',
            'Centrale verdediger links',
            'Centrale verdediger rechts',
            'Linksachter',
            'Centrale middenvelder links',
            'Centrale middenvelder rechts',
            'Aanvallende middenvelder',
            'Linksbuiten',
            'Rechtsbuiten',
            'Spits',
          ]}
        />
        <Select
          label="Gewenst niveau"
          value={form.level_pref}
          onChange={(v) => update('level_pref', v)}
          options={[
            'Recreatief / Vriendenploeg',
            '4e Provinciale',
            '3e Provinciale',
            '2e Provinciale',
            '1e Provinciale',
            '3e Afdeling',
            '2e Afdeling',
            '1e Afdeling',
          ]}
        />
        <Select
          label="Voorkeursvoet"
          value={form.foot}
          onChange={(v) => update('foot', v)}
          options={['Rechts', 'Links', 'Beide']}
        />
        <TeamSelect value={form.current_team} onChange={(v) => update('current_team', v)} />

        {/* 🔹 Nieuw veld: geboortedatum */}
        <InputField
          label="Geboortedatum"
          type="date"
          value={form.birth_date}
          onChange={(v) => update('birth_date', v)}
        />

        <InputField
          label="Beschikbaar vanaf"
          type="date"
          value={form.available_from}
          onChange={(v) => update('available_from', v)}
        />
      </div>

      {/* Tekstvelden */}
      <div>
  <label className="block text-sm font-medium mb-1 text-[#F59E0B]">
    Sterktes
  </label>
  <p className="text-xs text-gray-400 mb-2">
    Selecteer de kwaliteiten die jou het best omschrijven.
  </p>
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
    {[
      'Snelheid',
      'Techniek',
      'Inzicht',
      'Fysiek sterk',
      'Uithouding',
      'Kopbalsterk',
      'Passnauwkeurigheid',
      'Dribbelvaardig',
      'Verdedigend inzicht',
      'Positiespel',
      'Afwerking',
      'Teamspeler',
      'Leiderschap',
      'Communicatie',
      'Creativiteit',
    ].map((sterkte) => {
      const selected = form.strengths
        ?.split(',')
        .map((s: string) => s.trim())
        .includes(sterkte)
      return (
        <button
          key={sterkte}
          type="button"
          onClick={() => {
            const current = form.strengths
              ? form.strengths.split(',').map((s: string) => s.trim())
              : []
            const newList = selected
              ? current.filter((s: string) => s !== sterkte)
              : [...current, sterkte]
            update('strengths', newList.join(', '))
          }}
          className={`rounded-lg border px-3 py-2 text-sm text-center transition ${
            selected
              ? 'bg-[#F59E0B] text-white border-[#F59E0B]'
              : 'bg-[#1E293B] text-gray-200 border-white/30 hover:bg-white/10'
          }`}
        >
          {sterkte}
        </button>
      )
    })}
  </div>
</div>


        <div>
  <label className="block text-sm font-medium mb-1 text-[#F59E0B]">
    Loopbaan / Carrière
  </label>
  <p className="text-xs text-gray-400 mb-2">
    Voeg clubs toe en geef aan of het om jeugd of senior voetbal gaat.
  </p>

  {careerList.map((item, idx) => (
    <div
      key={idx}
      className="flex flex-wrap md:flex-nowrap items-center gap-3 mb-2 bg-[#1E293B] border border-white/20 rounded-lg p-3"
    >
      {/* Team-select met logo — label verbergen */}
      <div className="flex-1 min-w-[220px]">
        <TeamSelect
          value={item.team_name || ''}
          onChange={(val: string, logo: string) => {
            const updated = [...careerList]
            updated[idx].team_name = val
            updated[idx].team_logo = logo
            setCareerList(updated)
          }}
          hideLabel
        />
      </div>

      {/* Jeugd / senior toggle */}
      <div className="flex items-center gap-2 h-[46px]">
        <input
          id={`is_youth_${idx}`}
          type="checkbox"
          checked={item.is_youth || false}
          onChange={(e) => {
            const updated = [...careerList]
            updated[idx].is_youth = e.target.checked
            setCareerList(updated)
          }}
          className="accent-[#F59E0B] w-4 h-4"
        />
        <label
          htmlFor={`is_youth_${idx}`}
          className="text-sm text-gray-300 select-none"
        >
          Jeugd
        </label>
      </div>

      {/* Datum- of U-selectie */}
      <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
        {item.is_youth ? (
          <>
            <select
              value={item.youth_from || ''}
              onChange={(e) => {
                const updated = [...careerList]
                updated[idx].youth_from = e.target.value
                setCareerList(updated)
              }}
              className="w-[110px] bg-[#0F172A] border border-white/30 rounded-lg p-2 text-white"
            >
              <option value="">Van</option>
              {['U6','U7','U8','U9','U10','U11','U12','U13','U14','U15','U16','U17','U18','U19'].map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
            <span className="text-gray-400 text-sm">→</span>
            <select
              value={item.youth_to || ''}
              onChange={(e) => {
                const updated = [...careerList]
                updated[idx].youth_to = e.target.value
                setCareerList(updated)
              }}
              className="w-[110px] bg-[#0F172A] border border-white/30 rounded-lg p-2 text-white"
            >
              <option value="">Tot</option>
              {['U6','U7','U8','U9','U10','U11','U12','U13','U14','U15','U16','U17','U18','U19'].map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </>
        ) : (
          <>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="Startjaar"
              value={item.start_date ? new Date(item.start_date).getFullYear() : ''}
              onChange={(e) => {
                const year = e.target.value.replace(/\D/g, '')  // Alleen cijfers
                const updated = [...careerList]
                
                if (year === '') {
                  updated[idx].start_date = null
                } else {
                  updated[idx].start_date = `${year.padStart(4, '0')}-01-01`
                }
                
                setCareerList(updated)
              }}
              className="w-[110px] bg-[#0F172A] border border-white/30 rounded-lg p-2 text-white text-center"
            />
            <span className="text-gray-400 text-sm">→</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="Eindjaar"
              value={item.end_date ? new Date(item.end_date).getFullYear() : ''}
              onChange={(e) => {
                const year = e.target.value.replace(/\D/g, '')  // Alleen cijfers
                const updated = [...careerList]
                
                if (year === '') {
                  updated[idx].end_date = null
                } else {
                  updated[idx].end_date = `${year.padStart(4, '0')}-01-01`
                }
                
                setCareerList(updated)
              }}
              className="w-[110px] bg-[#0F172A] border border-white/30 rounded-lg p-2 text-white text-center"
            />

          </>
        )}
      </div>

      {/* Verwijderknop rechts */}
      <button
        type="button"
        onClick={() =>
          setCareerList(careerList.filter((_, i) => i !== idx))
        }
        className="text-red-400 hover:text-red-600 text-sm ml-auto"
      >
        ✕
      </button>
    </div>
  ))}

  {/* Knop om nieuwe rij toe te voegen */}
  <button
    type="button"
    onClick={() =>
      setCareerList([
        ...careerList,
        {
          team_name: '',
          team_logo: '',
          is_youth: false,
          youth_from: '',
          youth_to: '',
          start_date: '',
          end_date: '',
        },
      ])
    }
    className="mt-2 text-[#F59E0B] text-sm hover:underline"
  >
    + Voeg club toe
  </button>
</div>

      <div>
        <label className="block text-sm font-medium mb-1">Over mij</label>
        <textarea
          className="bg-[#1E293B] border border-white/30 rounded-lg p-4 w-full text-white placeholder-gray-400
                     focus:ring-2 focus:ring-[#F59E0B] outline-none resize-none"
          placeholder="Vertel iets over jezelf..."
          value={form.bio || ''}
          onChange={(e) => update('bio', e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-4 pt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 border border-white/40 rounded-lg hover:bg-white/10 transition"
        >
          Annuleren
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold transition"
        >
          {saving ? 'Opslaan...' : 'Opslaan'}
        </button>
      </div>
    </form>
  )
}


/* ---------- Kleine UI helpers ---------- */
function InputField({
  label,
  type = 'text',
  value,
  onChange,
  disabled = false,
}: {
  label: string
  type?: string
  value: string | number | null
  onChange: (v: any) => void
  disabled?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`bg-[#1E293B] border border-white/30 rounded-lg p-4 w-full text-white placeholder-gray-400
                    focus:ring-2 focus:ring-[#F59E0B] outline-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
    </div>
  )
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string | null
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <select
        className="bg-[#1E293B] border border-white/30 rounded-lg p-4 w-full text-white focus:ring-2 focus:ring-[#F59E0B] outline-none"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Selecteer...</option>
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}

function TeamSelect({
  value,
  onChange,
  hideLabel = false,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)

  // 🔠 Sorteer alfabetisch
  const teams = useMemo(
    () => [...belgianTeams].sort((a, b) => a.name.localeCompare(b.name)),
    []
  )

  // 🔍 Filteren
  const filteredTeams = useMemo(() => {
    if (!query) return teams
    return teams.filter((team) =>
      team.name.toLowerCase().includes(query.toLowerCase())
    )
  }, [query, teams])

  // 💡 Toon tijdelijk query bij focus
  const displayValue = focused ? query : value

  return (
    <div className="relative w-full">
      {!hideLabel && (
  <label className="block text-sm font-medium mb-1">
    Huidige / Laatste club
  </label>
)}


      <input
        type="text"
        placeholder="Zoek of selecteer een club..."
        value={displayValue || ''}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          setFocused(true)
          setQuery('') // leeg bij focus om te zoeken
        }}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        className="w-full bg-[#1E293B] border border-white/30 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#F59E0B] outline-none"
      />

      {/* Dropdownlijst */}
      {focused && (
        <div className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto bg-[#0F172A] border border-white/20 rounded-lg shadow-lg">
          {/* ➕ Optie: geen club */}
          <button
            type="button"
            onClick={() => {
              onChange('')
              setQuery('')
              setFocused(false)
            }}
            className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-[#F59E0B]/20 transition-colors border-b border-white/10"
          >
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-600/50 text-white text-xs">
              –
            </div>
            <span className="text-sm text-gray-300 italic">Geen club (vrije speler)</span>
          </button>

          {/* Clubs */}
          {filteredTeams.map((team) => (
            <button
              key={team.name}
              type="button"
              onClick={() => {
                onChange(team.name)
                setQuery('')
                setFocused(false)
              }}
              className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-[#F59E0B]/20 transition-colors"
            >
              <Image
                src={team.logo_url}
                alt={team.name}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="text-sm text-white">{team.name}</span>
            </button>
          ))}

          {filteredTeams.length === 0 && (
            <p className="px-3 py-2 text-sm text-gray-400">
              Geen clubs gevonden
            </p>
          )}
        </div>
      )}
    </div>
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
