import { PageSkeleton } from '@/components/base/PageSkeleton'

export default function Loading() {
  return <PageSkeleton showFilters showGrid gridItems={12} />
}
