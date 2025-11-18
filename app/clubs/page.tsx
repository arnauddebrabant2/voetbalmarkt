'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { motion } from 'framer-motion'

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

  useEffect(() => {
    const fetchClubs = async () => {
      const { data, error } = await supabase
        .from('profiles_player')
        .select('user_id, display_name, is_anonymous, province, level, bio')
        .eq('role', 'club')
        .eq('visibility', true)
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
    <main className="relative min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0B1220]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Vind jouw club
          </h1>
          <p className="text-gray-400 text-lg">
            Doorzoek {clubs.length} clubs
          </p>
        </div>

        {/* Filters */}
        <div className="bg-[#1E293B]/60 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Zoekbalk */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Zoek op clubnaam
              </label>
              <input
                type="text"
                placeholder="Typ een clubnaam..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0F172A] border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#F59E0B] outline-none transition"
              />
            </div>

            {/* Provincie filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Provincie
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full bg-[#0F172A] border border-white/20 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-[#F59E0B] outline-none transition"
              >
                <option value="">Alle provincies</option>
                <option>Antwerpen</option>
                <option>Limburg</option>
                <option>Oost-Vlaanderen</option>
                <option>West-Vlaanderen</option>
                <option>Vlaams-Brabant</option>
                <option>Brussel</option>
              </select>
            </div>

            {/* Niveau filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Niveau
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-[#0F172A] border border-white/20 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-[#F59E0B] outline-none transition"
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
          </div>

          {/* Active filters display */}
          {(search || province || level) && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-400">Actieve filters:</span>
                {search && (
                  <span className="bg-[#F59E0B]/20 text-[#F59E0B] px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    Naam: {search}
                    <button onClick={() => setSearch('')} className="hover:text-white">×</button>
                  </span>
                )}
                {province && (
                  <span className="bg-[#F59E0B]/20 text-[#F59E0B] px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {province}
                    <button onClick={() => setProvince('')} className="hover:text-white">×</button>
                  </span>
                )}
                {level && (
                  <span className="bg-[#F59E0B]/20 text-[#F59E0B] px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {level}
                    <button onClick={() => setLevel('')} className="hover:text-white">×</button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearch('')
                    setProvince('')
                    setLevel('')
                  }}
                  className="text-sm text-gray-400 hover:text-white underline"
                >
                  Wis alle filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-gray-400 text-sm">
            {filtered.length} {filtered.length === 1 ? 'club' : 'clubs'} gevonden
          </p>
        </div>

        {/* Clubs lijst */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F59E0B]"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-[#1E293B]/40 rounded-2xl border border-white/10">
            <p className="text-gray-400 text-lg mb-2">Geen clubs gevonden</p>
            <p className="text-gray-500 text-sm">Probeer andere filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c, i) => (
              <motion.div
                key={c.user_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex"
              >
                <Link
                  href={`/clubs/${c.user_id}`}
                  className="flex flex-col w-full bg-[#1E293B]/60 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-[#F59E0B]/30 transition-all shadow-lg group"
                >
                  {/* Header met gradient */}
                  <div className="bg-gradient-to-r from-[#F59E0B]/10 to-[#D97706]/10 p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white font-bold text-2xl group-hover:scale-105 transition-transform">
                        {c.is_anonymous ? '?' : c.display_name?.charAt(0).toUpperCase() || '🏢'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-lg text-white group-hover:text-[#F59E0B] transition-colors truncate">
                          {c.is_anonymous ? 'Anonieme club' : c.display_name || 'Onbekende club'}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 flex flex-col p-6">
                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                        <div className="flex items-center gap-2 text-[#F59E0B] text-xs font-medium mb-1">
                          <span>📍</span>
                          <span className="text-gray-400">Provincie</span>
                        </div>
                        <p className="text-white font-semibold text-sm truncate">{c.province || '-'}</p>
                      </div>

                      <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                        <div className="flex items-center gap-2 text-[#F59E0B] text-xs font-medium mb-1">
                          <span>🏆</span>
                          <span className="text-gray-400">Niveau</span>
                        </div>
                        <p className="text-white font-semibold text-sm truncate">{c.level || '-'}</p>
                      </div>
                    </div>

                    {/* Bio - fixed height */}
                    <div className="mb-4 min-h-[96px]">
                      <p className="text-xs text-gray-400 mb-2">Over de club:</p>
                      <p className="text-sm text-gray-300 line-clamp-4 leading-relaxed">
                        {c.bio || 'Geen extra informatie beschikbaar.'}
                      </p>
                    </div>

                    {/* View profile CTA - at bottom */}
                    <div className="pt-4 border-t border-white/5 mt-auto">
                      <span className="text-sm text-[#F59E0B] group-hover:underline flex items-center gap-2">
                        Bekijk clubprofiel
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}