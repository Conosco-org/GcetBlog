import { Loader2 } from 'lucide-react'
import { cn } from '@/frontend/lib/utils'

interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg'
  /** Additional className */
  className?: string
  /** Label for screen readers */
  label?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
}

export function LoadingSpinner({ size = 'md', className, label = 'Loading' }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center', className)} role="status" aria-label={label}>
      <Loader2 className={cn('animate-spin text-muted-foreground', sizeClasses[size])} />
      <span className="sr-only">{label}</span>
    </div>
  )
}
