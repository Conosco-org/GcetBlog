import { Skeleton } from '@/frontend/components/ui/skeleton'

export default function Loading() {
  return (
    <main className="min-h-screen" aria-busy="true" aria-live="polite" aria-label="Loading home page">
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-6 pt-20 pb-14 md:pt-28 md:pb-20">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-start">
            <div className="lg:col-span-7 space-y-4">
              <Skeleton className="h-14 w-72" />
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-5 w-full max-w-xl" />
              <Skeleton className="h-5 w-[92%] max-w-xl" />
              <div className="flex gap-3 pt-2">
                <Skeleton className="h-11 w-36 rounded-full" />
                <Skeleton className="h-11 w-36 rounded-full" />
              </div>
            </div>
            <div className="lg:col-span-5 hidden lg:block">
              <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-10">
            <div className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-64" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Skeleton className="min-h-[320px] sm:min-h-[420px] rounded-2xl" />
            <div className="space-y-4 sm:space-y-6">
              <Skeleton className="h-36 sm:h-40 rounded-2xl" />
              <Skeleton className="h-36 sm:h-40 rounded-2xl" />
              <Skeleton className="h-36 sm:h-40 rounded-2xl" />
              <Skeleton className="h-36 sm:h-40 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
