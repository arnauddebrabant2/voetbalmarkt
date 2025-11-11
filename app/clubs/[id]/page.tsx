'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function ClubProfielPage() {
  const params = useParams()
  const clubId = params?.id
  const [club, setClub] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClub = async () => {
      if (!clubId) return

      const { data, error } = await supabase
        .from('profiles_player')
        .select('*')
        .eq('user_id', clubId)
        .eq('role', 'club')
        .single()

      if (error) {
        console.error('❌ Fout bij ophalen clubprofiel:', error)
      } else {
        setClub(data)
      }

      setLoading(false)
    }

    fetchClub()
  }, [clubId])

  if (loading)
    return <p className="text-center text-gray-400 mt-10">Even geduld... clubprofiel wordt geladen.</p>

  if (!club)
    return (
      <p className="text-center text-gray-400 mt-10">
        Clubprofiel niet gevonden of niet openbaar.
      </p>
    )

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0B1220] text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-[#1E293B]/70 border border-white/20 rounded-3xl shadow-2xl p-10 backdrop-blur-xl"
      >
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
          {/* 👤 Naam + provincie */}
          <div>
            <h1 className="text-3xl font-bold text-[#F59E0B] mb-1">
              {club.is_anonymous ? 'Anonieme club' : club.display_name || 'Onbekende club'}
            </h1>
            <p className="text-gray-300 text-sm">
              📍 {club.province || '-'} &nbsp; ⚽ {club.level || '-'}
            </p>
          </div>

          {/* 🔙 Terugknop */}
          <Link
            href="/"
            className="px-4 py-2 bg-[#F59E0B]/90 hover:bg-[#D97706] text-white rounded-lg text-sm transition"
          >
            ← Terug
          </Link>
        </div>

        {/* 📝 Beschrijving */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-[#F59E0B] mb-2">Over onze club</h2>
          <p className="text-gray-200 whitespace-pre-line">
            {club.bio || 'Nog geen beschrijving toegevoegd.'}
          </p>
        </section>

        {/* 📍 Extra info */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300 text-sm">
          <p>
            <span className="font-semibold text-[#F59E0B]">Provincie:</span>{' '}
            {club.province || '-'}
          </p>
          <p>
            <span className="font-semibold text-[#F59E0B]">Niveau:</span>{' '}
            {club.level || '-'}
          </p>
          <p>
            <span className="font-semibold text-[#F59E0B]">Weergavenaam:</span>{' '}
            {club.is_anonymous ? 'Anonieme club' : club.display_name || '-'}
          </p>
          <p>
            <span className="font-semibold text-[#F59E0B]">Laatst bijgewerkt:</span>{' '}
            {club.updated_at
              ? new Date(club.updated_at).toLocaleDateString('nl-BE')
              : '-'}
          </p>
        </section>
      </motion.div>
    </main>
  )
}
