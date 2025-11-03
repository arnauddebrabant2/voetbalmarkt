// app/layout.tsx  ✅ SERVER COMPONENT
import './globals.css'
import { AuthProvider } from '@/components/ui/AuthProvider'
import Navbar from '@/components/ui/navbar'
import Footer from '@/components/ui/Footer' // new file we’ll create

export const metadata = {
  title: 'MyScout',
  description: 'Verbind spelers en clubs in het Belgische amateurvoetbal.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body className="flex flex-col min-h-screen bg-gray-100 text-gray-900">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
        </AuthProvider>
        <Footer />
      </body>
    </html>
  )
}
