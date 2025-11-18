'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/ui/AuthProvider'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { FootballField } from '@/components/ui/FootballField'
import { FootballFieldHorizontal } from '@/components/ui/FootballFieldHorizontal'

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
    <div className="hidden lg:block sticky top-24 backdrop-blur-xl bg-[#1E293B]/70 border border-white/20 rounded-3xl shadow-2xl p-6 text-white w-[280px] space-y-3">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white font-bold text-xl">
          {profile.is_anonymous ? '?' : profile.display_name?.charAt(0).toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-white truncate">
            {profile.is_anonymous
              ? profile.role === 'club'
                ? 'Anonieme club'
                : 'Anonieme speler'
              : profile.display_name || 'Onbekend'}
          </h2>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-300">
          <span>📍</span>
          <span>{profile.province || 'Onbekend'}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <span>⚽</span>
          <span>{profile.level || '-'}</span>
        </div>
      </div>
      
      <div className="border-t border-white/20 pt-3 mt-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Profielbezoeken</span>
          <span className="text-[#F59E0B] font-semibold">{viewCount}</span>
        </div>
      </div>
      
      <button
        onClick={() => (window.location.href = '/profiel')}
        className="mt-4 w-full py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold transition shadow-lg"
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

      const { data: clubs, error: clubError } = await supabase
        .from('profiles_player')
        .select('user_id, display_name, bio, province, level')
        .eq('role', 'club')
        .eq('province', speler.province)
        .eq('visibility', true)
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
      
      <main className="relative grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-8 px-4 py-10 max-w-[1600px] mx-auto text-white">
        {/* 🔹 Links: mini profiel */}
        <div className="hidden lg:block">
          <MiniProfileCard />
        </div>

        {/* 🔸 Midden: tijdslijn */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[900px] mx-auto"
        >
          {/* Nieuwe post button */}
          <div
            onClick={() => setShowModal(true)}
            className="w-full bg-[#1E293B]/60 hover:bg-[#1E293B]/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8 cursor-pointer transition-all group shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white font-bold text-xl group-hover:scale-105 transition-transform">
                {profile?.is_anonymous ? '?' : profile?.display_name?.charAt(0).toUpperCase() || '?'}
              </div>
              <span className="text-gray-300 group-hover:text-white transition-colors">
                Deel een bijdrage...
              </span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="text-[#F59E0B]">📰</span>
            Tijdslijn
          </h1>

          {loadingFeed && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F59E0B]"></div>
            </div>
          )}
          
          {!loadingFeed && listings.length === 0 && (
            <div className="text-center py-16 bg-[#1E293B]/40 rounded-2xl border border-white/10">
              <p className="text-gray-400 text-lg">Nog geen bijdragen geplaatst.</p>
              <p className="text-gray-500 text-sm mt-2">Wees de eerste!</p>
            </div>
          )}

          <div className="space-y-6">
            {listings.map((l, i) => {
              const pos = [l.position?.trim(), l.position_secondary?.trim()].filter(Boolean)
              const created = new Date(l.created_at)

              const diffMs = Date.now() - created.getTime()
              const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

              let timeAgo = ''
              if (diffDays <= 0) {
                timeAgo = 'vandaag'
              } else if (diffDays < 7) {
                timeAgo = `${diffDays} ${diffDays === 1 ? 'dag' : 'dagen'} geleden`
              } else {
                timeAgo = created.toLocaleDateString('nl-BE')
              }

              return (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[#1E293B]/60 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:border-white/20 transition-all"
                >
                  {/* Header van de post */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Link
                          href={`/spelers/${l.owner_user_id}`}
                          className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full font-semibold transition-transform hover:scale-105 ${
                            l.profiles_player?.is_anonymous
                              ? 'bg-gray-600/50 text-white'
                              : 'bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white'
                          }`}
                        >
                          {l.profiles_player?.is_anonymous
                            ? '?'
                            : l.profiles_player?.display_name?.[0]?.toUpperCase() || '?'}
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/spelers/${l.owner_user_id}`}
                            className="font-semibold text-white hover:text-[#F59E0B] transition-colors block truncate"
                          >
                            {l.profiles_player?.is_anonymous
                              ? 'Anonieme speler'
                              : l.profiles_player?.display_name || 'Onbekend'}
                          </Link>
                          <p className="text-xs text-gray-400">{timeAgo}</p>
                        </div>
                      </div>

                      {/* Badge type */}
                      <span
                        className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full ${
                          l.type === 'club_zoekt_speler'
                            ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30'
                            : 'bg-green-600/20 text-green-400 border border-green-600/30'
                        }`}
                      >
                        {l.type === 'club_zoekt_speler' ? '🏟️ Club zoekt' : '👟 Speler zoekt'}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-white mb-2">{l.title}</h3>
                      <p className="text-gray-300 leading-relaxed">{l.description}</p>
                    </div>

                    {/* Info tags */}
                    <div className="flex flex-wrap gap-2">
                      <InfoTag icon="📍" text={l.province} />
                      <InfoTag icon="⚽" text={l.level} />
                      {pos.map((p) => (
                        <InfoTag key={p} icon="🧍" text={p} />
                      ))}
                    </div>
                  </div>
                        {/* Voetbalveld footer */}
                        {pos.length > 0 && (
                          <div className="bg-[#0F172A]/50 border-t border-white/5 p-6">
                            <p className="text-sm text-gray-400 mb-4 flex items-center gap-2">
                              <span>⚽</span>
                              {l.type === 'speler_zoekt_club' ? 'Posities:' : 'Gezochte posities:'}
                            </p>
                            <div className="w-full h-[350px]">
                              <FootballFieldHorizontal positionsSelected={pos} />
                            </div>
                          </div>
                        )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* 🔹 Rechts: clubs in de buurt */}
        <div className="hidden lg:block">
          <div className="sticky top-24 backdrop-blur-xl bg-[#1E293B]/70 border border-white/20 rounded-3xl shadow-2xl p-6 text-white w-[280px]">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-[#F59E0B]">🏢</span>
              Clubs in de buurt
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
              <div className="space-y-3">
                {clubsInBuurt.map((club) => (
                  <Link
                    key={club.user_id}
                    href={`/clubs/${club.user_id}`}
                    className="block bg-[#243045]/50 hover:bg-[#2E3A50] border border-white/10 rounded-xl p-4 transition group"
                  >
                    <p className="font-semibold text-white group-hover:text-[#F59E0B] transition-colors truncate">
                      {club.display_name || 'Onbekende club'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{club.level || '-'}</p>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      {club.bio || 'Geen beschrijving beschikbaar.'}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal blijft hetzelfde */}
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
              <div className="bg-[#0F172A] border border-white/20 rounded-2xl shadow-2xl p-10 max-w-5xl w-full text-white max-h-[90vh] overflow-y-auto">
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
                    className="bg-[#1E293B] border border-white/30 rounded-lg p-4 w-full text-white placeholder-gray-400 min-h-[140px] focus:ring-2 focus:ring-[#F59E0B] outline-none resize-none"
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
                      className="px-6 py-2.5 border border-white/40 rounded-lg hover:bg-white/10 transition"
                    >
                      Annuleren
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-8 py-2.5 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold transition shadow-lg disabled:opacity-50"
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

// Helper component voor info tags
function InfoTag({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-[#0F172A]/50 border border-white/10 rounded-lg px-3 py-1.5">
      <span className="text-sm">{icon}</span>
      <span className="text-sm text-gray-300">{text}</span>
    </div>
  )
}