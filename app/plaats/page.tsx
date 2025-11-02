'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/ui/AuthProvider'

export default function PlaatsPage() {
  const { user, loading } = useAuth()
  const [form, setForm] = useState({
    title: '',
    description: '',
    province: '',
    level: '',
    position: '',
    available_from: ''
  })
  const [message, setMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    if (!user) {
      setMessage('Je moet eerst inloggen om een zoekertje te plaatsen.')
      return
    }

    const { error } = await supabase.from('listings').insert([
      {
        owner_user_id: user.id,
        type: 'speler_zoekt_club',
        title: form.title,
        description: form.description,
        province: form.province,
        level: form.level,
        position: form.position,
        available_from: form.available_from,
      },
    ])

    setMessage(error ? '❌ Fout bij opslaan.' : '✅ Zoekertje succesvol geplaatst!')
    if (!error)
      setForm({ title: '', description: '', province: '', level: '', position: '', available_from: '' })
  }

  if (loading) return <p className="p-8">Bezig met laden...</p>

  return (
    <main className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Zoekertje plaatsen</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="title" placeholder="Titel" value={form.title} onChange={handleChange} required />
        <textarea name="description" placeholder="Beschrijving" className="border rounded w-full p-2 h-28"
          value={form.description} onChange={handleChange} required />
        <Input name="province" placeholder="Provincie" value={form.province} onChange={handleChange} />
        <Input name="level" placeholder="Niveau" value={form.level} onChange={handleChange} />
        <Input name="position" placeholder="Positie" value={form.position} onChange={handleChange} />
        <Input type="date" name="available_from" placeholder="Beschikbaar vanaf" value={form.available_from} onChange={handleChange} />
        <Button type="submit">Plaatsen</Button>
      </form>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </main>
  )
}
