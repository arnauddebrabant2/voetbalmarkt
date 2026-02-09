'use client'

import { useState } from 'react'
import { useAuth } from '@/components/ui/AuthProvider'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { MessageCircle } from 'lucide-react'

interface ChatButtonProps {
  recipientId: string
  recipientName: string
}

export default function ChatButton({ recipientId, recipientName }: ChatButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleStartChat = async () => {
    if (!user) {
      alert('Je moet ingelogd zijn om te chatten')
      return
    }

    if (user.id === recipientId) {
      alert('Je kunt niet met jezelf chatten')
      return
    }

    setLoading(true)

    try {
      // Roep de get_or_create_conversation functie aan
      const { data, error } = await supabase.rpc('get_or_create_conversation', {
        current_user_id: user.id,
        other_user_id: recipientId
      })

      if (error) throw error

      // Navigeer naar de chat pagina
      router.push(`/berichten?conversation=${data}`)
    } catch (err: any) {
      console.error('Error starting chat:', err)
      alert('Kon chat niet starten: ' + (err.message || 'Onbekende fout'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleStartChat}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <MessageCircle className="w-5 h-5" />
      {loading ? 'Laden...' : `Bericht ${recipientName}`}
    </button>
  )
}