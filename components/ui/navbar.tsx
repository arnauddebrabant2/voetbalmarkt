'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/components/ui/AuthProvider'
import { supabase } from '@/lib/supabaseClient'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Navbar() {
  const { user, profile, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Publieke pagina's waar je niet ingelogd hoeft te zijn
    const publicPaths = ['/start', '/privacy', '/login', '/register']
    const isPublic = publicPaths.some((path) => pathname === path || pathname.startsWith(path))

    // wacht tot Supabase klaar is
    if (loading) return

    // alleen redirecten als we GEEN user hebben, NIET aan het inloggen zijn
    // en we niet op een publieke pagina zitten
    // MAAR: op homepage (/) is het ok om niet ingelogd te zijn
    if (!user && !isPublic && pathname !== '/') {
      // redirect naar login in plaats van start
      const timeout = setTimeout(() => {
        router.replace('/login')
      }, 200)
      return () => clearTimeout(timeout)
    }
  }, [user, loading, pathname, router])

  const linkStyle = (path: string) =>
    `px-4 py-2 rounded-md text-lg font-medium transition-colors ${
      pathname === path
        ? 'text-[#F59E0B] font-semibold'
        : 'text-[#0F172A] hover:text-[#F59E0B]'
    }`

  const displayName = profile?.display_name ?? null
  const isAnonymous = profile?.is_anonymous ?? false
  const role = profile?.role // speler / club / trainer

  const nameToShow = isAnonymous
    ? 'Anoniem'
    : displayName || user?.email?.split('@')[0] || ''

  // ❌ Navbar ALLEEN niet tonen op deze specifieke pagina's
  // EN op homepage als je NIET ingelogd bent
  if (
    pathname === '/start' ||
    pathname === '/privacy' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    (pathname === '/' && !user) // ← alleen op homepage zonder user
  ) {
    return null
  }

  return (
    <nav className="flex items-center justify-between bg-[#F8FAFC] text-[#0F172A] px-6 h-16 shadow-md sticky top-0 z-50">
      {/* Logo + naam */}
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/logo4.png"
          alt="Voetbalmarkt logo"
          width={40}
          height={40}
          className="rounded"
        />
        <span className="text-2xl font-bold">
          <span className="text-[#0F172A]">My</span>
          <span className="text-[#F59E0B]">Scout</span>
        </span>
      </Link>

      {/* Navigatie */}
      <div className="flex items-center gap-4">
        <Link href="/" className={linkStyle('/')}>
          Home
        </Link>

        {role === 'speler' && (
          <Link href="/clubs" className={linkStyle('/clubs')}>
            Clubs
          </Link>
        )}
        {role === 'club' && (
          <Link href="/spelers" className={linkStyle('/spelers')}>
            Spelers
          </Link>
        )}
        {role === 'trainer' && (
          <Link href="/teams" className={linkStyle('/teams')}>
            Teams
          </Link>
        )}
      </div>

      {/* Rechts: profiel / login */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link
              href="/profiel"
              className="flex items-center gap-2 hover:text-[#F59E0B] transition"
            >
              <div className="w-8 h-8 rounded-full bg-[#0F172A]/10 flex items-center justify-center font-semibold text-[#0F172A] uppercase">
                {isAnonymous
                  ? '?'
                  : displayName?.charAt(0).toUpperCase() ||
                    user.email?.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline text-lg font-medium">
                {nameToShow}
              </span>
            </Link>

            <button
              onClick={() => supabase.auth.signOut()}
              className="bg-[#0F172A] text-white px-3 py-1.5 rounded hover:bg-[#1E293B] text-sm font-medium transition-colors"
            >
              Uitloggen
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="bg-[#0F172A] text-white px-3 py-1.5 rounded hover:bg-[#1E293B] text-sm font-medium transition-colors"
          >
            Inloggen
          </Link>
        )}
      </div>
    </nav>
  )
}