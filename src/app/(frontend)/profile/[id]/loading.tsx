import { PageSkeleton } from '@frontend/components/base'

export default function Loading() {
  return <PageSkeleton showStats statsCount={3} showTable tableRows={10} />
}
