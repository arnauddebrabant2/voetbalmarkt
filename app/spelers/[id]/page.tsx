'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { FootballField } from '@/components/ui/FootballField'
import { useAuth } from '@/components/ui/AuthProvider'


export default function PubliekSpelerProfiel() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const id = params?.id as string
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return
      const { data, error } = await supabase
        .from('profiles_player')
        .select('*')
        .eq('user_id', id)
        // .eq('visibility', true) // 🔒 alleen zichtbare spelers
        .single()


      if (error) console.error('❌ Fout bij ophalen profiel:', error)
      else setProfile(data)

      setLoading(false)
    }
    fetchProfile()
  }, [id])

  // 👁️ Profielview registreren (club of andere speler bekijkt dit profiel)
useEffect(() => {
  const logProfileView = async () => {
    if (!user || !id) return
    if (user.id === id) return // eigen profiel niet tellen

    const { error } = await supabase.from('profile_views_player').insert([
      {
        profile_id: id,     // speler die bekeken wordt
        viewer_id: user.id, // wie bekijkt
      },
    ])

    if (error && error.code !== '23505') {
      // 23505 = unieke constraint (al bekeken vandaag)
      console.error('❌ Fout bij registreren profielview:', error)
    }
  }

  logProfileView()
}, [user, id])

  if (loading)
    return (
      <main className="p-8 text-center">
        <p>Profiel laden...</p>
      </main>
    )

  if (!profile)
    return (
      <main className="p-8 text-center">
        <Button onClick={() => router.push('/spelers')} className="mb-6">
          ← Terug naar spelerslijst
        </Button>
        <p>❌ Geen speler gevonden.</p>
      </main>
    )

    if (!profile.visibility) {
  return (
    <main className="p-8 text-center">
      <Button onClick={() => router.push('/spelers')} className="mb-6">
        ← Terug naar spelerslijst
      </Button>
      <p className="text-gray-600">
        🔒 Dit profiel is privé en niet openbaar zichtbaar.
      </p>
    </main>
  )
}


  const isSpeler = profile.role === 'speler'
  const selectedPositions = [
    ...(profile.position_primary ? [profile.position_primary] : []),
    ...(profile.position_secondary ? [profile.position_secondary] : []),
  ]

  return (
    <main className="relative p-8 w-full min-h-[calc(100vh-4rem)] bg-gradient-to-b from-green-50 to-white">
      {/* 🔙 Terugknop */}
      <div className="flex justify-between items-center max-w-7xl mx-auto mb-10">
        <Button
          onClick={() => router.push('/spelers')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800"
        >
          ← Terug naar spelerslijst
        </Button>

        <h1 className="text-3xl font-bold text-[#F59E0B]">
          Posities
        </h1>
      </div>

      {profile && (
        <div
          className={`grid ${
            isSpeler ? 'md:grid-cols-[2fr_1fr]' : 'grid-cols-1'
          } gap-12 max-w-7xl mx-auto`}
        >
          {/* 🟢 Linkerkolom: info */}
          <div className="space-y-10 text-left">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Info label="Weergavenaam">
                {profile.is_anonymous
                  ? 'Anonieme speler'
                  : profile.display_name || '-'}
              </Info>
              <Info label="Leeftijd">{profile.age || '-'}</Info>
              <Info label="Provincie">{profile.province || '-'}</Info>
              <Info label="Niveau">{profile.level || '-'}</Info>
              <Info label="Gewenst niveau">{profile.level_pref || '-'}</Info>
              <Info label="Voet">{profile.foot || '-'}</Info>
              <Info label="Beschikbaar vanaf">
                {profile.available_from
                  ? new Date(profile.available_from).toLocaleDateString('nl-BE')
                  : '-'}
              </Info>
              <Info label="Favoriete positie">
                {profile.position_primary || '-'}
              </Info>
              <Info label="Tweede positie">
                {profile.position_secondary || '-'}
              </Info>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2 text-[#F59E0B]">
                Over de speler
              </h2>
              <p className="text-gray-700 whitespace-pre-line">
                {profile.bio || 'Nog geen beschrijving toegevoegd.'}
              </p>
            </section>

            {isSpeler && (
              <>
                <section>
                  <h2 className="text-lg font-semibold mb-2 text-[#F59E0B]">
                    Sterktes
                  </h2>
                  {profile.strengths ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.strengths.split(',').map((s: string) => (
                        <span
                          key={s.trim()}
                          className="inline-block bg-[#FEF3C7] text-[#0F172A] px-3 py-1 rounded-full text-sm font-medium shadow-sm"
                        >
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Nog geen sterktes ingevuld.</p>
                  )}
                </section>

                <section>
                  <h2 className="text-lg font-semibold mb-2 text-[#F59E0B]">
                    Loopbaan / Carrière
                  </h2>
                  {profile.career ? (
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {profile.career.split('\n').map((line: string, i: number) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">
                      Nog geen loopbaaninformatie toegevoegd.
                    </p>
                  )}
                </section>
              </>
            )}
          </div>

          {/* ⚽️ Rechterkolom: veld */}
          {isSpeler && (
            <div className="flex justify-center md:justify-end">
              <FootballField positionsSelected={selectedPositions} />
            </div>
          )}
        </div>
      )}

      {!profile && (
        <p className="text-center text-gray-500 mt-12">
          Nog geen profielinformatie beschikbaar.
        </p>
      )}
    </main>
  )
}

/** Kleine helpercomponent voor nette labels */
function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="block text-sm text-gray-500">{label}</span>
      <span className="block text-base font-medium text-gray-800">{children}</span>
    </div>
  )
}

