import Link from 'next/link'
import { Button } from '@frontend/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center px-4">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <FileQuestion className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Post Not Found</h2>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        The post you&apos;re trying to edit doesn&apos;t exist or you don&apos;t have permission to edit it.
      </p>
      <Button asChild>
        <Link href="/editor/posts">Back to Posts</Link>
      </Button>
    </div>
  )
}
