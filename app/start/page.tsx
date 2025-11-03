'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function StartPage() {
  const router = useRouter()

  // 👉 stuurt naar registratie
  const handleSelect = (role: string) => {
    router.push(`/login?role=${role}&register=true`)
  }

  // 👉 gewone login knop
  const goToLogin = () => {
    router.push('/login')
  }

  const cards = [
    {
      role: 'speler',
      label: 'Speler',
      img: '/images/speler-bg.png',
      overlay:
        'Van amateur tot prof — maak je profiel aan en laat clubs jou ontdekken.',
    },
    {
      role: 'trainer',
      label: 'Trainer',
      img: '/images/trainer-bg.png',
      overlay: 'Deel je ervaring en vind teams die bij jouw visie passen.',
    },
    {
      role: 'club',
      label: 'Club',
      img: '/images/club-bg.png',
      overlay: 'Ontdek spelers en trainers die jouw team versterken.',
    },
  ]

  return (
    <div className="flex flex-col min-h-screen text-white bg-[#0F172A] overflow-hidden">
      {/* 🔝 Header */}
      <header className="backdrop-blur-md bg-[#0F172A]/70 border-b border-white/10 z-50">
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 w-full relative">
          {/* Logo + Naam */}
          <div className="flex items-center space-x-3">
            <Image
              src="/logo4.png"
              alt="VoetbalMarkt Logo"
              width={40}
              height={40}
              className="rounded-md"
            />
            <span className="text-xl sm:text-2xl font-extrabold text-[#F59E0B] tracking-tight">
              VoetbalMarkt
            </span>
          </div>

          {/* Midden tekst */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-gray-300 text-sm sm:text-base font-medium tracking-wide">
              Kies jouw rol om te starten
            </p>
          </div>

          {/* 🔸 Rechts: login-knop */}
          <button
            onClick={goToLogin}
            className="bg-[#F59E0B] hover:bg-[#fbbf24] text-[#0F172A] text-sm sm:text-base font-semibold px-4 py-2 rounded-md transition-colors shadow-md"
          >
            Ik ben al geregistreerd
          </button>
        </div>
      </header>

      {/* 🟧 Inhoud vult de resterende ruimte */}
      <main className="flex-1 flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-3 flex-1 relative z-10">
          {cards.map((card, index) => (
            <motion.button
              key={card.role}
              onClick={() => handleSelect(card.role)} // 👉 stuurt met ?register=true
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="relative h-full group overflow-hidden cursor-pointer focus:outline-none"
            >
              {/* Achtergrondfoto */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[1500ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-105"
                style={{ backgroundImage: `url(${card.img})` }}
              />

              {/* Donkere overlay */}
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-700" />

              {/* Tekst */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 transition-transform duration-500 group-hover:-translate-y-1">
                <h2 className="text-4xl font-bold text-white drop-shadow-lg mb-2 transition-colors duration-500 group-hover:text-[#F59E0B]">
                  {card.label}
                </h2>
                <p className="text-gray-200 max-w-sm text-sm sm:text-base">
                  {card.overlay}
                </p>
              </div>

              {/* Accentbalk */}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#F59E0B] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Hoverglow */}
              <div className="absolute inset-0 ring-0 group-hover:ring-4 group-hover:ring-[#F59E0B]/30 transition-all duration-700" />
            </motion.button>
          ))}
        </div>
      </main>

      {/* ⚽ Footer — sluit exact aan */}
      <footer className="text-center text-gray-400 text-xs py-3 bg-[#0F172A] border-t border-white/10">
        © {new Date().getFullYear()} VoetbalMarkt — gemaakt met ⚽ & ❤️{' '}
        <span className="mx-2">|</span>
        <a
          href="/privacy"
          className="text-[#F59E0B] hover:text-[#fbbf24] transition-colors"
        >
          Privacybeleid
        </a>
      </footer>
    </div>
  )
}
