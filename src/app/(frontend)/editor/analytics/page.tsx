import { TrendingUp, Users, Eye, Clock, BarChart3 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function AnalyticsPage() {
  // TODO: Integrate with analytics service (Google Analytics, Plausible, etc.)
  // For now, showing placeholder state until analytics are configured

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Track your content performance and engagement</p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <Card>
        <CardContent className="p-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Analytics Not Yet Configured</h2>
            <p className="text-muted-foreground mb-8">
              Set up an analytics service to track page views, user engagement, and content performance metrics.
            </p>
            
            {/* Placeholder Stats Preview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Total Views</p>
                <p className="text-xl font-bold text-muted-foreground">-</p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Active Users</p>
                <p className="text-xl font-bold text-muted-foreground">-</p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Avg. Time</p>
                <p className="text-xl font-bold text-muted-foreground">-</p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Engagement</p>
                <p className="text-xl font-bold text-muted-foreground">-</p>
              </div>
            </div>

            <div className="p-6 bg-muted rounded-lg text-left">
              <p className="text-sm font-medium mb-3">Recommended Analytics Setup:</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-primary/10 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Choose an Analytics Provider</p>
                    <p className="text-xs text-muted-foreground">Options: Google Analytics, Plausible, Umami, or Vercel Analytics</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-primary/10 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Add Tracking Code</p>
                    <p className="text-xs text-muted-foreground">Install the analytics script in your app layout or document</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-primary/10 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Fetch and Display Data</p>
                    <p className="text-xs text-muted-foreground">Update this page to fetch and display analytics data</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Button asChild>
                <a
                  href="https://vercel.com/docs/analytics"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn About Vercel Analytics
                  <TrendingUp className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
