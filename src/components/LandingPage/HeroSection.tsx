'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import type { Post, Media as MediaType } from '@/payload-types'

interface HeroSectionProps {
  totalPosts: number
  totalUsers: number
  latestPost?: Post | null
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  totalPosts,
  totalUsers,
  latestPost,
}) => {
  const heroImage = latestPost && typeof latestPost.heroImage === 'object' && latestPost.heroImage
    ? (latestPost.heroImage as MediaType)
    : null

  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]" aria-hidden="true">
        <svg width="100%" height="100%">
          <pattern id="hero-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>
      </div>

      <div className="container mx-auto px-6 pt-20 pb-14 md:pt-28 md:pb-20 relative z-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-start">
          {/* Text Section */}
          <div className="lg:col-span-7 animate-fade-up">
            <h1 id="hero-heading" className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight mb-3">
              <span className="text-accent">GCET</span>
              <span className="text-foreground"> Blog</span>
            </h1>
            <p className="text-xl md:text-2xl font-display font-semibold bg-gradient-to-r from-accent via-accent/70 to-accent/50 bg-clip-text text-transparent mb-6 tracking-tight italic">
              Spill Your Mind
            </p>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg mb-8">
              Got opinions, ideas, or something the world needs to hear? This is your space. Write about anything &mdash; tech, life, art, campus, or that random 3 AM thought.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-12">
              <Link
                href="/posts"
                className="group inline-flex items-center gap-2.5 px-6 py-3 bg-accent text-accent-foreground rounded-full text-sm font-medium tracking-wide hover:opacity-90 transition-opacity"
              >
                Explore Posts
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="#about"
                className="inline-flex items-center gap-2.5 px-6 py-3 border border-border rounded-full text-sm font-medium tracking-wide hover:bg-card transition-colors"
              >
                What We Offer
              </Link>
            </div>

            {/* Stats Strip */}
            <div className="flex items-center gap-8 md:gap-12 pt-6 border-t border-border animate-fade-up stagger-3">
              <div>
                <div className="font-display text-3xl md:text-4xl font-bold text-foreground">{totalPosts || 0}+</div>
                <div className="text-[10px] md:text-xs tracking-widest uppercase text-muted-foreground mt-1">Articles</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div>
                <div className="font-display text-3xl md:text-4xl font-bold text-foreground">{totalUsers || 0}+</div>
                <div className="text-[10px] md:text-xs tracking-widest uppercase text-muted-foreground mt-1">Contributors</div>
              </div>
            </div>
          </div>

          {/* Right: Latest Post Card */}
          <div className="lg:col-span-5 animate-slide-right stagger-4 hidden lg:block">
            {latestPost ? (
              <Link href={`/posts/${latestPost.slug}`} className="group block">
                <article className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {heroImage?.url ? (
                      <Image
                        src={heroImage.url}
                        alt={heroImage.alt || latestPost.title}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                        <span className="font-display text-8xl font-bold text-accent/30">{latestPost.title.charAt(0)}</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-accent text-accent-foreground text-xs font-medium tracking-wider uppercase rounded-full">
                        Latest
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold leading-snug mb-2 group-hover:text-accent transition-colors line-clamp-2">
                      {latestPost.title}
                    </h3>
                    {latestPost.meta?.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {latestPost.meta.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs font-medium tracking-wider uppercase text-accent">
                      Read Article
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </article>
              </Link>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-12 text-center">
                <div className="font-display text-6xl font-bold text-accent/20 mb-4">G</div>
                <p className="text-muted-foreground text-sm">New stories coming soon</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
    </section>
  )
}

export default HeroSection