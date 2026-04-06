'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@frontend/components/ui/card'
import { 
  Users, 
  TrendingUp,
  Plus,
  Clock,
  CheckCircle,
  Activity,
  BarChart3,
  ArrowRight,
  Sun,
  Moon,
  File
} from 'lucide-react'

interface DashboardStats {
  totalPosts: number
  totalUsers: number
  publishedToday: number
  totalMedia: number
}

export default function CustomDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    totalUsers: 0,
    publishedToday: 0,
    totalMedia: 0,
  })
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    // Check for Payload's theme preference
    const payloadTheme = document.documentElement.getAttribute('data-theme')
    if (payloadTheme === 'light' || payloadTheme === 'dark') {
      setTheme(payloadTheme)
    }

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.getAttribute('data-theme')
          if (newTheme === 'light' || newTheme === 'dark') {
            setTheme(newTheme)
          }
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    })

    return () => observer.disconnect()
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: 'Total Pages',
      value: stats.totalPosts,
      icon: File,
      gradient: 'from-blue-500 to-blue-600',
      change: '+12%',
      changeType: 'increase',
      subtitle: `${stats.publishedToday} published today`,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      href: '/admin/collections/pages'
    },
    {
      title: 'Active Users',
      value: stats.totalUsers,
      icon: Users,
      gradient: 'from-green-500 to-green-600',
      change: '+5%',
      changeType: 'increase',
      subtitle: 'All registered members',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      href: '/admin/collections/users'
    },
    {
      title: 'Admin Logs',
      value: stats.totalMedia || 0,
      icon: Activity,
      gradient: 'from-orange-500 to-orange-600',
      change: '+8%',
      changeType: 'increase',
      subtitle: 'System activity',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      href: '/admin/collections/admin-logs'
    }
  ]

  const quickActions = [
    {
      title: 'Create New Page',
      description: 'Start creating a new page',
      icon: Plus,
      href: '/admin/collections/pages/create',
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'hover:from-blue-600 hover:to-blue-700'
    },
    {
      title: 'Manage Users',
      description: 'Add or edit user accounts',
      icon: Users,
      href: '/admin/collections/users',
      gradient: 'from-green-500 to-green-600',
      hoverGradient: 'hover:from-green-600 hover:to-green-700'
    },
    {
      title: 'Admin Logs',
      description: 'View system activity',
      icon: Activity,
      href: '/admin/collections/admin-logs',
      gradient: 'from-orange-500 to-orange-600',
      hoverGradient: 'hover:from-orange-600 hover:to-orange-700'
    }
  ]

  const recentActivity = [
    { action: 'Published', item: 'New page: Getting Started', time: '2 hours ago', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
    { action: 'Pending', item: 'Role upgrade request', time: '4 hours ago', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { action: 'Joined', item: 'New contributor registered', time: '1 day ago', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { action: 'Updated', item: 'Page edited: About Us', time: '2 days ago', icon: File, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  ]

  if (loading) {
    return (
      <div className="p-8 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-800/50 rounded-lg w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-40 bg-gray-800/50 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="custom-dashboard">
      <div className={`p-8 transition-colors duration-300 ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Welcome to GCET Blog
              </h1>
              <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Here&apos;s your content overview and quick actions
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className={`p-3 rounded-xl border transition-all duration-300 ${
                  theme === 'dark' 
                    ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 hover:border-blue-500/50' 
                    : 'bg-white border-gray-300 hover:bg-gray-100 hover:border-blue-500/50'
                }`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-yellow-400" />
                ) : (
                  <Moon className="h-5 w-5 text-blue-600" />
                )}
              </button>
              
              {/* System Status */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                theme === 'dark' 
                  ? 'bg-gray-800/50 border-gray-700' 
                  : 'bg-white border-gray-300'
              }`}>
                <Activity className="h-4 w-4 text-green-400 animate-pulse" />
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  All systems operational
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, index) => {
              const Icon = card.icon
              return (
                <a
                  key={index}
                  href={card.href}
                  className="group"
                >
                  <Card className={`relative overflow-hidden hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 border backdrop-blur-sm group-hover:scale-[1.02] group-hover:border-blue-500/50 ${
                    theme === 'dark' 
                      ? 'border-gray-800 bg-gray-900/50' 
                      : 'border-gray-200 bg-white'
                  }`}>
                    <div className={`absolute top-0 right-0 w-32 h-32 ${card.bgColor} rounded-full -mr-16 -mt-16 opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                      <CardTitle className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {card.title}
                      </CardTitle>
                      <div className={`p-3 ${card.bgColor} bg-opacity-10 border border-${card.iconColor} border-opacity-20 rounded-xl group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-5 w-5 ${card.iconColor}`} />
                      </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="flex items-baseline gap-2 mb-3">
                        <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {card.value}
                        </div>
                        <span className={`flex items-center text-xs font-medium ${
                          card.changeType === 'increase' ? 'text-green-400' : 
                          card.changeType === 'alert' ? 'text-yellow-400' : 
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {card.changeType === 'increase' && <TrendingUp className="h-3 w-3 mr-1" />}
                          {card.change}
                        </span>
                      </div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                        {card.subtitle}
                      </p>
                      <div className="mt-3 flex items-center text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        View details <ArrowRight className="h-3 w-3 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </a>
              )
            })}
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions - 2 columns */}
            <div className="lg:col-span-2">
              <Card className={`border backdrop-blur-sm ${
                theme === 'dark' 
                  ? 'border-gray-800 bg-gray-900/50' 
                  : 'border-gray-200 bg-white'
              }`}>
                <CardHeader>
                  <CardTitle className={`text-xl flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <BarChart3 className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Common administrative tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quickActions.map((action, index) => {
                      const Icon = action.icon
                      return (
                        <a
                          key={index}
                          href={action.href}
                          className={`group relative p-6 rounded-xl border-2 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden ${
                            theme === 'dark' 
                              ? 'border-gray-800 bg-gray-900/30' 
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                          <div className="relative z-10">
                            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${action.gradient} mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {action.title}
                            </h3>
                            <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {action.description}
                            </p>
                            <div className="flex items-center text-sm text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              Get started <ArrowRight className="h-4 w-4 ml-1" />
                            </div>
                          </div>
                        </a>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity - 1 column */}
            <div>
              <Card className={`border backdrop-blur-sm ${
                theme === 'dark' 
                  ? 'border-gray-800 bg-gray-900/50' 
                  : 'border-gray-200 bg-white'
              }`}>
                <CardHeader>
                  <CardTitle className={`text-xl flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Latest updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => {
                      const Icon = activity.icon
                      return (
                        <div key={index} className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer group ${
                          theme === 'dark' ? 'hover:bg-gray-800/50' : 'hover:bg-gray-100'
                        }`}>
                          <div className={`p-2 rounded-lg ${activity.bgColor} bg-opacity-10 border border-${activity.color} border-opacity-20 group-hover:scale-110 transition-transform`}>
                            <Icon className={`h-4 w-4 ${activity.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {activity.action}
                            </p>
                            <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {activity.item}
                            </p>
                            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                              {activity.time}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <Link 
                    href="/admin/collections/admin-logs"
                    className="block mt-4 text-center text-sm text-blue-400 hover:text-blue-300 font-medium"
                  >
                    View all activity →
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
