'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useSearchParams } from 'next/navigation'
import { Mail, Lock, User } from 'lucide-react'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const roleParam = searchParams.get('role') as 'speler' | 'trainer' | 'club' | null
  const registerParam = searchParams.get('register')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [role, setRole] = useState<'speler' | 'trainer' | 'club'>('speler')
  const [isRegister, setIsRegister] = useState(false)
  const [visibility, setVisibility] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (roleParam) setRole(roleParam)
  }, [roleParam])

  useEffect(() => {
    if (registerParam === 'true') setIsRegister(true)
  }, [registerParam])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('Bezig...')

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: isAnonymous ? null : displayName || null,
              is_anonymous: isAnonymous,
              role,
              visibility,
            },
          },
        })
        if (error) throw error
        setMessage('✅ Account aangemaakt! Controleer je e-mail om te bevestigen.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setMessage('✅ Ingelogd! Even geduld...')
        window.location.href = '/'
      }
    } catch (err: any) {
      setMessage(`❌ ${err.message || 'Onbekende fout'}`)
    }
  }

  return (
    <>
      {/* Achtergrond */}
      <div
        className="fixed inset-0 bg-[#0F172A] bg-cover bg-center -z-10"
        style={{ backgroundImage: "url('/images/login-bg.png')" }}
      />
      <div className="fixed inset-0 bg-black/70 -z-10" />

      {/* Hoogte behouden zodat footer zichtbaar blijft */}
      <main className="flex items-center justify-center relative z-10 py-8 min-h-[calc(100vh-64px-48px)]">
        <div
          className="w-full max-w-5xl backdrop-blur-xl bg-white/10 border border-white/20 
          rounded-3xl shadow-2xl p-16 text-white flex flex-col md:flex-row gap-16"
        >
          {/* Linkerzijde: titel en uitleg */}
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-5xl font-bold mb-6 text-[#F59E0B] tracking-wide leading-tight">
              {isRegister ? 'Account aanmaken' : 'Welkom terug'}
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed max-w-md">
              {isRegister
                ? 'Registreer vandaag nog en maak een profiel aan zodat clubs je kunnen ontdekken. Beheer je account eenvoudig vanuit één plek.'
                : 'Log in om toegang te krijgen tot je persoonlijke dashboard, trainingen en clubconnecties.'}
            </p>
          </div>

          {/* Rechterzijde: formulier */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* E-mail */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <input
                  type="email"
                  placeholder="E-mail"
                  className="w-full border border-white/30 bg-white/10 text-white placeholder-gray-300 p-4 pl-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Wachtwoord */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <input
                  type="password"
                  placeholder="Wachtwoord"
                  className="w-full border border-white/30 bg-white/10 text-white placeholder-gray-300 p-4 pl-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Extra velden bij registratie */}
              {isRegister && (
                <>
                  <label className="text-sm font-medium text-gray-200 mt-2">Ik ben een...</label>
                  <select
                    className="border border-white/30 bg-white/10 text-white p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'speler' | 'trainer' | 'club')}
                  >
                    <option className="bg-white text-[#0F172A]" value="speler">👟 Speler</option>
                    <option className="bg-white text-[#0F172A]" value="trainer">🎓 Trainer</option>
                    <option className="bg-white text-[#0F172A]" value="club">🏟️ Club</option>
                  </select>

                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Weergavenaam (optioneel)"
                      className="w-full border border-white/30 bg-white/10 text-white placeholder-gray-300 p-4 pl-10 rounded-xl"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={isAnonymous}
                    />
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                      />
                      <span>Anoniem blijven</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={visibility}
                        onChange={(e) => setVisibility(e.target.checked)}
                      />
                      <span>Maak mijn profiel zichtbaar voor clubs</span>
                    </label>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="bg-[#F59E0B] text-white font-semibold px-6 py-4 rounded-xl hover:bg-[#D97706] transition mt-4 text-lg"
              >
                {isRegister ? 'Registreren' : 'Inloggen'}
              </button>
            </form>

            {message && (
              <p className="text-sm mt-6 text-center text-gray-300">{message}</p>
            )}

            <div className="mt-8 text-center text-sm text-gray-300">
              {isRegister ? (
                <>
                  Heb je al een account?{' '}
                  <button
                    onClick={() => setIsRegister(false)}
                    className="text-[#F59E0B] underline hover:text-[#D97706]"
                  >
                    Inloggen
                  </button>
                </>
              ) : (
                <>
                  Nog geen account?{' '}
                  <button
                    onClick={() => setIsRegister(true)}
                    className="text-[#F59E0B] underline hover:text-[#D97706]"
                  >
                    Registreren
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
