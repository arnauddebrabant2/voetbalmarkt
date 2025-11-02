'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

type Profile = {
  display_name: string | null
  is_anonymous: boolean
  role: 'speler' | 'club' | null
}

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  profile: Profile | null
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  profile: null,
  refreshProfile: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // ✅ Profiel ophalen of opnieuw laden
  const refreshProfile = async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles_player')
        .select('display_name, is_anonymous, role')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Fout bij ophalen profiel:', error)
      }

      // ✅ Gebruik exacte waarde uit DB, geen geforceerde default
      setProfile({
        display_name: data?.display_name ?? null,
        is_anonymous: data?.is_anonymous ?? false,
        role: data?.role ?? null, // ← laat null staan als er nog geen rol is
      })
    } catch (err) {
      console.error('❌ Onverwachte fout bij profiel:', err)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Auth status bij opstart ophalen
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    }
    init()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  // ✅ Wanneer user verandert, profiel opnieuw laden
  useEffect(() => {
    if (user) {
      refreshProfile()
    } else {
      setProfile(null)
      setLoading(false)
    }
  }, [user])

  return (
    <AuthContext.Provider
      value={{ user, session, loading, profile, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}
