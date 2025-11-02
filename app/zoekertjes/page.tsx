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
          profiles_player:owner_user_id (
            display_name,
            is_anonymous
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Supabase fout:', JSON.stringify(error, null, 2))
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
      <h1 className="text-2xl font-bold mb-4 text-center">Recente zoekertjes</h1>

      {listings.length === 0 && (
        <p className="text-center text-gray-600">Nog geen zoekertjes geplaatst.</p>
      )}

      <ul className="space-y-4">
        {listings.map((l) => {
          const p = l.profiles_player
          return (
            <li key={l.id} className="border rounded p-4 shadow-sm bg-white">
              <h2 className="font-semibold text-lg">
                {p?.is_anonymous
                  ? 'Anonieme speler'
                  : p?.display_name || 'Onbekende speler'}
              </h2>

              <h3 className="font-semibold text-lg mt-1">{l.title}</h3>
              <p className="text-sm text-gray-700 mb-2">{l.description}</p>

              <p className="text-sm text-gray-500">
                📍 {l.province || 'Onbekend'} | ⚽ {l.level || '-'} | 🧍 {l.position || '-'}
              </p>

              <p className="text-xs text-gray-400 mt-2">
                Geplaatst op {new Date(l.created_at).toLocaleDateString('nl-BE')}
              </p>
            </li>
          )
        })}
      </ul>

      <div className="text-center">
        <Link
          href="/plaats"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Plaats nieuw zoekertje
        </Link>
      </div>
    </main>
  )
}
