import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Calendar, ArrowRight } from 'lucide-react'
import type { Post, Media } from '@/payload-types'
import { formatDateTime } from '@/utilities/formatDateTime'

interface HomePostsProps {
  posts: Post[]
}

export const HomePosts: React.FC<HomePostsProps> = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return (
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">No Posts Yet</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Check back soon for exciting content from our community!
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400">
              Latest Stories
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover the newest articles, insights, and achievements from our vibrant GCET community
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {posts.map((post, index) => {
            const heroImage = typeof post.heroImage === 'object' && post.heroImage ? post.heroImage as Media : null
            const category = post.categories && post.categories.length > 0
              ? typeof post.categories[0] === 'object'
                ? post.categories[0].title
                : 'Uncategorized'
              : 'Uncategorized'
            
            const author = post.authors && post.authors.length > 0
              ? typeof post.authors[0] === 'object'
                ? post.authors[0].name || 'Anonymous'
                : 'Anonymous'
              : 'Anonymous'

            return (
              <Link
                key={post.id}
                href={`/posts/${post.slug}`}
                className="group"
              >
                <Card className="h-full overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-500 dark:hover:border-blue-400">
                  {/* Featured Image */}
                  <div className="relative h-56 bg-gradient-to-br from-blue-500 to-cyan-500 overflow-hidden">
                    {heroImage?.url ? (
                      <Image
                        src={heroImage.url}
                        alt={heroImage.alt || post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white/80 text-6xl font-bold">
                          {post.title.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/95 text-gray-900 hover:bg-white backdrop-blur-sm">
                        {category}
                      </Badge>
                    </div>

                    {/* Featured Badge for first post */}
                    {index === 0 && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-blue-600 text-white hover:bg-blue-700">
                          Featured
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    
                    {post.meta?.description && (
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 text-sm">
                        {post.meta.description}
                      </p>
                    )}

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        <span className="truncate">{author}</span>
                      </div>
                      {post.publishedAt && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDateTime(post.publishedAt)}</span>
                        </div>
                      )}
                    </div>

                    {/* Read More Link */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold group-hover:gap-3 transition-all">
                        Read Article
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* View All Posts Link */}
        {posts.length >= 10 && (
          <div className="text-center">
            <Link
              href="/posts"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              Explore All Posts
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
