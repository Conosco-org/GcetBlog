'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PenLine, ArrowRight } from 'lucide-react'

export const CTASection: React.FC = () => {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 p-12 md:p-16 text-white shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center">
              <div className="inline-flex p-4 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
                <PenLine className="w-12 h-12" />
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Share Your Story?
              </h2>

              <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl mx-auto">
                Join our vibrant community of writers, coders, and innovators. Your voice matters, and we can&apos;t wait to hear it.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/login">
                  <Button size="lg" className="group bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 shadow-xl">
                    Start Writing Today
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                
                <Link href="/posts">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm">
                    Explore Articles
                  </Button>
                </Link>
              </div>

              {/* Additional Info */}
              <div className="mt-12 pt-8 border-t border-white/20">
                <p className="text-blue-100">
                  <strong>New here?</strong> Check out our{' '}
                  <Link href="/about" className="underline hover:text-white transition-colors">
                    getting started guide
                  </Link>
                  {' '}to learn how to contribute.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
