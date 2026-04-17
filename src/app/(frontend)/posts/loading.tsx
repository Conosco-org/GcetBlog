import { Skeleton } from '@frontend/components/ui/skeleton'

export default function Loading() {
  return (
    <main className="min-h-screen" aria-busy="true" aria-live="polite" aria-label="Loading posts">
      <div className="container mx-auto px-5 sm:px-6 pt-20 pb-4 md:pt-24 md:pb-6 space-y-3">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="container mx-auto px-5 sm:px-6 mb-4">
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-10 w-72 max-w-full" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="container mx-auto px-5 sm:px-6 mb-4">
        <Skeleton className="h-4 w-44" />
      </div>

      <div className="container px-5 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {Array.from({ length: 9 }).map((_, index) => (
            <article
              key={index}
              className="relative overflow-hidden rounded-2xl border border-border bg-card p-0"
            >
              <Skeleton className="aspect-[3/2] sm:aspect-[16/10] w-full rounded-none" />
              <div className="p-4 sm:p-5 space-y-3">
                <Skeleton className="h-5 w-[85%]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="pt-3 border-t border-border">
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
