import { PageSkeleton } from '@frontend/components/base'

export default function Loading() {
  return <PageSkeleton showFilters showTable tableRows={8} tableColumns={3} />
}
