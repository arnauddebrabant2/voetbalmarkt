'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function LandingPage() {
  const router = useRouter()

  const sports = [
    {
      id: 'voetbal',
      name: 'Voetbal',
      img: '/images/voetbal-bg.jpg',
      description: 'Vind clubs, spelers en trainers voor jouw voetbalteam',
      icon: '⚽',
    },
    {
      id: 'basketbal',
      name: 'Basketbal',
      img: '/images/basketbal-bg.jpg',
      description: 'Ontdek talent en teams in de basketbalwereld',
      icon: '🏀',
    },
    {
      id: 'volleybal',
      name: 'Volleybal',
      img: '/images/volleybal-bg.jpg',
      description: 'Verbind spelers en clubs in het volleybal',
      icon: '🏐',
    },
    {
      id: 'handbal',
      name: 'Handbal',
      img: '/images/handbal-bg.jpg',
      description: 'Het platform voor handbalclubs en spelers',
      icon: '🤾',
    },
    {
      id: 'rugby',
      name: 'Rugby',
      img: '/images/rugby-bg.jpg',
      description: 'Bouw je rugbyteam met de beste spelers',
      icon: '🏉',
    },
    {
      id: 'hockey',
      name: 'Veldhockey',
      img: '/images/hockey-bg.jpg',
      description: 'Ontdek hockeytalent en versterk je team',
      icon: '🏑',
    },
  ]

  const handleSportSelect = (sportId: string) => {
    // Voor nu alleen voetbal actief
    if (sportId === 'voetbal') {
      router.push('/start')
    } else {
      alert(`${sportId.charAt(0).toUpperCase() + sportId.slice(1)} komt binnenkort beschikbaar!`)
    }
  }

  const goToLogin = () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0B1220] text-white">
      {/* Header */}
      <header className="backdrop-blur-md bg-[#0F172A]/70 border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 py-4">
          {/* Logo + Naam */}
          <div className="flex items-center space-x-3">
            <Image
              src="/logo4.png"
              alt="SportMarkt Logo"
              width={40}
              height={40}
              className="rounded-md"
            />
            <span className="text-xl sm:text-2xl font-extrabold text-[#F59E0B] tracking-tight">
              MyScout
            </span>
          </div>

          {/* Login knop */}
          <button
            onClick={goToLogin}
            className="bg-[#F59E0B] hover:bg-[#D97706] text-white text-sm sm:text-base font-semibold px-6 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            Inloggen
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#F59E0B]/10 via-transparent to-transparent pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
            Vind jouw team,
            <br />
            <span className="text-[#F59E0B]">Bouw jouw toekomst</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Het platform dat spelers, trainers en clubs samenbrengt. Maak je profiel, 
            ontdek nieuwe kansen en versterk je team.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#1E293B]/60 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <p className="text-4xl font-bold text-[#F59E0B] mb-2">6</p>
              <p className="text-sm text-gray-400">Sporten</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#1E293B]/60 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <p className="text-4xl font-bold text-[#F59E0B] mb-2">100+</p>
              <p className="text-sm text-gray-400">Actieve gebruikers</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#1E293B]/60 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <p className="text-4xl font-bold text-[#F59E0B] mb-2">50+</p>
              <p className="text-sm text-gray-400">Succesvolle matches</p>
            </motion.div>
          </div>
        </motion.div>
      </section>


        {/* How it works */}
        <section className="py-20 px-4 relative overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]" />
        
        <div className="max-w-6xl mx-auto relative z-10">
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
            >
            <span className="inline-block px-4 py-2 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-full text-[#F59E0B] text-sm font-semibold mb-4">
                Zo simpel is het
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Van registratie tot match
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Volg deze drie stappen en vind jouw perfecte sportpartner
            </p>
            </motion.div>

            {/* Timeline */}
            <div className="relative">
            {/* Vertical line - hidden on mobile */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#F59E0B] via-[#F59E0B]/50 to-transparent transform -translate-x-1/2" />

            <div className="space-y-16 md:space-y-24">
                {/* Step 1 - Left */}
                <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="relative grid md:grid-cols-2 gap-8 items-center"
                >
                <div className="md:text-right order-2 md:order-1">
                    <div className="inline-block md:block">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] font-bold text-lg mb-4">
                        01
                    </span>
                    <h3 className="text-3xl font-bold text-white mb-4 flex items-center md:justify-end gap-3">
                        <span className="text-4xl">🎯</span>
                        Kies je sport
                    </h3>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Selecteer uit voetbal, basketbal, volleybal, handbal, rugby of hockey. Elke sport heeft zijn eigen community.
                    </p>
                    </div>
                </div>
                
                <div className="order-1 md:order-2">
                    <motion.div
                    whileHover={{ scale: 1.05, rotateY: 5 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
                    >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#F59E0B]/10 rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <div className="grid grid-cols-3 gap-3 mb-4">
                        {['⚽', '🏀', '🏐'].map((icon, i) => (
                            <div key={i} className="aspect-square bg-white/5 rounded-xl flex items-center justify-center text-3xl hover:bg-white/10 transition-all cursor-pointer hover:scale-110">
                            {icon}
                            </div>
                        ))}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                        {['🤾', '🏉', '🏑'].map((icon, i) => (
                            <div key={i} className="aspect-square bg-white/5 rounded-xl flex items-center justify-center text-3xl hover:bg-white/10 transition-all cursor-pointer hover:scale-110">
                            {icon}
                            </div>
                        ))}
                        </div>
                    </div>
                    </motion.div>
                </div>

                {/* Center dot */}
                <div className="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-[#F59E0B] rounded-full border-4 border-[#0F172A] shadow-lg shadow-[#F59E0B]/50" />
                </motion.div>

                {/* Step 2 - Right */}
                <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="relative grid md:grid-cols-2 gap-8 items-center"
                >
                <div className="order-1">
                    <motion.div
                    whileHover={{ scale: 1.05, rotateY: -5 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
                    >
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#F59E0B]/10 rounded-full blur-3xl" />
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3 bg-white/5 rounded-xl p-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-full" />
                        <div className="flex-1">
                            <div className="h-3 bg-white/20 rounded w-3/4 mb-2" />
                            <div className="h-2 bg-white/10 rounded w-1/2" />
                        </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-xl p-3 h-16" />
                        <div className="bg-white/5 rounded-xl p-3 h-16" />
                        </div>
                        <div className="bg-[#F59E0B]/20 border border-[#F59E0B]/30 rounded-xl p-3 text-center text-[#F59E0B] font-semibold">
                        Profiel aanmaken
                        </div>
                    </div>
                    </motion.div>
                </div>
                
                <div className="order-2">
                    <div className="inline-block md:block">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] font-bold text-lg mb-4">
                        02
                    </span>
                    <h3 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
                        <span className="text-4xl">✨</span>
                        Maak je profiel
                    </h3>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Vul je gegevens in, voeg je sportervaring toe en laat zien wat je kan. Speler, trainer of club - iedereen is welkom.
                    </p>
                    </div>
                </div>

                {/* Center dot */}
                <div className="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-[#F59E0B] rounded-full border-4 border-[#0F172A] shadow-lg shadow-[#F59E0B]/50" />
                </motion.div>

                {/* Step 3 - Left */}
                <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="relative grid md:grid-cols-2 gap-8 items-center"
                >
                <div className="md:text-right order-2 md:order-1">
                    <div className="inline-block md:block">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] font-bold text-lg mb-4">
                        03
                    </span>
                    <h3 className="text-3xl font-bold text-white mb-4 flex items-center md:justify-end gap-3">
                        <span className="text-4xl">🤝</span>
                        Maak de match
                    </h3>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Browse door profielen, filter op niveau en locatie, en neem contact op. Vind de perfecte match voor jouw sportieve ambities.
                    </p>
                    </div>
                </div>
                
                <div className="order-1 md:order-2">
                    <motion.div
                    whileHover={{ scale: 1.05, rotateY: 5 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
                    >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#F59E0B]/10 rounded-full blur-3xl" />
                    <div className="relative z-10 flex items-center justify-center h-48">
                        <div className="relative">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-20 h-20 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-full flex items-center justify-center text-3xl"
                        >
                            ✓
                        </motion.div>
                        <motion.div
                            animate={{ scale: [0, 1.5, 0], opacity: [0, 0.5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-[#F59E0B] rounded-full"
                        />
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-white font-bold text-xl mb-2">Perfect Match! 🎉</p>
                        <p className="text-gray-400 text-sm">Je sportieve toekomst begint hier</p>
                    </div>
                    </motion.div>
                </div>

                {/* Center dot */}
                <div className="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-[#F59E0B] rounded-full border-4 border-[#0F172A] shadow-lg shadow-[#F59E0B]/50" />
                </motion.div>
            </div>
            </div>

            {/* Bottom CTA */}
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
            >
            <div className="inline-flex flex-col items-center gap-4 bg-gradient-to-r from-[#F59E0B]/10 via-[#D97706]/10 to-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-2xl px-8 py-6">
                <p className="text-white font-semibold text-lg">Klaar om te starten?</p>
                <div className="flex items-center gap-2 text-[#F59E0B]">
                <span>Het duurt maar</span>
                <span className="text-2xl font-bold">2 minuten</span>
                <span>⚡</span>
                </div>
            </div>
            </motion.div>
        </div>
        </section>

      {/* Sports Selection */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Kies jouw sport
            </h2>
            <p className="text-xl text-gray-400">
              Start je zoektocht naar het perfecte team
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sports.map((sport, index) => (
              <motion.button
                key={sport.id}
                onClick={() => handleSportSelect(sport.id)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative h-64 rounded-2xl overflow-hidden group cursor-pointer focus:outline-none ${
                  sport.id !== 'voetbal' ? 'opacity-60' : ''
                }`}
              >
                {/* Background image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${sport.img})` }}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30 group-hover:from-[#F59E0B]/80 group-hover:via-black/60 transition-all duration-500" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {sport.icon}
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-[#F59E0B] transition-colors">
                    {sport.name}
                  </h3>
                  <p className="text-gray-200 text-sm">
                    {sport.description}
                  </p>
                  
                  {sport.id !== 'voetbal' && (
                    <span className="mt-4 text-xs bg-white/20 px-3 py-1 rounded-full">
                      Binnenkort beschikbaar
                    </span>
                  )}
                </div>

                {/* Active indicator */}
                {sport.id === 'voetbal' && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    ✓ Actief
                  </div>
                )}

                {/* Border glow on hover */}
                <div className="absolute inset-0 ring-0 group-hover:ring-4 group-hover:ring-[#F59E0B]/50 rounded-2xl transition-all duration-500" />
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#F59E0B]/10 to-[#D97706]/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Klaar om te beginnen?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Word lid van de SportMarkt community en ontdek nieuwe kansen
          </p>
          <button
            onClick={() => router.push('/start')}
            className="bg-[#F59E0B] hover:bg-[#D97706] text-white text-lg font-bold px-10 py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Gratis account aanmaken
          </button>
        </motion.div>
      </section>
    </div>
  )
}