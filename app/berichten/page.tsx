'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useAuth } from '@/components/ui/AuthProvider'
import { supabase } from '@/lib/supabaseClient'
import { useSearchParams, useRouter } from 'next/navigation'
import { Send, ArrowLeft, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface Conversation {
  id: string
  user1_id: string
  user2_id: string
  updated_at: string
  last_message: string | null
  other_user: {
    user_id: string
    display_name: string | null
    is_anonymous: boolean
    role: string
  } | null
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  read: boolean
}

// ✅ FIX: useSearchParams in apart component
function BerichtenContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedConversationId = searchParams.get('conversation')

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const selectedConversation = conversations.find(c => c.id === selectedConversationId)

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp + 'Z')
    return date.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!user) return

    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false })

      if (error) { console.error('Error fetching conversations:', error); return }

      const conversationsWithUsers = await Promise.all(
        (data || []).map(async (conv) => {
          const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id
          const { data: profileData } = await supabase
            .from('profiles_player')
            .select('user_id, display_name, is_anonymous, role')
            .eq('user_id', otherUserId)
            .single()
          return { ...conv, other_user: profileData }
        })
      )

      setConversations(conversationsWithUsers)
      setLoading(false)
    }

    fetchConversations()
  }, [user])

  useEffect(() => {
    if (!selectedConversationId || !user) return

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversationId)
        .order('created_at', { ascending: true })

      if (error) { console.error('Error fetching messages:', error); return }

      setMessages(data || [])

      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', selectedConversationId)
        .eq('sender_id', selectedConversation?.other_user?.user_id || '')
        .eq('read', false)
    }

    fetchMessages()

    const channel = supabase
      .channel(`messages:${selectedConversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${selectedConversationId}`
      }, (payload) => {
        setMessages((current) => [...current, payload.new as Message])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [selectedConversationId, user, selectedConversation])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversationId || !user) return

    setSending(true)
    const { error } = await supabase.from('messages').insert({
      conversation_id: selectedConversationId,
      sender_id: user.id,
      content: newMessage.trim()
    })

    if (error) { console.error('Error sending message:', error); alert('Kon bericht niet versturen') }
    else setNewMessage('')

    setSending(false)
  }

  const getDisplayName = (conv: Conversation) => {
    if (!conv.other_user) return 'Onbekend'
    if (conv.other_user.is_anonymous) return conv.other_user.role === 'club' ? 'Anonieme club' : 'Anonieme speler'
    return conv.other_user.display_name || 'Onbekend'
  }

  const getAvatar = (conv: Conversation) => {
    const name = getDisplayName(conv)
    if (conv.other_user?.is_anonymous) return '?'
    return name.charAt(0).toUpperCase()
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const diffMs = Date.now() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffMins < 1) return 'zojuist'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}u`
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] flex items-center justify-center">
        <p className="text-white">Je moet ingelogd zijn om berichten te bekijken</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F59E0B]"></div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-112px)] bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A]">
      <div className="h-full">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">

          {/* Conversations List */}
          <div className={`${selectedConversationId ? 'hidden md:block' : 'block'} border-r border-white/10 bg-[#1E293B]/40 flex flex-col h-full`}>
            <div className="p-6 border-b border-white/10 flex-shrink-0">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-[#F59E0B]" />
                Berichten
              </h1>
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-gray-400">Nog geen gesprekken</p>
                  <p className="text-sm text-gray-500 mt-2">Start een gesprek door een bericht te sturen naar een speler of club</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => router.push(`/berichten?conversation=${conv.id}`)}
                      className={`w-full p-4 hover:bg-white/5 transition text-left ${selectedConversationId === conv.id ? 'bg-white/10' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {getAvatar(conv)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-white truncate">{getDisplayName(conv)}</p>
                            <span className="text-xs text-gray-400">{formatTime(conv.updated_at)}</span>
                          </div>
                          <p className="text-sm text-gray-400 truncate">{conv.last_message || 'Nog geen berichten'}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${selectedConversationId ? 'block' : 'hidden md:block'} md:col-span-2 flex flex-col`}>
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-white/10 bg-[#1E293B]/60 backdrop-blur-sm flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/berichten')} className="md:hidden p-2 hover:bg-white/10 rounded-lg transition">
                      <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center text-white font-bold">
                      {getAvatar(selectedConversation)}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{getDisplayName(selectedConversation)}</p>
                      <p className="text-xs text-gray-400">{selectedConversation.other_user?.role === 'club' ? '🏢 Club' : '⚽ Speler'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="text-6xl mb-4">👋</div>
                        <p className="text-gray-400">Start het gesprek!</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg) => {
                        const isOwn = msg.sender_id === user.id
                        return (
                          <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isOwn ? 'bg-[#F59E0B] text-white' : 'bg-white/10 text-white'}`}>
                              <p className="break-words">{msg.content}</p>
                              <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
                                {formatMessageTime(msg.created_at)}
                              </p>
                            </div>
                          </motion.div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-[#1E293B]/60 flex-shrink-0">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Typ een bericht..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent outline-none"
                    />
                    <button type="submit" disabled={!newMessage.trim() || sending}
                      className="px-6 py-3 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                      <Send className="w-5 h-5" />
                      <span className="hidden sm:inline">Verstuur</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="hidden md:flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-gray-400 text-lg">Selecteer een gesprek</p>
                  <p className="text-sm text-gray-500 mt-2">Kies een gesprek om te beginnen met chatten</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ✅ FIX: Suspense wrapper rond het component dat useSearchParams gebruikt
export default function BerichtenPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F59E0B]"></div>
      </div>
    }>
      <BerichtenContent />
    </Suspense>
  )
}