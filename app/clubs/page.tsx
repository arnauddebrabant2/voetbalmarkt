'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Input } from '@/components/ui/input'

type Club = {
  user_id: string
  display_name: string | null
  is_anonymous: boolean
  province: string | null
  level: string | null
  bio: string | null
}

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [filtered, setFiltered] = useState<Club[]>([])
  const [search, setSearch] = useState('')
  const [province, setProvince] = useState('')
  const [level, setLevel] = useState('')
  const [loading, setLoading] = useState(true)

  // 🔹 Clubs ophalen
  useEffect(() => {
    const fetchClubs = async () => {
      const { data, error } = await supabase
        .from('profiles_player')
        .select('user_id, display_name, is_anonymous, province, level, bio')
        .eq('role', 'club') // 👈 enkel clubs
        .order('display_name', { ascending: true })

      if (error) console.error('❌ Fout bij ophalen clubs:', error)
      else {
        setClubs(data || [])
        setFiltered(data || [])
      }
      setLoading(false)
    }
    fetchClubs()
  }, [])

  // 🔹 Filter logica (client-side)
  useEffect(() => {
    let data = clubs

    if (search.trim()) {
      const lower = search.toLowerCase()
      data = data.filter((c) =>
        (c.display_name || '').toLowerCase().includes(lower)
      )
    }

    if (province) data = data.filter((c) => c.province === province)
    if (level) data = data.filter((c) => c.level === level)

    setFiltered(data)
  }, [search, province, level, clubs])

  return (
    <main className="p-8 max-w-6xl mx-auto min-h-[calc(100vh-4rem)]">
      <h1 className="text-3xl font-bold mb-6 text-center">Clubs zoeken</h1>

      {/* 🔍 Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Input
          placeholder="Zoek op clubnaam..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:col-span-2"
        />

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
          <option>Recreatief / Vriendenploeg</option>
          <option>4e Provinciale</option>
          <option>3e Provinciale</option>
          <option>2e Provinciale</option>
          <option>1e Provinciale</option>
          <option>3e Afdeling</option>
          <option>2e Afdeling</option>
          <option>1e Afdeling</option>
        </select>
      </div>

      {/* 📋 Clubs lijst */}
      {loading ? (
        <p className="text-center text-gray-500">Laden...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500">
          Geen clubs gevonden met deze filters.
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <li
              key={c.user_id}
              className="border rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition"
            >
              <p className="font-semibold text-lg text-[#0F172A]">
                {c.is_anonymous
                  ? 'Anonieme club'
                  : c.display_name || 'Onbekende club'}
              </p>
              <p className="text-sm text-gray-600">
                📍 {c.province || '-'} — ⚽ {c.level || '-'}
              </p>
              <p className="text-gray-700 text-sm mt-2 line-clamp-3">
                {c.bio || 'Geen extra informatie beschikbaar.'}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
