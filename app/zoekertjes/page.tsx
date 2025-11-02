'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

type ProfileEmbed = {
  display_name: string | null
  is_anonymous: boolean
}

type Listing = {
  id: string
  title: string
  description: string
  province: string
  level: string
  position: string
  created_at: string
  type: 'speler_zoekt_club' | 'club_zoekt_speler' | null
  profiles_player?: ProfileEmbed | null
}

export default function ZoekertjesPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchListings = async () => {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          id,
          title,
          description,
          province,
          level,
          position,
          created_at,
          type,
          profiles_player:owner_user_id (
            display_name,
            is_anonymous
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Supabase fout:', error)
      } else if (data) {
        setListings(data as unknown as Listing[])
      }

      setLoading(false)
    }

    fetchListings()
  }, [])

  if (loading) return <p className="p-8">Laden...</p>

  return (
    <main className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-4 text-center text-[#0F172A]">
        Recente zoekertjes
      </h1>

      {listings.length === 0 && (
        <p className="text-center text-gray-600">
          Nog geen zoekertjes geplaatst.
        </p>
      )}

      <ul className="space-y-4">
        {listings.map((l) => {
          const p = l.profiles_player

          const typeBadge =
            l.type === 'club_zoekt_speler' ? (
              <span className="bg-green-100 text-green-700 px-2 py-1 text-xs rounded-full font-medium">
                🏟️ Club zoekt speler
              </span>
            ) : (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 text-xs rounded-full font-medium">
                👟 Speler zoekt club
              </span>
            )

          return (
            <li
              key={l.id}
              className="border rounded-xl p-5 shadow-sm bg-white hover:shadow-md transition"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-lg text-[#0F172A]">
                  {p?.is_anonymous
                    ? 'Anonieme speler'
                    : p?.display_name || 'Onbekende speler'}
                </h2>
                {typeBadge}
              </div>

              <h3 className="font-semibold text-lg mt-1 text-[#F59E0B]">
                {l.title}
              </h3>

              <p className="text-sm text-gray-700 mb-2">{l.description}</p>

              <p className="text-sm text-gray-500">
                📍 {l.province || 'Onbekend'} | ⚽ {l.level || '-'} | 🧍{' '}
                {l.position || '-'}
              </p>

              <p className="text-xs text-gray-400 mt-2">
                Geplaatst op{' '}
                {new Date(l.created_at).toLocaleDateString('nl-BE')}
              </p>
            </li>
          )
        })}
      </ul>

      <div className="text-center">
        <Link
          href="/plaats"
          className="bg-[#F59E0B] text-white px-4 py-2 rounded hover:bg-[#D97706]"
        >
          📢 Plaats nieuw zoekertje
        </Link>
      </div>
    </main>
  )
}
