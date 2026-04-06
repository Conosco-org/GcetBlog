import { formatDateTime } from '@frontend/lib/format-date-time'
import React from 'react'
import Link from 'next/link'

import type { Post } from '@shared/types/payload-types'

import { Media } from '@frontend/components/shared/media'

export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const { categories, heroImage, populatedAuthors, publishedAt, title } = post

  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && populatedAuthors.some(a => a?.name)

  return (
    <div className="relative flex items-end min-h-[55vh] sm:min-h-[65vh]">
      {/* Background image / color */}
      {heroImage && typeof heroImage !== 'string' ? (
        <Media
          fill
          priority
          imgClassName="object-cover object-top sm:object-center"
          resource={heroImage}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/80 to-foreground/60" />
      )}
      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

      {/* Content */}
      <div className="container relative z-10 px-5 sm:px-6 pb-8 sm:pb-12 pt-24 lg:grid lg:grid-cols-[1fr_48rem_1fr]">
        <div className="lg:col-start-2 lg:col-span-1">
          {/* Categories */}
          {categories && categories.length > 0 && (
            <div className="text-[10px] sm:text-xs tracking-widest uppercase mb-3 text-white/60 font-medium">
              {categories.map((category, index) => {
                if (typeof category === 'object' && category !== null) {
                  const isLast = index === categories.length - 1
                  return (
                    <React.Fragment key={index}>
                      {category.title || 'Untitled category'}
                      {!isLast && <React.Fragment>, &nbsp;</React.Fragment>}
                    </React.Fragment>
                  )
                }
                return null
              })}
            </div>
          )}

          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl text-white mb-5 sm:mb-7 leading-[1.1] max-w-2xl">
            {title}
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
            {hasAuthors && (
              <div className="flex flex-col gap-1">
                <p className="text-[10px] sm:text-xs tracking-widest uppercase text-white/50">Author</p>
                <p className="text-sm sm:text-base font-medium text-white">
                  {populatedAuthors.filter(a => a?.name).map((author, index, arr) => (
                    <React.Fragment key={author.id || index}>
                      <Link
                        href={`/profile/${author.id}`}
                        className="hover:underline hover:text-white/90 transition"
                      >
                        {author.name}
                      </Link>
                      {index < arr.length - 2 && ', '}
                      {index === arr.length - 2 && (arr.length > 2 ? ', and ' : ' and ')}
                    </React.Fragment>
                  ))}
                </p>
              </div>
            )}
            {publishedAt && (
              <div className="flex flex-col gap-1">
                <p className="text-[10px] sm:text-xs tracking-widest uppercase text-white/50">Published</p>
                <time dateTime={publishedAt} className="text-sm sm:text-base font-medium text-white">
                  {formatDateTime(publishedAt)}
                </time>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
