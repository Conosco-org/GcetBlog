'use client'

import React from 'react'
import { Code2, Pen, Trophy, Sparkles, Users2, Rocket } from 'lucide-react'
import { Card } from '@/components/ui/card'

const features = [
  {
    icon: Code2,
    title: 'Technical Excellence',
    description: 'Deep dive into coding tutorials, algorithm insights, and cutting-edge technology trends.',
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Pen,
    title: 'Creative Expression',
    description: 'Showcase your literary talents through poems, stories, and thoughtful essays.',
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Trophy,
    title: 'Student Achievements',
    description: 'Celebrate hackathon wins, project showcases, and academic milestones.',
    color: 'amber',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: Sparkles,
    title: 'Innovation Hub',
    description: 'Discover groundbreaking ideas and innovative solutions from our community.',
    color: 'cyan',
    gradient: 'from-cyan-500 to-teal-500',
  },
  {
    icon: Users2,
    title: 'Collaborative Learning',
    description: 'Connect with peers, share knowledge, and grow together in a supportive environment.',
    color: 'green',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Rocket,
    title: 'Career Growth',
    description: 'Access career guidance, interview prep, and industry insights to boost your journey.',
    color: 'red',
    gradient: 'from-red-500 to-rose-500',
  },
]

export const FeaturesSection: React.FC = () => {
  return (
    <section id="about" className="py-20 md:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 mb-6">
            <Sparkles className="w-4 h-4" />
            <span>What We Offer</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400">
              Empowering Student Voices
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            A platform where technical prowess meets creative expression, fostering a community of innovators and storytellers.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className="group p-8 hover:shadow-2xl transition-all duration-300 border-2 hover:border-transparent hover:scale-105 cursor-pointer bg-white dark:bg-gray-800"
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Hover Effect Line */}
                <div className={`mt-6 h-1 w-0 group-hover:w-full bg-gradient-to-r ${feature.gradient} transition-all duration-300 rounded-full`}></div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
