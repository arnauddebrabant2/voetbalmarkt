'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

type Speler = {
  user_id: string
  display_name: string | null
  is_anonymous: boolean
  position_primary: string | null
  position_secondary: string | null
  level: string | null
  province: string | null
  bio: string | null
  role: 'speler' | 'club' | null
}

export default function SpelersPage() {
  const [spelers, setSpelers] = useState<Speler[]>([])
  const [filtered, setFiltered] = useState<Speler[]>([])
  const [search, setSearch] = useState('')
  const [position, setPosition] = useState('')
  const [province, setProvince] = useState('')
  const [level, setLevel] = useState('')
  const [loading, setLoading] = useState(true)

  // 🔹 Haal enkel spelers (geen clubs) op
  useEffect(() => {
    const fetchSpelers = async () => {
      const { data, error } = await supabase
        .from('profiles_player')
        .select(`
          user_id,
          display_name,
          is_anonymous,
          position_primary,
          position_secondary,
          level,
          province,
          bio,
          role
        `)
        .eq('role', 'speler')
        .eq('visibility', true) // 🔒 alleen zichtbare spelers
        .order('display_name', { ascending: true })

      if (error) console.error('❌ Fout bij ophalen spelers:', error)
      else {
        setSpelers(data || [])
        setFiltered(data || [])
      }
      setLoading(false)
    }
    fetchSpelers()
  }, [])

  // 🔹 Filter logica (client-side)
  useEffect(() => {
    let data = spelers

    if (search.trim()) {
      const lower = search.toLowerCase()
      data = data.filter((s) =>
        (s.display_name || '').toLowerCase().includes(lower)
      )
    }

    if (position)
      data = data.filter(
        (s) =>
          s.position_primary === position || s.position_secondary === position
      )
    if (province) data = data.filter((s) => s.province === province)
    if (level) data = data.filter((s) => s.level === level)

    setFiltered(data)
  }, [search, position, province, level, spelers])

  return (
    <main className="p-8 max-w-6xl mx-auto min-h-[calc(100vh-4rem)]">
      <h1 className="text-3xl font-bold mb-6 text-center text-[#F59E0B]">
        Spelers zoeken
      </h1>

      {/* 🔍 Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Input
          placeholder="Zoek op naam..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:col-span-2"
        />

        <select
          className="border rounded p-2"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        >
          <option value="">Alle posities</option>
          <option>Doelman</option>
          <option>Rechtsachter</option>
          <option>Centrale verdediger links</option>
          <option>Centrale verdediger rechts</option>
          <option>Linksachter</option>
          <option>Centrale middenvelder links</option>
          <option>Centrale middenvelder rechts</option>
          <option>Aanvallende middenvelder</option>
          <option>Linksbuiten</option>
          <option>Rechtsbuiten</option>
          <option>Spits</option>
        </select>

        <select
          className="border rounded p-2"
          value={province}
          onChange={(e) => setProvince(e.target.value)}
        >
          <option value="">Alle provincies</option>
          <option>Antwerpen</option>
          <option>Limburg</option>
          <option>Oost-Vlaanderen</option>
          <option>West-Vlaanderen</option>
          <option>Vlaams-Brabant</option>
          <option>Brussel</option>
        </select>

        <select
          className="border rounded p-2"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          <option value="">Alle niveaus</option>
          <option>1e Provinciale</option>
          <option>2e Provinciale</option>
          <option>3e Provinciale</option>
          <option>4e Provinciale</option>
          <option>Recreatief / Vriendenploeg</option>
        </select>
      </div>

      {/* 📋 Spelerslijst */}
      {loading ? (
        <p className="text-center text-gray-500">Laden...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500">
          Geen spelers gevonden met deze filters.
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((s) => (
            <li key={s.user_id}>
              <Link
                href={`/spelers/${s.user_id}`}
                className="block border rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition"
              >
                {/* Naam */}
                <p className="font-semibold text-lg text-[#0F172A] mb-1">
                  {s.is_anonymous
                    ? 'Anonieme speler'
                    : s.display_name || 'Onbekende speler'}
                </p>

                {/* Posities */}
                <p className="text-sm text-gray-700 mb-1">
                  {(s.position_primary || '-') +
                    (s.position_secondary
                      ? ` & ${s.position_secondary}`
                      : '')}
                </p>

                {/* Regio */}
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium text-gray-700">Regio:</span>{' '}
                  {s.province || '-'}
                </p>

                {/* Niveau */}
                <p className="text-sm text-gray-500 mb-2">
                  <span className="font-medium text-gray-700">Niveau:</span>{' '} {s.level || '-'}
                </p>

                {/* Bio */}
                <p className="text-gray-700 text-sm line-clamp-3">
                  {s.bio || 'Geen beschrijving beschikbaar.'}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
