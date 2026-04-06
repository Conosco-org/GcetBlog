'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/shared/Link'
import { Media } from '@/components/shared/Media'
import RichText from '@/components/shared/RichText'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  })

  return (
    <div
      className="relative -mt-[10.4rem] flex items-end justify-center text-white overflow-hidden"
      data-theme="dark"
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-transparent z-10" />
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      {/* Content Container */}
      <div className="container pb-16 pt-32 z-20 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo/Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
            <span className="text-sm font-medium">🎓 Geethanjali College of Engineering and Technology</span>
          </div>

          {/* Main Heading */}
          {richText && (
            <RichText 
              className="mb-6 [&_h1]:text-5xl [&_h1]:md:text-7xl [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:mb-6 [&_h1]:bg-gradient-to-r [&_h1]:from-white [&_h1]:to-gray-300 [&_h1]:bg-clip-text [&_h1]:text-transparent [&_p]:text-lg [&_p]:md:text-xl [&_p]:text-gray-200 [&_p]:max-w-2xl [&_p]:mx-auto [&_p]:leading-relaxed" 
              data={richText} 
              enableGutter={false} 
            />
          )}

          {/* CTA Buttons */}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex flex-wrap justify-center gap-4 mt-10">
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink 
                      {...link} 
                      className={i === 0 
                        ? "inline-flex items-center px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                        : "inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300"
                      }
                    />
                  </li>
                )
              })}
            </ul>
          )}

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-12">
            <span className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-sm">
              📝 Latest Tech Articles
            </span>
            <span className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-sm">
              💡 Student Projects
            </span>
            <span className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-sm">
              🚀 Innovation Hub
            </span>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="absolute inset-0 select-none">
        {media && typeof media === 'object' && (
          <Media fill imgClassName="-z-10 object-cover" priority resource={media} />
        )}
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-black to-transparent z-10" />
    </div>
  )
}
