import { PageSkeleton } from '@/components/base'

export default function Loading() {
  return <PageSkeleton showStats statsCount={4} showTable tableRows={5} tableColumns={4} />
}
