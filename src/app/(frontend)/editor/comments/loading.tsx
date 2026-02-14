import { PageSkeleton } from '@/components/base'

export default function Loading() {
  return <PageSkeleton showTable tableRows={10} tableColumns={4} />
}
