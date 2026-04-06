import { LoadingSpinner } from '@frontend/components/base/LoadingSpinner'

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" />
    </div>
  )
}
