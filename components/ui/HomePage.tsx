'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/ui/AuthProvider'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { FootballFieldHorizontal } from '@/components/ui/FootballFieldHorizontal'

/* 🔹 Mini-profiel Sidebar */
function ProfileSidebar() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState({ views: 0, posts: 0 })

  useEffect(() => {
    const load = async () => {
      if (!user) return
      const { data } = await supabase.from('profiles_player').select('*').eq('user_id', user.id).single()
      setProfile(data)

      const { count: views } = await supabase
        .from('profile_views_player')
        .select('*', { count: 'exact' })
        .eq('profile_id', user.id)
      
      const { count: posts } = await supabase
        .from('listings')
        .select('*', { count: 'exact' })
        .eq('owner_user_id', user.id)

      setStats({ views: views || 0, posts: posts || 0 })
    }
    load()
  }, [user])

  if (!profile) return null

  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 rounded-2xl overflow-hidden">
        {/* Cover */}
        <div className="h-20 bg-gradient-to-r from-[#F59E0B] to-[#D97706] relative">
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white font-bold text-3xl border-4 border-[#0F172A] shadow-xl">
              {profile.is_anonymous ? '?' : profile.display_name?.charAt(0).toUpperCase() || '?'}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-12 px-6 pb-6">
          <h2 className="text-lg font-bold text-white mb-1 truncate">
            {profile.is_anonymous
              ? profile.role === 'club' ? 'Anonieme club' : 'Anonieme speler'
              : profile.display_name || 'Onbekend'}
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            {profile.role === 'club' ? '🏢 Club' : '⚽ Speler'}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-[#F59E0B]">{stats.views}</p>
              <p className="text-xs text-gray-400">Views</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-[#F59E0B]">{stats.posts}</p>
              <p className="text-xs text-gray-400">Posts</p>
            </div>
          </div>

          {/* Quick Info */}
          <div className="space-y-2 text-sm mb-4">
            <div className="flex items-center gap-2 text-gray-300">
              <span>📍</span>
              <span>{profile.province || 'Onbekend'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <span>🏆</span>
              <span>{profile.level || '-'}</span>
            </div>
          </div>

          <Link
            href="/profiel"
            className="block w-full py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-white text-center font-semibold transition"
          >
            Bekijk profiel
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#1E293B]/60 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <span>⚡</span>
          Quick Actions
        </h3>
        <div className="space-y-2">
          <Link
            href="/spelers"
            className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition group"
          >
            <span className="text-xl">👥</span>
            <span className="text-sm text-gray-300 group-hover:text-white">Zoek spelers</span>
          </Link>
          <Link
            href="/clubs"
            className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition group"
          >
            <span className="text-xl">🏢</span>
            <span className="text-sm text-gray-300 group-hover:text-white">Zoek clubs</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

/* 🔹 Clubs Sidebar */
function ClubsSidebar() {
  const { user, profile } = useAuth() // ← Voeg profile toe
  const [clubsInBuurt, setClubsInBuurt] = useState<any[]>([])
  const [playerProvince, setPlayerProvince] = useState<string | null>(null)

  useEffect(() => {
    const fetchClubs = async () => {
      if (!user) return

      const { data: speler } = await supabase
        .from('profiles_player')
        .select('province')
        .eq('user_id', user.id)
        .single()

      if (!speler) return
      setPlayerProvince(speler.province)

      const { data: clubs } = await supabase
        .from('profiles_player')
        .select('user_id, display_name, bio, province, level, is_anonymous') // ← Voeg is_anonymous toe
        .eq('role', 'club')
        .eq('province', speler.province)
        .eq('visibility', true)
        .limit(5)

      setClubsInBuurt(clubs || [])
    }

    fetchClubs()
  }, [user])

  return (
    <div className="bg-[#1E293B]/60 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-[#F59E0B]">📍</span>
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
              className="block bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#F59E0B]/30 rounded-xl p-4 transition group"
            >
              <p className="font-semibold text-white group-hover:text-[#F59E0B] transition-colors truncate mb-1">
                {club.is_anonymous ? 'Anonieme club' : (club.display_name || 'Onbekende club')} {/* ← Fix hier */}
              </p>
              <p className="text-xs text-gray-400">{club.level || '-'}</p>
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                {club.bio || 'Geen beschrijving beschikbaar.'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

/* 🔸 Main Feed */
export default function HomePage() {
  const { user, profile } = useAuth()
  const [listings, setListings] = useState<any[]>([])
  const [loadingFeed, setLoadingFeed] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    province: '',
    level: '',
    positions: [] as string[], // Array voor meerdere posities
    available_from: '',
  })

  useEffect(() => {
    const fetchListings = async () => {
      const { data } = await supabase
        .from('listings')
        .select(`
          *,
          profiles_player:owner_user_id (display_name, is_anonymous, role)
        `)
        .order('created_at', { ascending: false })
      setListings(data || [])
      setLoadingFeed(false)
    }
    fetchListings()
  }, [])

  const handleChange = (e: any) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const togglePosition = (pos: string) => {
    setForm((prev) => {
      const exists = prev.positions.includes(pos)
      return {
        ...prev,
        positions: exists
          ? prev.positions.filter((p) => p !== pos)
          : [...prev.positions, pos],
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return setMessage('Je moet eerst inloggen.')
    
    // Validatie
    if (profile?.role === 'club' && form.positions.length === 0) {
      setMessage('❌ Selecteer minimaal 1 positie')
      return
    }
    if (profile?.role === 'speler' && form.positions.length === 0) {
      setMessage('❌ Selecteer minimaal 1 positie')
      return
    }

    setSaving(true)
    const type = profile?.role === 'club' ? 'club_zoekt_speler' : 'speler_zoekt_club'

    // In handleSubmit, wijzig naar:
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
        // Voor clubs: alle posities in positions_needed
        // Voor spelers: gebruik position en position_secondary
        ...(profile?.role === 'club' 
            ? { positions_needed: form.positions.join(', ') }
            : { 
                position: form.positions[0] || null,
                position_secondary: form.positions[1] || null 
            }
        ),
        available_from: form.available_from || null, // ← Fix hier: lege string wordt null
        },
    ])
    .select()
    if (!error && data) {
      const newListing = {
        ...data[0],
        profiles_player: {
          display_name: profile?.is_anonymous ? null : profile?.display_name || 'Onbekend',
          is_anonymous: profile?.is_anonymous ?? false,
          role: profile?.role,
        },
      }

      setListings((prev) => [newListing, ...prev])
      setShowModal(false)
      setForm({
        title: '',
        description: '',
        province: '',
        level: '',
        positions: [],
        available_from: '',
      })
      setMessage('✅ Bijdrage succesvol geplaatst!')
      setTimeout(() => setMessage(''), 3000)
    } else if (error) {
      setMessage(`❌ Er ging iets mis: ${error.message}`)
    }

    setSaving(false)
  }

  const allPositions = [
    'Doelman',
    'Rechtsachter',
    'Linksachter',
    'Centrale verdediger links',
    'Centrale verdediger rechts',
    'Centrale middenvelder links',
    'Centrale middenvelder rechts',
    'Aanvallende middenvelder',
    'Linksbuiten',
    'Rechtsbuiten',
    'Spits',
  ]

  return (
    <>
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] -z-10" />
      
      {/* Grid pattern overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] -z-10" />

      <main className="relative max-w-[1400px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-6">
          {/* Left Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <ProfileSidebar />
            </div>
          </aside>

          {/* Main Feed */}
          <div className="space-y-6">
            {/* Create Post Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setShowModal(true)}
              className="bg-[#1E293B]/60 backdrop-blur-sm border border-white/10 hover:border-white/20 rounded-2xl p-6 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white font-bold text-xl group-hover:scale-105 transition-transform">
                  {profile?.is_anonymous ? '?' : profile?.display_name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1">
                  <div className="bg-white/5 rounded-xl px-4 py-3 text-gray-400 group-hover:bg-white/10 transition">
                    Deel een bijdrage met de community...
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feed Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>📰</span>
                Tijdslijn
              </h1>
              <select className="bg-[#1E293B]/60 border border-white/10 rounded-lg px-4 py-2 text-sm text-white">
                <option>Nieuwste eerst</option>
                <option>Populair</option>
              </select>
            </div>

            {/* Loading */}
            {loadingFeed && (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F59E0B]"></div>
              </div>
            )}

            {/* Empty State */}
            {!loadingFeed && listings.length === 0 && (
              <div className="text-center py-20 bg-[#1E293B]/40 rounded-2xl border border-white/10">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-400 text-lg mb-2">Nog geen bijdragen</p>
                <p className="text-gray-500 text-sm">Wees de eerste die een bijdrage plaatst!</p>
              </div>
            )}

            {/* Feed Items */}
            <div className="space-y-6">
              {listings.map((l, i) => {
                // In de render van listings:
                const pos = l.type === 'club_zoekt_speler' && l.positions_needed
                ? l.positions_needed.split(',').map(p => p.trim()).filter(Boolean)
                : [l.position?.trim(), l.position_secondary?.trim()].filter(Boolean)
                const created = new Date(l.created_at)
                const diffMs = Date.now() - created.getTime()
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

                let timeAgo = ''
                if (diffDays <= 0) timeAgo = 'vandaag'
                else if (diffDays < 7) timeAgo = `${diffDays}d geleden`
                else timeAgo = created.toLocaleDateString('nl-BE')

                // Bepaal display name op basis van role
                const displayName = l.profiles_player?.is_anonymous
                  ? l.profiles_player?.role === 'club' 
                    ? 'Anonieme club' 
                    : 'Anonieme speler'
                  : l.profiles_player?.display_name || 'Onbekend'

                return (
                  <motion.article
                    key={l.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-[#1E293B]/60 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all"
                  >
                    {/* Post Header */}
                    <div className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <Link
                          href={l.profiles_player?.role === 'club' ? `/clubs/${l.owner_user_id}` : `/spelers/${l.owner_user_id}`}
                          className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white font-bold hover:scale-110 transition-transform"
                        >
                          {l.profiles_player?.is_anonymous
                            ? '?'
                            : l.profiles_player?.display_name?.[0]?.toUpperCase() || '?'}
                        </Link>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Link
                              href={l.profiles_player?.role === 'club' ? `/clubs/${l.owner_user_id}` : `/spelers/${l.owner_user_id}`}
                              className="font-bold text-white hover:text-[#F59E0B] transition truncate"
                            >
                              {displayName}
                            </Link>
                            <span className="text-gray-500">·</span>
                            <span className="text-sm text-gray-400">{timeAgo}</span>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${
                              l.type === 'club_zoekt_speler'
                                ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                                : 'bg-green-600/20 text-green-400'
                            }`}
                          >
                            {l.type === 'club_zoekt_speler' ? '🏢 Club zoekt' : '⚽ Speler zoekt'}
                          </span>
                        </div>

                        <button className="text-gray-400 hover:text-white transition">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>

                      {/* Post Content */}
                      <div className="mb-4">
                        <h2 className="text-xl font-bold text-white mb-2">{l.title}</h2>
                        <p className="text-gray-300 leading-relaxed">{l.description}</p>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-blue-400">📍</span>
                            <span className="text-xs text-blue-400/60">Provincie</span>
                          </div>
                          <p className="text-sm font-semibold text-white truncate">{l.province}</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-purple-400">🏆</span>
                            <span className="text-xs text-purple-400/60">Niveau</span>
                          </div>
                          <p className="text-sm font-semibold text-white truncate">{l.level}</p>
                        </div>

                        <div className="bg-gradient-to-br from-[#F59E0B]/10 to-[#D97706]/10 border border-[#F59E0B]/20 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[#F59E0B]">⚽</span>
                            <span className="text-xs text-[#F59E0B]/60">
                              {pos.length > 1 ? 'Posities' : 'Positie'}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-white truncate">
                            {pos.length > 0 ? `${pos.length} ${pos.length === 1 ? 'positie' : 'posities'}` : '-'}
                          </p>
                        </div>
                      </div>

                      {/* Extra posities als tags */}
                      {pos.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {pos.map((p) => (
                            <span key={p} className="inline-flex items-center gap-1.5 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-lg px-3 py-1 text-xs text-[#F59E0B]">
                              <span>⚽</span>
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Field Visualization */}
                    {pos.length > 0 && (
                      <div className="bg-[#0F172A]/50 border-t border-white/5 p-6">
                        <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
                          <span>⚽</span>
                          <span>{l.type === 'speler_zoekt_club' ? 'Posities:' : 'Gezochte posities:'}</span>
                        </div>
                        <div className="w-full h-[300px]">
                          <FootballFieldHorizontal positionsSelected={pos} />
                        </div>
                      </div>
                    )}

                    {/* Post Actions */}
                    <div className="border-t border-white/5 px-6 py-3 flex items-center gap-4 text-sm text-gray-400">
                      <button className="flex items-center gap-2 hover:text-[#F59E0B] transition">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>Interessant</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-[#F59E0B] transition">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>Reageer</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-[#F59E0B] transition ml-auto">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        <span>Deel</span>
                      </button>
                    </div>
                  </motion.article>
                )
              })}
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <ClubsSidebar />
            </div>
          </aside>
        </div>
      </main>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
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
              <div className="bg-[#0F172A] border border-white/20 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="border-b border-white/10 p-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Nieuwe bijdrage</h2>
                    <p className="text-sm text-gray-400 mt-1">
                      {profile?.role === 'club' 
                        ? 'Vertel welke spelers je zoekt voor je team' 
                        : 'Vertel waar je naar op zoek bent'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-white transition"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <input
                    name="title"
                    placeholder="Titel van je bijdrage..."
                    value={form.title}
                    onChange={handleChange}
                    required
                    className="bg-[#1E293B] border border-white/20 rounded-xl p-4 w-full text-white placeholder-gray-400 focus:ring-2 focus:ring-[#F59E0B] outline-none"
                  />

                  <textarea
                    name="description"
                    placeholder={profile?.role === 'club' 
                      ? 'Beschrijf welk type spelers je zoekt, wat je te bieden hebt...' 
                      : 'Vertel meer over jezelf en wat je zoekt...'}
                    value={form.description}
                    onChange={handleChange}
                    required
                    rows={4}
className="bg-[#1E293B] border border-white/20 rounded-xl p-4 w-full text-white placeholder-gray-400 focus:ring-2 focus:ring-[#F59E0B] outline-none resize-none"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <select
                      name="province"
                      value={form.province}
                      onChange={handleChange}
                      required
                      className="bg-[#1E293B] border border-white/20 rounded-xl p-4 w-full text-white focus:ring-2 focus:ring-[#F59E0B] outline-none"
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
                      className="bg-[#1E293B] border border-white/20 rounded-xl p-4 w-full text-white focus:ring-2 focus:ring-[#F59E0B] outline-none"
                    >
                      <option value="">Niveau</option>
                      <option>Recreatief / Vriendenploeg</option>
                      <option>4e Provinciale</option>
                      <option>3e Provinciale</option>
                      <option>2e Provinciale</option>
                      <option>1e Provinciale</option>
                      <option>3e Afdeling</option>
                      <option>2e Afdeling</option>
                      <option>1e Afdeling</option>
                    </select>
                  </div>

                  {/* Posities selectie */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      {profile?.role === 'club' 
                        ? 'Welke posities zoek je? (selecteer er minimaal 1)' 
                        : 'Op welke posities kan je spelen? (selecteer er minimaal 1)'}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {allPositions.map((pos) => {
                        const selected = form.positions.includes(pos)
                        return (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => togglePosition(pos)}
                            className={`rounded-lg border px-3 py-2 text-sm transition ${
                              selected
                                ? 'bg-[#F59E0B] text-white border-[#F59E0B]'
                                : 'bg-[#1E293B] text-gray-300 border-white/20 hover:bg-white/5'
                            }`}
                          >
                            {pos}
                          </button>
                        )
                      })}
                    </div>
                    {form.positions.length > 0 && (
                      <p className="text-xs text-gray-400 mt-2">
                        {form.positions.length} {form.positions.length === 1 ? 'positie' : 'posities'} geselecteerd
                      </p>
                    )}
                  </div>

                  {profile?.role === 'speler' && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Beschikbaar vanaf (optioneel)</label>
                      <input
                        type="date"
                        name="available_from"
                        value={form.available_from}
                        onChange={handleChange}
                        className="bg-[#1E293B] border border-white/20 rounded-xl p-4 w-full text-white focus:ring-2 focus:ring-[#F59E0B] outline-none"
                      />
                    </div>
                  )}

                  {message && (
                    <div className={`p-4 rounded-xl ${message.includes('✅') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {message}
                    </div>
                  )}

                  {/* Modal Footer */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-3 border border-white/20 rounded-xl hover:bg-white/5 transition text-white font-medium"
                    >
                      Annuleren
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold hover:shadow-lg hover:shadow-[#F59E0B]/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Plaatsen...
                        </span>
                      ) : (
                        'Plaatsen'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}