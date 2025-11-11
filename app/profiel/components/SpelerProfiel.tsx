'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/ui/AuthProvider'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams } from 'next/navigation'
import { FootballField } from '@/components/ui/FootballField'

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

        {/* ---------- 1️⃣ BOVENSTE PROFIELKADER (GEBOORTEDATUM & OPGESCHOOND) ---------- */}
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
                <Section
                title="Loopbaan / Carrière"
                content={
                    profile.career ? (
                    <ul className="list-disc list-inside space-y-1 text-gray-100">
                        {profile.career.split('\n').map((line: string, i: number) => (
                        <li key={i}>{line}</li>
                        ))}
                    </ul>
                    ) : (
                    'Nog geen loopbaaninformatie toegevoegd.'
                    )
                }
                />
            </div>

            {/* Veld rechts */}
            <div className="flex justify-center md:justify-end sticky top-20">
                <FootballField positionsSelected={selectedPositions} size="md" />
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

/* ---------- VOETBALVELD ---------- */
// function FootballField({ positionsSelected = [] }: { positionsSelected?: string[] }) {
//   const positions: Record<string, { x: number; y: number }> = {
//     Doelman: { x: 50, y: 95 },
//     Linksachter: { x: 16, y: 78 },
//     'Centrale verdediger links': { x: 38, y: 82 },
//     'Centrale verdediger rechts': { x: 62, y: 82 },
//     Rechtsachter: { x: 84, y: 78 },
//     'Centrale middenvelder links': { x: 30, y: 60 },
//     'Centrale middenvelder rechts': { x: 70, y: 60 },
//     'Aanvallende middenvelder': { x: 50, y: 38 },
//     Linksbuiten: { x: 20, y: 27 },
//     Spits: { x: 50, y: 20 },
//     Rechtsbuiten: { x: 80, y: 27 },
//   }
  

//   return (
//     <div className="relative flex items-center justify-center">
//       {/* 🏟️ Buitenrand (stadionmuur) */}
//       <div className="relative w-[320px] h-[480px] rounded-3xl bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-4 border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
//         {/* 💺 Tribune ring */}
//         <div className="absolute inset-0 bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-3xl p-3">
//           {/* ⚽ Grasveld */}
//           <div className="relative w-full h-full rounded-2xl bg-gradient-to-b from-green-800 to-green-700 border-4 border-green-900 shadow-inner overflow-hidden">
//             {/* Witte lijnen */}
//             <svg viewBox="0 0 100 150" className="absolute inset-0 w-full h-full opacity-90">
//               <rect x="0" y="0" width="100" height="150" fill="none" stroke="white" strokeWidth="1.2" />
//               <line x1="0" y1="75" x2="100" y2="75" stroke="white" strokeWidth="0.8" />
//               <circle cx="50" cy="75" r="10" stroke="white" fill="none" strokeWidth="0.8" />
//               <circle cx="50" cy="75" r="1.5" fill="white" />
//               <rect x="25" y="0" width="50" height="16" stroke="white" fill="none" strokeWidth="0.8" />
//               <rect x="25" y="134" width="50" height="16" stroke="white" fill="none" strokeWidth="0.8" />
//               <rect x="35" y="0" width="30" height="6" stroke="white" fill="none" strokeWidth="0.8" />
//               <rect x="35" y="144" width="30" height="6" stroke="white" fill="none" strokeWidth="0.8" />
//               <rect x="42" y="-2" width="16" height="2" fill="white" />
//               <rect x="42" y="150" width="16" height="2" fill="white" />
//               <circle cx="50" cy="11" r="1.2" fill="white" />
//               <circle cx="50" cy="139" r="1.2" fill="white" />
//             </svg>

//             {/* Posities */}
//             {Object.entries(positions).map(([pos, { x, y }]) => {
//               const isSelected = positionsSelected.includes(pos)
//               return (
//                 <div
//                   key={pos}
//                   title={pos}
//                   className={`absolute rounded-full transition-all duration-300 ease-in-out ${
//                     isSelected
//                       ? 'bg-yellow-400 border-2 border-white w-6 h-6 ring-4 ring-yellow-300/40 shadow-lg animate-pulse'
//                       : 'bg-white/80 w-3 h-3 shadow-sm'
//                   }`}
//                   style={{
//                     left: `${x}%`,
//                     top: `${y}%`,
//                     transform: 'translate(-50%, -50%)',
//                   }}
//                 />
//               )
//             })}
//           </div>
//         </div>
//       </div>

//       {/* 💡 Lichtgloed bovenaan (stadionlichten) */}
//       <div className="absolute -top-10 w-[120%] h-20 bg-gradient-to-b from-white/10 to-transparent blur-3xl rounded-full pointer-events-none" />
//     </div>
//   )
// }


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
    career: initial?.career || '',
    visibility: initial?.visibility ?? true,
    position_primary: initial?.position_primary || '',
    position_secondary: initial?.position_secondary || '',
    level_pref: initial?.level_pref || '',
    foot: initial?.foot || '',
    birth_date: initial?.birth_date || '', // 🔹 Nieuw: geboortedatum
    available_from: initial?.available_from || '',
  })
  const [saving, setSaving] = useState(false)

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
          value={form.career || ''}
          onChange={(e) => update('career', e.target.value)}
        />
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
