'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/components/ui/AuthProvider'
import { supabase } from '@/lib/supabaseClient'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X, MessageCircle, Home, Users, Building2, Shield } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const { user, profile, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const publicPaths = ['/start', '/privacy', '/login', '/register']
    const isPublic = publicPaths.some((path) => pathname === path || pathname.startsWith(path))

    if (loading) return

    if (!user && !isPublic && pathname !== '/') {
      const timeout = setTimeout(() => {
        router.replace('/login')
      }, 200)
      return () => clearTimeout(timeout)
    }
  }, [user, loading, pathname, router])

  // Fetch ongelezen berichten count
  useEffect(() => {
    if (!user) return

    const fetchUnreadCount = async () => {
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)

      if (!conversations) return

      const conversationIds = conversations.map(c => c.id)

      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .neq('sender_id', user.id)
        .eq('read', false)

      setUnreadCount(count || 0)
    }

    fetchUnreadCount()

    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchUnreadCount()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const displayName = profile?.display_name ?? null
  const isAnonymous = profile?.is_anonymous ?? false
  const role = profile?.role

  const nameToShow = isAnonymous
    ? 'Anoniem'
    : displayName || user?.email?.split('@')[0] || ''

  if (
    pathname === '/start' ||
    pathname === '/privacy' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    (pathname === '/' && !user)
  ) {
    return null
  }

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <>
      <nav className="bg-white border-b border-gray-200 px-6 h-16 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-8">
          
          {/* Logo - Links */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <Image
              src="/logo4.png"
              alt="MyScout"
              width={40}
              height={40}
              className="rounded-lg transition-transform group-hover:scale-105"
            />
            <span className="text-xl font-bold hidden sm:block">
              <span className="text-gray-900">My</span>
              <span className="text-[#F59E0B]">Scout</span>
            </span>
          </Link>

          {/* Navigatie - Center (Desktop) */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            <NavLink href="/" active={isActive('/')}>
              <Home className="w-4 h-4" />
              <span>Home</span>
            </NavLink>
            <NavLink href="/spelers" active={isActive('/spelers')}>
              <Users className="w-4 h-4" />
              <span>Spelers</span>
            </NavLink>
            <NavLink href="/clubs" active={isActive('/clubs')}>
              <Building2 className="w-4 h-4" />
              <span>Clubs</span>
            </NavLink>
            {role === 'trainer' && (
              <NavLink href="/teams" active={isActive('/teams')}>
                <Shield className="w-4 h-4" />
                <span>Teams</span>
              </NavLink>
            )}
            {user && (
              <NavLink href="/berichten" active={isActive('/berichten')} badge={unreadCount}>
                <MessageCircle className="w-4 h-4" />
                <span>Berichten</span>
              </NavLink>
            )}
          </div>

          {/* Profiel + Uitloggen - Rechts (Desktop) */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {user ? (
              <>
                <Link
                  href="/profiel"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center text-white font-bold shadow-sm">
                    {isAnonymous
                      ? '?'
                      : displayName?.charAt(0).toUpperCase() ||
                        user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {nameToShow}
                  </span>
                </Link>

                <button
                  onClick={() => supabase.auth.signOut()}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Uitloggen
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Inloggen
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -mr-2 hover:bg-gray-50 rounded-lg transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-700" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/30 z-40"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="md:hidden fixed top-16 right-0 bottom-0 w-72 bg-white border-l border-gray-200 shadow-xl z-40 overflow-y-auto"
            >
              <div className="p-5 space-y-5">
                
                {/* User Info */}
                {user && (
                  <div className="pb-5 border-b border-gray-200">
                    <Link
                      href="/profiel"
                      className="flex items-center gap-3 p-3 -m-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center text-white font-bold">
                        {isAnonymous
                          ? '?'
                          : displayName?.charAt(0).toUpperCase() ||
                            user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate text-sm">
                          {nameToShow}
                        </p>
                        <p className="text-xs text-gray-500">
                          {role === 'club' ? 'Club' : 'Speler'}
                        </p>
                      </div>
                    </Link>
                  </div>
                )}

                {/* Mobile Nav Links */}
                <div className="space-y-1">
                  <MobileNavLink href="/" icon={Home} active={isActive('/')}>
                    Home
                  </MobileNavLink>
                  <MobileNavLink href="/spelers" icon={Users} active={isActive('/spelers')}>
                    Spelers
                  </MobileNavLink>
                  <MobileNavLink href="/clubs" icon={Building2} active={isActive('/clubs')}>
                    Clubs
                  </MobileNavLink>
                  {role === 'trainer' && (
                    <MobileNavLink href="/teams" icon={Shield} active={isActive('/teams')}>
                      Teams
                    </MobileNavLink>
                  )}
                  {user && (
                    <MobileNavLink href="/berichten" icon={MessageCircle} active={isActive('/berichten')} badge={unreadCount}>
                      Berichten
                    </MobileNavLink>
                  )}
                </div>

                {/* Mobile Actions */}
                {user ? (
                  <button
                    onClick={() => {
                      supabase.auth.signOut()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Uitloggen
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="block w-full px-4 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-white text-sm font-semibold text-center rounded-lg transition-colors"
                  >
                    Inloggen
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function NavLink({ href, active, badge, children }: any) {
  return (
    <Link
      href={href}
      className={`
        relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors
        ${active 
          ? 'text-[#F59E0B] bg-[#F59E0B]/5' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }
      `}
    >
      {children}
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  )
}

function MobileNavLink({ href, icon: Icon, active, badge, children }: any) {
  return (
    <Link
      href={href}
      className={`
        relative flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors
        ${active 
          ? 'text-[#F59E0B] bg-[#F59E0B]/5' 
          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
        }
      `}
    >
      <Icon className="w-4 h-4" />
      {children}
      {badge > 0 && (
        <span className="ml-auto min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  )
}