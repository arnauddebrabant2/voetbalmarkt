'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X } from 'lucide-react'

interface Liker {
  user_id: string
  created_at: string
  display_name?: string | null
  is_anonymous?: boolean
  role?: string
}

interface LikersModalProps {
  listingId: string
  isOpen: boolean
  onClose: () => void
}

export default function LikersModal({ listingId, isOpen, onClose }: LikersModalProps) {
  const [likers, setLikers] = useState<Liker[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isOpen || !listingId) return

    const fetchLikers = async () => {
      setLoading(true)
      
      // Eerst haal likes op
      const { data: likesData, error: likesError } = await supabase
        .from('likes')
        .select('user_id, created_at')
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false })

      if (likesError) {
        console.error('Error fetching likes:', likesError)
        setLoading(false)
        return
      }

      if (!likesData || likesData.length === 0) {
        setLikers([])
        setLoading(false)
        return
      }

      // Haal user IDs op
      const userIds = likesData.map(like => like.user_id)

      // Haal profile data op voor deze users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles_player')
        .select('user_id, display_name, is_anonymous, role')
        .in('user_id', userIds)

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
      }

      // Combineer de data
      const likersWithProfiles = likesData.map(like => {
        const profile = profilesData?.find(p => p.user_id === like.user_id)
        return {
          user_id: like.user_id,
          created_at: like.created_at,
          display_name: profile?.display_name || null,
          is_anonymous: profile?.is_anonymous || false,
          role: profile?.role || 'speler'
        }
      })

      setLikers(likersWithProfiles)
      setLoading(false)
    }

    fetchLikers()
  }, [listingId, isOpen])

  if (!isOpen) return null

  const getDisplayName = (liker: Liker) => {
    if (liker.is_anonymous) {
      return liker.role === 'club' ? 'Anonieme club' : 'Anonieme speler'
    }
    return liker.display_name || 'Onbekend'
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const diffMs = Date.now() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'zojuist'
    if (diffMins < 60) return `${diffMins}m geleden`
    if (diffHours < 24) return `${diffHours}u geleden`
    if (diffDays < 7) return `${diffDays}d geleden`
    return date.toLocaleDateString('nl-BE')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#1E293B] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-[#F59E0B]">❤️</span>
                  Interessant gevonden door
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition p-2 hover:bg-white/5 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(80vh-88px)]">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F59E0B]"></div>
                  </div>
                ) : likers.length === 0 ? (
                  <div className="text-center py-12 px-6">
                    <div className="text-4xl mb-3">💔</div>
                    <p className="text-gray-400">Nog niemand heeft dit interessant gevonden</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {likers.map((liker) => {
                      const displayName = getDisplayName(liker)
                      const isAnonymous = liker.is_anonymous
                      const role = liker.role

                      return (
                        <Link
                          key={liker.user_id}
                          href={role === 'club' ? `/clubs/${liker.user_id}` : `/spelers/${liker.user_id}`}
                          className="flex items-center gap-4 p-4 hover:bg-white/5 transition group"
                        >
                          {/* Avatar */}
                          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white font-bold text-lg group-hover:scale-110 transition-transform">
                            {isAnonymous ? '?' : displayName.charAt(0).toUpperCase()}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold truncate group-hover:text-[#F59E0B] transition">
                              {displayName}
                            </p>
                            <p className="text-sm text-gray-400">
                              {role === 'club' ? '🏢 Club' : '⚽ Speler'}
                              {' · '}
                              {getTimeAgo(liker.created_at)}
                            </p>
                          </div>

                          {/* Heart Icon */}
                          <div className="flex-shrink-0 text-[#F59E0B]">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}