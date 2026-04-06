import { PageSkeleton } from '@frontend/components/base/PageSkeleton'

export default function Loading() {
  return <PageSkeleton showFilters showGrid gridItems={12} />
}
