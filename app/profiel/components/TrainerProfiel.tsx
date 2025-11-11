'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/ui/AuthProvider'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

export default function TrainerProfielPage() {
  const { user, refreshProfile } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState('')

  // 🧠 Trainerprofiel ophalen
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return
      const { data, error } = await supabase
        .from('profiles_player')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'trainer')
        .single()
      if (error && error.code !== 'PGRST116') console.error(error)
      setProfile(data)
    }
    fetchProfile()
  }, [user, isEditing])

  // Automatisch melding verbergen
  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(''), 3000)
    return () => clearTimeout(t)
  }, [message])

  if (!user)
    return <p className="p-8 text-center">Log eerst in om je trainerprofiel te bekijken.</p>

  return (
    <main className="relative p-8 w-full min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0B1220] text-white">
      {/* ✅ Melding bovenaan */}
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

      {/* Titel + knop */}
      <div className="flex justify-between items-center max-w-7xl mx-auto mb-10">
        <h1 className="text-3xl font-bold text-[#F59E0B]">Mijn trainerprofiel</h1>
        {profile && (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-[#F59E0B] hover:bg-[#D97706] text-white shadow"
          >
            Profiel bewerken
          </Button>
        )}
      </div>

      {/* Profielweergave */}
      {profile ? (
        <div className="max-w-5xl mx-auto bg-[#1E293B]/60 border border-white/20 rounded-3xl shadow-2xl p-10 space-y-10">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Info label="Naam">
              {profile.is_anonymous ? 'Anonieme trainer' : profile.display_name || '-'}
            </Info>
            <Info label="Provincie">{profile.province || '-'}</Info>
            <Info label="Niveau">{profile.level || '-'}</Info>
            <Info label="Leeftijd">{profile.age || '-'}</Info>
            <Info label="Contact e-mail">{profile.contact_email || '-'}</Info>
            <Info label="Zichtbaarheid">
              {profile.visibility ? 'Zichtbaar voor clubs' : 'Verborgen'}
            </Info>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 text-[#F59E0B]">Over mij</h2>
            <p className="text-gray-100 whitespace-pre-line">
              {profile.bio || 'Nog geen beschrijving toegevoegd.'}
            </p>
          </section>
        </div>
      ) : (
        <p className="text-center text-gray-100 mt-12">Nog geen trainerinformatie beschikbaar.</p>
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

/* 🔹 Info helpercomponent */
function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="block text-sm text-gray-400">{label}</span>
      <span className="block text-base font-medium text-gray-200">{children}</span>
    </div>
  )
}

/* 🛠️ Bewerkenformulier */
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
    province: initial?.province || '',
    level: initial?.level || '',
    bio: initial?.bio || '',
    age: initial?.age || '',
    contact_email: initial?.contact_email || '',
    visibility: initial?.visibility ?? true,
    is_anonymous: !!initial?.is_anonymous,
  })
  const [saving, setSaving] = useState(false)

  const update = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }))

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase
      .from('profiles_player')
      .update({
        role: 'trainer',
        ...form,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    setSaving(false)
    if (error) {
      console.error('❌ Fout bij opslaan:', error)
      alert('❌ Fout bij opslaan')
    } else onSaved()
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-4 text-[#F59E0B]">
        Trainerprofiel bewerken
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Naam"
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
            'Recreatief / Jeugdtrainer',
            '4e Provinciale',
            '3e Provinciale',
            '2e Provinciale',
            '1e Provinciale',
            'Nationale Jeugd',
            'Elite / Professioneel',
          ]}
        />

        <InputField label="Leeftijd" type="number" value={form.age} onChange={(v) => update('age', v)} />
        <InputField
          label="Contact e-mail"
          type="email"
          value={form.contact_email}
          onChange={(v) => update('contact_email', v)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Over mij</label>
        <textarea
          className="bg-[#1E293B] border border-white/30 rounded-lg p-4 w-full text-white placeholder-gray-400
                    focus:ring-2 focus:ring-[#F59E0B] outline-none resize-none h-40"
          placeholder="Vertel iets over je ervaring, stijl of visie als trainer..."
          value={form.bio}
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

/* Kleine helpers */
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
