import { PageSkeleton } from '@/components/base'

export default function Loading() {
  return <PageSkeleton showStats statsCount={3} showFilters showTable tableRows={15} tableColumns={5} />
}
