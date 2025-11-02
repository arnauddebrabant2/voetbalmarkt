'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('Bezig...')

    try {
      if (isRegister) {
        // ✅ Nieuwe gebruiker aanmaken met metadata
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: isAnonymous ? null : displayName || null,
              is_anonymous: isAnonymous,
            },
          },
        })

        if (error) throw error

        setMessage(
          '✅ Account aangemaakt! Controleer je e-mail om te bevestigen (indien vereist).'
        )
      } else {
        // 🔹 Inloggen met e-mail en wachtwoord
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
    <main className="p-8 max-w-md mx-auto min-h-[calc(100vh-4rem)] flex flex-col justify-center">
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
          </>
        )}

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
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
              className="text-green-700 underline"
            >
              Inloggen
            </button>
          </>
        ) : (
          <>
            Nog geen account?{' '}
            <button
              onClick={() => setIsRegister(true)}
              className="text-green-700 underline"
            >
              Registreren
            </button>
          </>
        )}
      </p>
    </main>
  )
}
