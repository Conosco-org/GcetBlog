/**
 * Newsletter Email Confirmation Page
 *
 * GET /newsletter/confirm?token={unsubscribeToken}
 *
 * Confirms the subscriber's email (double opt-in).
 * Sets confirmedAt, changes status to active.
 */

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { CheckCircle, XCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    return <ErrorState message="Missing confirmation token." />
  }

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'newsletter-subscribers',
    where: { unsubscribeToken: { equals: token } },
    limit: 1,
    depth: 0,
  })

  if (result.docs.length === 0) {
    return <ErrorState message="Invalid or expired confirmation link." />
  }

  const subscriber = result.docs[0]

  if (subscriber.confirmedAt && subscriber.status === 'active') {
    return <SuccessState message="Your email is already confirmed! You're all set." alreadyConfirmed token={token} />
  }

  // Confirm the subscriber
  await payload.update({
    collection: 'newsletter-subscribers',
    id: subscriber.id as string,
    data: {
      status: 'active',
      confirmedAt: new Date().toISOString(),
    },
  })

  return (
    <SuccessState
      message="Your email has been confirmed! Welcome to the GCET Blog newsletter."
      token={token}
    />
  )
}

function SuccessState({
  message,
  alreadyConfirmed,
  token,
}: {
  message: string
  alreadyConfirmed?: boolean
  token?: string
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold">{alreadyConfirmed ? 'Already Confirmed' : 'Subscription Confirmed!'}</h1>
        <p className="text-muted-foreground">{message}</p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
          >
            Visit Blog
          </Link>
          {token && (
            <Link
              href={`/newsletter/preferences?token=${encodeURIComponent(token)}`}
              className="inline-flex items-center px-4 py-2 rounded-lg border text-sm font-medium hover:bg-accent transition"
            >
              Manage Preferences
            </Link>
          )}
        </div>
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
        <h1 className="text-2xl font-bold">Confirmation Failed</h1>
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
