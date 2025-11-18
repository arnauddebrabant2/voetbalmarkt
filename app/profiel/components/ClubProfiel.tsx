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
  const [viewCount, setViewCount] = useState<number>(0)

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
    const fetchViewCount = async () => {
      if (!user) return
      const { count, error } = await supabase
        .from('profile_views_player')
        .select('id', { count: 'exact' })
        .eq('profile_id', user.id)
      if (error) console.error(error)
      setViewCount(count || 0)
    }
    fetchViewCount()
  }, [user])

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(''), 3000)
    return () => clearTimeout(t)
  }, [message])

  if (!user) {
    return <p className="p-8 text-center text-white">Log eerst in om je clubprofiel te bekijken.</p>
  }

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

  const selectedPositions: string[] = profile?.positions_needed
    ? (profile.positions_needed as string).split(',').map((p: string) => p.trim())
    : []

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
                <Button onClick={() => setIsEditing(true)} className="bg-[#F59E0B] hover:bg-[#D97706] text-white shadow-lg">
                  Profiel bewerken
                </Button>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatItem icon="📍" label="Provincie" value={profile.province} />
                <StatItem icon="🏆" label="Niveau" value={profile.level} />
                <StatItem icon="📧" label="Contact" value={profile.contact_email} />
                <StatItem icon="👁️" label="Zichtbaar" value={profile.visibility ? 'Ja' : 'Nee'} />
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
                <DetailRow label="Zichtbaarheid" value={profile.visibility ? 'Zichtbaar voor spelers' : 'Verborgen'} />
              </div>
            </ContentCard>

            <ContentCard title="Statistieken" icon="📊">
              <div className="space-y-4">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <p className="text-3xl font-bold text-[#F59E0B]">{viewCount}</p>
                  <p className="text-sm text-gray-400 mt-1">Profielweergaves</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <p className="text-3xl font-bold text-[#F59E0B]">{selectedPositions.length}</p>
                  <p className="text-sm text-gray-400 mt-1">Gezochte posities</p>
                </div>
              </div>
            </ContentCard>
          </div>
        </div>
      </div>

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
                         p-10 max-w-5xl w-full max-h-[90vh] overflow-y-auto text-white"
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

      <div className="grid md:grid-cols-2 gap-6">
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
          options={['Recreatief / Vriendenploeg', '4e Provinciale', '3e Provinciale', '2e Provinciale', '1e Provinciale', '3e Afdeling', '2e Afdeling', '1e Afdeling']}
        />
      </div>

      <InputField label="Contact e-mail" value={form.contact_email} onChange={(v: string) => update('contact_email', v)} />

      <div>
        <label className="block text-sm font-medium mb-1 text-[#F59E0B]">
          Posities gezocht
        </label>
        <p className="text-xs text-gray-400 mb-2">
          Selecteer de posities waarvoor jullie spelers zoeken.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {allPositions.map((pos) => {
            const selected = form.positions_needed.includes(pos)
            return (
              <button
                key={pos}
                type="button"
                onClick={() => togglePosition(pos)}
                className={`rounded-lg border px-3 py-2 text-sm transition ${
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
                     focus:ring-2 focus:ring-[#F59E0B] outline-none resize-none"
          placeholder="Vertel iets over je club..."
          value={form.bio}
          onChange={(e) => update('bio', e.target.value)}
          rows={6}
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
function InputField({ label, value, onChange, disabled = false }: any) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`bg-[#1E293B] border border-white/30 rounded-lg p-4 w-full text-white focus:ring-2 focus:ring-[#F59E0B] outline-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
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