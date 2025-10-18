import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/Logo/Logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Simple header with logo and back button */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo loading="eager" priority="high" className="invert dark:invert-0 h-8" />
          </Link>
          <Link 
            href="/" 
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>

      {/* Auth content */}
      <main>{children}</main>

      {/* Simple footer */}
      <footer className="container mx-auto px-4 py-6 mt-8">
        <p className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} GCET Blog. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
