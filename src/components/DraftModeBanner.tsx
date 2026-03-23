import Link from 'next/link'
import { Eye, X } from 'lucide-react'

interface DraftModeBannerProps {
  postStatus?: string
  reviewStatus?: string
  isAuthor?: boolean
}

export function DraftModeBanner({ postStatus, reviewStatus, isAuthor }: DraftModeBannerProps) {
  const getPreviewMessage = () => {
    if (postStatus === 'published') {
      return 'You&apos;re previewing a published post'
    }
    
    if (reviewStatus === 'pending_review') {
      return isAuthor 
        ? 'Your post is under review by editors - this preview shows how it will look when published'
        : 'This post is pending review - only editors and the author can see this preview'
    }
    
    if (reviewStatus === 'rejected') {
      return isAuthor
        ? 'Your post was rejected - check editor feedback and revise before resubmitting'
        : 'This post was rejected - only editors and the author can see this preview'
    }
    
    if (reviewStatus === 'approved') {
      return 'This post is approved and ready for publishing'
    }
    
    return 'You&apos;re previewing an unpublished draft - only editors/admins can see this'
  }

  const getBannerColor = () => {
    if (reviewStatus === 'rejected') return 'bg-red-500'
    if (reviewStatus === 'approved') return 'bg-green-500'
    if (reviewStatus === 'pending_review') return 'bg-orange-500'
    return 'bg-yellow-500'
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${getBannerColor()} text-white py-3 px-4 shadow-lg`}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5" />
          <div>
            <strong className="font-semibold">🔒 Editor Preview Mode</strong>
            <span className="ml-2 text-sm">
              {getPreviewMessage()}
            </span>
          </div>
        </div>
        <Link
          href="/api/disable-draft"
          className="flex items-center gap-2 bg-black/20 text-white px-4 py-2 rounded-md hover:bg-black/30 transition-colors text-sm font-medium"
        >
          <X className="w-4 h-4" />
          Exit Preview
        </Link>
      </div>
    </div>
  )
}
