'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'

export const CTASection: React.FC = () => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)

  const handleNavigate = (href: string) => {
    setNavigatingTo(href)
    startTransition(() => {
      router.push(href)
    })
  }
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Accent background strip */}
      <div className="absolute inset-0 bg-foreground" />
      
      {/* Dot pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%">
          <pattern id="cta-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.5" fill="currentColor" className="text-background" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#cta-dots)" />
        </svg>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-xs tracking-widest uppercase text-background/50 font-medium">Students &middot; Staff &middot; Alumni</span>
          
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-background mt-6 mb-8 leading-[1.05]">
            Got something
            <br />
            to say?
          </h2>

          <p className="text-lg md:text-xl text-background/60 max-w-xl mx-auto mb-12 leading-relaxed">
            A tutorial, a poem, a hot take, a project breakdown &mdash; whatever it is, spill it. This platform is built for your voice.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => handleNavigate('/login')}
              disabled={isPending && navigatingTo === '/login'}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-accent text-accent-foreground rounded-full text-sm font-medium tracking-wide hover:opacity-90 transition-opacity disabled:opacity-70"
            >
              {isPending && navigatingTo === '/login' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Start Contributing
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

            <button
              onClick={() => handleNavigate('/posts')}
              disabled={isPending && navigatingTo === '/posts'}
              className="inline-flex items-center gap-3 px-8 py-4 border border-background/20 text-background rounded-full text-sm font-medium tracking-wide hover:bg-background/10 transition-colors disabled:opacity-70"
            >
              {isPending && navigatingTo === '/posts' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Read Articles'
              )}
            </button>
          </div>
        </div>

        {/* Attribution Footer */}
        <div className="mt-24 pt-12 border-t border-background/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-background/40">
            <p>© {new Date().getFullYear()} GCET. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span>Built for the GCET community • Powered by</span>
              <a
                href="https://conosco.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center hover:opacity-90 transition-opacity"
                aria-label="Conosco"
              >
                {/* eslint-disable @next/next/no-img-element */}
                <img
                  src="/conosco-logo.png"
                  alt="Conosco"
                  className="h-4 w-auto brightness-0 invert"
                  loading="lazy"
                  decoding="async"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}