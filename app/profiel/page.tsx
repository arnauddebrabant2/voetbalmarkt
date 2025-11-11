'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/ui/AuthProvider'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams } from 'next/navigation'


export default function ProfielPage() {
  const { user, refreshProfile } = useAuth()
  const params = useParams()
  const profielID = params?.id || user?.id // eigen profiel of een specifiek profiel-id uit de URL
  const [viewCount, setViewCount] = useState<number>(0)
  const [profile, setProfile] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState('')

  // Profiel ophalen
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return
      const { data, error } = await supabase
        .from('profiles_player')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (data) setProfile(data)
      if (error && error.code !== 'PGRST116') console.error(error)
    }
    fetchProfile()
  }, [user, isEditing])

  // 🔹 Aantal profielbezoekers ophalen
// 🔹 Aantal profielbezoekers ophalen
useEffect(() => {
  const fetchViewCount = async () => {
    if (!profielID) return

    const { data, count, error } = await supabase
      .from('profile_views_player')
      .select('id, profile_id, viewer_id', { count: 'exact' })
      .eq('profile_id', profielID)

    console.log('📊 View data:', data)
    console.log('📈 View count:', count)
    console.log('⚠️ Error:', error)

    if (error) {
      console.error('❌ Fout bij ophalen viewcount:', error)
    } else {
      setViewCount(count || 0)
    }
  }

  fetchViewCount()
}, [profielID])



  // Meldingsbanner automatisch laten verdwijnen
  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(''), 3000)
    return () => clearTimeout(t)
  }, [message])

  if (!user)
    return <p className="p-8 text-center">Log eerst in om je profiel te bekijken.</p>

  const isClub = profile?.role === 'club'
  const isSpeler = profile?.role === 'speler'

