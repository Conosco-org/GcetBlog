'use client'

import Link from 'next/link'
import { Logo } from '@/components/layout/Logo/Logo'

export default function CustomLogo() {
  return (
    <Link href="/admin" className="flex items-center gap-3 px-6 py-4">
      <Logo className="h-8 w-auto" />
      <div className="flex flex-col">
        <span className="text-lg font-bold text-gray-900 dark:text-white">GCET Blog</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">Admin Dashboard</span>
      </div>
    </Link>
  )
}
