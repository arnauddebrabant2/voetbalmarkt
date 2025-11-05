'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/ui/AuthProvider'
import { motion, AnimatePresence } from 'framer-motion'

type ProfileEmbed = {
  display_name: string | null
  is_anonymous: boolean
}

type Listing = {
  id: string
  title: string
  description: string
  province: string
  level: string
  position: string
  created_at: string
  type: 'speler_zoekt_club' | 'club_zoekt_speler' | null
  profiles_player?: ProfileEmbed | null
}

export default function HomePage() {
  const { user, profile, loading } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [loadingFeed, setLoadingFeed] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    province: '',
    level: '',
    position: '',
    available_from: '',
  })

  useEffect(() => {
    const fetchListings = async () => {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          id,
          title,
          description,
          province,
          level,
          position,
          created_at,
          type,
          profiles_player:owner_user_id (
            display_name,
            is_anonymous
          )
        `)
        .order('created_at', { ascending: false })

      if (!error && data) setListings(data as unknown as Listing[])
      setLoadingFeed(false)
    }

    fetchListings()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    if (!user) {
      setMessage('Je moet eerst inloggen om een zoekertje te plaatsen.')
      return
    }

    setSaving(true)

    const type =
      profile?.role === 'club' ? 'club_zoekt_speler' : 'speler_zoekt_club'

    const { data, error } = await supabase
      .from('listings')
      .insert([
        {
          owner_user_id: user.id,
          type,
          title: form.title,
          description: form.description,
          province: form.province,
          level: form.level,
          position: form.position,
          available_from: form.available_from,
        },
      ])
      .select()

    if (error) {
      console.error('❌ Fout bij opslaan:', error)
      setMessage('❌ Er ging iets mis bij het opslaan.')
    } else {
      setMessage('✅ Zoekertje succesvol geplaatst!')
      if (data) setListings((prev) => [data[0] as Listing, ...prev])
      setForm({
        title: '',
        description: '',
        province: '',
        level: '',
        position: '',
        available_from: '',
      })
      setShowModal(false)
    }

    setSaving(false)
  }

  return (
    <>
      {/* Achtergrond */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0F172A] to-[#1E293B] -z-10" />
      <div className="fixed inset-0 bg-black/60 -z-10" />

      {/* Inhoud */}
      <main className="relative flex items-start justify-center px-4 py-10 min-h-[calc(100vh-64px-48px)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 md:p-12 text-white w-full max-w-4xl"
        >
          {/* “Start een bijdrage” */}
          <div
            onClick={() => setShowModal(true)}
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-5 mb-8 cursor-pointer transition"
          >
            <p className="text-gray-300">🗨️ Start een bijdrage...</p>
          </div>

          <h1 className="text-3xl font-bold text-[#F59E0B] mb-8">Tijdslijn</h1>

          {loadingFeed && <p className="text-center text-gray-300">Laden...</p>}

          {!loadingFeed && listings.length === 0 && (
            <p className="text-center text-gray-400 py-8">
              Nog geen zoekertjes geplaatst.
            </p>
          )}

          {/* Tijdslijn */}
          <ul className="space-y-6">
            {listings.map((l, i) => {
              const p = l.profiles_player
              const typeBadge =
                l.type === 'club_zoekt_speler' ? (
                  <span className="bg-green-500/20 text-green-300 px-2 py-1 text-xs rounded-full font-medium">
                    🏟️ Club zoekt speler
                  </span>
                ) : (
                  <span className="bg-blue-500/20 text-blue-300 px-2 py-1 text-xs rounded-full font-medium">
                    👟 Speler zoekt club
                  </span>
                )

              return (
                <motion.li
                  key={l.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-semibold text-lg">
                      {p?.is_anonymous
                        ? 'Anonieme speler'
                        : p?.display_name || 'Onbekende gebruiker'}
                    </h2>
                    {typeBadge}
                  </div>

                  <h3 className="font-semibold text-[#F59E0B] text-xl mb-1">
                    {l.title}
                  </h3>

                  <p className="text-gray-200 text-sm mb-3 leading-relaxed">
                    {l.description}
                  </p>

                  <div className="text-sm text-gray-400 flex flex-wrap gap-3">
                    <span>📍 {l.province || 'Onbekend'}</span>
                    <span>⚽ {l.level || '-'}</span>
                    <span>🧍 {l.position || '-'}</span>
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    Geplaatst op{' '}
                    {new Date(l.created_at).toLocaleDateString('nl-BE')}
                  </p>
                </motion.li>
              )
            })}
          </ul>
        </motion.div>
      </main>

      {/* Modaal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/70 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
            />
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="bg-[#0F172A] border border-white/20 rounded-2xl shadow-2xl p-8 max-w-lg w-full text-white">
                <h2 className="text-2xl font-bold text-[#F59E0B] mb-6">
                  Plaats een bijdrage
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    name="title"
                    placeholder="Titel"
                    value={form.title}
                    onChange={handleChange}
                    required
                    className="bg-white/10 border border-white/20 rounded-lg p-3 w-full placeholder-gray-400 text-white focus:ring-2 focus:ring-[#F59E0B] outline-none"
                  />

                  <textarea
                    name="description"
                    placeholder="Beschrijving..."
                    value={form.description}
                    onChange={handleChange}
                    required
                    className="bg-white/10 border border-white/20 rounded-lg p-3 w-full placeholder-gray-400 text-white min-h-[120px] focus:ring-2 focus:ring-[#F59E0B] outline-none"
                  />

                  <select
                    name="province"
                    value={form.province}
                    onChange={handleChange}
                    required
                    className="bg-white/10 border border-white/20 rounded-lg p-3 w-full text-white focus:ring-2 focus:ring-[#F59E0B]"
                  >
                    <option value="">Kies een provincie</option>
                    <option>Antwerpen</option>
                    <option>Limburg</option>
                    <option>Oost-Vlaanderen</option>
                    <option>West-Vlaanderen</option>
                    <option>Vlaams-Brabant</option>
                    <option>Brussel</option>
                  </select>

                  <select
                    name="level"
                    value={form.level}
                    onChange={handleChange}
                    required
                    className="bg-white/10 border border-white/20 rounded-lg p-3 w-full text-white focus:ring-2 focus:ring-[#F59E0B]"
                  >
                    <option value="">Kies niveau</option>
                    <option>Jeugd</option>
                    <option>Recreatief / Vriendenploeg</option>
                    <option>4e Provinciale</option>
                    <option>3e Provinciale</option>
                    <option>2e Provinciale</option>
                    <option>1e Provinciale</option>
                    <option>3e Afdeling</option>
                    <option>2e Afdeling</option>
                    <option>1e Afdeling</option>
                  </select>

                  <select
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    required
                    className="bg-white/10 border border-white/20 rounded-lg p-3 w-full text-white focus:ring-2 focus:ring-[#F59E0B]"
                  >
                    <option value="">Kies positie</option>
                    <option>Doelman</option>
                    <option>Rechtsachter</option>
                    <option>Centrale verdediger</option>
                    <option>Linksachter</option>
                    <option>Verdedigende middenvelder</option>
                    <option>Centrale middenvelder</option>
                    <option>Aanvallende middenvelder</option>
                    <option>Rechtsbuiten</option>
                    <option>Linksbuiten</option>
                    <option>Spits</option>
                    <option>Flexibele speler / meerdere posities</option>
                  </select>

                  <input
                    type="date"
                    name="available_from"
                    value={form.available_from}
                    onChange={handleChange}
                    className="bg-white/10 border border-white/20 rounded-lg p-3 w-full text-white focus:ring-2 focus:ring-[#F59E0B]"
                  />

                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 rounded-lg border border-white/30 hover:bg-white/10 transition"
                    >
                      Annuleren
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] font-semibold transition"
                    >
                      {saving ? 'Bezig...' : 'Plaatsen'}
                    </button>
                  </div>

                  {message && (
                    <p className="text-center text-sm mt-3 text-gray-300">
                      {message}
                    </p>
                  )}
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