const selectedPositions = [
  ...(profile?.position_primary ? [profile.position_primary] : []),
  ...(profile?.position_secondary ? [profile.position_secondary] : []),
]


  return (
<main className="relative p-8 w-full min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0B1220] text-white">
      {/* Meldingsbalk */}
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

      {/* Titel + bewerken-knop rechtsboven */}
      <div className="flex justify-between items-center max-w-7xl mx-auto mb-10">
        <h1 className="text-3xl font-bold text-[#F59E0B]">
          {isClub ? 'Mijn clubprofiel' : 'Mijn spelersprofiel'}
        </h1>

        {profile && (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-[#F59E0B] hover:bg-[#D97706] text-white shadow"
          >
            Profiel bewerken
          </Button>
        )}
      </div>

      {profile && (
        <div
          className={`grid ${isSpeler ? 'md:grid-cols-[2fr_1fr]' : 'grid-cols-1'} gap-12 max-w-7xl mx-auto`}
        >
          {/* Linkerkolom: info */}
          <div className="space-y-10 text-left">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Info label="Weergavenaam">
                {profile.is_anonymous
                  ? isClub
                    ? 'Anonieme club'
                    : 'Anonieme speler'
                  : profile.display_name || '-'}
              </Info>

              {isSpeler && <Info label="Leeftijd">{profile.age || '-'}</Info>}
              <Info label="Provincie">{profile.province || '-'}</Info>
              <Info label="Niveau">{profile.level || '-'}</Info>
              <Info label="👀 Profielbezoekers">{viewCount}</Info>
              {isSpeler && <Info label="Gewenst niveau">{profile.level_pref || '-'}</Info>}
              {isSpeler && (
                    <Info label="Posities">{profile.position_primary || '-'}{" & "}{profile.position_secondary || '-'}</Info>
                )}

              {isSpeler && <Info label="Voet">{profile.foot || '-'}</Info>}
              {isSpeler && (
                <Info label="Beschikbaar vanaf">
                  {profile.available_from
                    ? new Date(profile.available_from).toLocaleDateString('nl-BE')
                    : '-'}
                </Info>
              )}
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2 text-[#F59E0B]">
                {isClub ? 'Over onze club' : 'Over mij'}
              </h2>
              <p className="text-gray-100 whitespace-pre-line">
                {profile.bio ||
                  (isClub
                    ? 'Nog geen clubbeschrijving toegevoegd.'
                    : 'Nog geen beschrijving toegevoegd.')}
              </p>
            </section>

            {isSpeler && (
              <>
                <section>
                  <h2 className="text-lg font-semibold mb-2 text-[#F59E0B]">Sterktes</h2>
                  {profile.strengths ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.strengths.split(',').map((s: string) => (
                        <span
                          key={s.trim()}
                          className="inline-block bg-[#FEF3C7] text-[#0F172A] px-3 py-1 rounded-full text-sm font-medium shadow-sm"
                        >
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">Nog geen sterktes ingevuld.</p>
                  )}
                </section>

                <section>
                  <h2 className="text-lg font-semibold mb-2 text-[#F59E0B]">
                    Loopbaan / Carrière
                  </h2>
                  {profile.career ? (
                    <ul className="list-disc list-inside space-y-1 text-gray-100">
                      {profile.career.split('\n').map((line: string, i: number) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-100">Nog geen loopbaaninformatie toegevoegd.</p>
                  )}
                </section>
              </>
            )}
          </div>

          {/* Rechterkolom: veld */}
          {isSpeler && (
            <div className="flex justify-center md:justify-end">
              {profile && (
  <FootballField positionsSelected={selectedPositions} />
)}

            </div>
          )}
        </div>
      )}

      {!profile && (
        <p className="text-center text-gray-100 mt-12">Nog geen profielinformatie beschikbaar.</p>
      )}

      {/* Bewerken overlay */}
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
              <EditForm
                user={user}
                initial={profile}
                isClub={isClub}
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

/** Info helper */
function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="block text-sm text-gray-400">{label}</span>
      <span className="block text-base font-medium text-gray-200">{children}</span>
    </div>
  )
}

/** ⚽ Voetbalveld met lijnen, doelen, alle posities en duidelijke highlight */
/** ⚽ Voetbalveld met lijnen, doelen en realistische 1-4-3-3 opstelling */
/** ⚽ Voetbalveld met lijnen, doelen en realistische 1-4-3-3 opstelling (meerdere posities mogelijk) */
/** ⚽ Voetbalveld met meerdere posities aangeduid (1-4-3-3 formatie) */
function FootballField({
  positionsSelected = [],
}: {
  positionsSelected?: string[]
}) {
  const positions: Record<string, { x: number; y: number }> = {
    'Doelman': { x: 50, y: 95 },
    'Linksachter': { x: 16, y: 78 },
    'Centrale verdediger links': { x: 38, y: 82 },
    'Centrale verdediger rechts': { x: 62, y: 82 },
    'Rechtsachter': { x: 84, y: 78 },
    'Centrale middenvelder links': { x: 30, y: 60 },
    'Centrale middenvelder rechts': { x: 70, y: 60 },
    'Aanvallende middenvelder': { x: 50, y: 38 },
    'Linksbuiten': { x: 20, y: 27 },
    'Spits': { x: 50, y: 20 },
    'Rechtsbuiten': { x: 80, y: 27 },
  }

  return (
    <div className="relative w-[320px] h-[480px] bg-green-700 border-4 border-green-900 rounded-xl shadow-xl overflow-hidden">
      <svg viewBox="0 0 100 150" className="absolute inset-0 w-full h-full">
        <rect x="0" y="0" width="100" height="150" fill="none" stroke="white" strokeWidth="1" />
        <line x1="0" y1="75" x2="100" y2="75" stroke="white" strokeWidth="0.7" />
        <circle cx="50" cy="75" r="10" stroke="white" fill="none" strokeWidth="0.7" />
        <circle cx="50" cy="75" r="1.8" fill="white" />
        <rect x="25" y="0" width="50" height="16" stroke="white" fill="none" strokeWidth="0.7" />
        <rect x="25" y="134" width="50" height="16" stroke="white" fill="none" strokeWidth="0.7" />
        <rect x="35" y="0" width="30" height="6" stroke="white" fill="none" strokeWidth="0.7" />
        <rect x="35" y="144" width="30" height="6" stroke="white" fill="none" strokeWidth="0.7" />
        <rect x="42" y="-2" width="16" height="2" fill="white" />
        <rect x="42" y="150" width="16" height="2" fill="white" />
        <circle cx="50" cy="11" r="1.2" fill="white" />
        <circle cx="50" cy="139" r="1.2" fill="white" />
      </svg>

      {/* Posities */}
      {Object.entries(positions).map(([pos, { x, y }]) => {
        const isSelected = positionsSelected.includes(pos)
        return (
          <div
            key={pos}
            title={pos}
            className={`absolute rounded-full transition-transform ${
              isSelected
                ? 'bg-yellow-400 border-2 border-white w-6 h-6 animate-pulse ring-4 ring-yellow-300/40'
                : 'bg-white/80 w-3 h-3'
            }`}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )
      })}
    </div>
  )
}

/** Bewerkformulier (met sterktes & carrière) */
function EditForm({
  user,
  initial,
  isClub,
  onClose,
  onSaved,
}: {
  user: any
  initial: any
  isClub: boolean
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
    career: initial?.career || '',
    visibility: initial?.visibility ?? true,
    ...(isClub
      ? {}
      : {
          position_primary: initial?.position_primary || '',
          position_secondary: initial?.position_secondary || '',
          level_pref: initial?.level_pref || '',
          foot: initial?.foot || '',
          age: initial?.age || '',
          available_from: initial?.available_from || '',
        }),
  })
  const [saving, setSaving] = useState(false)

  const update = (key: string, val: any) => setForm((prev) => ({ ...prev, [key]: val }))

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
      role: isClub ? 'club' : 'speler',
      ...cleanedForm,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

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
        {isClub ? 'Clubprofiel bewerken' : 'Spelersprofiel bewerken'}
      </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2 grid md:grid-cols-[1fr_auto] gap-6 items-start">
        <InputField
          label={isClub ? 'Clubnaam' : 'Weergavenaam'}
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


  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">

        <Select
          label="Provincie"
          value={form.province}
          onChange={(v) => update('province', v)}
          options={['Antwerpen', 'Limburg', 'Oost-Vlaanderen', 'West-Vlaanderen', 'Vlaams-Brabant', 'Brussel']}
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

        {!isClub && (
          <>
            {/* Primaire positie */}
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
              // 'Verdedigende middenvelder',
              'Centrale middenvelder links',
              'Centrale middenvelder rechts',
              'Aanvallende middenvelder',
              'Linksbuiten',
              'Rechtsbuiten',
              'Spits',
            ]}
          />

          {/* Secundaire positie */}
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
              // 'Verdedigende middenvelder',
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

            <Select label="Voorkeursvoet" value={form.foot} onChange={(v) => update('foot', v)} options={['Rechts', 'Links', 'Beide']} />

            <InputField label="Leeftijd" type="number" value={form.age} onChange={(v) => update('age', v)} />

            <InputField label="Beschikbaar vanaf" type="date" value={form.available_from} onChange={(v) => update('available_from', v)} />
          </>
        )}
      </div>
      </div>
      

      {!isClub && (
        <>
          <InputField
            label="Sterktes (komma gescheiden, bv. snelheid, techniek, inzicht)"
            value={form.strengths}
            onChange={(v) => update('strengths', v)}
          />

          <div>
            <label className="block text-sm font-medium mb-1">Loopbaan / carrière</label>
            <textarea
              className="bg-[#1E293B] border border-white/30 rounded-lg p-4 w-full text-white placeholder-gray-400
                        focus:ring-2 focus:ring-[#F59E0B] outline-none resize-none h-40"
              placeholder="Bijv: KVC Westerlo (2018–2021)\nKSK Lierse (2021–heden)"
              value={form.career}
              onChange={(e) => update('career', e.target.value)}
            />
          </div>
        </>
        
      )}

      <div>
        <label className="block text-sm font-medium mb-1">{isClub ? 'Over onze club' : 'Over mij'}</label>
        <textarea
          className="bg-[#1E293B] border border-white/30 rounded-lg p-4 w-full text-white placeholder-gray-400
                    focus:ring-2 focus:ring-[#F59E0B] outline-none resize-none"
          value={form.bio}
          onChange={(e) => update('bio', e.target.value)}
          placeholder={isClub ? 'Vertel iets over je club...' : 'Vertel iets over jezelf...'}
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

function InputField({
  label,
  type = 'text',
  value,
  onChange,
  disabled = false,
}: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`bg-[#1E293B] border border-white/30 rounded-lg p-4 w-full text-white placeholder-gray-400
                  focus:ring-2 focus:ring-[#F59E0B] outline-none ${
                    disabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
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
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <select
        className="bg-[#1E293B] border border-white/30 rounded-lg p-4 w-full text-white 
                  focus:ring-2 focus:ring-[#F59E0B] outline-none"
        value={value}
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
