'use client'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/ui/AuthProvider'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams } from 'next/navigation'
import { FootballField } from '@/components/ui/FootballField'
import belgianTeams from '@/public/data/belgian_teams_simple.json'
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

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(''), 3000)
    return () => clearTimeout(t)
  }, [message])

  if (!user) return <p className="p-8 text-center">Log eerst in om je profiel te bekijken.</p>

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

  return (
    <main className="relative p-8 w-full min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0B1220] text-white">
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

      <div className="flex justify-between items-center max-w-7xl mx-auto mb-10">
        <h1 className="text-3xl font-bold text-[#F59E0B]">Mijn spelersprofiel</h1>
        {profile && (
          <Button onClick={() => setIsEditing(true)} className="bg-[#F59E0B] hover:bg-[#D97706] text-white shadow">
            Profiel bewerken
          </Button>
        )}
      </div>

      {profile ? (
        <div className="max-w-7xl mx-auto flex flex-col gap-10">

        {/* ---------- 1️⃣ BOVENSTE PROFIELKADER (GEBOORTEDATUM + LEEFTIJDSBOL) ---------- */}
        <section className="relative overflow-hidden bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-[#1E293B] border border-white/10 rounded-3xl shadow-2xl p-10 flex flex-col md:flex-row items-start gap-10">
        {/* Achtergrond glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F59E0B]/5 to-transparent pointer-events-none" />

        {/* 🔹 Leeftijd berekenen op basis van geboortedatum */}
        {(() => {
            if (!profile?.birth_date) return null
            const birth = new Date(profile.birth_date)
            const diff = Date.now() - birth.getTime()
            const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
            profile.age_calculated = age
        })()}

        {/* Linkerzijde: Avatar + naam */}
        <div className="relative z-10 flex flex-col items-center text-center gap-4 w-full md:w-[300px] flex-shrink-0">
            {/* Profielfoto */}
            <div className="relative w-36 h-36 flex items-center justify-center text-5xl font-bold rounded-full 
                            bg-gradient-to-br from-[#F59E0B]/20 to-[#F59E0B]/5 border-2 border-[#F59E0B]/40 
                            text-[#F59E0B] shadow-lg hover:scale-105 transition-transform duration-300">
            {getProfileAvatar()}

            {/* 🔸 Leeftijdsbolletje rechts onderaan */}
            {profile.birth_date && (
                <div className="absolute bottom-1 right-2 bg-[#F59E0B] text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-md">
                {profile.age_calculated}
                </div>
            )}
            </div>

            {/* Naam */}
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
            {/* ⚽ Posities — blijft 2 kolommen breed */}
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

            {/* ---------- 2️⃣ INFO + VELD NAAST ELKAAR ---------- */}
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
                <FootballField positionsSelected={selectedPositions} size="lg" />
            </div>
            </section>
        </div>
        ) : (
        <p className="text-center text-gray-100 mt-12">
            Nog geen profielinformatie beschikbaar.
        </p>
        )}


      {/* ---------- BEWERK OVERLAY ---------- */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[#0F172A]/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl 
                         p-10 max-w-5xl w-[90%] max-h-[90vh] overflow-y-auto text-white"
            >
              {/* 👉 Jouw originele EditForm-component */}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

/* ---------- HELPERCOMPONENTEN ---------- */
function Info({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <span className="block text-gray-400">{label}</span>
      <span className="block text-gray-100 font-medium">{value || '-'}</span>
    </div>
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
                src={team.logo}
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
