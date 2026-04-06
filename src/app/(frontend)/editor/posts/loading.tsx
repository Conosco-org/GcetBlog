import { PageSkeleton } from '@/components/base/PageSkeleton'

export default function Loading() {
  return <PageSkeleton showFilters showTable tableRows={10} tableColumns={6} />
}
