'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import TeamSelect from '@/components/ui/TeamSelect'

type CareerEntry = {
  id?: string
  team_name: string
  team_logo?: string
  start_date: string
  end_date?: string | null
}

export default function CareerEditor({
  playerId,
  onChange,
}: {
  playerId: string
  onChange?: (entries: CareerEntry[]) => void
}) {
  const [career, setCareer] = useState<CareerEntry[]>([])
  const [loading, setLoading] = useState(true)

  // 🔹 Ophalen bestaande loopbaan uit Supabase
  useEffect(() => {
    const fetchCareer = async () => {
      const { data, error } = await supabase
        .from('player_career')
        .select('*')
        .eq('player_id', playerId)
        .order('start_date', { ascending: true })

      if (error) console.error('Fout bij ophalen loopbaan:', error)
      else setCareer(data || [])
      setLoading(false)
    }

    if (playerId) fetchCareer()
  }, [playerId])

  // 🔸 Helper: update formulierstatus + emit
  const updateCareer = (newList: CareerEntry[]) => {
    setCareer(newList)
    onChange?.(newList)
  }

  const addEntry = () => {
    updateCareer([
      ...career,
      { team_name: '', start_date: '', end_date: null, team_logo: '' },
    ])
  }

  const removeEntry = (i: number) => {
    updateCareer(career.filter((_, idx) => idx !== i))
  }

  const updateField = (i: number, field: keyof CareerEntry, value: any) => {
    const copy = [...career]
    copy[i][field] = value
    updateCareer(copy)
  }

  // 🔹 Opslaan naar Supabase
  const saveCareer = async () => {
  console.log('💾 Start saveCareer()')
  console.log('📦 Huidige career state:', career)

  // enkel clubs met team_name opslaan
  const cleaned = career
    .filter((c) => c.team_name)
    .map((c) => ({
      player_id: playerId,
      team_name: c.team_name,
      team_logo: c.team_logo || null,
      start_date: c.start_date || null,
      end_date: c.end_date || null,
    }))

  console.log('🧾 Te bewaren carrière-items:', cleaned)

  // Eerst oude entries verwijderen
  const { error: delError } = await supabase
    .from('player_career')
    .delete()
    .eq('player_id', playerId)

  if (delError) {
    console.error('❌ Fout bij leegmaken oude carrière:', delError)
    alert('❌ Kon oude carrière niet verwijderen')
    return
  }

  // Nieuwe entries invoegen
  const { data, error: insertError } = await supabase
    .from('player_career')
    .insert(cleaned)
    .select()

  if (insertError) {
    console.error('❌ Fout bij opslaan carrière:', insertError)
    alert('❌ Fout bij opslaan carrière')
  } else {
    console.log('✅ Succesvol opgeslagen:', data)
    alert('✅ Carrière opgeslagen!')
  }
}


  if (loading)
    return <p className="text-gray-400 text-sm">Carrièregegevens laden...</p>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-[#F59E0B] font-semibold text-lg">
          Loopbaan / carrière
        </h3>
        <button
          type="button"
          onClick={addEntry}
          className="text-sm bg-[#F59E0B] hover:bg-[#D97706] text-white px-3 py-1 rounded-md transition"
        >
          + Club toevoegen
        </button>
      </div>

      {career.length === 0 && (
        <p className="text-gray-400 text-sm">
          Nog geen clubs toegevoegd. Klik op <b>“+ Club toevoegen”</b> om te
          starten.
        </p>
      )}

      <div className="space-y-6">
        {career.map((entry, i) => (
          <div
            key={i}
            className="p-4 border border-white/20 rounded-xl bg-[#1E293B]/60 shadow-lg space-y-3 relative"
          >
            <button
              type="button"
              onClick={() => removeEntry(i)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-400 transition"
            >
              ✕
            </button>

            {/* Clubkeuze */}
            <TeamSelect
              value={entry.team_name}
              onChange={(val) => updateField(i, 'team_name', val)}
            />

            {/* Datums */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Vanaf</label>
                <input
                  type="date"
                  value={entry.start_date || ''}
                  onChange={(e) => updateField(i, 'start_date', e.target.value)}
                  className="w-full bg-[#1E293B] border border-white/30 rounded-lg p-2 text-white focus:ring-2 focus:ring-[#F59E0B] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Tot</label>
                <input
                  type="date"
                  value={entry.end_date || ''}
                  onChange={(e) => updateField(i, 'end_date', e.target.value)}
                  className="w-full bg-[#1E293B] border border-white/30 rounded-lg p-2 text-white focus:ring-2 focus:ring-[#F59E0B] outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {career.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={saveCareer}
            className="mt-4 px-6 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold rounded-lg transition"
          >
            Loopbaan opslaan
          </button>
        </div>
      )}
    </div>
  )
}
