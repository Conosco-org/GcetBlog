import Link from 'next/link'
import { Eye, X } from 'lucide-react'

export function DraftModeBanner({ postStatus }: { postStatus?: string }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black py-3 px-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5" />
          <div>
            <strong className="font-semibold">🔒 Editor Preview Mode</strong>
            <span className="ml-2 text-sm">
              {postStatus === 'published' 
                ? 'You&apos;re previewing a published post' 
                : 'You&apos;re previewing an unpublished draft - only editors/admins can see this'}
            </span>
          </div>
        </div>
        <Link
          href="/api/disable-draft"
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          <X className="w-4 h-4" />
          Exit Preview
        </Link>
      </div>
    </div>
  )
}
