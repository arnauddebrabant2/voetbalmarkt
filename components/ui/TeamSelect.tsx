import { useState, useMemo } from 'react'
import Image from 'next/image'
import belgianTeams from '@/public/data/belgian_teams_simple.json'

export default function TeamSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)

  // 🔠 Sorteer alfabetisch
  const teams = useMemo(
    () => [...belgianTeams].sort((a, b) => a.name.localeCompare(b.name)),
    []
  )

  // 🔍 Filteren
  const filteredTeams = useMemo(() => {
    if (!query) return teams
    return teams.filter((team) =>
      team.name.toLowerCase().includes(query.toLowerCase())
    )
  }, [query, teams])

  // 💡 Toon tijdelijk query bij focus
  const displayValue = focused ? query : value

  return (
    <div className="relative w-full">
      <label className="block text-sm font-medium mb-1 text-[#F59E0B]">
        Huidige club
      </label>

      <input
        type="text"
        placeholder="Zoek of selecteer een club..."
        value={displayValue || ''}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          setFocused(true)
          setQuery('') // leeg bij focus om te zoeken
        }}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        className="w-full bg-[#1E293B] border border-white/30 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#F59E0B] outline-none"
      />

      {/* Dropdownlijst */}
      {focused && (
        <div className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto bg-[#0F172A] border border-white/20 rounded-lg shadow-lg">
          {/* ➕ Optie: geen club */}
          <button
            type="button"
            onClick={() => {
              onChange('')
              setQuery('')
              setFocused(false)
            }}
            className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-[#F59E0B]/20 transition-colors border-b border-white/10"
          >
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-600/50 text-white text-xs">
              –
            </div>
            <span className="text-sm text-gray-300 italic">Geen club (vrije speler)</span>
          </button>

          {/* Clubs */}
          {filteredTeams.map((team) => (
            <button
              key={team.name}
              type="button"
              onClick={() => {
                onChange(team.name)
                setQuery('')
                setFocused(false)
              }}
              className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-[#F59E0B]/20 transition-colors"
            >
              <Image
                src={team.logo}
                alt={team.name}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="text-sm text-white">{team.name}</span>
            </button>
          ))}

          {filteredTeams.length === 0 && (
            <p className="px-3 py-2 text-sm text-gray-400">
              Geen clubs gevonden
            </p>
          )}
        </div>
      )}
    </div>
  )
}
