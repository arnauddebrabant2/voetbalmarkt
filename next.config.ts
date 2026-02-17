import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.api-sports.io',
      },
      {
        protocol: 'https',
        hostname: 'www.voetbalinbelgie.be',
        pathname: '/images/**',
      },
    ],
  },
}

export default nextConfig
