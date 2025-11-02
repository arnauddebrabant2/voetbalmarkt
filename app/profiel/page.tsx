'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/ui/AuthProvider'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

export default function ProfielPage() {
  const { user, refreshProfile } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState('')

  // 🔹 Ophalen profiel
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return
      const { data, error } = await supabase
        .from('profiles_player')
        .select(
          'display_name, is_anonymous, position, level, level_pref, foot, province, bio, age, available_from'
        )
        .eq('user_id', user.id)
        .single()
      if (data) setProfile(data)
      if (error && error.code !== 'PGRST116') console.error(error)
    }
    fetchProfile()
  }, [user, isEditing])

  if (!user)
    return <p className="p-8 text-center">Log eerst in om je profiel te bekijken.</p>

  return (
    <main className="relative p-8 max-w-5xl mx-auto min-h-[calc(100vh-4rem)]">
      <h1 className="text-3xl font-bold mb-6 text-center">Mijn spelersprofiel</h1>

      {/* ✅ Alleen-lezen weergave */}
      {profile && (
        <div className="bg-white rounded-2xl shadow-md p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <Info label="Weergavenaam">
              {profile.is_anonymous ? 'Anonieme speler' : profile.display_name || '-'}
            </Info>
            <Info label="Leeftijd">{profile.age || '-'}</Info>
            <Info label="Positie">{profile.position || '-'}</Info>
            <Info label="Huidig niveau">{profile.level || '-'}</Info>
            <Info label="Gewenst niveau">{profile.level_pref || '-'}</Info>
            <Info label="Voorkeursvoet">{profile.foot || '-'}</Info>
            <Info label="Provincie">{profile.province || '-'}</Info>
            <Info label="Beschikbaar vanaf">
              {profile.available_from
                ? new Date(profile.available_from).toLocaleDateString('nl-BE')
                : '-'}
            </Info>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Over mij</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {profile.bio || 'Nog geen beschrijving toegevoegd.'}
            </p>
          </div>

          <div className="text-right">
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              Profiel bewerken
            </Button>
          </div>
        </div>
      )}

      {!profile && (
        <p className="text-center text-gray-500 mt-12">
          Nog geen profielinformatie beschikbaar.
        </p>
      )}

      {/* 🟢 Overlay voor bewerken */}
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
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-5xl w-[90%] max-h-[90vh] overflow-y-auto"
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

      {message && (
        <p className="mt-4 text-center text-sm text-green-700">{message}</p>
      )}
    </main>
  )
}

// 🔸 Helper voor info-velden
function Info({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <span className="block text-sm text-gray-500">{label}</span>
      <span className="block text-base font-medium text-gray-800">
        {children}
      </span>
    </div>
  )
}

// 🟢 Bewerken (zelfde grid als eerder)
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
    position: initial?.position || '',
    level: initial?.level || '',
    level_pref: initial?.level_pref || '',
    foot: initial?.foot || '',
    province: initial?.province || '',
    bio: initial?.bio || '',
    age: initial?.age || '',
    available_from: initial?.available_from || '',
  })
  const [saving, setSaving] = useState(false)

  const update = (key: string, val: any) =>
    setForm((prev) => ({ ...prev, [key]: val }))

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase.from('profiles_player').upsert({
      user_id: user.id,
      ...form,
      updated_at: new Date().toISOString(),
    })
    setSaving(false)
    if (error) {
      console.error(error)
      alert('❌ Fout bij opslaan')
    } else {
      onSaved()
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-4">Profiel bewerken</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Naam + anonimiteit */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Weergavenaam
          </label>
          <Input
            type="text"
            value={form.display_name}
            onChange={(e) => update('display_name', e.target.value)}
            disabled={form.is_anonymous}
          />
        </div>

        <div className="flex items-center gap-2 mt-6">
          <input
            type="checkbox"
            checked={form.is_anonymous}
            onChange={(e) => update('is_anonymous', e.target.checked)}
          />
          <span className="text-sm">Anoniem blijven</span>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Leeftijd</label>
          <Input
            type="number"
            value={form.age}
            onChange={(e) => update('age', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Beschikbaar vanaf
          </label>
          <Input
            type="date"
            value={form.available_from || ''}
            onChange={(e) => update('available_from', e.target.value)}
          />
        </div>

        <Select label="Positie" value={form.position} onChange={(v) => update('position', v)} options={['Doelman','Verdediger','Middenvelder','Aanvaller']} />
        <Select label="Huidig niveau" value={form.level} onChange={(v) => update('level', v)} options={['1e Provinciale','2e Provinciale','3e Provinciale','4e Provinciale','Recreatief / Vriendenploeg']} />
        <Select label="Gewenst niveau" value={form.level_pref} onChange={(v) => update('level_pref', v)} options={['1e Provinciale','2e Provinciale','3e Provinciale','4e Provinciale','Recreatief / Vriendenploeg']} />
        <Select label="Voorkeursvoet" value={form.foot} onChange={(v) => update('foot', v)} options={['Rechts','Links','Beide']} />
        <Select label="Provincie" value={form.province} onChange={(v) => update('province', v)} options={['Antwerpen','Limburg','Oost-Vlaanderen','West-Vlaanderen','Vlaams-Brabant','Brussel']} />
      </div>

      {/* Over mij breed */}
      <div>
        <label className="block text-sm font-medium mb-1">Over mij</label>
        <textarea
          className="border rounded p-3 w-full h-40 resize-none"
          value={form.bio}
          onChange={(e) => update('bio', e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          onClick={onClose}
          className="bg-gray-300 text-gray-800 hover:bg-gray-400"
        >
          Annuleren
        </Button>
        <Button
          type="submit"
          disabled={saving}
          className="bg-green-600 hover:bg-green-700"
        >
          {saving ? 'Opslaan...' : 'Opslaan'}
        </Button>
      </div>
    </form>
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
        className="border rounded p-2 w-full"
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
