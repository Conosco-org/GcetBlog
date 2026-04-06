import React from 'react'
import Link from 'next/link'
import { Media } from '@/components/shared/Media'
import type { Post, Media as MediaType } from '@/payload-types'
import { Star } from 'lucide-react'
import { formatDateTimeIST } from '@/utilities/formatDateTime'

interface FeaturedPostsProps {
  posts: Post[]
}

export const FeaturedPosts: React.FC<FeaturedPostsProps> = ({ posts }) => {
  if (posts.length === 0) return null

  return (
    <section className="py-16 bg-gradient-to-b from-accent/5 to-transparent">
      <div className="container mx-auto px-5 sm:px-6">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Star className="h-5 w-5 text-accent" fill="currentColor" />
          </div>
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold">Featured & Events</h2>
            <p className="text-sm text-muted-foreground">Highlighted by editors - don&apos;t miss these</p>
          </div>
        </div>

        {/* Featured Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => {
            const heroImage: MediaType | null =
              post.heroImage && typeof post.heroImage === 'object'
                ? (post.heroImage as MediaType)
                : null
            const metaImage =
              post.meta?.image && typeof post.meta.image === 'object'
                ? (post.meta.image as MediaType)
                : null
            const displayImage = metaImage || heroImage

            // Calculate remaining time for featured period (in IST)
            const featuredUntil = post.featuredUntil ? new Date(post.featuredUntil) : null
            const now = new Date()
            const daysRemaining = featuredUntil
              ? Math.ceil((featuredUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
              : null

            // Format featured until date in IST
            const featuredUntilIST = featuredUntil && post.featuredUntil ? formatDateTimeIST(post.featuredUntil) : null

            return (
              <Link
                key={post.id}
                href={`/posts/${post.slug}`}
                prefetch={true}
                className="group relative overflow-hidden rounded-2xl border-2 border-accent/20 bg-card hover:border-accent/40 hover:shadow-xl transition-all duration-300"
              >
                {/* Featured badge */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-accent text-accent-foreground text-xs font-semibold rounded-full shadow-lg">
                  <Star className="h-3 w-3" fill="currentColor" />
                  Featured
                </div>

                {/* Image */}
                <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                  {displayImage ? (
                    <Media
                      fill
                      resource={displayImage}
                      size="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      imgClassName="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                      <span className="font-display text-5xl text-accent/30">
                        {post.title?.charAt(0)?.toUpperCase() || 'G'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Categories */}
                  {post.categories && Array.isArray(post.categories) && post.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {post.categories.map((cat, idx) => {
                        const catTitle = typeof cat === 'object' ? cat.title : null
                        if (!catTitle) return null
                        return (
                          <span
                            key={idx}
                            className="text-[10px] tracking-wider uppercase text-accent font-medium"
                          >
                            {catTitle}
                          </span>
                        )
                      })}
                    </div>
                  )}

                  <h3 className="text-lg font-semibold leading-snug mb-2 group-hover:text-accent transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  {post.meta?.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {post.meta.description}
                    </p>
                  )}

                  {/* Footer with time remaining */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
                    <div className="flex flex-col gap-1">
                      {daysRemaining !== null && daysRemaining > 0 && (
                        <span className="flex items-center gap-1 text-accent">
                          <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                          {daysRemaining === 1 ? 'Last day!' : `${daysRemaining} days left`}
                        </span>
                      )}
                      {daysRemaining !== null && daysRemaining <= 0 && (
                        <span className="text-muted-foreground">Ending soon</span>
                      )}
                      {featuredUntilIST && (
                        <span className="text-[10px] text-muted-foreground">
                          Until: {featuredUntilIST}
                        </span>
                      )}
                    </div>
                    <span className="ml-auto flex items-center gap-1 font-medium tracking-wider uppercase text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                      Read More
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
