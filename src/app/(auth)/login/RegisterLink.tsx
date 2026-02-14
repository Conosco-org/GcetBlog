'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Loader2 } from 'lucide-react'

export function RegisterLink() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    startTransition(() => {
      router.push('/register')
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1 disabled:opacity-70"
    >
      {isPending ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          Loading...
        </>
      ) : (
        'Apply to become a contributor'
      )}
    </button>
  )
}
