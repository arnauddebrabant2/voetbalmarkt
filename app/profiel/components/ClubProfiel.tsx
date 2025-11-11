'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/ui/AuthProvider'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { FootballField } from '@/components/ui/FootballField'

export default function ClubProfielPage() {
  const { user, refreshProfile } = useAuth()
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
        .eq('role', 'club')
        .single()
      if (error && error.code !== 'PGRST116') console.error(error)
      setProfile(data)
    }
    fetchProfile()
  }, [user, isEditing])

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(''), 3000)
    return () => clearTimeout(t)
  }, [message])

  if (!user)
    return <p className="p-8 text-center">Log eerst in om je clubprofiel te bekijken.</p>

  const selectedPositions: string[] =
  profile?.positions_needed
    ? (profile.positions_needed as string)
        .split(',')
        .map((p: string) => p.trim())
    : []


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
        <h1 className="text-3xl font-bold text-[#F59E0B]">Mijn clubprofiel</h1>
        {profile && (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-[#F59E0B] hover:bg-[#D97706] text-white shadow"
          >
            Profiel bewerken
          </Button>
        )}
      </div>

      {profile ? (
        <div className="grid md:grid-cols-[2fr_1fr] gap-12 max-w-7xl mx-auto">
          {/* Linkerzijde */}
          <div className="space-y-10 text-left">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Info label="Clubnaam">
                {profile.is_anonymous ? 'Anonieme club' : profile.display_name || '-'}
              </Info>
              <Info label="Provincie">{profile.province || '-'}</Info>
              <Info label="Niveau">{profile.level || '-'}</Info>
              <Info label="Contact e-mail">{profile.contact_email || '-'}</Info>
              <Info label="Zichtbaarheid">
                {profile.visibility ? 'Zichtbaar voor spelers' : 'Verborgen'}
              </Info>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2 text-[#F59E0B]">Over onze club</h2>
              <p className="text-gray-100 whitespace-pre-line">
                {profile.bio || 'Nog geen beschrijving toegevoegd.'}
              </p>
            </section>
          </div>

          {/* Rechterzijde — veld en lijst naast elkaar */}
            <div className="flex flex-col md:flex-row justify-end items-start md:items-stretch gap-6">
            {/* Lijst links — zelfde hoogte als veld */}
            <div className="w-full md:w-[250px] h-[480px] bg-[#1E293B]/80 p-4 rounded-lg border border-white/20 shadow flex flex-col justify-between">
                <div>
                <h3 className="text-[#F59E0B] font-semibold mb-3 text-center md:text-left">
                    Gezochte posities
                </h3>

                {selectedPositions.length > 0 ? (
                    <ul className="text-sm space-y-2 text-gray-100 overflow-y-auto pr-2 flex-1">
                    {selectedPositions.map((pos: string) => (
                        <li
                        key={pos}
                        className="flex items-center gap-2 border-b border-white/10 pb-1"
                        >
                        <span className="text-[#F59E0B]">⚽</span>
                        <span>{pos}</span>
                        </li>
                    ))}
                    </ul>
                ) : (
                    <p className="text-gray-400 text-sm">Nog geen posities geselecteerd.</p>
                )}
                </div>

                {/* Optioneel: klein onderblokje voor styling of aantal */}
                <div className="pt-3 text-xs text-gray-400 border-t border-white/10 text-center md:text-left">
                {selectedPositions.length > 0
                    ? `${selectedPositions.length} posities geselecteerd`
                    : 'Geen posities geselecteerd'}
                </div>
            </div>

            {/* Voetbalveld rechts */}
            <FootballField positionsSelected={selectedPositions} size="md" />
            </div>


        </div>
      ) : (
        <p className="text-center text-gray-100 mt-12">Nog geen clubinformatie beschikbaar.</p>
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
                onClose={() => setIsEditing(false)}
                onSaved={() => {
                  refreshProfile()
                  setIsEditing(false)
                  setMessage('✅ Clubprofiel bijgewerkt!')
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

/* Info helper */
function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="block text-sm text-gray-400">{label}</span>
      <span className="block text-base font-medium text-gray-200">{children}</span>
    </div>
  )
}


/* ⚙️ Bewerken met multi-select voor posities */
function EditForm({ user, initial, onClose, onSaved }: any) {
  const [form, setForm] = useState({
    display_name: initial?.display_name || '',
    province: initial?.province || '',
    level: initial?.level || '',
    bio: initial?.bio || '',
    contact_email: initial?.contact_email || '',
    positions_needed: initial?.positions_needed?.split(',').map((p: string) => p.trim()) || [],
    visibility: initial?.visibility ?? true,
    is_anonymous: initial?.is_anonymous ?? false,
  })
  const [saving, setSaving] = useState(false)

  const update = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }))

  const togglePosition = (pos: string) => {
    setForm((prev) => {
      const exists = prev.positions_needed.includes(pos)
      return {
        ...prev,
        positions_needed: exists
          ? prev.positions_needed.filter((p: string) => p !== pos)
          : [...prev.positions_needed, pos],
      }
    })
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase
      .from('profiles_player')
      .update({
        role: 'club',
        ...form,
        positions_needed: form.positions_needed.join(', '),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
    setSaving(false)
    if (error) alert('❌ Fout bij opslaan')
    else onSaved()
  }

  const allPositions = [
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
  ]

  return (
    <form onSubmit={save} className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-4 text-[#F59E0B]">Clubprofiel bewerken</h2>

    <div className="md:col-span-2 grid md:grid-cols-[1fr_auto] gap-6 items-start">
    <InputField
        label="Clubnaam"
        value={form.display_name}
        onChange={(v: string) => update('display_name', v)}
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
        <span>Anonieme club</span>
        </label>

        <label className="flex items-center gap-2 text-sm">
        <input
            type="checkbox"
            className="w-4 h-4 accent-[#F59E0B]"
            checked={form.visibility}
            onChange={(e) => update('visibility', e.target.checked)}
        />
        <span>Maak mijn profiel zichtbaar voor spelers</span>
        </label>
    </div>
    </div>
      <Select
        label="Provincie"
        value={form.province}
        onChange={(v: string) => update('province', v)}
        options={['Antwerpen', 'Limburg', 'Oost-Vlaanderen', 'West-Vlaanderen', 'Vlaams-Brabant', 'Brussel']}
      />
      <Select
        label="Niveau"
        value={form.level}
        onChange={(v: string) => update('level', v)}
        options={['4e Provinciale', '3e Provinciale', '2e Provinciale', '1e Provinciale', '3e Afdeling', '2e Afdeling', '1e Afdeling']}
      />

      <InputField label="Contact e-mail" value={form.contact_email} onChange={(v: string) => update('contact_email', v)} />

      <div>
        <label className="block text-sm font-medium mb-1 text-[#F59E0B]">
          Posities gezocht
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {allPositions.map((pos) => {
            const selected = form.positions_needed.includes(pos)
            return (
              <button
                key={pos}
                type="button"
                onClick={() => togglePosition(pos)}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  selected
                    ? 'bg-[#F59E0B] text-white border-[#F59E0B]'
                    : 'bg-[#1E293B] text-gray-200 border-white/30 hover:bg-white/10'
                }`}
              >
                {pos}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Over onze club</label>
        <textarea
          className="bg-[#1E293B] border border-white/30 rounded-lg p-4 w-full text-white placeholder-gray-400
                     focus:ring-2 focus:ring-[#F59E0B] outline-none resize-none h-40"
          placeholder="Vertel iets over je club..."
          value={form.bio}
          onChange={(e) => update('bio', e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-4 pt-6">
        <button type="button" onClick={onClose} className="px-5 py-2 border border-white/40 rounded-lg hover:bg-white/10 transition">
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

/* Kleine helpers */
function InputField({ label, value, onChange }: any) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#1E293B] border border-white/30 rounded-lg p-4 w-full text-white focus:ring-2 focus:ring-[#F59E0B] outline-none"
      />
    </div>
  )
}

function Select({ label, value, onChange, options }: any) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#1E293B] border border-white/30 rounded-lg p-4 w-full text-white focus:ring-2 focus:ring-[#F59E0B] outline-none"
      >
        <option value="">Selecteer...</option>
        {options.map((opt: string) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}
