import React from 'react'

const features = [
  {
    icon: '🚀',
    title: 'Tech Articles',
    description: 'Latest technology trends and insights',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: '💡',
    title: 'Student Projects',
    description: 'Innovative solutions by GCET students',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: '📚',
    title: 'Knowledge Hub',
    description: 'Tutorials and educational resources',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: '🎯',
    title: 'Events & Workshops',
    description: 'Stay updated with latest events',
    color: 'from-green-500 to-emerald-500',
  },
]

const stats = [
  { label: 'Students', value: '2000+', icon: '👨‍🎓' },
  { label: 'Articles', value: '500+', icon: '📝' },
  { label: 'Projects', value: '150+', icon: '💻' },
  { label: 'Faculty', value: '100+', icon: '👨‍🏫' },
]

export const ModernFeatures: React.FC = () => {
  return (
    <div className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900">
      <div className="container">
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            What We Offer
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore a world of technology, innovation, and academic excellence
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Gradient Border Effect */}
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl`}
              />

              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>

              {/* Arrow Icon */}
              <div className="mt-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors">
                <svg
                  className="w-6 h-6 transform group-hover:translate-x-2 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
