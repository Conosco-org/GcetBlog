'use client'

import React from 'react'
import Link from 'next/link'
import { Card } from '@frontend/components/ui/card'
import { Badge } from '@frontend/components/ui/badge'
import { Button } from '@frontend/components/ui/button'
import { ArrowRight, Clock, User } from 'lucide-react'

interface Post {
  id: string
  title: string
  category: string
  author: string
  date: string
  readTime: string
  image?: string
}

interface RecentPostsSectionProps {
  posts?: Post[]
}

export const RecentPostsSection: React.FC<RecentPostsSectionProps> = ({ posts = [] }) => {
  // Placeholder posts if none provided
  const displayPosts = posts.length > 0 ? posts : [
    {
      id: '1',
      title: 'Getting Started with Machine Learning',
      category: 'Technology',
      author: 'John Doe',
      date: 'Oct 15, 2025',
      readTime: '5 min read',
    },
    {
      id: '2',
      title: 'The Art of Creative Writing',
      category: 'Literature',
      author: 'Jane Smith',
      date: 'Oct 12, 2025',
      readTime: '4 min read',
    },
    {
      id: '3',
      title: 'Winning at Smart India Hackathon',
      category: 'Achievement',
      author: 'Team GCET',
      date: 'Oct 10, 2025',
      readTime: '6 min read',
    },
  ]

  return (
    <section className="py-20 md:py-32 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400">
                Latest Stories
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Fresh perspectives from our talented community
            </p>
          </div>
          <Link href="/posts">
            <Button variant="outline" className="group hidden md:inline-flex">
              View All Posts
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {displayPosts.slice(0, 3).map((post) => (
            <Card
              key={post.id}
              className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-500 dark:hover:border-blue-400"
            >
              {/* Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-blue-500 to-cyan-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all"></div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-white/90 text-gray-900 hover:bg-white">
                    {post.category}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {post.title}
                </h3>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                {/* Read More Link */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    href={`/posts/${post.id}`}
                    className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold group-hover:gap-3 transition-all"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="text-center md:hidden">
          <Link href="/posts">
            <Button className="group w-full">
              View All Posts
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
