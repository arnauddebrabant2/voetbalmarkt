'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/ui/AuthProvider'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'



/* ⚽ Voetbalveldcomponent */
function FootballField({ positionsSelected = [] }: { positionsSelected?: string[] }) {
  const positions: Record<string, { x: number; y: number }> = {
    Doelman: { x: 50, y: 95 },
    Linksachter: { x: 16, y: 78 },
    'Centrale verdediger links': { x: 38, y: 82 },
    'Centrale verdediger rechts': { x: 62, y: 82 },
    Rechtsachter: { x: 84, y: 78 },
    'Centrale middenvelder links': { x: 30, y: 60 },
    'Centrale middenvelder rechts': { x: 70, y: 60 },
    'Aanvallende middenvelder': { x: 50, y: 38 },
    Linksbuiten: { x: 20, y: 27 },
    Spits: { x: 50, y: 20 },
    Rechtsbuiten: { x: 80, y: 27 },
  }

  return (
    <div className="relative w-[220px] h-[340px] bg-green-700 border-4 border-green-900 rounded-xl shadow-xl overflow-hidden flex-shrink-0">
      <svg viewBox="0 0 100 150" className="absolute inset-0 w-full h-full">
        <rect x="0" y="0" width="100" height="150" fill="none" stroke="white" strokeWidth="1" />
        <line x1="0" y1="75" x2="100" y2="75" stroke="white" strokeWidth="0.7" />
        <circle cx="50" cy="75" r="10" stroke="white" fill="none" strokeWidth="0.7" />
        <rect x="25" y="0" width="50" height="16" stroke="white" fill="none" strokeWidth="0.7" />
        <rect x="25" y="134" width="50" height="16" stroke="white" fill="none" strokeWidth="0.7" />
      </svg>

      {Object.entries(positions).map(([pos, { x, y }]) => {
        const isSelected = positionsSelected.includes(pos)
        return (
          <div
            key={pos}
            title={pos}
            className={`absolute rounded-full transition-all duration-300 ${
              isSelected
                ? 'bg-yellow-400 border-2 border-white w-5 h-5 ring-4 ring-yellow-300/40 animate-pulse'
                : 'bg-white/70 w-3 h-3'
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

/* 🔹 Mini-profiel */
function MiniProfileCard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [viewCount, setViewCount] = useState<number>(0)

  useEffect(() => {
    const load = async () => {
      if (!user) return
      const { data } = await supabase.from('profiles_player').select('*').eq('user_id', user.id).single()
      setProfile(data)

      const { count } = await supabase
        .from('profile_views_player')
        .select('*', { count: 'exact' })
        .eq('profile_id', user.id)
      setViewCount(count || 0)
    }
    load()
  }, [user])

  if (!profile) return null

  return (
    <div className="hidden md:block sticky top-24 backdrop-blur-xl bg-[#1E293B]/70 border border-white/20 rounded-3xl shadow-2xl p-6 text-white w-[280px] space-y-3">
      <h2 className="text-xl font-bold text-[#F59E0B]">
        {profile.is_anonymous
          ? profile.role === 'club'
            ? 'Anonieme club'
            : 'Anonieme speler'
          : profile.display_name || 'Onbekend'}
      </h2>
      <p className="text-sm text-gray-300">📍 {profile.province || 'Onbekend'}</p>
      <p className="text-sm text-gray-300">⚽ {profile.level || '-'}</p>
      <div className="border-t border-white/20 pt-3 mt-3">
        <p className="text-sm text-gray-300">👁️ {viewCount} profielbezoeken</p>
      </div>
      <button
        onClick={() => (window.location.href = '/profiel')}
        className="mt-4 w-full py-2 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold transition"
      >
        Bekijk mijn profiel
      </button>
    </div>
  )
}

/* 🔸 Hoofdpagina */
export default function HomePage() {
  const { user, profile, loading } = useAuth()
  const [listings, setListings] = useState<any[]>([])
  const [loadingFeed, setLoadingFeed] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [clubsInBuurt, setClubsInBuurt] = useState<any[]>([])
  const [playerProvince, setPlayerProvince] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    province: '',
    level: '',
    position1: '',
    position2: '',
    available_from: '',
  })
  

  useEffect(() => {
    const fetchListings = async () => {
      const { data } = await supabase
        .from('listings')
        .select(`
          *,
          profiles_player:owner_user_id (display_name, is_anonymous)
        `)
        .order('created_at', { ascending: false })
      setListings(data || [])
      setLoadingFeed(false)
    }
    fetchListings()
  }, [])

  useEffect(() => {
    const fetchClubs = async () => {
      if (!user) return

      // 🔹 Eerst: haal speler zijn provincie op
      const { data: speler, error: spelerError } = await supabase
        .from('profiles_player')
        .select('province')
        .eq('user_id', user.id)
        .single()

      if (spelerError) {
        console.error('❌ Fout bij ophalen speler:', spelerError)
        return
      }

      setPlayerProvince(speler.province)

      // 🔹 Daarna: haal clubs uit dezelfde provincie op
      const { data: clubs, error: clubError } = await supabase
        .from('profiles_player')
        .select('user_id, display_name, bio, province, level')
        .eq('role', 'club')
        .eq('province', speler.province)
        .limit(5)

      if (clubError) {
        console.error('❌ Fout bij ophalen clubs:', clubError)
      } else {
        setClubsInBuurt(clubs || [])
      }
    }

    fetchClubs()
  }, [user])


  const handleChange = (e: any) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return setMessage('Je moet eerst inloggen.')
    setSaving(true)
    const type = profile?.role === 'club' ? 'club_zoekt_speler' : 'speler_zoekt_club'

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
          position: form.position1,
          position_secondary: form.position2,
          available_from: form.available_from,
        },
      ])
      .select()

    if (!error && data) {
      // ✅ Voeg de profielgegevens meteen toe om flikkering te vermijden
      const newListing = {
        ...data[0],
        profiles_player: {
          display_name: profile?.is_anonymous
            ? null
            : profile?.display_name || 'Onbekend',
          is_anonymous: profile?.is_anonymous ?? false,
        },
      }

      setListings((prev) => [newListing, ...prev])
      setShowModal(false)
      setForm({
        title: '',
        description: '',
        province: '',
        level: '',
        position1: '',
        position2: '',
        available_from: '',
      })
      setMessage('✅ Bijdrage succesvol geplaatst!')
    } else if (error) {
      console.error('❌ Fout bij opslaan:', error)
      setMessage(`❌ Er ging iets mis: ${error.message}`)
    }

    setSaving(false)

  }

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-b from-[#0F172A] to-[#1E293B] -z-10" />
      <main className="relative grid grid-cols-1 md:grid-cols-[1fr_minmax(0,900px)_1fr] gap-8 px-4 py-10 max-w-[1600px] mx-auto text-white">
        {/* 🔹 Links: mini profiel */}
        <div className="hidden md:block md:col-start-1 md:justify-self-end">
          <MiniProfileCard />
        </div>

        {/* 🔸 Midden: tijdslijn */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="md:col-start-2 bg-[#1E293B]/70 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-10"
        >
          <div
            onClick={() => setShowModal(true)}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-6 mb-10 cursor-pointer transition text-gray-300"
          >
            🗨️ Start een bijdrage...
          </div>

          <h1 className="text-3xl font-bold text-[#F59E0B] mb-8">Tijdslijn</h1>

          {loadingFeed && <p>Laden...</p>}
          {!loadingFeed && listings.length === 0 && (
            <p className="text-center text-gray-400 py-8">Nog geen zoekertjes.</p>
          )}

          <ul className="space-y-8">
            {listings.map((l, i) => {
              const pos = [l.position?.trim(), l.position_secondary?.trim()].filter(Boolean)
              const created = new Date(l.created_at)

              // 🔹 Bereken verschil in dagen
              const diffMs = Date.now() - created.getTime()
              const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

              // 🔹 Tijdweergave
              let timeAgo = ''
              if (diffDays <= 0) {
                timeAgo = 'vandaag'
              } else if (diffDays < 7) {
                timeAgo = `${diffDays} ${diffDays === 1 ? 'dag' : 'dagen'} geleden`
              } else {
                timeAgo = created.toLocaleDateString('nl-BE')
              }

              return (
                <motion.li
                  key={l.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative bg-[#1E293B]/90 border border-white/10 rounded-2xl p-8 shadow-lg hover:bg-[#243045] transition-all"
                >
                  {/* ✅ Structuur: links info + rechts veld */}
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    {/* 🔹 Linkerzijde */}
                    <div className="flex-1 relative">
                      {/* Badge bovenaan */}
                      <span
                        className={`absolute -top-3 left-0 text-xs font-semibold px-3 py-1 rounded-full ${
                          l.type === 'club_zoekt_speler'
                            ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                            : 'bg-green-600/20 text-green-400'
                        }`}
                      >
                        {l.type === 'club_zoekt_speler'
                          ? '🏟️ Club zoekt speler'
                          : '👟 Speler zoekt club'}
                      </span>

                      {/* 👤 Profielnaam + bolletje */}
                      {/* 👤 Profielnaam + bolletje */}
                      <div className="flex items-center gap-3 mb-4 mt-6">
                        <Link
                          href={`/spelers/${l.owner_user_id}`}
                          aria-label="Bekijk spelersprofiel"
                          className={`w-10 h-10 flex items-center justify-center rounded-full font-semibold shadow-inner border border-white/10
                            ${l.profiles_player?.is_anonymous
                              ? 'bg-gray-500/50 text-white'
                              : 'bg-[#F59E0B]/90 text-[#0F172A] hover:brightness-105 transition'
                            }`}
                        >
                          {l.profiles_player?.is_anonymous
                            ? '?'
                            : l.profiles_player?.display_name?.[0]?.toUpperCase() || '?'}
                        </Link>

                        <div className="flex flex-col leading-tight">
                          <Link
                            href={`/spelers/${l.owner_user_id}`}
                            className="text-lg font-semibold text-gray-100 hover:text-[#F59E0B] transition-colors"
                          >
                            {l.profiles_player?.is_anonymous
                              ? 'Anonieme speler'
                              : l.profiles_player?.display_name || 'Onbekend'}
                          </Link>
                          <p className="text-xs text-gray-400 mt-0.5">{timeAgo}</p>
                        </div>
                      </div>
                      {/* 📝 Titel en beschrijving */}
                      <h3 className="text-[#F59E0B] text-2xl font-semibold mb-2">{l.title}</h3>
                      <p className="text-gray-300 mb-4">{l.description}</p>

                      {/* 📋 Extra info */}
                      <div className="space-y-1 text-sm text-gray-400">
                        <p>
                          📍 <span className="text-gray-200">{l.province}</span>
                        </p>
                        <p>
                          ⚽ <span className="text-gray-200">{l.level}</span>
                        </p>
                        <p>
                          🧍 <span className="text-gray-200">{pos.join(' & ')}</span>
                        </p>
                      </div>
                    </div>

                    {/* 🔸 Rechterzijde: voetbalveld */}
                    <div className="flex flex-col items-end justify-start">
                      {pos.length > 0 && <FootballField positionsSelected={pos} />}
                    </div>
                  </div>
                </motion.li>
              )
            })}
          </ul>
        </motion.div>
        {/* 🔹 Rechts: clubs in de buurt */}
        <div className="hidden md:block md:col-start-3 md:justify-self-start sticky top-24 self-start">
          <div className="backdrop-blur-xl bg-[#1E293B]/70 border border-white/20 rounded-3xl shadow-2xl p-6 w-[280px] text-white">
            <h2 className="text-xl font-bold text-[#F59E0B] mb-4">
              Clubs in jouw buurt
            </h2>

            {!playerProvince && (
              <p className="text-gray-400 text-sm">
                Vul je provincie in bij je profiel om clubs in je buurt te zien.
              </p>
            )}

            {playerProvince && clubsInBuurt.length === 0 && (
              <p className="text-gray-400 text-sm">
                Nog geen clubs gevonden in {playerProvince}.
              </p>
            )}

            {clubsInBuurt.length > 0 && (
              <ul className="space-y-4">
                {clubsInBuurt.map((club) => (
                  <li key={club.user_id}>
                    <Link
                      href={`/clubs/${club.user_id}`}
                      className="block bg-[#243045]/70 hover:bg-[#2E3A50] border border-white/10 rounded-xl p-4 transition"
                    >
                      <p className="text-lg font-semibold text-white">
                        {club.display_name || 'Onbekende club'}
                      </p>
                      <p className="text-sm text-gray-400">{club.level || '-'}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {club.bio || 'Geen beschrijving beschikbaar.'}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </main>

      {/* Modaal voor nieuwe bijdrage */}
      {/* Modaal voor nieuwe bijdrage */}
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
        <div className="bg-[#0F172A] border border-white/20 rounded-2xl shadow-2xl p-10 max-w-5xl w-full text-white">
          <h2 className="text-3xl font-bold text-[#F59E0B] mb-6 text-center">
            Plaats een bijdrage
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              name="title"
              placeholder="Titel"
              value={form.title}
              onChange={handleChange}
              required
              className="bg-[#1E293B] border border-white/30 rounded-lg p-4 w-full text-white placeholder-gray-400 focus:ring-2 focus:ring-[#F59E0B] outline-none"
            />

            <textarea
              name="description"
              placeholder="Beschrijving..."
              value={form.description}
              onChange={handleChange}
              required
              className="bg-[#1E293B] border border-white/30 rounded-lg p-4 w-full text-white placeholder-gray-400 min-h-[140px] focus:ring-2 focus:ring-[#F59E0B] outline-none"
            />

            <div className="grid grid-cols-2 gap-5">
              <select
                name="province"
                value={form.province}
                onChange={handleChange}
                required
                className="bg-[#1E293B] border border-white/30 rounded-lg p-4 w-full text-white placeholder-gray-400 focus:ring-2 focus:ring-[#F59E0B] outline-none"
              >
                <option value="">Provincie</option>
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
                className="bg-[#1E293B] border border-white/30 rounded-lg p-4 w-full text-white placeholder-gray-400 focus:ring-2 focus:ring-[#F59E0B] outline-none"
              >
                <option value="">Niveau</option>
                <option>4e Provinciale</option>
                <option>3e Provinciale</option>
                <option>2e Provinciale</option>
                <option>1e Provinciale</option>
                <option>3e Afdeling</option>
                <option>2e Afdeling</option>
                <option>1e Afdeling</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <select
                name="position1"
                value={form.position1}
                onChange={handleChange}
                required
                className="bg-[#1E293B] border border-white/30 rounded-lg p-4 w-full text-white focus:ring-2 focus:ring-[#F59E0B] outline-none"
              >
                <option value="">Positie 1</option>
                <option>Doelman</option>
                <option>Rechtsachter</option>
                <option>Linksachter</option>
                <option>Centrale verdediger links</option>
                <option>Centrale verdediger rechts</option>
                <option>Centrale middenvelder links</option>
                <option>Centrale middenvelder rechts</option>
                <option>Aanvallende middenvelder</option>
                <option>Linksbuiten</option>
                <option>Rechtsbuiten</option>
                <option>Spits</option>
              </select>

              <select
                name="position2"
                value={form.position2}
                onChange={handleChange}
                className="bg-[#1E293B] border border-white/30 rounded-lg p-4 w-full text-white focus:ring-2 focus:ring-[#F59E0B] outline-none"
              >
                <option value="">Positie 2 (optioneel)</option>
                <option>Doelman</option>
                <option>Rechtsachter</option>
                <option>Linksachter</option>
                <option>Centrale verdediger links</option>
                <option>Centrale verdediger rechts</option>
                <option>Centrale middenvelder links</option>
                <option>Centrale middenvelder rechts</option>
                <option>Aanvallende middenvelder</option>
                <option>Linksbuiten</option>
                <option>Rechtsbuiten</option>
                <option>Spits</option>
              </select>
            </div>

            <input
              type="date"
              name="available_from"
              value={form.available_from}
              onChange={handleChange}
              className="bg-[#1E293B] border border-white/30 rounded-lg p-4 w-full text-white focus:ring-2 focus:ring-[#F59E0B] outline-none"
            />

            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2 border border-white/40 rounded-lg hover:bg-white/10 transition"
              >
                Annuleren
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold transition"
              >
                {saving ? 'Bezig...' : 'Plaatsen'}
              </button>
            </div>

            {message && (
              <p className="text-center text-gray-300 text-sm mt-3">{message}</p>
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
