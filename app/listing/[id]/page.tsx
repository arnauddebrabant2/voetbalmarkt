'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/ui/AuthProvider'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Trophy, Calendar } from 'lucide-react'
import { FootballFieldHorizontal } from '@/components/ui/FootballFieldHorizontal'
import { CommentsSection } from '@/components/ui/CommentsSection'
import ShareModal from '@/components/ui/ShareModal'

export default function ListingDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const listingId = params.id as string

  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [commentCount, setCommentCount] = useState(0)
  const [showShareModal, setShowShareModal] = useState(false)

  useEffect(() => {
    const fetchListing = async () => {
      const { data, error } = await supabase
        .from('listings')
        .select(`*, profiles_player:owner_user_id (display_name, is_anonymous, role)`)
        .eq('id', listingId)
        .single()

      if (error) {
        console.error('Error fetching listing:', error)
        setLoading(false)
        return
      }

      setListing(data)
      setLoading(false)
    }

    fetchListing()
  }, [listingId])

  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!user || !listingId) return
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('listing_id', listingId)
        .eq('user_id', user.id)
        .single()
      setIsLiked(!!data)
    }
    fetchLikeStatus()
  }, [user, listingId])

  useEffect(() => {
    const fetchLikeCount = async () => {
      if (!listingId) return
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact' })
        .eq('listing_id', listingId)
      setLikeCount(count || 0)
    }
    fetchLikeCount()
  }, [listingId])

  useEffect(() => {
    const fetchCommentCount = async () => {
      if (!listingId) return
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact' })
        .eq('listing_id', listingId)
      setCommentCount(count || 0)
    }
    fetchCommentCount()
  }, [listingId])

  const toggleLike = async () => {
    if (!user) { alert('Je moet ingelogd zijn om te liken'); return }

    if (isLiked) {
      await supabase.from('likes').delete().eq('listing_id', listingId).eq('user_id', user.id)
      setIsLiked(false)
      setLikeCount(prev => Math.max(prev - 1, 0))
    } else {
      await supabase.from('likes').insert({ listing_id: listingId, user_id: user.id })
      setIsLiked(true)
      setLikeCount(prev => prev + 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F59E0B]"></div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Post niet gevonden</p>
          <Link href="/" className="text-[#F59E0B] hover:underline">Terug naar homepage</Link>
        </div>
      </div>
    )
  }

  const pos = listing.type === 'club_zoekt_speler' && listing.positions_needed
    ? listing.positions_needed.split(',').map((p: string) => p.trim()).filter(Boolean)
    : [listing.position?.trim(), listing.position_secondary?.trim()].filter(Boolean)

  const created = new Date(listing.created_at)
  const displayName = listing.profiles_player?.is_anonymous
    ? listing.profiles_player?.role === 'club' ? 'Anonieme club' : 'Anonieme speler'
    : listing.profiles_player?.display_name || 'Onbekend'

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span>Terug naar tijdlijn</span>
        </Link>

        {/* Main Card */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1E293B]/60 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
        >
          {/* Post Header */}
          <div className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <Link
                href={listing.profiles_player?.role === 'club' ? `/clubs/${listing.owner_user_id}` : `/spelers/${listing.owner_user_id}`}
                className="flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white font-bold text-xl hover:scale-110 transition-transform"
              >
                {listing.profiles_player?.is_anonymous ? '?' : listing.profiles_player?.display_name?.[0]?.toUpperCase() || '?'}
              </Link>

              <div className="flex-1">
                <Link
                  href={listing.profiles_player?.role === 'club' ? `/clubs/${listing.owner_user_id}` : `/spelers/${listing.owner_user_id}`}
                  className="font-bold text-white text-lg hover:text-[#F59E0B] transition"
                >
                  {displayName}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${
                    listing.type === 'club_zoekt_speler' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' : 'bg-green-600/20 text-green-400'
                  }`}>
                    {listing.type === 'club_zoekt_speler' ? '🏢 Club zoekt' : '⚽ Speler zoekt'}
                  </span>
                  <span className="text-sm text-gray-400">
                    {created.toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-4">{listing.title}</h1>
              <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">{listing.description}</p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-blue-400/60">Provincie</span>
                </div>
                <p className="text-lg font-semibold text-white">{listing.province}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-purple-400/60">Niveau</span>
                </div>
                <p className="text-lg font-semibold text-white">{listing.level}</p>
              </div>

              {listing.available_from && (
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-green-400/60">Beschikbaar vanaf</span>
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {new Date(listing.available_from).toLocaleDateString('nl-BE')}
                  </p>
                </div>
              )}
            </div>

            {/* Positions */}
            {pos.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  {listing.type === 'speler_zoekt_club' ? 'Posities' : 'Gezochte posities'}
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {pos.map((p: string) => (
                    <span key={p} className="inline-flex items-center gap-1.5 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-lg px-4 py-2 text-sm text-[#F59E0B] font-medium">
                      <span>⚽</span>{p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Field Visualization */}
          {pos.length > 0 && (
            <div className="bg-[#0F172A]/50 border-t border-white/5 p-6">
              <div className="w-full h-[400px]">
                <FootballFieldHorizontal positionsSelected={pos} />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="border-t border-white/5 px-6 py-4 flex items-center gap-6 text-sm text-gray-400">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-2 transition ${isLiked ? 'text-[#F59E0B]' : 'hover:text-[#F59E0B]'}`}
            >
              <svg className="w-6 h-6" fill={isLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="font-medium">{likeCount > 0 ? `${likeCount} Interessant` : 'Interessant'}</span>
            </button>

            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="font-medium">{commentCount} {commentCount === 1 ? 'Reactie' : 'Reacties'}</span>
            </div>

            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 hover:text-[#F59E0B] transition ml-auto"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="font-medium">Deel</span>
            </button>
          </div>

          {/* Comments Section */}
          <div className="border-t border-white/10 p-6 bg-[#0F172A]/30">
            <CommentsSection listingId={listingId}/>
          </div>
        </motion.article>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        listing={listing}
      />
    </div>
  )
}