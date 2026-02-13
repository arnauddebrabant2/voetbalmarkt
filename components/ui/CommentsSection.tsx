/* 🔹 Comments Section Component - Alternative versie zonder join */
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/ui/AuthProvider'
import Link from 'next/link'

interface Comment {
  id: string
  listing_id: string
  user_id: string
  content: string
  created_at: string
}

interface CommentWithProfile extends Comment {
  profile?: {
    display_name: string | null
    is_anonymous: boolean
    role: string
  }
}

interface CommentsSectionProps {
  listingId: string
}

export function CommentsSection({ listingId }: CommentsSectionProps) {
  const { user, profile } = useAuth()
  const [comments, setComments] = useState<CommentWithProfile[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchComments()
  }, [listingId])

  const fetchComments = async () => {
    console.log('🔍 Fetching comments for listing:', listingId)
    setLoading(true)
    setError(null)
    
    try {
      // Haal eerst de comments op ZONDER join
      const { data: commentsData, error: fetchError } = await supabase
        .from('comments')
        .select('*')
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('❌ Error fetching comments:', fetchError)
        setError(`Fout bij ophalen: ${fetchError.message}`)
        setComments([])
        setLoading(false)
        return
      }

      console.log('✅ Comments fetched:', commentsData?.length || 0)

      if (!commentsData || commentsData.length === 0) {
        setComments([])
        setLoading(false)
        return
      }

      // Haal nu de profielen op voor alle user_ids
      const userIds = [...new Set(commentsData.map(c => c.user_id))]
      console.log('📥 Fetching profiles for', userIds.length, 'users')

      const { data: profilesData, error: profileError } = await supabase
        .from('profiles_player')
        .select('user_id, display_name, is_anonymous, role')
        .in('user_id', userIds)

      if (profileError) {
        console.error('⚠️ Error fetching profiles:', profileError)
        // Ga door zonder profielen
      }

      console.log('✅ Profiles fetched:', profilesData?.length || 0)

      // Combineer comments met profielen
      const profileMap = new Map(
        profilesData?.map(p => [p.user_id, p]) || []
      )

      const commentsWithProfiles: CommentWithProfile[] = commentsData.map(comment => ({
        ...comment,
        profile: profileMap.get(comment.user_id)
      }))

      setComments(commentsWithProfiles)
    } catch (err) {
      console.error('❌ Unexpected error:', err)
      setError('Onverwachte fout bij ophalen van reacties')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert('Je moet ingelogd zijn om te reageren')
      return
    }
    
    if (!newComment.trim()) {
      alert('Reactie mag niet leeg zijn')
      return
    }

    console.log('📤 Submitting comment...')
    console.log('User ID:', user.id)
    console.log('Listing ID:', listingId)
    console.log('Content:', newComment.trim())

    setSubmitting(true)
    setError(null)

    try {
      const commentData = {
        listing_id: listingId,
        user_id: user.id,
        content: newComment.trim(),
      }

      // Insert ZONDER .select() met join
      const { data, error: insertError } = await supabase
        .from('comments')
        .insert([commentData])
        .select()
        .single()

      if (insertError) {
        console.error('❌ Error inserting comment:', insertError)
        console.error('Error details:', JSON.stringify(insertError, null, 2))
        setError(`Fout bij plaatsen: ${insertError.message}`)
        alert(`Fout bij plaatsen: ${insertError.message}`)
      } else if (data) {
        console.log('✅ Comment inserted successfully:', data)
        
        // Haal het profiel op van de huidige user
        const { data: userProfile } = await supabase
          .from('profiles_player')
          .select('user_id, display_name, is_anonymous, role')
          .eq('user_id', user.id)
          .single()

        // Voeg de nieuwe comment toe met profiel info
        const newCommentWithProfile: CommentWithProfile = {
          ...data,
          profile: userProfile || undefined
        }

        setComments([newCommentWithProfile, ...comments])
        setNewComment('')
        
        // Success feedback (alleen in console)
        console.log('✅ Comment added to UI')
      }
    } catch (err) {
      console.error('❌ Unexpected error:', err)
      setError('Onverwachte fout bij plaatsen van reactie')
      alert('Er ging iets mis. Check de console voor details.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Weet je zeker dat je deze reactie wilt verwijderen?')) return

    console.log('🗑️ Deleting comment:', commentId)

    try {
      const { error: deleteError } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user?.id)

      if (deleteError) {
        console.error('❌ Error deleting comment:', deleteError)
        alert(`Fout bij verwijderen: ${deleteError.message}`)
      } else {
        console.log('✅ Comment deleted')
        setComments(comments.filter((c) => c.id !== commentId))
      }
    } catch (err) {
      console.error('❌ Unexpected error:', err)
      alert('Er ging iets mis bij het verwijderen')
    }
  }

  const getTimeAgo = (dateString: string) => {
    // Parse de ISO datetime string correct
    // Supabase geeft timestamps in UTC, we moeten ze correct parsen
    const date = new Date(dateString)
    const now = new Date()
    
    // Check of de datum geldig is
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateString)
      return 'onbekend'
    }
    
    const diffMs = now.getTime() - date.getTime()
    
    // Debug logging (verwijder later als alles werkt)
    console.log('Date comparison:', {
      created: date.toISOString(),
      now: now.toISOString(),
      diffMs,
      diffMins: Math.floor(diffMs / 60000)
    })
    
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    // Als diffMs negatief is, ligt de datum in de toekomst (probleem!)
    if (diffMs < 0) {
      console.error('Date is in the future!', dateString)
      return 'zojuist'
    }

    if (diffSecs < 10) return 'zojuist'
    if (diffSecs < 60) return `${diffSecs}s geleden`
    if (diffMins < 60) return `${diffMins}m geleden`
    if (diffHours < 24) return `${diffHours}u geleden`
    if (diffDays < 7) return `${diffDays}d geleden`
    return date.toLocaleDateString('nl-BE')
  }

  const displayedComments = showAll ? comments : comments.slice(0, 3)

  return (
    <div className="border-t border-white/5 bg-[#0F172A]/30">
      {/* Debug Info */}
      {error && (
        <div className="p-4 bg-red-500/10 border-b border-red-500/20">
          <p className="text-red-400 text-sm">⚠️ {error}</p>
        </div>
      )}

      {/* Comment Input */}
      {user ? (
        <div className="p-6 border-b border-white/5">
          <form onSubmit={handleSubmitComment} className="flex gap-3">
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white font-bold text-sm">
              {profile?.is_anonymous ? '?' : profile?.display_name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Schrijf een reactie..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent outline-none transition"
                disabled={submitting}
              />
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="px-6 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Plaatsen...' : 'Plaatsen'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="p-6 border-b border-white/5">
          <p className="text-gray-400 text-sm text-center">
            Je moet <Link href="/login" className="text-[#F59E0B] hover:underline">ingelogd</Link> zijn om te reageren
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F59E0B] mx-auto"></div>
            <p className="text-gray-400 text-sm mt-2">Reacties laden...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">Nog geen reacties. Wees de eerste!</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {displayedComments.map((comment) => {
                const displayName = comment.profile?.is_anonymous
                  ? comment.profile?.role === 'club'
                    ? 'Anonieme club'
                    : 'Anonieme speler'
                  : comment.profile?.display_name || 'Onbekend'

                const profileRole = comment.profile?.role || 'speler'

                return (
                  <div key={comment.id} className="flex gap-3 group">
                    <Link
                      href={
                        profileRole === 'club'
                          ? `/clubs/${comment.user_id}`
                          : `/spelers/${comment.user_id}`
                      }
                      className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm hover:scale-110 transition-transform"
                    >
                      {comment.profile?.is_anonymous
                        ? '?'
                        : comment.profile?.display_name?.[0]?.toUpperCase() || '?'}
                    </Link>

                    <div className="flex-1 bg-white/5 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={
                              profileRole === 'club'
                                ? `/clubs/${comment.user_id}`
                                : `/spelers/${comment.user_id}`
                            }
                            className="font-semibold text-white hover:text-[#F59E0B] transition"
                          >
                            {displayName}
                          </Link>
                          <span className="text-gray-500">·</span>
                          <span className="text-xs text-gray-400">
                            {getTimeAgo(comment.created_at)}
                          </span>
                        </div>

                        {user?.id === comment.user_id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition text-sm"
                            title="Verwijder reactie"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>

                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {comments.length > 3 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="mt-4 text-sm text-[#F59E0B] hover:text-[#D97706] font-semibold transition"
              >
                {showAll
                  ? 'Minder reacties tonen'
                  : `Bekijk alle ${comments.length} reacties`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}