import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User } from '@/payload-types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/utilities/formatDateTime'
import Link from 'next/link'
import { Edit, Trash2, Send, FileText, AlertCircle } from 'lucide-react'

export default async function DraftsPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  const typedUser = user as User

  if (typedUser.role !== 'contributor') {
    redirect('/dashboard')
  }

  // Fetch drafts
  const drafts = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { authors: { equals: typedUser.id } },
        { reviewStatus: { equals: 'draft' } },
      ],
    },
    sort: '-updatedAt',
    limit: 50,
  })

  return (
    <div className="container max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Drafts</h1>
            <p className="text-muted-foreground mt-1">
              Continue working on your unfinished posts
            </p>
          </div>
          <Button asChild>
            <Link href="/contributor/create">
              <FileText className="h-4 w-4 mr-2" />
              New Draft
            </Link>
          </Button>
        </div>
      </div>

      {drafts.docs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Drafts</h3>
            <p className="text-muted-foreground mb-4">
              All your draft posts will appear here
            </p>
            <Button asChild>
              <Link href="/contributor/create">Create New Draft</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drafts.docs.map((post) => (
            <Card key={post.id} className="hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                  <Badge variant="outline" className="flex-shrink-0">Draft</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Last edited: {formatDateTime(post.updatedAt)}
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="default" size="sm" asChild className="flex-1">
                    <Link href={`/contributor/edit/${post.id}`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Continue
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/contributor/submit/${post.id}`}>
                      <Send className="h-4 w-4 mr-1" />
                      Submit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
