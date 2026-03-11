import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import Link from 'next/link'
import {
  Users, FileText, Clock, Calendar, Users2,
  Activity, MessageSquare, TrendingUp, PenSquare, ArrowUpRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { User } from '@/payload-types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function UserDashboardPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) return null

  const typedUser = user as User
  const assignments = (typedUser as unknown as { roleAssignments?: Array<{ assignedRole: string }> })
    .roleAssignments ?? []

  const isInstAdmin   = assignments.some(a => a.assignedRole === 'institution_admin')
  const isBlogEditor  = assignments.some(a => a.assignedRole === 'blog_editor')
  const isBlogAuthor  = assignments.some(a => a.assignedRole === 'blog_author')
  const isClubAdmin   = assignments.some(a => a.assignedRole === 'club_admin')
  const isClubEditor  = assignments.some(a => a.assignedRole === 'club_editor')
  const isEventMgr    = assignments.some(a => a.assignedRole === 'event_manager')
  const isModerator   = assignments.some(a => a.assignedRole === 'moderator')

  const canSeeBlog    = isInstAdmin || isBlogEditor || isBlogAuthor
  const canSeeUsers   = isInstAdmin
  const canSeeEvents  = isInstAdmin || isClubAdmin || isClubEditor || isEventMgr
  const canSeeClubs   = isInstAdmin || isClubAdmin || isClubEditor
  const canSeeComments = isInstAdmin || isModerator

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  // Fetch only what this user's role needs
  const [
    totalPosts,
    pendingPosts,
    totalUsers,
    newUsersToday,
    pendingComments,
    recentActivity,
  ] = await Promise.all([
    canSeeBlog    ? payload.count({ collection: 'posts' }) : Promise.resolve({ totalDocs: 0 }),
    canSeeBlog    ? payload.count({ collection: 'posts', where: { _status: { equals: 'draft' } } }) : Promise.resolve({ totalDocs: 0 }),
    canSeeUsers   ? payload.count({ collection: 'users' }) : Promise.resolve({ totalDocs: 0 }),
    canSeeUsers   ? payload.count({ collection: 'users', where: { createdAt: { greater_than: today.toISOString() } } }) : Promise.resolve({ totalDocs: 0 }),
    canSeeComments ? payload.count({ collection: 'comments', where: { status: { equals: 'pending' } } }) : Promise.resolve({ totalDocs: 0 }),
    isInstAdmin   ? payload.count({ collection: 'admin-logs', where: { createdAt: { greater_than: weekAgo.toISOString() } } }) : Promise.resolve({ totalDocs: 0 }),
  ])

  const roleLabel = isInstAdmin ? 'Institution Admin'
    : isBlogEditor  ? 'Blog Editor'
    : isBlogAuthor  ? 'Blog Author'
    : isClubAdmin   ? 'Club Admin'
    : isClubEditor  ? 'Club Editor'
    : isEventMgr    ? 'Event Manager'
    : isModerator   ? 'Moderator'
    : 'User'

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1400px]">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {typedUser.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <div className="text-muted-foreground text-sm mt-0.5 flex items-center">
            <Badge variant="secondary" className="mr-2 text-xs">{roleLabel}</Badge>
            <span>Here&apos;s what&apos;s happening today.</span>
          </div>
        </div>
        {canSeeBlog && (
          <Button asChild>
            <Link href="/user/posts/create">
              <PenSquare className="h-4 w-4 mr-2" />
              New Post
            </Link>
          </Button>
        )}
      </div>

      {/* Stats grid — only show cards relevant to this user's roles */}
      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        {canSeeBlog && (
          <>
            <Card className="border-t-4 border-t-blue-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPosts.totalDocs}</div>
                {isBlogEditor || isInstAdmin ? (
                  <Link href="/user/content" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                    View all <ArrowUpRight className="h-3 w-3" />
                  </Link>
                ) : (
                  <Link href="/user/posts" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                    My posts <ArrowUpRight className="h-3 w-3" />
                  </Link>
                )}
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-amber-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingPosts.totalDocs}</div>
                <Link href="/user/queue" className="text-xs text-amber-500 hover:underline flex items-center gap-1 mt-1">
                  Review queue <ArrowUpRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          </>
        )}

        {canSeeUsers && (
          <Card className="border-t-4 border-t-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers.totalDocs}</div>
              {newUsersToday.totalDocs > 0 && (
                <p className="text-xs text-green-600 mt-1">+{newUsersToday.totalDocs} today</p>
              )}
              <Link href="/user/users" className="text-xs text-green-500 hover:underline flex items-center gap-1 mt-1">
                Manage <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        )}

        {canSeeEvents && (
          <Card className="border-t-4 border-t-purple-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">—</div>
              <Link href="/user/events" className="text-xs text-purple-500 hover:underline flex items-center gap-1 mt-1">
                Manage events <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        )}

        {canSeeClubs && (
          <Card className="border-t-4 border-t-pink-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Clubs</CardTitle>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">—</div>
              <Link href="/user/clubs" className="text-xs text-pink-500 hover:underline flex items-center gap-1 mt-1">
                Manage clubs <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        )}

        {canSeeComments && (
          <Card className="border-t-4 border-t-orange-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Pending Comments</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingComments.totalDocs}</div>
              <Link href="/user/comments" className="text-xs text-orange-500 hover:underline flex items-center gap-1 mt-1">
                Review <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        )}

        {isInstAdmin && (
          <Card className="border-t-4 border-t-slate-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Activity (7d)</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentActivity.totalDocs}</div>
              <Link href="/user/logs" className="text-xs text-slate-500 hover:underline flex items-center gap-1 mt-1">
                View logs <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick actions based on role */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          {canSeeBlog && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/user/posts/create"><PenSquare className="h-3.5 w-3.5 mr-1.5" />Write Post</Link>
            </Button>
          )}
          {(isBlogEditor || isInstAdmin) && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/user/queue"><Clock className="h-3.5 w-3.5 mr-1.5" />Review Queue</Link>
            </Button>
          )}
          {canSeeUsers && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/user/users"><Users className="h-3.5 w-3.5 mr-1.5" />Manage Users</Link>
            </Button>
          )}
          {canSeeEvents && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/user/events"><Calendar className="h-3.5 w-3.5 mr-1.5" />Events</Link>
            </Button>
          )}
          {isInstAdmin && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/user/logs"><TrendingUp className="h-3.5 w-3.5 mr-1.5" />Activity Logs</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
