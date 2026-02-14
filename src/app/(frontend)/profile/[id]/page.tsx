import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  ThumbsUp,
  Calendar,
  Globe,
  Linkedin,
  Github,
  Twitter,
  BookOpen,
  GraduationCap,
  MessageCircle,
} from 'lucide-react'
import type { Media as MediaType, User, Post } from '@/payload-types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })

  // Fetch user
  let user: User
  try {
    user = await payload.findByID({
      collection: 'users',
      id,
      depth: 1,
    })
  } catch {
    notFound()
  }

  if (!user) notFound()

  // Fetch user's published posts
  const posts = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { authors: { contains: user.id } },
        { _status: { equals: 'published' } },
      ],
    },
    sort: '-publishedAt',
    limit: 20,
    depth: 1,
  })

  // Count total votes received across all posts
  const postIds = posts.docs.map((p) => p.id)
  let totalUpvotes = 0
  let totalDownvotes = 0
  if (postIds.length > 0) {
    const [upvotes, downvotes] = await Promise.all([
      payload.count({
        collection: 'votes',
        where: { and: [{ post: { in: postIds.join(',') } }, { value: { equals: 1 } }] },
      }),
      payload.count({
        collection: 'votes',
        where: { and: [{ post: { in: postIds.join(',') } }, { value: { equals: -1 } }] },
      }),
    ])
    totalUpvotes = upvotes.totalDocs
    totalDownvotes = downvotes.totalDocs
  }

  // Count comments by user
  const commentsCount = await payload.count({
    collection: 'comments',
    where: { author: { equals: user.id } },
  })

  const avatar = user.avatar as MediaType | null
  const avatarUrl = avatar?.url || null
  const socialLinks = user.socialLinks as { twitter?: string; linkedin?: string; github?: string; website?: string } | undefined
  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-8">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              {/* Avatar */}
              <div className="shrink-0">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={user.name}
                    width={120}
                    height={120}
                    className="rounded-full object-cover w-[120px] h-[120px] border-4 border-primary/10"
                  />
                ) : (
                  <div className="w-[120px] h-[120px] rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                  <Badge variant="secondary" className="capitalize">
                    {user.role || 'contributor'}
                  </Badge>
                  {user.department && (
                    <Badge variant="outline" className="gap-1">
                      <GraduationCap className="w-3 h-3" />
                      {user.department}
                    </Badge>
                  )}
                  {user.year && (
                    <Badge variant="outline">{user.year}</Badge>
                  )}
                </div>

                {user.bio && (
                  <p className="mt-4 text-muted-foreground max-w-2xl">{user.bio}</p>
                )}

                {/* Social Links */}
                {socialLinks && (socialLinks.twitter || socialLinks.linkedin || socialLinks.github || socialLinks.website) && (
                  <div className="flex gap-3 mt-4 justify-center md:justify-start">
                    {socialLinks.twitter && (
                      <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition" aria-label="Twitter">
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                    {socialLinks.linkedin && (
                      <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition" aria-label="LinkedIn">
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {socialLinks.github && (
                      <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition" aria-label="GitHub">
                        <Github className="w-5 h-5" />
                      </a>
                    )}
                    {socialLinks.website && (
                      <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition" aria-label="Website">
                        <Globe className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                )}

                <p className="text-sm text-muted-foreground mt-3 flex items-center gap-1 justify-center md:justify-start">
                  <Calendar className="w-4 h-4" />
                  Member since {memberSince}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <FileText className="w-8 h-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{posts.totalDocs}</p>
              <p className="text-sm text-muted-foreground">Posts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <ThumbsUp className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold">{totalUpvotes}</p>
              <p className="text-sm text-muted-foreground">Upvotes Received</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <MessageCircle className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold">{commentsCount.totalDocs}</p>
              <p className="text-sm text-muted-foreground">Comments</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <BookOpen className="w-8 h-8 mx-auto text-amber-500 mb-2" />
              <p className="text-2xl font-bold">{totalUpvotes - totalDownvotes}</p>
              <p className="text-sm text-muted-foreground">Net Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Published Posts ({posts.totalDocs})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {posts.docs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No published posts yet.
              </p>
            ) : (
              <div className="divide-y">
                {posts.docs.map((post: Post) => {
                  const heroImage = post.heroImage as MediaType | null
                  return (
                    <Link
                      key={post.id}
                      href={`/posts/${post.slug}`}
                      className="flex gap-4 py-4 hover:bg-muted/50 -mx-4 px-4 rounded-lg transition"
                    >
                      {heroImage?.url && (
                        <Image
                          src={heroImage.url}
                          alt={post.title}
                          width={80}
                          height={60}
                          className="rounded-lg object-cover w-20 h-15 shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{post.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span>
                            {post.publishedAt
                              ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'Draft'}
                          </span>
                          {typeof post.voteScore === 'number' && post.voteScore !== 0 && (
                            <span className={post.voteScore > 0 ? 'text-green-600' : 'text-red-500'}>
                              {post.voteScore > 0 ? '+' : ''}{post.voteScore} votes
                            </span>
                          )}
                          {Array.isArray(post.tags) && post.tags.length > 0 && (
                            <span className="truncate">
                              {(post.tags as string[]).slice(0, 3).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
