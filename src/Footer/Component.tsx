import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer } from '@/payload-types'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

export async function Footer() {
  const footerData: Footer = await getCachedGlobal('footer', 1)()

  const navItems = footerData?.navItems || []

  return (
    <footer className="mt-auto border-t border-border bg-foreground text-background">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between md:items-start">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link className="flex items-center gap-2" href="/">
              <Logo />
            </Link>
            <p className="text-sm text-background/50 max-w-xs">
              The platform where the GCET community spills their mind &mdash; tech, creativity, and everything in between.
            </p>
          </div>

          {/* Right: Nav + Theme */}
          <div className="flex flex-col-reverse items-start md:flex-row gap-6 md:items-center">
            <ThemeSelector />
            <nav className="flex flex-col md:flex-row gap-4">
              {navItems.map(({ link }, i) => {
                return <CMSLink className="text-background/70 hover:text-accent text-sm tracking-wide transition-colors" key={i} {...link} />
              })}
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-background/40">
            &copy; {new Date().getFullYear()} GCET. All rights reserved.
          </p>
          <p className="text-xs text-background/40">
            Built by the GCET community
          </p>
        </div>
      </div>
    </footer>
  )
}
