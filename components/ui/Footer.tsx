'use client'

import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()

  // Verberg footer op de startpagina
  const HIDE_ON = new Set<string>(['/start'])
  if (HIDE_ON.has(pathname)) return null

  // Check of we op login of register zitten
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')

  return (
    <footer
      className={`h-12 mt-auto w-full text-center text-xs flex items-center justify-center border-t
        transition-colors duration-500
        ${
          isAuthPage
            ? 'bg-transparent border-white/20 text-gray-200 backdrop-blur-sm'
            : 'bg-[#1E293B] border-[#1E293B] text-gray-400'
        }`}
    >
      © {new Date().getFullYear()} VoetbalMarkt — gemaakt met ⚽ & ❤️
      <span className="mx-2">|</span>
      <a
        href="/privacy"
        className={`transition-colors ${
          isAuthPage
            ? 'text-[#F59E0B] hover:text-[#FBBF24]'
            : 'text-[#F59E0B] hover:underline'
        }`}
      >
        Privacybeleid
      </a>
    </footer>
  )
}
