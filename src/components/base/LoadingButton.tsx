import { Loader2 } from 'lucide-react'
import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/utilities/ui'

interface LoadingButtonProps extends ButtonProps {
  /** Whether the button is in a loading state */
  loading?: boolean
  /** Text to show while loading (optional) */
  loadingText?: string
}

export function LoadingButton({
  loading = false,
  loadingText,
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      className={cn('relative', className)}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      )}
      {loading && loadingText ? loadingText : children}
    </Button>
  )
}
