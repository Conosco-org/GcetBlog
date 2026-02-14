import { PageSkeleton } from '@/components/base'

export default function Loading() {
  return <PageSkeleton showFilters showTable tableRows={20} tableColumns={5} />
}
