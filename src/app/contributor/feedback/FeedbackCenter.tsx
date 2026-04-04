'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, AlertCircle } from 'lucide-react'

export default function FeedbackCenter() {
  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Feedback Center</h1>
        <p className="text-muted-foreground mt-2">
          This feature is reserved for future use. Currently, editor feedback is displayed directly in your drafts.
        </p>
      </div>

      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            How to View Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                Check Your Drafts
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-400">
                When an editor requests changes to your post, it will appear in your &ldquo;My Drafts&rdquo; section with a visible feedback badge and message. You can then edit the post and resubmit it for review.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Future Enhancement:</strong> This page will eventually support:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Threaded conversations with editors</li>
              <li>Feedback history and analytics</li>
              <li>Real-time notifications</li>
              <li>Categorized feedback types (critical, suggestions, praise, questions)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}