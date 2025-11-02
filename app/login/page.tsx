'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [role, setRole] = useState<'speler' | 'club'>('speler')
  const [isRegister, setIsRegister] = useState(false)
  const [visibility, setVisibility] = useState(true)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('Bezig...')

    try {
      if (isRegister) {
        // 🔹 Alleen signup — de trigger maakt zelf het profiel aan
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

        setMessage(
          '✅ Account aangemaakt! Controleer je e-mail om te bevestigen (indien vereist).'
        )
      } else {
        // 🔹 Inloggen
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error

        setMessage('✅ Ingelogd! Even geduld...')
        window.location.href = '/'
      }
    } catch (err: any) {
      console.error('❌ Auth fout:', err)
      setMessage(`❌ ${err.message || 'Onbekende fout'}`)
    }
  }

  return (
    <main className="p-8 max-w-md mx-auto min-h-[calc(100vh-5rem)] flex flex-col justify-center">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {isRegister ? 'Account aanmaken' : 'Inloggen'}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 bg-white shadow-md rounded-xl p-6"
      >
        <input
          type="email"
          placeholder="E-mail"
          className="border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Wachtwoord"
          className="border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Alleen tonen bij registratie */}
        {isRegister && (
          <>
            <label className="text-sm font-medium">Ik ben een...</label>
            <select
              className="border p-2 rounded"
              value={role}
              onChange={(e) => setRole(e.target.value as 'speler' | 'club')}
            >
              <option value="speler">👟 Speler</option>
              <option value="club">🏟️ Club</option>
            </select>

            <input
              type="text"
              placeholder="Weergavenaam (optioneel)"
              className="border p-2 rounded"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={isAnonymous}
            />

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              <span>Anoniem blijven</span>
            </label>

            <label className="flex items-center gap-2 text-sm">
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
          className="bg-[#F59E0B] text-white px-4 py-2 rounded hover:bg-[#D97706] transition"
        >
          {isRegister ? 'Registreren' : 'Inloggen'}
        </button>
      </form>

      <p className="text-sm mt-4 text-center text-gray-600">{message}</p>

      <p className="text-sm mt-4 text-center">
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
              className="text-[#D97706] underline"
            >
              Registreren
            </button>
          </>
        )}
      </p>
    </main>
  )
}
