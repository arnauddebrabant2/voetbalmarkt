'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const roleParam = searchParams.get('role') as 'speler' | 'trainer' | 'club' | null
  const registerParam = searchParams.get('register') // 👈 dit is nieuw

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [role, setRole] = useState<'speler' | 'trainer' | 'club'>('speler')
  const [isRegister, setIsRegister] = useState(false) // 👈 standaard false
  const [visibility, setVisibility] = useState(true)
  const [message, setMessage] = useState('')

  // 🔹 Rol automatisch instellen via queryparam
  useEffect(() => {
    if (roleParam) setRole(roleParam)
  }, [roleParam])

  // 🔹 Registratiemodus aanzetten als ?register=true
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
      {/* 🔳 Achtergrondlaag: vult ALLES, ook achter footer */}
      <div
        className="fixed inset-0 bg-[#0F172A] bg-cover bg-center -z-10"
        style={{ backgroundImage: "url('/images/login-bg.png')" }}
      />
      {/* Donkere overlay voor leesbaarheid */}
      <div className="fixed inset-0 bg-black/60 -z-10" />

      {/* 💡 De inhoud ligt erboven */}
      <main className="flex items-center justify-center relative z-10 py-8 min-h-[calc(100vh-64px-48px)]">
        <div className="w-full max-w-md px-6">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-lg p-6 text-white">
            <h1 className="text-3xl font-bold mb-6 text-center text-[#F59E0B]">
              {isRegister ? 'Account aanmaken' : 'Inloggen'}
            </h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="E-mail"
                className="border border-white/30 bg-white/10 text-white placeholder-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Wachtwoord"
                className="border border-white/30 bg-white/10 text-white placeholder-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {isRegister && (
                <>
                  <label className="text-sm font-medium text-gray-200 mt-2">
                    Ik ben een...
                  </label>
                  <select
                    className="border border-white/30 bg-white/10 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#F59E0B] cursor-pointer"
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value as 'speler' | 'trainer' | 'club')
                    }
                  >
                    <option className="bg-white text-[#0F172A]" value="speler">
                      👟 Speler
                    </option>
                    <option className="bg-white text-[#0F172A]" value="trainer">
                      🎓 Trainer
                    </option>
                    <option className="bg-white text-[#0F172A]" value="club">
                      🏟️ Club
                    </option>
                  </select>
                  <input
                    type="text"
                    placeholder="Weergavenaam (optioneel)"
                    className="border border-white/30 bg-white/10 text-white placeholder-gray-300 p-2 rounded"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={isAnonymous}
                  />

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
                </>
              )}

              <button
                type="submit"
                className="bg-[#F59E0B] text-white px-4 py-2 rounded hover:bg-[#D97706] transition mt-2"
              >
                {isRegister ? 'Registreren' : 'Inloggen'}
              </button>
            </form>

            <p className="text-sm mt-4 text-center text-gray-300">{message}</p>

            <p className="text-sm mt-4 text-center text-gray-300">
              {isRegister ? (
                <>
                  Heb je al een account?{' '}
                  <button
                    onClick={() => setIsRegister(false)}
                    className="text-[#F59E0B] underline"
                  >
                    Inloggen
                  </button>
                </>
              ) : (
                <>
                  Nog geen account?{' '}
                  <button
                    onClick={() => setIsRegister(true)}
                    className="text-[#F59E0B] underline"
                  >
                    Registreren
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
