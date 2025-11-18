'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'
import belgianTeams from '@/public/data/belgian_teams_simple.json'

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
  birth_date: string | null
  strengths: string | null
  current_team: string | null
  available_from: string | null
  level_pref: string | null
  foot: string | null
}

export default function SpelersPage() {
  const [spelers, setSpelers] = useState<Speler[]>([])
  const [filtered, setFiltered] = useState<Speler[]>([])
  const [search, setSearch] = useState('')
  const [position, setPosition] = useState('')
  const [province, setProvince] = useState('')
  const [level, setLevel] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSpelers = async () => {
      const { data, error } = await supabase
        .from('profiles_player')
        .select('*')
        .eq('role', 'speler')
        .eq('visibility', true)
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

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null
    const birth = new Date(birthDate)
    const diff = Date.now() - birth.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0B1220]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Vind jouw speler
          </h1>
          <p className="text-gray-400 text-lg">
            Doorzoek {spelers.length} beschikbare spelers
          </p>
        </div>

        {/* Filters */}
        <div className="bg-[#1E293B]/60 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Zoekbalk */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Zoek op naam
              </label>
              <input
                type="text"
                placeholder="Typ een naam..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0F172A] border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#F59E0B] outline-none transition"
              />
            </div>

            {/* Positie filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Positie
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full bg-[#0F172A] border border-white/20 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-[#F59E0B] outline-none transition"
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
          {(search || position || province || level) && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-400">Actieve filters:</span>
                {search && (
                  <span className="bg-[#F59E0B]/20 text-[#F59E0B] px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    Naam: {search}
                    <button onClick={() => setSearch('')} className="hover:text-white">×</button>
                  </span>
                )}
                {position && (
                  <span className="bg-[#F59E0B]/20 text-[#F59E0B] px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {position}
                    <button onClick={() => setPosition('')} className="hover:text-white">×</button>
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
                    setPosition('')
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
            {filtered.length} {filtered.length === 1 ? 'speler' : 'spelers'} gevonden
          </p>
        </div>

        {/* Spelerslijst */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F59E0B]"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-[#1E293B]/40 rounded-2xl border border-white/10">
            <p className="text-gray-400 text-lg mb-2">Geen spelers gevonden</p>
            <p className="text-gray-500 text-sm">Probeer andere filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((s, i) => {
              const age = calculateAge(s.birth_date)
              const currentTeamData = s.current_team
                ? belgianTeams.find((t) => t.name === s.current_team)
                : null
              const strengthsList = s.strengths?.split(',').map(str => str.trim()).slice(0, 3) || []

              return (
                <motion.div
                  key={s.user_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex" // 🔹 flex voor gelijke hoogte
                >
                  <Link
                    href={`/spelers/${s.user_id}`}
                    className="flex flex-col w-full bg-[#1E293B]/60 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-[#F59E0B]/30 transition-all shadow-lg group"
                  >
                    {/* Header met gradient */}
                    <div className="bg-gradient-to-r from-[#F59E0B]/10 to-[#D97706]/10 p-6 border-b border-white/10">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white font-bold text-2xl group-hover:scale-105 transition-transform">
                            {s.is_anonymous ? '?' : s.display_name?.charAt(0).toUpperCase() || '?'}
                            {age && (
                              <div className="absolute -bottom-2 -right-2 bg-white text-[#F59E0B] text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                                {age}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-lg text-white group-hover:text-[#F59E0B] transition-colors truncate">
                              {s.is_anonymous ? 'Anonieme speler' : s.display_name || 'Onbekend'}
                            </h3>
                            {/* Club of placeholder */}
                            <div className="flex items-center gap-2 mt-1 h-5">
                              {currentTeamData ? (
                                <>
                                  <Image
                                    src={currentTeamData.logo}
                                    alt={currentTeamData.name}
                                    width={16}
                                    height={16}
                                    className="rounded-full"
                                  />
                                  <span className="text-xs text-gray-400 truncate">{currentTeamData.name}</span>
                                </>
                              ) : (
                                <span className="text-xs text-gray-500">-</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Body - flex-1 zorgt dat deze groeit */}
                    <div className="flex-1 flex flex-col p-6">
                      {/* Stats grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                          <div className="flex items-center gap-2 text-[#F59E0B] text-xs font-medium mb-1">
                            <span>📍</span>
                            <span className="text-gray-400">Provincie</span>
                          </div>
                          <p className="text-white font-semibold text-sm truncate">{s.province || '-'}</p>
                        </div>

                        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                          <div className="flex items-center gap-2 text-[#F59E0B] text-xs font-medium mb-1">
                            <span>🏆</span>
                            <span className="text-gray-400">Niveau</span>
                          </div>
                          <p className="text-white font-semibold text-sm truncate">{s.level || '-'}</p>
                        </div>

                        <div className="bg-white/5 rounded-lg p-3 border border-white/5 col-span-2">
                          <div className="flex items-center gap-2 text-[#F59E0B] text-xs font-medium mb-1">
                            <span>⚽</span>
                            <span className="text-gray-400">Posities</span>
                          </div>
                          <p className="text-white font-semibold text-sm truncate">
                            {s.position_primary || '-'}
                            {s.position_secondary && ` & ${s.position_secondary}`}
                          </p>
                        </div>
                      </div>

                      {/* Additional info - fixed height */}
                      <div className="space-y-2 mb-4 min-h-[72px]">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-400">Gewenst:</span>
                          <span className="text-gray-300">{s.level_pref || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-400">Voet:</span>
                          <span className="text-gray-300">{s.foot || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-400">Beschikbaar:</span>
                          <span className="text-gray-300">
                            {s.available_from ? new Date(s.available_from).toLocaleDateString('nl-BE') : '-'}
                          </span>
                        </div>
                      </div>

                      {/* Sterktes - fixed height */}
                      <div className="mb-4 min-h-[60px]">
                        <p className="text-xs text-gray-400 mb-2">Sterktes:</p>
                        {strengthsList.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {strengthsList.map((strength) => (
                              <span
                                key={strength}
                                className="text-xs bg-[#F59E0B]/10 text-[#F59E0B] px-2 py-1 rounded-full border border-[#F59E0B]/20"
                              >
                                {strength}
                              </span>
                            ))}
                            {s.strengths && s.strengths.split(',').length > 3 && (
                              <span className="text-xs text-gray-400 px-2 py-1">
                                +{s.strengths.split(',').length - 3} meer
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </div>

                      {/* Bio - fixed height with line clamp */}
                      <div className="mb-4 min-h-[48px]">
                        <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                          {s.bio || '-'}
                        </p>
                      </div>

                      {/* View profile CTA - at bottom */}
                      <div className="pt-4 border-t border-white/5 mt-auto">
                        <span className="text-sm text-[#F59E0B] group-hover:underline flex items-center gap-2">
                          Bekijk volledig profiel
                          <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}