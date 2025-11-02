'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/ui/AuthProvider'

export default function PlaatsPage() {
  const { user, profile, loading } = useAuth()
  const [form, setForm] = useState({
    title: '',
    description: '',
    province: '',
    level: '',
    position: '',
    available_from: ''
  })
  const [message, setMessage] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    if (!user) {
      setMessage('Je moet eerst inloggen om een zoekertje te plaatsen.')
      return
    }

    // ✅ Automatisch type afhankelijk van rol
    const type =
      profile?.role === 'club' ? 'club_zoekt_speler' : 'speler_zoekt_club'

    const { error } = await supabase.from('listings').insert([
      {
        owner_user_id: user.id,
        type,
        title: form.title,
        description: form.description,
        province: form.province,
        level: form.level,
        position: form.position,
        available_from: form.available_from,
      },
    ])

    setMessage(
      error
        ? '❌ Er ging iets mis bij het opslaan.'
        : '✅ Zoekertje succesvol geplaatst!'
    )

    if (!error)
      setForm({
        title: '',
        description: '',
        province: '',
        level: '',
        position: '',
        available_from: '',
      })
  }

  if (loading) return <p className="p-8">Bezig met laden...</p>

  return (
    <main className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Zoekertje plaatsen</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Titel */}
        <Input
          name="title"
          placeholder="Titel"
          value={form.title}
          onChange={handleChange}
          required
        />

        {/* Beschrijving */}
        <textarea
          name="description"
          placeholder="Beschrijving"
          className="border rounded w-full p-2 h-28"
          value={form.description}
          onChange={handleChange}
          required
        />

        {/* Provincie */}
        <select
          name="province"
          className="border rounded p-2 w-full"
          value={form.province}
          onChange={handleChange}
          required
        >
          <option value="">Kies een provincie</option>
          <option>Antwerpen</option>
          <option>Limburg</option>
          <option>Oost-Vlaanderen</option>
          <option>West-Vlaanderen</option>
          <option>Vlaams-Brabant</option>
          <option>Brussel</option>
        </select>

        {/* Niveau */}
        <select
          name="level"
          className="border rounded p-2 w-full"
          value={form.level}
          onChange={handleChange}
          required
        >
          <option value="">Kies niveau</option>
          <option>Jeugd</option>
          <option>Recreatief / Vriendenploeg</option>
          <option>4e Provinciale</option>
          <option>3e Provinciale</option>
          <option>2e Provinciale</option>
          <option>1e Provinciale</option>
          <option>3e Afdeling</option>
          <option>2e Afdeling</option>
          <option>1e Afdeling</option>
        </select>

        {/* Positie */}
        <select
          name="position"
          className="border rounded p-2 w-full"
          value={form.position}
          onChange={handleChange}
          required
        >
          <option value="">Kies positie</option>
          <option>Doelman</option>
          <option>Rechtsachter</option>
          <option>Centrale verdediger</option>
          <option>Linksachter</option>
          <option>Verdedigende middenvelder</option>
          <option>Centrale middenvelder</option>
          <option>Aanvallende middenvelder</option>
          <option>Rechtsbuiten</option>
          <option>Linksbuiten</option>
          <option>Spits</option>
          <option>Flexibele speler / meerdere posities</option>
        </select>

        {/* Beschikbaar vanaf */}
        <Input
          type="date"
          name="available_from"
          placeholder="Beschikbaar vanaf"
          value={form.available_from}
          onChange={handleChange}
        />

        <Button type="submit" className="w-full">
          Plaatsen
        </Button>
      </form>

      {message && (
        <p className="mt-4 text-sm text-center font-medium">{message}</p>
      )}
    </main>
  )
}
