'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  listing: {
    id: string
    title: string
    description: string
    type: string
  }
}

export default function ShareModal({ isOpen, onClose, listing }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  // Genereer de share URL
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/listing/${listing.id}`
    : ''

  const shareText = `${listing.title} - ${listing.description.substring(0, 100)}...`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareVia = (platform: string) => {
    let url = ''
    
    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
        break
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        break
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
        break
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
        break
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(listing.title)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`
        break
    }

    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="bg-[#1E293B] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Deel deze post</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Share buttons */}
              <div className="space-y-3 mb-6">
                <ShareButton
                  icon="📱"
                  label="WhatsApp"
                  color="from-green-500 to-green-600"
                  onClick={() => shareVia('whatsapp')}
                />
                <ShareButton
                  icon="📘"
                  label="Facebook"
                  color="from-blue-500 to-blue-600"
                  onClick={() => shareVia('facebook')}
                />
                <ShareButton
                  icon="🐦"
                  label="X (Twitter)"
                  color="from-sky-400 to-sky-500"
                  onClick={() => shareVia('twitter')}
                />
                <ShareButton
                  icon="💼"
                  label="LinkedIn"
                  color="from-blue-600 to-blue-700"
                  onClick={() => shareVia('linkedin')}
                />
                <ShareButton
                  icon="✉️"
                  label="E-mail"
                  color="from-gray-500 to-gray-600"
                  onClick={() => shareVia('email')}
                />
              </div>

              {/* Copy link */}
              <div className="border-t border-white/10 pt-4">
                <p className="text-sm text-gray-400 mb-2">Of kopieer de link</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-lg transition flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span className="text-sm">Gekopieerd!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span className="text-sm">Kopieer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function ShareButton({
  icon,
  label,
  color,
  onClick,
}: {
  icon: string
  label: string
  color: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r ${color} hover:opacity-90 transition text-white font-medium`}
    >
      <span className="text-2xl">{icon}</span>
      <span>Deel via {label}</span>
    </button>
  )
}