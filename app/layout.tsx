import './globals.css'
import { AuthProvider } from '@/components/ui/AuthProvider'
import Navbar from '@/components/ui/navbar'

export const metadata = {
  title: 'MyScout',
  description: 'Verbind spelers en clubs in het Belgische amateurvoetbal.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className="min-h-screen bg-gray-100">
        <AuthProvider>
          <Navbar />
          <main className="pb-0">{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
