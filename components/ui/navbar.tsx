'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/components/ui/AuthProvider'   // ✅ correcte import
import { supabase } from '@/lib/supabaseClient'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const { user, profile } = useAuth()
  const pathname = usePathname()

  // 🔹 Active link styling
  const linkStyle = (path: string) =>
    `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      pathname === path
        ? 'bg-white text-[#0F172A]'
        : 'text-white hover:bg-white/20'
    }`

  // 🔹 Haal displayName en anonimiteit uit context
  const displayName = profile?.display_name ?? null
  const isAnonymous = profile?.is_anonymous ?? false

  // 🔹 Bepaal wat getoond wordt
  const nameToShow = isAnonymous
    ? 'Anoniem'
    : displayName
    ? displayName
    : user?.email
    ? user.email.split('@')[0]
    : ''

  return (
    <nav className="flex items-center justify-between bg-[#047857] px-6 py-3 shadow-md sticky top-0 z-50">
      {/* 🔹 Links: logo + naam */}
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/logo4.png"
          alt="Voetbalmarkt logo"
          width={40}
          height={40}
          className="rounded"
        />
        <span className="text-2xl font-bold text-[#F59E0B]">
          Voetbal<span className="text-[#0F172A]">Markt</span>
        </span>
      </Link>

      {/* 🔹 Midden: navigatie */}
      <div className="flex items-center gap-4">
        <Link href="/" className={linkStyle('/')}>
          Home
        </Link>
        <Link href="/zoekertjes" className={linkStyle('/zoekertjes')}>
          Zoekertjes
        </Link>
      </div>

      {/* 🔹 Rechts: profiel / login */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link
              href="/profiel"
              className="flex items-center gap-2 text-white hover:opacity-90 transition"
            >
              <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center font-semibold text-white uppercase">
                {isAnonymous
                  ? '?'
                  : displayName
                  ? displayName.charAt(0).toUpperCase()
                  : user.email?.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline text-sm">{nameToShow}</span>
            </Link>

            <button
              onClick={() => supabase.auth.signOut()}
              className="bg-[#0F172A] text-white px-3 py-1.5 rounded hover:bg-[#1E293B] text-sm"
            >
              Uitloggen
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="bg-[#0F172A] text-white px-3 py-1.5 rounded hover:bg-[#1E293B] text-sm"
          >
            Inloggen
          </Link>
        )}
      </div>
    </nav>
  )
}
