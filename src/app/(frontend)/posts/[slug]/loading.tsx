import { Skeleton } from '@frontend/components/ui/skeleton'

export default function Loading() {
  return (
    <article className="pb-16" aria-busy="true" aria-live="polite" aria-label="Loading article">
      <div className="h-[42vh] w-full border-b border-border bg-card/30">
        <div className="container mx-auto h-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-end gap-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full max-w-3xl" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 mt-10 sm:mt-14">
        <div className="lg:grid lg:grid-cols-[1fr_680px_1fr] xl:grid-cols-[1fr_720px_1fr] gap-6">
          <div className="hidden lg:flex lg:col-start-1 lg:justify-end lg:pr-6">
            <div className="sticky top-24 flex flex-col items-center gap-4 pt-2 w-12">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-6 w-8" />
            </div>
          </div>

          <div className="lg:col-start-2 space-y-5">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>

            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-[95%]" />
            <Skeleton className="h-5 w-[92%]" />
            <Skeleton className="h-52 w-full rounded-lg" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-[96%]" />
            <Skeleton className="h-5 w-[90%]" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>

          <div className="hidden lg:block lg:col-start-3 lg:pl-8">
            <div className="sticky top-24 space-y-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
