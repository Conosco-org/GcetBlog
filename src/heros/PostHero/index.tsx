import { formatDateTime } from 'src/utilities/formatDateTime'
import React from 'react'
import Link from 'next/link'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'

export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const { categories, heroImage, populatedAuthors, publishedAt, title } = post

  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && populatedAuthors.some(a => a?.name)

  return (
    <div className="relative pt-16 flex items-end">
      <div className="container z-10 relative lg:grid lg:grid-cols-[1fr_48rem_1fr] text-white px-5 sm:px-6 pb-6 sm:pb-8">
        <div className="col-start-1 col-span-1 md:col-start-2 md:col-span-2">
          <div className="text-[10px] sm:text-xs tracking-widest uppercase mb-4 sm:mb-6 text-white/70 font-medium">
            {categories?.map((category, index) => {
              if (typeof category === 'object' && category !== null) {
                const { title: categoryTitle } = category

                const titleToUse = categoryTitle || 'Untitled category'

                const isLast = index === categories.length - 1

                return (
                  <React.Fragment key={index}>
                    {titleToUse}
                    {!isLast && <React.Fragment>, &nbsp;</React.Fragment>}
                  </React.Fragment>
                )
              }
              return null
            })}
          </div>

          <div className="">
            <h1 className="font-display mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-5xl lg:text-6xl leading-[1.1]">{title}</h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-16">
            {hasAuthors && (
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] sm:text-xs tracking-widest uppercase text-white/50">Author</p>

                  <p className="text-sm sm:text-base font-medium">
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
              </div>
            )}
            {publishedAt && (
              <div className="flex flex-col gap-1">
                <p className="text-[10px] sm:text-xs tracking-widest uppercase text-white/50">Date Published</p>

                <time dateTime={publishedAt} className="text-sm sm:text-base font-medium">{formatDateTime(publishedAt)}</time>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="min-h-[60vh] sm:min-h-[80vh] select-none">
        {heroImage && typeof heroImage !== 'string' && (
          <Media fill priority imgClassName="-z-10 object-cover object-top sm:object-center" resource={heroImage} />
        )}
        <div className="absolute pointer-events-none left-0 bottom-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent" />
      </div>
    </div>
  )
}
