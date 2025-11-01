'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BookOpen, Users, Award } from 'lucide-react'
import type { Post } from '@/payload-types'

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
  const bgUrl = '/media/image-hero1-1.webp'

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative min-h-[90vh] flex items-center overflow-hidden"
    >
      {/* Background image */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.85) saturate(1.05)',
        }}
      />

      {/* Overlay gradient for polish */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/75 to-transparent dark:from-black/90 dark:via-black/70" />

      <div className="container mx-auto px-6 py-24 relative z-10">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Text Section */}
          <div className="backdrop-blur-lg bg-white/70 dark:bg-gray-900/40 p-10 rounded-3xl shadow-2xl border border-white/40 dark:border-gray-800">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium">
              <Award className="w-4 h-4" />
              <span>Geethanjali College of Engineering & Technology</span>
            </div>

            <h1
              id="hero-heading"
              className="mt-6 text-5xl md:text-6xl font-extrabold leading-tight"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
                GCET Blog
              </span>
            </h1>

            <p className="mt-5 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Explore innovations, insights, and stories from GCET — where ideas
              take flight, knowledge connects, and every student’s voice matters.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/posts" aria-label="Explore posts">
                <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-600 hover:to-pink-500 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 flex items-center">
                  Explore Posts
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </Link>

              <Link href="#about" aria-label="Learn more about the blog">
                <button className="px-6 py-3 border border-indigo-500 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-300 dark:hover:bg-indigo-900/20 font-semibold rounded-xl transition-all duration-300 flex items-center">
                  Learn More
                  <BookOpen className="ml-2 w-5 h-5" />
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div>
                <div className="text-4xl font-bold text-indigo-700 dark:text-indigo-300">
                  {totalPosts ?? 0}+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Published Articles
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold text-pink-600 dark:text-pink-400">
                  {totalUsers ?? 0}+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Student Contributors
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Visuals */}
          <div className="relative hidden lg:flex justify-center">
            <div className="relative w-[400px] h-[480px]">
              {/* Animated gradient blobs */}
              <div className="absolute -top-10 -left-10 w-64 h-64 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full blur-3xl opacity-25 animate-pulse" />
              <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-gradient-to-br from-pink-400 to-yellow-300 rounded-full blur-3xl opacity-25 animate-pulse delay-700" />

              {/* Featured Article Card */}
              <div className="absolute inset-0 flex flex-col justify-center items-center">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden w-[350px] transform hover:-translate-y-2 transition-transform duration-300">
                  <div className="relative w-full h-48">
                    <Image
                      src={
                        (latestPost as any)?.featuredImage?.url ??
                        '/media/image-post1-1.webp'
                      }
                      alt={
                        (latestPost as any)?.title ??
                        'Featured blog article image'
                      }
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                      {(latestPost as any)?.title ?? 'Latest from GCET Blog'}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {(latestPost as any)?.summary ??
                        'Catch up on the newest updates, student experiences, and innovations from our vibrant campus community.'}
                    </p>
                    <Link
                      href={
                        latestPost
                          ? `/posts/${(latestPost as any)?.slug}`
                          : '/posts'
                      }
                    >
                      <span className="mt-4 inline-block text-indigo-600 dark:text-indigo-300 font-medium hover:underline">
                        Read More →
                      </span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Join GCET Writers Card */}
              <Link
                href="/login"
                className="absolute -bottom-14 left-10 hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="w-[300px] bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex items-center gap-3">
                  <div className="p-2 bg-pink-100 dark:bg-pink-900/20 rounded-lg">
                    <Users className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Active Community
                    </div>
                    <div className="font-semibold text-gray-800 dark:text-gray-100">
                      Join GCET Writers
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="url(#gradientWave)"
          />
          <defs>
            <linearGradient id="gradientWave" x1="0" y1="0" x2="1440" y2="0">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="50%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  )
}

export default HeroSection
