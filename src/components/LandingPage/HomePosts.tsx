import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Calendar, User } from 'lucide-react'
import type { Post, Media, Category } from '@/payload-types'
import { formatDateTime } from '@/utilities/formatDateTime'

interface HomePostsProps {
  posts: Post[]
}

function getPostImage(post: Post): Media | null {
  if (typeof post.heroImage === 'object' && post.heroImage) return post.heroImage as Media
  if (post.meta && typeof post.meta.image === 'object' && post.meta.image) return post.meta.image as Media
  return null
}

function getPostCategory(post: Post): string {
  if (post.categories && post.categories.length > 0) {
    const cat = post.categories[0]
    if (typeof cat === 'object' && cat !== null) return (cat as Category).title || 'Uncategorized'
  }
  return 'Uncategorized'
}

function getPostAuthor(post: Post): string {
  if (post.populatedAuthors && post.populatedAuthors.length > 0) {
    return post.populatedAuthors[0]?.name || 'Anonymous'
  }
  return 'Anonymous'
}

export const HomePosts: React.FC<HomePostsProps> = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-3xl mb-4">No Posts Yet</h2>
          <p className="text-muted-foreground">Check back soon for exciting content from our community.</p>
        </div>
      </section>
    )
  }

  const featured = posts[0]
  const rest = posts.slice(1, 5)
  const featuredImage = featured ? getPostImage(featured) : null

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 md:mb-12 animate-fade-up">
          <div>
            <span className="text-xs tracking-widest uppercase text-accent font-medium">From the Community</span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl mt-3 leading-[1.1]">
              Latest Stories
            </h2>
          </div>
          <Link
            href="/posts"
            className="group inline-flex items-center gap-2 text-sm font-medium tracking-wide hover:text-accent transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Bento Grid - mobile stacked, desktop side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 animate-fade-up stagger-2">
          {/* Featured Post - Large */}
          {featured && (
            <Link href={`/posts/${featured.slug}`} className="group block lg:row-span-2">
              <article className="relative h-full min-h-[300px] sm:min-h-[400px] lg:min-h-full overflow-hidden rounded-2xl border border-border bg-card">
                <div className="relative h-full">
                  {featuredImage?.url ? (
                    <Image
                      src={featuredImage.url}
                      alt={featuredImage.alt || featured.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/5" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  
                  {/* Content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                    <span className="inline-block px-2.5 py-1 bg-accent text-accent-foreground text-[10px] sm:text-xs font-medium tracking-wider uppercase rounded-full mb-3 sm:mb-4">
                      {getPostCategory(featured)}
                    </span>
                    <h3 className="font-display text-xl sm:text-2xl md:text-3xl text-white leading-snug mb-2 sm:mb-3 group-hover:text-accent transition-colors line-clamp-3">
                      {featured.title}
                    </h3>
                    {featured.meta?.description && (
                      <p className="text-white/70 text-sm line-clamp-2 mb-3 sm:mb-4 max-w-lg hidden sm:block">
                        {featured.meta.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-white/60">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3 h-3" />
                        {getPostAuthor(featured)}
                      </span>
                      {featured.publishedAt && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {formatDateTime(featured.publishedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          )}

          {/* Smaller Posts */}
          {rest.map((post) => {
            const image = getPostImage(post)
            return (
              <Link key={post.id} href={`/posts/${post.slug}`} className="group block">
                <article className="flex gap-4 p-4 sm:p-5 rounded-2xl border border-border bg-card hover:shadow-md transition-shadow duration-300 h-full">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-muted">
                    {image?.url ? (
                      <Image
                        src={image.url}
                        alt={image.alt || post.title}
                        fill
                        sizes="(max-width: 640px) 80px, 128px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/15 to-accent/5 flex items-center justify-center">
                        <span className="font-display text-2xl sm:text-3xl text-accent/30">{post.title.charAt(0)}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col justify-center min-w-0 flex-1">
                    <span className="text-[10px] sm:text-xs tracking-wider uppercase text-accent font-medium mb-1 sm:mb-2">
                      {getPostCategory(post)}
                    </span>
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold leading-snug mb-1.5 group-hover:text-accent transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground">
                      <span className="truncate">{getPostAuthor(post)}</span>
                      {post.publishedAt && (
                        <>
                          <span className="text-border">|</span>
                          <span className="flex-shrink-0">{formatDateTime(post.publishedAt)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            )
          })}
        </div>

        {/* Mobile View All */}
        <div className="text-center sm:hidden mt-8">
          <Link
            href="/posts"
            className="group inline-flex items-center gap-2 px-6 py-3 border border-border rounded-full text-sm font-medium hover:bg-card transition-colors"
          >
            View All Posts
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}