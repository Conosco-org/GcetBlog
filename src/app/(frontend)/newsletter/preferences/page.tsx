/**
 * Newsletter Preferences Page
 *
 * GET /newsletter/preferences?token={unsubscribeToken}
 *
 * Allows subscribers to update their category preferences
 * and digest frequency without fully unsubscribing.
 */

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { XCircle } from 'lucide-react'
import Link from 'next/link'
import { PreferencesForm } from '@/frontend/features/newsletter/components/newsletter-preferences'

export const dynamic = 'force-dynamic'

export default async function PreferencesPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    return <ErrorState message="Missing preferences token." />
  }

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'newsletter-subscribers',
    where: { unsubscribeToken: { equals: token } },
    limit: 1,
    depth: 0,
  })

  if (result.docs.length === 0) {
    return <ErrorState message="Invalid or expired link." />
  }

  const subscriber = result.docs[0]

  // Fetch all available categories
  const categoriesResult = await payload.find({
    collection: 'categories',
    limit: 50,
    sort: 'title',
    depth: 0,
  })

  const categories = categoriesResult.docs.map((cat) => ({
    id: cat.id as string,
    title: cat.title,
  }))

  // Get current subscriber category IDs
  const subscriberCategoryIds = Array.isArray(subscriber.categories)
    ? subscriber.categories.map((c: unknown) =>
        typeof c === 'object' && c !== null && 'id' in c
          ? String((c as { id: string }).id)
          : String(c),
      )
    : []

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-lg w-full">
        <PreferencesForm
          token={token}
          email={subscriber.email}
          currentFrequency={(subscriber.frequency as string) ?? 'weekly'}
          currentCategoryIds={subscriberCategoryIds}
          availableCategories={categories}
        />
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
        <h1 className="text-2xl font-bold">Invalid Link</h1>
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
