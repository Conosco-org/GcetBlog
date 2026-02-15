/**
 * Newsletter Unsubscribe Page
 *
 * GET /newsletter/unsubscribe?token={unsubscribeToken}
 *
 * One-click unsubscribe from the newsletter.
 * Shows confirmation and optional resubscribe.
 */

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { XCircle, MailX } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    return <ErrorState message="Missing unsubscribe token." />
  }

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'newsletter-subscribers',
    where: { unsubscribeToken: { equals: token } },
    limit: 1,
    depth: 0,
  })

  if (result.docs.length === 0) {
    return <ErrorState message="Invalid or expired unsubscribe link." />
  }

  const subscriber = result.docs[0]

  if (subscriber.status === 'unsubscribed') {
    return <SuccessState email={subscriber.email} alreadyUnsubscribed />
  }

  // Unsubscribe the user
  await payload.update({
    collection: 'newsletter-subscribers',
    id: subscriber.id as string,
    data: {
      status: 'unsubscribed',
      unsubscribedAt: new Date().toISOString(),
    },
  })

  return <SuccessState email={subscriber.email} />
}

function SuccessState({
  email,
  alreadyUnsubscribed,
}: {
  email: string
  alreadyUnsubscribed?: boolean
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto">
          <MailX className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold">
          {alreadyUnsubscribed ? 'Already Unsubscribed' : 'Unsubscribed Successfully'}
        </h1>
        <p className="text-muted-foreground">
          <strong>{email}</strong> has been removed from the GCET Blog mailing list.
          {!alreadyUnsubscribed && " We're sorry to see you go!"}
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
          >
            Visit Blog
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          Changed your mind? You can always resubscribe from the blog footer.
        </p>
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold">Unsubscribe Failed</h1>
        <p className="text-muted-foreground">{message}</p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
        >
          Go to Blog
        </Link>
      </div>
    </div>
  )
}
