'use client'

import { useState } from 'react'
import { Button } from '@frontend/components/ui/button'
import { Loader2 } from 'lucide-react'

interface MicrosoftSignInButtonProps {
  redirectTo?: string
  label?: string
  className?: string
}

export function MicrosoftSignInButton({
  redirectTo,
  label = 'Continue with Microsoft',
  className,
}: MicrosoftSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = () => {
    setIsLoading(true)
    const params = new URLSearchParams()
    if (redirectTo) {
      params.set('redirect', redirectTo)
    }
    const url = `/api/auth/microsoft${params.toString() ? `?${params.toString()}` : ''}`
    window.location.href = url
  }

  return (
    <div className={`w-full ${className || ''}`}>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Redirecting to Microsoft...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" viewBox="0 0 21 21">
              <rect x="1" y="1" width="9" height="9" fill="#f25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
              <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
            </svg>
            {label}
          </>
        )}
      </Button>
      <p className="text-xs text-center text-muted-foreground mt-2">
        Use your @gcet.edu.in work or school account
      </p>
    </div>
  )
}
