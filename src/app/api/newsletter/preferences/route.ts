/**
 * Newsletter Preferences Update API
 *
 * PUT /api/newsletter/preferences
 * Body: { token, frequency?, categories? }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, frequency, categories } = body as {
      token?: string
      frequency?: string
      categories?: string[]
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token is required.' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'newsletter-subscribers',
      where: { unsubscribeToken: { equals: token } },
      limit: 1,
      depth: 0,
    })

    if (result.docs.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid token.' },
        { status: 404 },
      )
    }

    const subscriber = result.docs[0]

    // Build update data
    const updateData: Record<string, unknown> = {}

    if (frequency && ['daily', 'weekly', 'monthly'].includes(frequency)) {
      updateData.frequency = frequency
    }

    if (Array.isArray(categories)) {
      updateData.categories = categories
    }

    if (Object.keys(updateData).length > 0) {
      await payload.update({
        collection: 'newsletter-subscribers',
        id: subscriber.id as string,
        data: updateData,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully.',
    })
  } catch (err) {
    console.error('[Preferences API] Error:', err)
    return NextResponse.json(
      { success: false, message: 'Something went wrong.' },
      { status: 500 },
    )
  }
}
