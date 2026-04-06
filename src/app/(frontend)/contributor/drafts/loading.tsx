import { PageSkeleton } from '@frontend/components/base'

export default function Loading() {
  return <PageSkeleton showFilters showGrid gridItems={12} />
}
