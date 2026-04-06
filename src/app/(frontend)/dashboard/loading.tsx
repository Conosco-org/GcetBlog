import { PageSkeleton } from '@frontend/components/base/PageSkeleton'

export default function Loading() {
  return <PageSkeleton showStats statsCount={4} />
}
