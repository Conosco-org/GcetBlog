import { PageHeader } from '@/components/base/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Plus, Send, Users, TrendingUp, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function NewsletterPage() {
  return (
    <div className="p-8 min-h-screen">
      <PageHeader
        title="Newsletter"
        description="Manage email campaigns and subscriber communications"
        action={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        }
      />

      {/* Stats */}
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard
          icon={Users}
          label="Subscribers"
          value="0"
          color="blue"
        />
        <StatCard
          icon={Send}
          label="Campaigns Sent"
          value="0"
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          label="Open Rate"
          value="0%"
          color="purple"
        />
        <StatCard
          icon={Mail}
          label="Drafts"
          value="0"
          color="amber"
        />
      </div>

      {/* Recent Campaigns */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
          <CardDescription>Manage your email campaigns and newsletters</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Empty State */}
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Campaigns Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create email campaigns to keep your subscribers informed about new content, 
              announcements, and updates.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Campaign
            </Button>

            {/* Setup Guide */}
            <div className="mt-8 p-6 bg-muted rounded-lg text-left max-w-2xl mx-auto">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                To enable newsletter functionality:
              </h4>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Add a &apos;subscribers&apos; collection to your database</li>
                <li>Add a &apos;newsletters&apos; collection for campaign data</li>
                <li>Set up email service integration (SendGrid, Mailchimp, etc.)</li>
                <li>Configure subscriber signup forms on your public pages</li>
                <li>Create email templates with your branding</li>
              </ol>
              
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm font-medium mb-2">Recommended Features:</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Email Templates</Badge>
                  <Badge variant="outline">Subscriber Segments</Badge>
                  <Badge variant="outline">A/B Testing</Badge>
                  <Badge variant="outline">Analytics</Badge>
                  <Badge variant="outline">Automation</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  color: string
}) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30',
    green: 'text-green-600 bg-green-50 dark:bg-green-950/30',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30',
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30',
  }

  return (
    <div className={`rounded-lg border p-4 ${colorMap[color] || ''}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" />
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}
