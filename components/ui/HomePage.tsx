'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/ui/AuthProvider'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { FootballFieldHorizontal } from '@/components/ui/FootballFieldHorizontal'
import LikersModal from '@/components/ui/LikersModal'
import { CommentsSection } from '@/components/ui/CommentsSection'


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
  const { user, profile } = useAuth()
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
        .select('user_id, display_name, bio, province, level, is_anonymous')
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
                {club.is_anonymous ? 'Anonieme club' : (club.display_name || 'Onbekende club')}
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
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [likeCounts, setLikeCounts] = useState<{ [key: string]: number }>({})
  const [showLikersModal, setShowLikersModal] = useState(false)
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'newest' | 'popular'>('newest')
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())

  const [form, setForm] = useState({
    title: '',
    description: '',
    province: '',
    level: '',
    positions: [] as string[],
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

  useEffect(() => {
    const fetchUserLikes = async () => {
      if (!user) return
      
      const { data } = await supabase
        .from('likes')
        .select('listing_id')
        .eq('user_id', user.id)
      
      if (data) {
        const likedIds = new Set(data.map(like => like.listing_id))
        setLikedPosts(likedIds)
      }
    }
    
    fetchUserLikes()
  }, [user])

  useEffect(() => {
    const fetchLikeCounts = async () => {
      const listingIds = listings.map(l => l.id)
      if (listingIds.length === 0) return

      const { data } = await supabase
        .from('likes')
        .select('listing_id')
        
      if (data) {
        const counts: { [key: string]: number } = {}
        data.forEach(like => {
          counts[like.listing_id] = (counts[like.listing_id] || 0) + 1
        })
        setLikeCounts(counts)
      }
    }
    
    if (listings.length > 0) {
      fetchLikeCounts()
    }
  }, [listings])

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

  const toggleLike = async (listingId: string) => {
    if (!user) {
      alert('Je moet ingelogd zijn om te liken')
      return
    }

    const isLiked = likedPosts.has(listingId)
    const newLikedPosts = new Set(likedPosts)
    const newLikeCounts = { ...likeCounts }

    if (isLiked) {
      newLikedPosts.delete(listingId)
      newLikeCounts[listingId] = Math.max((newLikeCounts[listingId] || 1) - 1, 0)
      
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('listing_id', listingId)
        .eq('user_id', user.id)
        
      if (error) {
        console.error('Unlike error:', error)
        return
      }
    } else {
      newLikedPosts.add(listingId)
      newLikeCounts[listingId] = (newLikeCounts[listingId] || 0) + 1
      
      const { error } = await supabase
        .from('likes')
        .insert({ listing_id: listingId, user_id: user.id })
        
      if (error) {
        console.error('Like error:', error)
        return
      }
    }

    setLikedPosts(newLikedPosts)
    setLikeCounts(newLikeCounts)
  }

  const openLikersModal = (listingId: string) => {
    setSelectedListingId(listingId)
    setShowLikersModal(true)
  }

  const closeLikersModal = () => {
    setShowLikersModal(false)
    setSelectedListingId(null)
  }

  const toggleComments = (listingId: string) => {
    const newExpanded = new Set(expandedComments)
    if (newExpanded.has(listingId)) {
      newExpanded.delete(listingId)
    } else {
      newExpanded.add(listingId)
    }
    setExpandedComments(newExpanded)
  }

  const getSortedListings = () => {
    if (sortOrder === 'popular') {
      return [...listings].sort((a, b) => {
        const likesA = likeCounts[a.id] || 0
        const likesB = likeCounts[b.id] || 0
        return likesB - likesA
      })
    }
    return listings
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return setMessage('Je moet eerst inloggen.')
    
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
          ...(profile?.role === 'club' 
            ? { positions_needed: form.positions.join(', ') }
            : { 
                position: form.positions[0] || null,
                position_secondary: form.positions[1] || null 
              }
          ),
          available_from: form.available_from || null,
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
      <div className="fixed inset-0 bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] -z-10" />
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
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'popular')}
                className="bg-[#1E293B]/60 border border-white/10 rounded-lg px-4 py-2 text-sm text-white cursor-pointer hover:border-white/20 transition focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
              >
                <option value="newest">Nieuwste eerst</option>
                <option value="popular">Populair</option>
              </select>
            </div>

            {loadingFeed && (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F59E0B]"></div>
              </div>
            )}

            {!loadingFeed && listings.length === 0 && (
              <div className="text-center py-20 bg-[#1E293B]/40 rounded-2xl border border-white/10">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-400 text-lg mb-2">Nog geen bijdragen</p>
                <p className="text-gray-500 text-sm">Wees de eerste die een bijdrage plaatst!</p>
              </div>
            )}

            {/* Feed Items */}
            <div className="space-y-6">
              {getSortedListings().map((l, i) => {
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
                      <button 
                        onClick={() => toggleLike(l.id)}
                        className={`flex items-center gap-2 transition ${
                          likedPosts.has(l.id) 
                            ? 'text-[#F59E0B]' 
                            : 'text-gray-400 hover:text-[#F59E0B]'
                        }`}
                      >
                        <svg 
                          className="w-5 h-5" 
                          fill={likedPosts.has(l.id) ? 'currentColor' : 'none'}
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                          />
                        </svg>
                        <span className="flex items-center gap-1">
                          {likeCounts[l.id] > 0 ? (
                            <>
                              <span
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openLikersModal(l.id)
                                }}
                                className="hover:underline font-semibold cursor-pointer"
                              >
                                {likeCounts[l.id]}
                              </span>
                              <span>Interessant</span>
                            </>
                          ) : (
                            'Interessant'
                          )}
                        </span>
                      </button>
                      
                      <button 
                        onClick={() => toggleComments(l.id)}
                        className="flex items-center gap-2 hover:text-[#F59E0B] transition"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>
                          {l.comment_count > 0 ? `${l.comment_count} ${l.comment_count === 1 ? 'Reactie' : 'Reacties'}` : 'Reageer'}
                        </span>
                      </button>
                      
                      <button className="flex items-center gap-2 hover:text-[#F59E0B] transition ml-auto">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        <span>Deel</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    <AnimatePresence>
                      {expandedComments.has(l.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CommentsSection listingId={l.id} />
                        </motion.div>
                      )}
                    </AnimatePresence>
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
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
            />
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <div className="relative bg-gradient-to-b from-[#1E293B] to-[#0F172A] border border-white/10 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#F59E0B]/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative border-b border-white/10 p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white font-bold text-xl shadow-lg">
                      {profile?.is_anonymous ? '?' : profile?.display_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white">Nieuwe bijdrage</h2>
                      <p className="text-sm text-gray-400 mt-1">
                        {profile?.role === 'club' 
                          ? 'Vertel welke spelers je zoekt voor je team' 
                          : 'Deel wat je zoekt met de community'}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowModal(false)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="relative overflow-y-auto max-h-[calc(90vh-180px)]">
                  <div className="p-6 space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                        <span className="text-[#F59E0B]">✏️</span>
                        Titel
                      </label>
                      <input
                        name="title"
                        placeholder="Geef je bijdrage een pakkende titel..."
                        value={form.title}
                        onChange={handleChange}
                        required
                        className="bg-white/5 border border-white/10 rounded-xl p-4 w-full text-white placeholder-gray-500 focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent outline-none transition"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                        <span className="text-[#F59E0B]">📝</span>
                        Beschrijving
                      </label>
                      <textarea
                        name="description"
                        placeholder={profile?.role === 'club' 
                          ? 'Beschrijf welk type spelers je zoekt, wat je te bieden hebt, trainingstijden...' 
                          : 'Vertel over jezelf, je ervaring, wat je zoekt in een club...'}
                        value={form.description}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="bg-white/5 border border-white/10 rounded-xl p-4 w-full text-white placeholder-gray-500 focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent outline-none resize-none transition"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                          <span className="text-blue-400">📍</span>
                          Provincie
                        </label>
                        <select
                          name="province"
                          value={form.province}
                          onChange={handleChange}
                          required
                          className="bg-white/5 border border-white/10 rounded-xl p-4 w-full text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-[#1E293B]">Selecteer provincie...</option>
                          <option className="bg-[#1E293B]">Antwerpen</option>
                          <option className="bg-[#1E293B]">Limburg</option>
                          <option className="bg-[#1E293B]">Oost-Vlaanderen</option>
                          <option className="bg-[#1E293B]">West-Vlaanderen</option>
                          <option className="bg-[#1E293B]">Vlaams-Brabant</option>
                          <option className="bg-[#1E293B]">Brussel</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                          <span className="text-purple-400">🏆</span>
                          Niveau
                        </label>
                        <select
                          name="level"
                          value={form.level}
                          onChange={handleChange}
                          required
                          className="bg-white/5 border border-white/10 rounded-xl p-4 w-full text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-[#1E293B]">Selecteer niveau...</option>
                          <option className="bg-[#1E293B]">Recreatief / Vriendenploeg</option>
                          <option className="bg-[#1E293B]">4e Provinciale</option>
                          <option className="bg-[#1E293B]">3e Provinciale</option>
                          <option className="bg-[#1E293B]">2e Provinciale</option>
                          <option className="bg-[#1E293B]">1e Provinciale</option>
                          <option className="bg-[#1E293B]">3e Afdeling</option>
                          <option className="bg-[#1E293B]">2e Afdeling</option>
                          <option className="bg-[#1E293B]">1e Afdeling</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                          <span className="text-[#F59E0B]">⚽</span>
                          {profile?.role === 'club' 
                            ? 'Welke posities zoek je?' 
                            : 'Op welke posities kan je spelen?'}
                        </label>
                        {form.positions.length > 0 && (
                          <span className="text-xs bg-[#F59E0B]/20 text-[#F59E0B] px-3 py-1 rounded-full">
                            {form.positions.length} geselecteerd
                          </span>
                        )}
                      </div>
                      
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {allPositions.map((pos) => {
                            const selected = form.positions.includes(pos)
                            return (
                              <button
                                key={pos}
                                type="button"
                                onClick={() => togglePosition(pos)}
                                className={`relative rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                                  selected
                                    ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white'
                                    : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                                }`}
                              >
                                {selected && (
                                  <span className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full" />
                                )}
                                {pos}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {profile?.role === 'speler' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                          <span className="text-green-400">📅</span>
                          Beschikbaar vanaf (optioneel)
                        </label>
                        <input
                          type="date"
                          name="available_from"
                          value={form.available_from}
                          onChange={handleChange}
                          className="bg-white/5 border border-white/10 rounded-xl p-4 w-full text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                        />
                      </div>
                    )}

                    {message && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl flex items-center gap-3 ${
                          message.includes('✅') 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        <span className="text-xl">{message.includes('✅') ? '✅' : '❌'}</span>
                        <span className="flex-1">{message.replace(/✅|❌/g, '').trim()}</span>
                      </motion.div>
                    )}
                  </div>

                  <div className="sticky bottom-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A] to-transparent border-t border-white/10 p-6">
                    <div className="flex items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-6 py-3 rounded-xl border border-white/20 hover:bg-white/5 transition text-white font-medium"
                      >
                        Annuleren
                      </button>
                      
                      <button
                        type="submit"
                        disabled={saving || form.positions.length === 0}
                        className="flex-1 max-w-xs px-6 py-3 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-bold hover:shadow-xl hover:shadow-[#F59E0B]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                      >
                        {saving ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Plaatsen...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <span>Plaatsen</span>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Likers Modal */}
      {selectedListingId && (
        <LikersModal
          listingId={selectedListingId}
          isOpen={showLikersModal}
          onClose={closeLikersModal}
        />
      )}
    </>
  )
}