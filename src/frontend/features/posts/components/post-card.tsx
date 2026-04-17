'use client'
import { cn } from '@frontend/lib/utils'
import useClickableCard from '@frontend/lib/use-clickable-card'
import Link from 'next/link'
import React, { Fragment, useState, useCallback } from 'react'
import { Copy, Check, Loader2 } from 'lucide-react'

import type { Post, Media as MediaType } from '@shared/types/payload-types'

import { Media } from '@frontend/components/shared/media'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title' | 'heroImage'>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  const { slug, categories, meta, title, heroImage } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ')
  const href = `/${relationTo}/${slug}`

  const [copied, setCopied] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const { card, link } = useClickableCard({
    onNavigateStart: () => setIsNavigating(true),
  })

  const handleLinkClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return
    }

    setIsNavigating(true)
  }, [])

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const url = typeof window !== 'undefined' ? `${window.location.origin}${href}` : href
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      })
    },
    [href],
  )

  const categoryLabel = hasCategories && typeof categories[0] === 'object'
    ? categories[0].title || 'Uncategorized'
    : null

  // Use meta.image first, fall back to heroImage
  const displayImage: MediaType | null | undefined =
    metaImage && typeof metaImage === 'object' ? metaImage as MediaType :
    heroImage && typeof heroImage === 'object' ? heroImage as MediaType :
    null

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300 hover:cursor-pointer',
        isNavigating && 'opacity-80',
        className,
      )}
      ref={card.ref}
    >
      {/* Image - responsive aspect ratio */}
      <div className="relative aspect-[3/2] sm:aspect-[16/10] overflow-hidden bg-muted">
        {displayImage ? (
          <Media
            fill
            resource={displayImage}
            size="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            imgClassName="object-cover object-top w-full h-full group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-accent/15 to-accent/5 flex items-center justify-center">
            <span className="font-display text-4xl sm:text-5xl text-accent/20">
              {titleToUse?.charAt(0)?.toUpperCase() || 'G'}
            </span>
          </div>
        )}
        {/* Category Badge */}
        {showCategories && categoryLabel && (
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
            <span className="px-2.5 py-1 bg-background/90 backdrop-blur-sm text-foreground text-[10px] sm:text-xs font-medium tracking-wider uppercase rounded-full border border-border/50">
              {categoryLabel}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        {showCategories && hasCategories && !categoryLabel && (
          <div className="text-[10px] sm:text-xs tracking-wider uppercase text-accent font-medium mb-2">
            {categories?.map((category, index) => {
              if (typeof category === 'object') {
                const { title: categoryTitle } = category
                const isLast = index === categories.length - 1
                return (
                  <Fragment key={index}>
                    {categoryTitle || 'Untitled'}
                    {!isLast && <Fragment>, </Fragment>}
                  </Fragment>
                )
              }
              return null
            })}
          </div>
        )}

        {titleToUse && (
          <h3 className="text-base sm:text-lg font-semibold leading-snug mb-1.5 sm:mb-2 group-hover:text-accent transition-colors line-clamp-2">
            <Link
              className="no-underline"
              href={href}
              ref={link.ref}
              prefetch={true}
              onClick={handleLinkClick}
            >
              {titleToUse}
            </Link>
          </h3>
        )}

        {sanitizedDescription && (
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {sanitizedDescription}
          </p>
        )}

        {/* Bottom action bar */}
        <div className="mt-3 pt-3 sm:mt-4 sm:pt-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium tracking-wider uppercase text-accent sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            {isNavigating ? (
              <>
                Opening...
                <Loader2 className="w-3 h-3 animate-spin" />
              </>
            ) : (
              <>
                Read Article
                <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            disabled={isNavigating}
            aria-label={copied ? 'Link copied!' : 'Copy link to post'}
            className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-accent/10 text-muted-foreground hover:text-accent"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </article>
  )
}
