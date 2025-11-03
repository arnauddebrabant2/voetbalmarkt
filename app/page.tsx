'use client'
import Link from 'next/link'
import { useAuth } from '@/components/ui/AuthProvider'
import { motion } from 'framer-motion'

export default function HomePage() {
  const { user, profile } = useAuth()
  const role = profile?.role

  return (
    <main className="relative min-h-[calc(100vh-5rem)] w-full flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100 text-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-8 max-w-3xl w-full px-6"
      >
        <div className="flex flex-col items-center space-y-3">
          <div className="flex items-center gap-3">
            <img
              src="/logo4.png"
              alt="Voetbalmarkt logo"
              className="w-16 h-16 rounded-xl"
            />
            <h1 className="text-5xl font-extrabold text-[#0F172A] tracking-tight">
              <span className="text-[#F59E0B]">Voetbal</span>markt
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-xl">
            Verbind spelers, clubs en scouts in het Belgische amateurvoetbal.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-5">
          {/* Dynamisch per rol */}
          {role === 'speler' ? (
            <>
              <Link
                href="/clubs"
                className="bg-[#0F172A] text-white px-6 py-3 rounded-xl shadow hover:bg-[#1E293B] transition font-medium"
              >
                🏟️ Zoek clubs
              </Link>
              <Link
                href="/zoekertjes"
                className="bg-[#F59E0B] text-white px-6 py-3 rounded-xl shadow hover:bg-[#D97706] transition font-medium"
              >
                📢 Bekijk zoekertjes
              </Link>
            </>
          ) : role === 'club' ? (
            <>
              <Link
                href="/spelers"
                className="bg-[#0F172A] text-white px-6 py-3 rounded-xl shadow hover:bg-[#1E293B] transition font-medium"
              >
                👟 Zoek spelers
              </Link>
              <Link
                href="/zoekertjes"
                className="bg-[#F59E0B] text-white px-6 py-3 rounded-xl shadow hover:bg-[#D97706] transition font-medium"
              >
                📢 Bekijk zoekertjes
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/spelers"
                className="bg-[#0F172A] text-white px-6 py-3 rounded-xl shadow hover:bg-[#1E293B] transition font-medium"
              >
                👟 Bekijk spelers
              </Link>
              <Link
                href="/clubs"
                className="bg-[#0F172A] text-white px-6 py-3 rounded-xl shadow hover:bg-[#1E293B] transition font-medium"
              >
                🏟️ Bekijk clubs
              </Link>
            </>
          )}

          {/* Iedereen kan een zoekertje plaatsen */}
          <Link
            href={user ? '/plaats' : '/login'}
            className="bg-[#F59E0B] text-white px-6 py-3 rounded-xl shadow hover:bg-[#D97706] transition font-medium"
          >
            📢 Plaats zoekertje
          </Link>
        </div>

        {!user && (
          <p className="text-sm text-gray-500">
            <Link
              href="/login"
              className="text-[#D97706] font-semibold hover:underline"
            >
              Log in
            </Link>{' '}
            om zoekertjes te plaatsen of spelers te vinden
          </p>
        )}
      </motion.div>

      

    </main>
  )
}
