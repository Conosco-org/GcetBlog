import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <main className="min-h-screen" aria-busy="true" aria-live="polite" aria-label="Loading page">
      <div className="h-[42vh] w-full border-b border-border bg-card/30">
        <div className="container mx-auto h-full px-5 sm:px-6 py-6 sm:py-8 flex flex-col justify-end gap-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full max-w-3xl" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="container mx-auto px-5 sm:px-6 py-10 sm:py-14 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-[96%]" />
          <Skeleton className="h-5 w-[92%]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-3 rounded-xl border border-border p-4">
              <Skeleton className="h-44 w-full rounded-lg" />
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
