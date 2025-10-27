import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  CheckCircle, 
  Edit, 
  Eye, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  MessageSquare,
  BarChart,
  Send
} from 'lucide-react'
import Link from 'next/link'
import type { User } from '@/payload-types'

export default async function ContributorDashboardPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  const typedUser = user as User

  // Fetch real data from MongoDB
  const allPosts = await payload.find({
    collection: 'posts',
    where: {
      authors: {
        equals: user.id,
      },
    },
    limit: 1000,
  })

  // Calculate stats
  const totalSubmissions = allPosts.totalDocs
  const publishedPosts = allPosts.docs.filter(post => post._status === 'published')
  const draftPosts = allPosts.docs.filter(post => post._status === 'draft')
  const approvedPosts = allPosts.docs.filter(post => post.reviewStatus === 'approved')
  const rejectedPosts = allPosts.docs.filter(post => post.reviewStatus === 'rejected')
  const submittedPosts = allPosts.docs.filter(post => post.reviewStatus === 'pending_review')
  
  const totalReviewed = approvedPosts.length + rejectedPosts.length
  const approvalRate = totalReviewed > 0 ? Math.round((approvedPosts.length / totalReviewed) * 100) : 0
  const readyToSubmit = draftPosts.filter(post => post.title && post.content).length

  // Get recent activity
  const recentActivity = await payload.find({
    collection: 'posts',
    where: {
      authors: {
        equals: user.id,
      },
    },
    sort: '-updatedAt',
    limit: 5,
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {typedUser.name || 'Contributor'}!</h1>
        <p className="text-muted-foreground">Here's your writing journey overview</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-blue-200 dark:border-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSubmissions}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              All time submissions
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{approvalRate}%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <CheckCircle className="h-3 w-3" />
              {approvedPosts.length} approved / {totalReviewed} reviewed
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drafts</CardTitle>
            <Edit className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{draftPosts.length}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3" />
              {readyToSubmit} ready to submit
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Works</CardTitle>
            <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{publishedPosts.length}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Eye className="h-3 w-3" />
              Live on blog
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.docs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activity</p>
                <Button className="mt-4" asChild>
                  <Link href="/contributor/create">Create Your First Post</Link>
                </Button>
              </div>
            ) : (
              recentActivity.docs.map((post) => {
                const isPublished = post._status === 'published'
                const isPending = post.reviewStatus === 'pending_review'
                const isRejected = post.reviewStatus === 'rejected'
                const isApproved = post.reviewStatus === 'approved'

                let statusColor = 'bg-muted'
                let statusText = 'Draft'
                let iconColor = 'text-muted-foreground'
                let Icon = Edit

                if (isPublished) {
                  statusColor = 'bg-green-50 dark:bg-green-950/20'
                  statusText = 'Published'
                  iconColor = 'text-green-600 dark:text-green-400'
                  Icon = Eye
                } else if (isPending) {
                  statusColor = 'bg-blue-50 dark:bg-blue-950/20'
                  statusText = 'Under Review'
                  iconColor = 'text-blue-600 dark:text-blue-400'
                  Icon = CheckCircle
                } else if (isRejected) {
                  statusColor = 'bg-orange-50 dark:bg-orange-950/20'
                  statusText = 'Needs Revision'
                  iconColor = 'text-orange-600 dark:text-orange-400'
                  Icon = MessageSquare
                } else if (isApproved) {
                  statusColor = 'bg-green-50 dark:bg-green-950/20'
                  statusText = 'Approved'
                  iconColor = 'text-green-600 dark:text-green-400'
                  Icon = CheckCircle
                }

                return (
                  <div key={post.id} className={`flex items-start gap-4 p-4 rounded-lg border ${statusColor}`}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <Icon className={`h-5 w-5 ${iconColor}`} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-semibold text-sm">{post.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <Badge variant="secondary" className={
                          isPublished ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : isPending ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          : isRejected ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                          : 'bg-muted text-muted-foreground'
                        }>
                          {statusText}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-between group" asChild>
                <Link href="/contributor/create">
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Start New Article
                  </span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>

              <Button variant="outline" className="w-full justify-between group" asChild>
                <Link href="/contributor/drafts">
                  <span className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Continue Draft
                  </span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>

              <Button variant="secondary" className="w-full justify-between group" asChild>
                <Link href="/contributor/submissions">
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    View Submissions
                  </span>
                  <Badge variant="outline" className="h-5">{submittedPosts.length}</Badge>
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Published</span>
                  <span className="text-sm font-semibold">{publishedPosts.length}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${totalSubmissions > 0 ? (publishedPosts.length / totalSubmissions) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">In Review</span>
                  <span className="text-sm font-semibold">{submittedPosts.length}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${totalSubmissions > 0 ? (submittedPosts.length / totalSubmissions) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Drafts</span>
                  <span className="text-sm font-semibold">{draftPosts.length}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${totalSubmissions > 0 ? (draftPosts.length / totalSubmissions) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
