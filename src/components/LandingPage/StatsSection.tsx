'use client'

import React from 'react'
import Link from 'next/link'
import { TrendingUp, FileText, Users, Award } from 'lucide-react'

const stats = [
  {
    icon: FileText,
    value: '500+',
    label: 'Published Articles',
    description: 'Technical blogs, creative writings, and more',
    color: 'blue',
  },
  {
    icon: Users,
    value: '1000+',
    label: 'Active Students',
    description: 'Contributors from all departments',
    color: 'cyan',
  },
  {
    icon: Award,
    value: '50+',
    label: 'Top Contributors',
    description: 'Recognized for their exceptional work',
    color: 'purple',
  },
  {
    icon: TrendingUp,
    value: '10k+',
    label: 'Monthly Readers',
    description: 'Growing audience across the globe',
    color: 'amber',
  },
]

export const StatsSection: React.FC = () => {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 text-white relative overflow-hidden">
      {/* Animated Background Patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Our Growing Impact
          </h2>
          <p className="text-lg text-blue-100">
            Building a thriving community of learners, creators, and innovators at GCET
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="group text-center p-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
              >
                <div className="inline-flex p-4 bg-white/20 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-8 h-8" />
                </div>
                
                <div className="text-5xl font-bold mb-2 group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                
                <div className="text-xl font-semibold mb-2">
                  {stat.label}
                </div>
                
                <div className="text-sm text-blue-100">
                  {stat.description}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-xl mb-2">Want to be part of our success story?</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-full font-semibold hover:bg-blue-50 transition-all hover:scale-105 shadow-xl"
          >
            Start Contributing Today
          </Link>
        </div>
      </div>
    </section>
  )
}
