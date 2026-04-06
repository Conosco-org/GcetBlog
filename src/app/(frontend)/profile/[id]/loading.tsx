import { PageSkeleton } from '@/components/base/PageSkeleton'

export default function Loading() {
  return <PageSkeleton showStats statsCount={3} showTable tableRows={10} />
}
